import type { CloudinaryFile } from '@/types'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export type UploadResourceType = 'image' | 'video' | 'raw' | 'auto'

interface UploadOptions {
  folder?: string
  resourceType?: UploadResourceType
  onProgress?: (percent: number) => void
}

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024 // 100 MB Cloudinary free/unsigned limit

export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {},
): Promise<CloudinaryFile> {
  const { folder = 'avisys', resourceType = 'auto', onProgress } = options

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Configuration Cloudinary manquante. Vérifiez vos variables d\'environnement.')
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Limite : 100 Mo.`,
    )
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', folder)

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`

  // eslint-disable-next-line no-console
  console.log('[Cloudinary] upload start', { endpoint, resourceType, file: file.name, size: file.size })

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', endpoint)
    xhr.timeout = 0 // no timeout; large videos need time

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      // eslint-disable-next-line no-console
      console.log('[Cloudinary] upload response', { status: xhr.status, response: xhr.responseText.slice(0, 500) })
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText)
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
        })
      } else {
        reject(new Error(parseCloudinaryError(xhr.status, xhr.responseText)))
      }
    }

    xhr.onerror = () => {
      // eslint-disable-next-line no-console
      console.error('[Cloudinary] network error', { endpoint, resourceType, file: file.name, size: file.size })
      reject(new Error(
        'Erreur réseau lors de l\'upload. Vérifiez votre connexion, la taille de la vidéo, et que le preset Cloudinary est de type "Unsigned".',
      ))
    }

    xhr.ontimeout = () => {
      reject(new Error('L\'upload a dépassé le délai autorisé. Réduisez la taille de la vidéo ou réessayez.'))
    }

    xhr.onabort = () => {
      reject(new Error('Upload annulé.'))
    }

    xhr.send(formData)
  })
}

function parseCloudinaryError(status: number, responseText: string): string {
  let cloudinaryMessage = ''
  try {
    const body = JSON.parse(responseText)
    cloudinaryMessage = body?.error?.message ?? ''
  } catch {
    // ignore invalid JSON
  }

  if (status === 401) {
    return [
      'Upload refusé par Cloudinary (non autorisé).',
      'Vérifiez dans votre fichier .env :',
      '• VITE_CLOUDINARY_CLOUD_NAME = le nom du cloud (Dashboard Cloudinary, pas le preset)',
      '• VITE_CLOUDINARY_UPLOAD_PRESET = un preset de type "Unsigned" existant',
      cloudinaryMessage ? `Détail Cloudinary : ${cloudinaryMessage}` : '',
    ]
      .filter(Boolean)
      .join(' ')
  }

  if (status === 400) {
    return cloudinaryMessage
      ? `Fichier ou configuration invalide : ${cloudinaryMessage}`
      : 'Fichier ou configuration Cloudinary invalide (400).'
  }

  if (status === 404) {
    return 'Compte Cloudinary introuvable. Vérifiez VITE_CLOUDINARY_CLOUD_NAME dans .env.'
  }

  return cloudinaryMessage
    ? `Échec de l'upload (${status}) : ${cloudinaryMessage}`
    : `Échec de l'upload (${status}). Réessayez ou contactez l'administrateur.`
}

export function getVideoThumbnail(url: string): string {
  return url.replace('/upload/', '/upload/w_400,h_225,c_fill/').replace(/\.[^/.]+$/, '.jpg')
}
