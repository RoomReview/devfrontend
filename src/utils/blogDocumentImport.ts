import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const MAX_BLOG_DOCUMENT_SIZE = 20 * 1024 * 1024;

const MAX_PDF_PAGE_DIMENSION = 1400;
const MAX_PDF_IMAGE_QUALITY = 0.78;
const allowedImageTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]);

export const extractBlogDocumentContent = async (
  file: File,
): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension !== 'docx' && extension !== 'pdf') {
    throw new Error('Choose a DOCX or PDF file.');
  }
  if (file.size > MAX_BLOG_DOCUMENT_SIZE) {
    throw new Error('The selected file is larger than 20 MB.');
  }

  const buffer = await file.arrayBuffer();
  if (extension === 'docx') {
    const result = await mammoth.convertToHtml(
      { arrayBuffer: buffer },
      {
        convertImage: mammoth.images.inline(async (image) => {
          if (!allowedImageTypes.has(image.contentType)) {
            throw new Error(
              `The DOCX contains an unsupported image format (${image.contentType}). Use PNG, JPEG, GIF, or WebP images.`,
            );
          }
          const base64 = await image.read('base64');
          return {
            src: `data:${image.contentType};base64,${base64}`,
          };
        }),
      },
    );
    const content = result.value.trim();
    return content;
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
  });
  const document = await loadingTask.promise;
  try {
    const pageImages: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => {
          if (!('str' in item)) return '';
          return `${item.str}${'hasEOL' in item && item.hasEOL ? '\n' : ' '}`;
        })
        .join('')
        .trim();

      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(
        1,
        MAX_PDF_PAGE_DIMENSION /
          Math.max(baseViewport.width, baseViewport.height),
      );
      const viewport = page.getViewport({ scale });
      const canvas = globalThis.document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('PDF page images could not be created in this browser.');
      }

      await page.render({ canvas, canvasContext: context, viewport }).promise;
      const image = canvas.toDataURL('image/jpeg', MAX_PDF_IMAGE_QUALITY);
      canvas.width = 0;
      canvas.height = 0;
      const altText = pageText
        ? `Page ${pageNumber}: ${pageText.slice(0, 500)}`
        : `Page ${pageNumber}`;
      const escapedAlt = altText
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const pageImage = `<figure><img src="${image}" alt="${escapedAlt}"></figure>`;
      pageImages.push(pageImage);
    }

    return pageImages.join('\n');
  } finally {
    await loadingTask.destroy();
  }
};
