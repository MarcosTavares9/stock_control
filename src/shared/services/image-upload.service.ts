import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../config/firebase.config'

/**
 * Comprime a imagem antes do upload para economizar storage e banda
 * Redimensiona para no máximo 800x800px e usa JPEG com qualidade 0.8
 */
const compressImage = (file: File, maxSize = 800, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      let { width, height } = img

      // Redimensionar mantendo proporção
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        } else {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Falha ao comprimir imagem'))
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => reject(new Error('Falha ao carregar imagem'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Gera um nome único para o arquivo no Storage
 */
const generateFileName = (originalName: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  return `${timestamp}_${random}.${extension}`
}

/**
 * Faz upload de uma imagem para o Firebase Storage
 * @param file - Arquivo de imagem selecionado pelo usuário
 * @param folder - Pasta no Storage (ex: 'products', 'users')
 * @returns URL pública da imagem
 */
export const uploadImage = async (
  file: File,
  folder = 'products'
): Promise<string> => {
  // Validar tipo de arquivo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não suportado. Use JPG, PNG, WebP ou GIF.')
  }

  // Validar tamanho (máx 5MB antes da compressão)
  const maxFileSize = 5 * 1024 * 1024
  if (file.size > maxFileSize) {
    throw new Error('Arquivo muito grande. O tamanho máximo é 5MB.')
  }

  // Comprimir a imagem
  const compressedBlob = await compressImage(file)

  // Gerar nome e fazer upload
  const fileName = generateFileName(file.name)
  const storageRef = ref(storage, `${folder}/${fileName}`)

  await uploadBytes(storageRef, compressedBlob, {
    contentType: 'image/jpeg',
  })

  // Retornar a URL pública
  const downloadURL = await getDownloadURL(storageRef)
  return downloadURL
}

/**
 * Validações de arquivo para uso em componentes
 */
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
export const IMAGE_MAX_SIZE_MB = 5
