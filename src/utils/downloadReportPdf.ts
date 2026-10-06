const normalizePdfColors = (document: Document) => {
  const view = document.defaultView;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!view || !context) return;
  const normalizedColors = new Map<string, string>();

  const colorProperties = [
    'color',
    'background-color',
    'background-image',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'outline-color',
    'text-decoration-color',
    'box-shadow',
    'text-shadow',
    'fill',
    'stroke',
    'filter',
  ];

  const toRgba = (color: string) => {
    const cached = normalizedColors.get(color);
    if (cached) return cached;
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
    const normalized = `rgba(${red}, ${green}, ${blue}, ${Number((alpha / 255).toFixed(3))})`;
    normalizedColors.set(color, normalized);
    return normalized;
  };

  const hasModernColorFunction = /(?:oklch|oklab|color-mix|color)\(/i;
  const modernColorFunction = /(?:oklch|oklab|color-mix|color)\([^)]*\)/gi;
  for (const element of document.querySelectorAll<HTMLElement | SVGElement>('*')) {
    const computedStyle = view.getComputedStyle(element);
    for (const property of colorProperties) {
      const computedValue = computedStyle.getPropertyValue(property);
      if (!hasModernColorFunction.test(computedValue)) continue;
      element.style.setProperty(
        property,
        computedValue.replace(modernColorFunction, (color) => toRgba(color)),
        'important',
      );
    }
  }
};

export const downloadReportPdf = async (element: HTMLElement, filename: string): Promise<void> => {
  const { default: html2pdf } = await import('html2pdf.js');
  const exportingClass = 'pdf-exporting';

  element.classList.add(exportingClass);
  try {
    const pdfBlob = await html2pdf()
      .set({
        margin: [8, 8, 10, 8],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          onclone: (clonedDocument: Document) => normalizePdfColors(clonedDocument),
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(element)
      .outputPdf('blob') as Blob;
    const downloadUrl = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  } finally {
    element.classList.remove(exportingClass);
  }
};