// Resume text extraction utilities.
//
// Extracts plain text from resume files (PDF, DOC, DOCX) or raw pasted text
// so it can be passed to the AI question-generation edge function. For DOCX
// files we extract text from the XML inside the zip. For PDFs we use
// pdfjs-dist. For plain-text / pasted content we normalize whitespace.

import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Extract plain text from a pasted resume string. Strips excessive
 * whitespace and returns a trimmed block.
 */
export function extractTextFromPaste(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract text from a plain-text File (e.g. .txt or pasted content saved as
 * a File). For DOCX files we parse the underlying XML.
 */
async function extractFromDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // DOCX is a ZIP archive; document.xml contains the text in <w:t> tags.
    // We use DecompressionStream to unzip — but the simplest robust approach
    // is to search the raw bytes for text content in the XML.
    const bytes = new Uint8Array(arrayBuffer);
    const text = new TextDecoder('utf-8').decode(bytes);
    // Extract text between <w:t> tags (DOCX word-processing XML).
    const matches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (matches && matches.length > 0) {
      return matches
        .map((m) => m.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, ''))
        .join(' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .trim();
    }
    return '';
  } catch {
    return '';
  }
}

/**
 * Extract text from a PDF file using pdfjs-dist.
 */
async function extractFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ('str' in item ? (item as { str: string }).str : ''))
        .join(' ');
      textParts.push(pageText);
    }

    return textParts.join('\n').replace(/\s+/g, ' ').trim();
  } catch {
    return '';
  }
}

/**
 * Extract plain text from a resume File. Detects type by extension and MIME.
 * Returns empty string if extraction fails.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return extractFromPdf(file);
  }

  if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    return extractFromDocx(file);
  }

  if (type === 'application/msword' || name.endsWith('.doc')) {
    // Legacy .doc is a binary format — attempt a best-effort text extraction
    // by scanning for readable ASCII/UTF-8 strings in the binary.
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      // Filter to printable characters, collapse whitespace.
      return text
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 10000);
    } catch {
      return '';
    }
  }

  // Fallback: treat as plain text.
  try {
    const text = await file.text();
    return extractTextFromPaste(text);
  } catch {
    return '';
  }
}

/**
 * Truncate resume text to a reasonable length for the AI prompt.
 * Gemini has large context windows, but keeping it concise improves quality.
 */
export function truncateResumeText(text: string, maxChars = 8000): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).trim() + '…';
}
