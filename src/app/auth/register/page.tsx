'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'IDARECI'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/auth/signin?message=Kayıt başarılı! Giriş yapabilirsiniz.')
      } else {
        setError(data.error || 'Kayıt sırasında bir hata oluştu')
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            WebSitesi
          </Link>
          <ThemeToggle />
        </div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Card Container */}
          <div className="bg-card/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                Hesap Oluştur
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Bilgilerinizi girin ve hesabınızı oluşturun
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground">
                    Ad Soyad
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-background sm:text-sm"
                    placeholder="Adınızı ve soyadınızı girin"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    E-posta
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-background sm:text-sm"
                    placeholder="E-posta adresinizi girin"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Şifre
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-background sm:text-sm"
                    placeholder="Şifrenizi girin"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                    Şifre Tekrar
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-background sm:text-sm"
                    placeholder="Şifrenizi tekrar girin"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Rol Seçimi
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="role-idareci"
                        name="role"
                        type="radio"
                        value="IDARECI"
                        checked={formData.role === 'IDARECI'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-200/50 dark:border-gray-700/50 rounded"
                      />
                      <label htmlFor="role-idareci" className="ml-3 text-sm font-medium text-foreground">
                        İdareci
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="role-ogretmen"
                        name="role"
                        type="radio"
                        value="OGRETMEN"
                        checked={formData.role === 'OGRETMEN'}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-200/50 dark:border-gray-700/50 rounded"
                      />
                      <label htmlFor="role-ogretmen" className="ml-3 text-sm font-medium text-foreground">
                        Öğretmen
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Kayıt ediliyor...' : 'Kayıt Ol'}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Zaten hesabınız var mı?{' '}
                  <Link href="/auth/signin" className="font-medium text-primary hover:text-primary/80 transition-colors">
                    Giriş yapın
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}