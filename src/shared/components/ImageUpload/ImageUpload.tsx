import { useState, useRef, useCallback } from 'react'
import { FaCamera, FaTimes, FaSpinner } from 'react-icons/fa'
import { uploadImage, IMAGE_ACCEPT, IMAGE_MAX_SIZE_MB } from '../../services/image-upload.service'
import './ImageUpload.sass'

interface ImageUploadProps {
  /** URL da imagem atual (para edição) */
  currentImageUrl?: string | null
  /** Callback quando a imagem for enviada com sucesso */
  onImageUploaded: (url: string) => void
  /** Callback quando a imagem for removida */
  onImageRemoved: () => void
  /** Pasta no Firebase Storage */
  folder?: string
  /** Se está desabilitado */
  disabled?: boolean
}

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  folder = 'products',
  disabled = false,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)

    // Preview local instantâneo
    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)

    setUploading(true)
    try {
      const downloadUrl = await uploadImage(file, folder)
      setPreviewUrl(downloadUrl)
      onImageUploaded(downloadUrl)
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload da imagem')
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setUploading(false)
    }
  }, [folder, currentImageUrl, onImageUploaded])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Limpar o input para permitir selecionar a mesma imagem novamente
    e.target.value = ''
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled || uploading) return

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFile(file)
    }
  }, [disabled, uploading, handleFile])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && !uploading) setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreviewUrl(null)
    setError(null)
    onImageRemoved()
  }

  const handleClick = () => {
    if (!disabled && !uploading) {
      inputRef.current?.click()
    }
  }

  return (
    <div className="image-upload">
      <div
        className={`image-upload__dropzone ${dragOver ? 'image-upload__dropzone--dragover' : ''} ${previewUrl ? 'image-upload__dropzone--has-image' : ''} ${disabled ? 'image-upload__dropzone--disabled' : ''}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          onChange={handleChange}
          className="image-upload__input"
          disabled={disabled || uploading}
        />

        {uploading && (
          <div className="image-upload__loading">
            <FaSpinner className="image-upload__spinner" size={24} />
            <span>Enviando...</span>
          </div>
        )}

        {!uploading && previewUrl && (
          <>
            <img
              src={previewUrl}
              alt="Preview"
              className="image-upload__preview"
            />
            {!disabled && (
              <button
                type="button"
                className="image-upload__remove"
                onClick={handleRemove}
                title="Remover imagem"
              >
                <FaTimes size={12} />
              </button>
            )}
            <div className="image-upload__overlay">
              <FaCamera size={20} />
              <span>Trocar imagem</span>
            </div>
          </>
        )}

        {!uploading && !previewUrl && (
          <div className="image-upload__placeholder">
            <FaCamera size={24} />
            <span>Clique ou arraste uma imagem</span>
            <small>JPG, PNG, WebP ou GIF (máx {IMAGE_MAX_SIZE_MB}MB)</small>
          </div>
        )}
      </div>

      {error && <p className="image-upload__error">{error}</p>}
    </div>
  )
}
