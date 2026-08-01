import { extractImageWithVision } from '@/modules/tarea/lib/extractImageWithVision'

const MAX_EXTRACTED_CHARACTERS = 18_000

export interface ExtractedHomework {
  text: string
  pageCount?: number
}

function cleanText(value: string) {
  return value
    .replace(/\u0000/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_EXTRACTED_CHARACTERS)
}

export async function extractHomeworkFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ExtractedHomework> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('El archivo supera el máximo de 10 MB.')
  }

  const extension = file.name.split('.').pop()?.toLowerCase()
  if (file.type === 'text/plain' || extension === 'txt') {
    onProgress?.(100)
    return { text: cleanText(await file.text()) }
  }

  if (file.type === 'application/pdf' || extension === 'pdf') {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()

    const document = await pdfjs.getDocument({
      data: new Uint8Array(await file.arrayBuffer()),
    }).promise
    const pages: string[] = []

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber)
      const content = await page.getTextContent()
      pages.push(
        content.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ')
      )
      onProgress?.(Math.round((pageNumber / document.numPages) * 100))
    }

    return { text: cleanText(pages.join('\n\n')), pageCount: document.numPages }
  }

  if (file.type.startsWith('image/')) {
    // Tesseract (OCR local, más abajo) no lee letra manuscrita de forma
    // confiable: solo sirve para texto impreso. Para que Lumi pueda revisar
    // lo que el estudiante ya escribió a mano en la foto, primero intentamos
    // con un modelo de visión en el backend. Si no está configurado o falla,
    // seguimos con OCR local como respaldo en vez de fallar por completo.
    onProgress?.(15)
    const visionText = await extractImageWithVision(file)
    if (visionText) {
      onProgress?.(100)
      return { text: cleanText(visionText) }
    }

    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker(['spa', 'eng'], undefined, {
      logger: ({ status, progress }) => {
        if (status === 'recognizing text') onProgress?.(Math.round(progress * 100))
      },
    })
    try {
      const result = await worker.recognize(file)
      return { text: cleanText(result.data.text) }
    } finally {
      await worker.terminate()
    }
  }

  throw new Error('Usa un archivo PDF, TXT, JPG, PNG o WEBP.')
}
