'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

interface TimelineItem {
  id: string
  title: string
  description: string
  targetDate: string
  status: 'pending' | 'in-progress' | 'completed' | 'delayed'
  order: number
  isActive: boolean
  createdAt: string
  createdBy: {
    id: string
    name: string | null
    email: string
  }
}

const statusLabels = {
  pending: 'Bekliyor',
  'in-progress': 'Devam Ediyor',
  completed: 'Tamamlandı',
  delayed: 'Gecikti'
}

const statusColors = {
  pending: 'bg-gray-500',
  'in-progress': 'bg-blue-500',
  completed: 'bg-green-500',
  delayed: 'bg-red-500'
}

export default function AdminTimelinePage() {
  const { data: session, status } = useSession()
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState<{
    title: string
    description: string
    targetDate: string
    status: 'pending' | 'in-progress' | 'completed' | 'delayed'
    order: number
  }>({
    title: '',
    description: '',
    targetDate: '',
    status: 'pending',
    order: 0
  })

  // Timeline öğelerini yükle
  const loadTimelineItems = async () => {
    try {
      const response = await fetch('/api/admin/timeline')
      if (response.ok) {
        const data = await response.json()
        setTimelineItems(data)
      }
    } catch (error) {
      console.error('Timeline öğeleri yüklenirken hata:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTimelineItems()
  }, [])

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  }

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Form temizle
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetDate: '',
      status: 'pending',
      order: timelineItems.length
    })
    setEditingItem(null)
    setShowForm(false)
  }

  // Timeline öğesi kaydet
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingItem 
        ? `/api/admin/timeline/${editingItem.id}`
        : '/api/admin/timeline'
      
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadTimelineItems()
        resetForm()
      } else {
        const error = await response.json()
        alert('Hata: ' + error.error)
      }
    } catch (error) {
      console.error('Timeline kaydedilirken hata:', error)
      alert('Beklenmeyen bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Timeline öğesi sil
  const handleDelete = async (id: string) => {
    if (!confirm('Bu timeline öğesini silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/timeline/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadTimelineItems()
      } else {
        const error = await response.json()
        alert('Hata: ' + error.error)
      }
    } catch (error) {
      console.error('Timeline silinirken hata:', error)
      alert('Beklenmeyen bir hata oluştu')
    }
  }

  // Düzenleme için form doldur
  const handleEdit = (item: TimelineItem) => {
    setFormData({
      title: item.title,
      description: item.description,
      targetDate: item.targetDate.split('T')[0],
      status: item.status,
      order: item.order
    })
    setEditingItem(item)
    setShowForm(true)
  }

  // Tarihi formatla
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Timeline Yönetimi</h1>
          <p className="mt-2 text-gray-600">
            Proje ilerlemesi ve önemli tarihleri yönetin
          </p>
        </div>

        {/* Yeni timeline öğesi ekleme butonu */}
        <div className="mb-6">
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            + Yeni Timeline Öğesi
          </button>
        </div>

        {/* Timeline form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingItem ? 'Timeline Öğesini Düzenle' : 'Yeni Timeline Öğesi'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hedef Tarih *
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'in-progress' | 'completed' | 'delayed' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Bekliyor</option>
                    <option value="in-progress">Devam Ediyor</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="delayed">Gecikti</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sıra
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  {isSubmitting ? 'Kaydediliyor...' : (editingItem ? 'Güncelle' : 'Kaydet')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Timeline öğeleri listesi */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Timeline Öğeleri</h2>
          </div>

          {timelineItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Henüz timeline öğesi eklenmemiş.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sıra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Başlık
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hedef Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oluşturan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timelineItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.order}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs" title={item.description}>
                            {item.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.targetDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${statusColors[item.status]}`}>
                          {statusLabels[item.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.createdBy.name || item.createdBy.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
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
    </div>
  )
}