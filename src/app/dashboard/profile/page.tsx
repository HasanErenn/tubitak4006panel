'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'

interface UserProfile {
  name: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }))
    }
  }, [session?.user?.name, session?.user?.email])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    // Şifre değişikliği için validasyon
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Yeni şifreler eşleşmiyor')
        setLoading(false)
        return
      }
      if (formData.newPassword.length < 6) {
        setError('Yeni şifre en az 6 karakter olmalıdır')
        setLoading(false)
        return
      }
      if (!formData.currentPassword) {
        setError('Şifre değiştirmek için mevcut şifrenizi girmelisiniz')
        setLoading(false)
        return
      }
    }

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email
      }

      // Şifre değişikliği varsa ekle
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      const response = await fetch('/api/user-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Güncelleme başarısız')
      }

      setMessage('Bilgileriniz başarıyla güncellendi')
      
      // Session'ı güncelle - NextAuth update işlemi
      await update({
        name: formData.name,
        email: formData.email
      })
      
      // Şifre alanlarını temizle
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
      
      // Sayfayı yenile (opsiyonel - eğer session update çalışmazsa)
      // window.location.reload()
      
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">Yükleniyor...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold flex items-center mb-2">
          <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Kullanıcı Bilgilerim
        </h1>
        <p className="text-indigo-100">
          Hesap bilgilerinizi güvenli bir şekilde güncelleyin
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="text-green-800 dark:text-green-200 text-sm font-medium">{message}</div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Kişisel Bilgiler */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
          <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center text-lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Kişisel Bilgiler
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-blue-800 dark:text-blue-200">
                Ad Soyad
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-blue-200 dark:border-blue-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-900/50 text-blue-900 dark:text-blue-100"
                placeholder="Adınızı ve soyadınızı girin"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-blue-800 dark:text-blue-200">
                E-posta Adresi
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-blue-200 dark:border-blue-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-900/50 text-blue-900 dark:text-blue-100"
                placeholder="E-posta adresinizi girin"
              />
            </div>
          </div>
        </div>

        {/* Şifre Değiştirme */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200/50 dark:border-red-800/50">
          <h3 className="font-bold text-red-900 dark:text-red-100 mb-4 flex items-center text-lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Şifre Değiştirme
          </h3>
          <p className="text-red-700 dark:text-red-300 text-sm mb-4">
            Şifrenizi değiştirmek istemiyorsanız bu alanları boş bırakın
          </p>
          <div className="grid gap-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-2 text-red-800 dark:text-red-200">
                Mevcut Şifre
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-red-200 dark:border-red-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/50 dark:bg-gray-900/50 text-red-900 dark:text-red-100"
                placeholder="Mevcut şifrenizi girin"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2 text-red-800 dark:text-red-200">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-red-200 dark:border-red-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/50 dark:bg-gray-900/50 text-red-900 dark:text-red-100"
                  placeholder="Yeni şifrenizi girin"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-red-800 dark:text-red-200">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-red-200 dark:border-red-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/50 dark:bg-gray-900/50 text-red-900 dark:text-red-100"
                  placeholder="Yeni şifrenizi tekrar girin"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kaydetme Butonu */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Güncelleniyor...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Değişiklikleri Kaydet
                </div>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
    </DashboardLayout>
  )
}