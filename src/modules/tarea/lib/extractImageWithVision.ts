import { supabase } from '@/shared/lib/supabaseClient'

/**
 * Transcribe fotos de tareas (impreso + escritura a mano) usando un modelo
 * con visión en el backend (Edge Function `extract-homework-image`, que usa
 * GPT-4o mini). Tesseract (OCR local, gratis) no puede leer letra manuscrita
 * de forma confiable, así que esta es la única forma de que Lumi "vea" lo
 * que el estudiante ya escribió en una foto del cuaderno o guía.
 *
 * Devuelve null si el servicio no está configurado o falla, para que quien
 * llama pueda recurrir a OCR local como respaldo sin romper el flujo de
 * subida (degradación limpia, igual que el resto de la voz/reconocimiento).
 */

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-homework-image`
const MAX_DIMENSION = 1600

async function resizeForVision(file: File): Promise<{ blob: Blob; mimeType: string }> {
  if (typeof createImageBitmap !== 'function' || typeof OffscreenCanvas === 'undefined') {
    return { blob: file, mimeType: file.type || 'image/jpeg' }
  }
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    if (scale >= 1) {
      bitmap.close()
      return { blob: file, mimeType: file.type || 'image/jpeg' }
    }
    const canvas = new OffscreenCanvas(
      Math.round(bitmap.width * scale),
      Math.round(bitmap.height * scale)
    )
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return { blob: file, mimeType: file.type || 'image/jpeg' }
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 })
    return { blob, mimeType: 'image/jpeg' }
  } catch {
    // Si algo falla al redimensionar, seguimos con el archivo original: es
    // mejor enviar la imagen completa que no enviar nada.
    return { blob: file, mimeType: file.type || 'image/jpeg' }
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // result viene como "data:image/jpeg;base64,AAAA..."; nos quedamos
      // solo con la parte de datos.
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer la imagen.'))
    reader.readAsDataURL(blob)
  })
}

export async function extractImageWithVision(file: File): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return null

  try {
    const { blob, mimeType } = await resizeForVision(file)
    const imageBase64 = await blobToBase64(blob)
    if (!imageBase64) return null

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ image_base64: imageBase64, mime_type: mimeType }),
    })
    if (!response.ok) return null

    const payload = await response.json().catch(() => null)
    const text = typeof payload?.text === 'string' ? payload.text.trim() : ''
    return text || null
  } catch {
    return null
  }
}
