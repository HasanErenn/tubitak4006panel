'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface SharedFile {
  id: string
  originalName: string
  fileType: string
  fileSize: number
  description: string | null
  createdAt: string
  uploadedBy: {
    name: string
    email: string
  }
}

export default function AdminFilesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [files, setFiles] = useState<SharedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    fetchFiles()
  }, [session, status, router])

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/admin/files')
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

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      const response = await fetch('/api/admin/files', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        await fetchFiles()
        // Form'u temizle
        e.currentTarget.reset()
      } else {
        const data = await response.json()
        setError(data.error || 'Dosya yükleme başarısız')
      }
    } catch (err) {
      setError('Dosya yükleme sırasında hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const handleFileDelete = async (fileId: string) => {
    if (!confirm('Bu dosyayı silmek istediğinize emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/files/${fileId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchFiles()
      } else {
        const data = await response.json()
        setError(data.error || 'Dosya silme başarısız')
      }
    } catch (err) {
      setError('Dosya silme sırasında hata oluştu')
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

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Paylaşılan Dosyalar Yönetimi
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Kullanıcılarla paylaşılacak dosyaları yükleyin ve yönetin.
        </p>
      </div>

      {/* Dosya Yükleme Formu */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Yeni Dosya Yükle
        </h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dosya Seç *
            </label>
            <input
              type="file"
              name="file"
              accept=".pdf,.png,.jpg,.jpeg"
              required
              disabled={uploading}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0
                       file:text-sm file:font-medium
                       file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/50 dark:file:text-blue-200
                       hover:file:bg-blue-100 dark:hover:file:bg-blue-900/70
                       file:cursor-pointer cursor-pointer
                       disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              PDF, PNG, JPG dosyaları yükleyebilirsiniz. Maksimum dosya boyutu: 10MB
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Açıklama (Opsiyonel)
            </label>
            <textarea
              name="description"
              rows={3}
              disabled={uploading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Dosya hakkında kısa bir açıklama yazın..."
            />
          </div>
          
          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 
                     disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors
                     disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Yükleniyor...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                Dosya Yükle
              </>
            )}
          </button>
        </form>
      </div>

      {/* Dosya Listesi */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Yüklenen Dosyalar ({files.length})
          </h2>
        </div>
        
        {files.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            Henüz hiç dosya yüklenmemiş.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Dosya
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Boyut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Yükleyen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFileIcon(file.fileType)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {file.originalName}
                          </div>
                          {file.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {file.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {file.uploadedBy.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(file.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleFileDelete(file.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200
                                 inline-flex items-center px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20
                                 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}