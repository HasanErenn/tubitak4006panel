'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import Link from 'next/link'
import CopyButton from '@/components/ui/CopyButton'

interface UserInfo {
  id: string
  title: string
  mainArea: string
  projectType: string
  subject: string
  purpose: string
  method: string
  expectedResult: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

interface EditFormData {
  title: string
  mainArea: string
  projectType: string
  subject: string
  purpose: string
  method: string
  expectedResult: string
}

export default function MyInfoPage() {
  const [userInfos, setUserInfos] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditFormData>({
    title: '',
    mainArea: '',
    projectType: '',
    subject: '',
    purpose: '',
    method: '',
    expectedResult: ''
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
      mainArea: info.mainArea,
      projectType: info.projectType,
      subject: info.subject,
      purpose: info.purpose,
      method: info.method,
      expectedResult: info.expectedResult
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({
      title: '',
      mainArea: '',
      projectType: '',
      subject: '',
      purpose: '',
      method: '',
      expectedResult: ''
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
                          Alt Proje Adı
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
                          Ana Alan
                        </label>
                        <input
                          type="text"
                          name="mainArea"
                          value={editForm.mainArea}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Proje Türü
                        </label>
                        <input
                          type="text"
                          name="projectType"
                          value={editForm.projectType}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Konu
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={editForm.subject}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-foreground">
                            Amaç ve Önem
                          </label>
                          {editForm.purpose && <CopyButton text={editForm.purpose} />}
                        </div>
                        <textarea
                          name="purpose"
                          value={editForm.purpose}
                          onChange={handleEditChange}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-foreground">
                            Yöntem
                          </label>
                          {editForm.method && <CopyButton text={editForm.method} />}
                        </div>
                        <textarea
                          name="method"
                          value={editForm.method}
                          onChange={handleEditChange}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-foreground">
                            Beklenen Sonuç
                          </label>
                          {editForm.expectedResult && <CopyButton text={editForm.expectedResult} />}
                        </div>
                        <textarea
                          name="expectedResult"
                          value={editForm.expectedResult}
                          onChange={handleEditChange}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
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
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                            <div><strong>Ana Alan:</strong> {info.mainArea}</div>
                            <div><strong>Tür:</strong> {info.projectType}</div>
                            <div className="col-span-2"><strong>Konu:</strong> {info.subject}</div>
                          </div>
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

                      <div className="space-y-4 mb-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground">Amaç ve Önem</h4>
                            <CopyButton text={info.purpose} />
                          </div>
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded">
                            {info.purpose}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground">Yöntem</h4>
                            <CopyButton text={info.method} />
                          </div>
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded">
                            {info.method}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground">Beklenen Sonuç</h4>
                            <CopyButton text={info.expectedResult} />
                          </div>
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded">
                            {info.expectedResult}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span>
                            Oluşturulma: {new Date(info.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                          <span>
                            Güncelleme: {new Date(info.updatedAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Sadece Admin'ler görebilir
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