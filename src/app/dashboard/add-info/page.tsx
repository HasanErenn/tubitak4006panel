'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'

interface FormData {
  title: string
  description: string
  content: string
  category: string
  isPublic: boolean
}

export default function AddInfoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    content: '',
    category: '',
    isPublic: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/user-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Bilgi kayıt işlemi başarısız')
      }

      setSuccess(true)
      setFormData({
        title: '',
        description: '',
        content: '',
        category: '',
        isPublic: false
      })

      // 2 saniye sonra bilgilerim sayfasına yönlendir
      setTimeout(() => {
        router.push('/dashboard/my-info')
      }, 2000)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Yeni Bilgi Ekle</h1>
          <p className="text-muted-foreground">
            Sisteme yeni bir bilgi girişi yapın
          </p>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Başlık *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Bilgi başlığını girin"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Açıklama
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Kısa bir açıklama (opsiyonel)"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Kategori
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Kategori (opsiyonel)"
                    value={formData.category}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    İçerik *
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    required
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Bilgi içeriğini detaylı olarak yazın..."
                    value={formData.content}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-200/50 dark:border-gray-700/50 rounded"
                    checked={formData.isPublic}
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="isPublic"
                    className="ml-2 block text-sm text-foreground"
                  >
                    Bu bilgiyi herkese açık yap
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-4">
                <div className="text-sm text-destructive">{error}</div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                <div className="text-sm text-green-700 dark:text-green-400">
                  Bilgi başarıyla kaydedildi! Bilgilerim sayfasına yönlendiriliyorsunuz...
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-200/50 dark:border-gray-700/50 text-foreground rounded-md hover:bg-accent transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}