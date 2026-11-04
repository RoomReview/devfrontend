import { expect, it } from 'vitest';
import { extractBlogDocumentContent } from './blogDocumentImport';

const createTextPdf = (pageContent = 'BT /F1 12 Tf 10 100 Td (Hello from PDF) Tj ET') => {
  const content = pageContent;
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
    `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj`,
  ];
  const encoder = new TextEncoder();
  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((object) => {
    const offset = encoder.encode(pdf).length;
    pdf += `${object}\n`;
    return offset;
  });
  const xrefOffset = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
};

it('preserves PDF pages as images with extracted text as alt text', async () => {
  const file = new File([createTextPdf()], 'article.pdf', {
    type: 'application/pdf',
  });

  const content = await extractBlogDocumentContent(file);
  expect(content).toContain('<figure><img src="data:image/jpeg;base64,');
  expect(content).toContain('alt="Page 1: Hello from PDF"');
});

it('imports scanned PDF pages as images even when no text is selectable', async () => {
  const file = new File([createTextPdf('')], 'scanned-article.pdf', {
    type: 'application/pdf',
  });

  const content = await extractBlogDocumentContent(file);
  expect(content).toContain('<figure><img src="data:image/jpeg;base64,');
  expect(content).toContain('alt="Page 1"');
});

it('rejects file types other than DOCX and PDF', async () => {
  const file = new File(['not a blog document'], 'article.txt', {
    type: 'text/plain',
  });

  await expect(extractBlogDocumentContent(file)).rejects.toThrow(
    'Choose a DOCX or PDF file.',
  );
});
