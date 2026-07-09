import { useCallback, useState } from 'react'
import { Upload, X, FileText, Image as ImageIcon, Film, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadToCloudinary, type UploadResourceType } from '@/lib/cloudinary'
import type { CloudinaryFile } from '@/types'
import { ProgressBar } from './ProgressBar'

interface FileUploaderProps {
  accept?: string
  resourceType?: UploadResourceType
  folder?: string
  label?: string
  value?: CloudinaryFile | null
  onChange: (file: CloudinaryFile | null) => void
  preview?: boolean
}

export function FileUploader({
  accept = 'image/*,application/pdf,video/*',
  resourceType = 'auto',
  folder,
  label = 'Glissez-déposez un fichier ou cliquez pour parcourir',
  value,
  onChange,
  preview = true,
}: FileUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = useCallback(
    async (file: File) => {
      setError('')
      setUploading(true)
      setProgress(0)
      try {
        const result = await uploadToCloudinary(file, {
          folder,
          resourceType,
          onProgress: setProgress,
        })
        onChange(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur upload')
      } finally {
        setUploading(false)
      }
    },
    [folder, onChange, resourceType],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const isImage = value?.mimeType.startsWith('image/')
  const isVideo = value?.mimeType.startsWith('video/')

  return (
    <div className="space-y-3">
      {!value ? (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={clsx(
            'flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
            dragging ? 'border-accent bg-accent-light/30' : 'border-gray-200 hover:border-accent hover:bg-gray-50',
            uploading && 'pointer-events-none opacity-70',
          )}
        >
          <Upload className="w-8 h-8 text-text-muted" />
          <span className="text-sm text-text-muted text-center">{label}</span>
          <input
            type="file"
            accept={accept}
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </label>
      ) : (
        preview && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative border border-gray-200 rounded-xl p-4 flex items-center gap-4"
          >
            {isImage && (
              <img src={value.url} alt={value.fileName} className="w-20 h-20 object-cover rounded-lg" />
            )}
            {isVideo && <Film className="w-10 h-10 text-accent shrink-0" />}
            {!isImage && !isVideo && <FileText className="w-10 h-10 text-accent shrink-0" />}
            {!isImage && !isVideo && value.mimeType.startsWith('image/') && (
              <ImageIcon className="w-10 h-10 text-accent shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{value.fileName}</p>
              <p className="text-xs text-text-muted">
                {(value.fileSize / 1024).toFixed(1)} Ko
              </p>
            </div>
            <div className="flex items-center gap-1">
              <div className="p-1.5 text-success" title="Upload terminé">
                <CheckCircle className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )
      )}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 text-sm text-accent mb-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Upload en cours...</span>
            </div>
            <ProgressBar value={progress} showLabel />
          </motion.div>
        )}
      </AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 text-sm text-danger bg-danger-light px-3 py-2 rounded-lg"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  )
}
