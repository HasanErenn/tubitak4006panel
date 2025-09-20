'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import Link from 'next/link'

interface UserInfo {
  id: string
  title: string
  description?: string
  content: string
  category?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

interface EditFormData {
  title: string
  description: string
  content: string
  category: string
  isPublic: boolean
}

export default function MyInfoPage() {
  const [userInfos, setUserInfos] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditFormData>({
    title: '',
    description: '',
    content: '',
    category: '',
    isPublic: false
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchUserInfos()
  }, [])

  const fetchUserInfos = async () => {
    try {
      const response = await fetch('/api/user-info')
      if (response.ok) {
        const data = await response.json()
        setUserInfos(data)
      } else {
        setError('Bilgiler yüklenirken hata oluştu')
      }
    } catch (error) {
      setError('Bilgiler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (info: UserInfo) => {
    setEditingId(info.id)
    setEditForm({
      title: info.title,
      description: info.description || '',
      content: info.content,
      category: info.category || '',
      isPublic: info.isPublic
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({
      title: '',
      description: '',
      content: '',
      category: '',
      isPublic: false
    })
  }

  const saveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/user-info/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        await fetchUserInfos()
        setEditingId(null)
      } else {
        const data = await response.json()
        setError(data.error || 'Güncelleme başarısız')
      }
    } catch (error) {
      setError('Güncelleme sırasında hata oluştu')
    }
  }

  const deleteInfo = async (id: string) => {
    try {
      const response = await fetch(`/api/user-info/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchUserInfos()
        setDeleteConfirm(null)
      } else {
        const data = await response.json()
        setError(data.error || 'Silme işlemi başarısız')
      }
    } catch (error) {
      setError('Silme işlemi sırasında hata oluştu')
    }
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setEditForm({
      ...editForm,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <div className="text-foreground">Bilgiler yükleniyor...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bilgilerim</h1>
            <p className="text-muted-foreground">
              Kaydettiğiniz bilgileri görüntüleyin ve yönetin
            </p>
          </div>
          <Link
            href="/dashboard/add-info"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Yeni Bilgi Ekle
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-destructive/10 p-4">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

        {userInfos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              Henüz hiç bilgi eklenmemiş
            </div>
            <Link
              href="/dashboard/add-info"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              İlk bilginizi ekleyin
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {userInfos.map((info) => (
              <div key={info.id} className="bg-card border border-gray-200/50 dark:border-gray-700/50 rounded-lg">
                {editingId === info.id ? (
                  // Edit Mode
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Başlık
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={editForm.title}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Açıklama
                        </label>
                        <input
                          type="text"
                          name="description"
                          value={editForm.description}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Kategori
                        </label>
                        <input
                          type="text"
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          İçerik
                        </label>
                        <textarea
                          name="content"
                          value={editForm.content}
                          onChange={handleEditChange}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="isPublic"
                          checked={editForm.isPublic}
                          onChange={handleEditChange}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-200/50 dark:border-gray-700/50 rounded"
                        />
                        <label className="ml-2 block text-sm text-foreground">
                          Herkese açık
                        </label>
                      </div>

                      <div className="flex justify-end space-x-4">
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 border border-gray-200/50 dark:border-gray-700/50 text-foreground rounded-md hover:bg-accent transition-colors"
                        >
                          İptal
                        </button>
                        <button
                          onClick={() => saveEdit(info.id)}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                          Kaydet
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {info.title}
                          </h3>
                          {info.description && (
                            <p className="text-muted-foreground mb-2">
                              {info.description}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(info)}
                            className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(info.id)}
                            className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 transition-colors"
                          >
                            Sil
                          </button>
                        </div>
                      </div>

                      <div className="prose prose-sm max-w-none text-foreground mb-4">
                        <div className="whitespace-pre-wrap">{info.content}</div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span>
                            Oluşturulma: {new Date(info.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                          <span>
                            Güncelleme: {new Date(info.updatedAt).toLocaleDateString('tr-TR')}
                          </span>
                          {info.category && (
                            <span className="px-2 py-1 bg-secondary rounded">
                              {info.category}
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          info.isPublic 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}>
                          {info.isPublic ? 'Herkese Açık' : 'Özel'}
                        </span>
                      </div>
                    </div>

                    {/* Delete Confirmation */}
                    {deleteConfirm === info.id && (
                      <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-muted/50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">
                            Bu bilgiyi silmek istediğinizden emin misiniz?
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1 text-sm border border-gray-200/50 dark:border-gray-700/50 text-foreground rounded hover:bg-accent transition-colors"
                            >
                              İptal
                            </button>
                            <button
                              onClick={() => deleteInfo(info.id)}
                              className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 transition-colors"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}