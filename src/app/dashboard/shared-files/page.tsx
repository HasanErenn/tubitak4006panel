'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface SharedFile {
  id: string
  originalName: string
  fileName: string
  fileType: string
  fileSize: number
  description: string | null
  createdAt: string
  uploadedBy: {
    name: string
    email: string
  }
}

export default function SharedFilesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [files, setFiles] = useState<SharedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    fetchFiles()
  }, [session, status, router])

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files/shared')
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      } else {
        setError('Dosyalar yüklenemedi')
      }
    } catch (err) {
      setError('Dosyalar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/files/download/${fileId}`)
      if (response.ok) {
        const blob = await response.blob()
        
        // Dosyayı indirme
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        const data = await response.json()
        setError(data.error || 'Dosya indirilemedi')
      }
    } catch (err) {
      setError('Dosya indirme sırasında hata oluştu')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return (
        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 18h12V6l-4-4H4v16zm-2 1V4a1 1 0 011-1h8l4 4v12a1 1 0 01-1 1H3a1 1 0 01-1-1z"/>
        </svg>
      )
    } else if (fileType.includes('image')) {
      return (
        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
        </svg>
      )
    }
    return (
      <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
      </svg>
    )
  }

  const getFileTypeLabel = (fileType: string) => {
    if (fileType.includes('pdf')) return 'PDF Belge'
    if (fileType.includes('png')) return 'PNG Resim'  
    if (fileType.includes('jpeg') || fileType.includes('jpg')) return 'JPEG Resim'
    return 'Dosya'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Paylaşılan Dosyalar
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Size paylaşılan dosyaları görüntüleyebilir ve indirebilirsiniz.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {files.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Henüz Paylaşılan Dosya Yok
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Size paylaşılan dosyalar burada görünecek.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {getFileIcon(file.fileType)}
                  <div className="ml-3 flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                      {file.originalName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getFileTypeLabel(file.fileType)}
                    </p>
                  </div>
                </div>
              </div>

              {file.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {file.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Boyut:</span>
                  <span className="text-gray-900 dark:text-white">{formatFileSize(file.fileSize)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Paylaşan:</span>
                  <span className="text-gray-900 dark:text-white">{file.uploadedBy.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Tarih:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(file.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(file.id, file.originalName)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-4-4V3"/>
                  </svg>
                  İndir
                </button>
                {file.fileType.includes('image') && (
                  <button
                    onClick={() => window.open(`/uploads/${file.fileName}`, '_blank')}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}