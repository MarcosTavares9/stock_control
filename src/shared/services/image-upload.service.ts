import { api } from '../utils/api'
import { endpoints } from '../config/endpoints'

export const uploadImage = async (
  file: File,
  folder = 'products'
): Promise<string> => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não suportado. Use JPG, PNG, WebP ou GIF.')
  }

  const maxFileSize = 5 * 1024 * 1024
  if (file.size > maxFileSize) {
    throw new Error('Arquivo muito grande. O tamanho máximo é 5MB.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const response = await api.post<{ url: string }>(
    endpoints.uploads.image(),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )

  return response.data.url
}

export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
export const IMAGE_MAX_SIZE_MB = 5
