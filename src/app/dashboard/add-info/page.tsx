'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import CopyButton from '@/components/ui/CopyButton'

interface FormData {
  title: string
  mainArea: string
  projectType: string
  subject: string
  purpose: string
  method: string
  expectedResult: string
}

interface ProjectSubject {
  id: string
  name: string
}

interface WordCount {
  purpose: number
  method: number
  expectedResult: number
}

const MAIN_AREAS = [
  'Biyoloji',
  'Coğrafya', 
  'Değerler Eğitimi',
  'Dil ve Edebiyat',
  'Fizik',
  'Kimya',
  'Matematik',
  'Sosyoloji',
  'Psikoloji',
  'Tarih',
  'Teknoloji ve Tasarım',
  'Bilişim Teknolojileri ve Yazılım'
]

const PROJECT_TYPES = ['Araştırma', 'Tasarım']

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

function getWordCountStyle(count: number): string {
  if (count >= 50 && count <= 150) {
    return 'text-green-600 dark:text-green-400'
  }
  return 'text-red-600 dark:text-red-400'
}

export default function AddInfoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    title: '',
    mainArea: '',
    projectType: '',
    subject: '',
    purpose: '',
    method: '',
    expectedResult: ''
  })
  const [subjects, setSubjects] = useState<ProjectSubject[]>([])
  const [wordCount, setWordCount] = useState<WordCount>({
    purpose: 0,
    method: 0,
    expectedResult: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Alt proje konularını yükle
  useEffect(() => {
    fetchSubjects()
  }, [])

  // Kelime sayısını güncelle
  useEffect(() => {
    setWordCount({
      purpose: countWords(formData.purpose),
      method: countWords(formData.method),
      expectedResult: countWords(formData.expectedResult)
    })
  }, [formData.purpose, formData.method, formData.expectedResult])

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/project-subjects')
      if (response.ok) {
        const data = await response.json()
        setSubjects(data)
      }
    } catch (error) {
      console.error('Alt proje konuları yüklenemedi:', error)
    }
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Alt proje adı gereklidir')
      return false
    }
    if (!formData.mainArea) {
      setError('Alt proje ana alanı seçiniz')
      return false
    }
    if (!formData.projectType) {
      setError('Alt proje türü seçiniz')
      return false
    }
    if (!formData.subject) {
      setError('Alt proje konusu seçiniz')
      return false
    }
    if (wordCount.purpose < 50 || wordCount.purpose > 150) {
      setError('Amaç ve Önem bölümü 50-150 kelime arasında olmalıdır')
      return false
    }
    if (wordCount.method < 50 || wordCount.method > 150) {
      setError('Yöntem bölümü 50-150 kelime arasında olmalıdır')
      return false
    }
    if (wordCount.expectedResult < 50 || wordCount.expectedResult > 150) {
      setError('Beklenen Sonuç bölümü 50-150 kelime arasında olmalıdır')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/user-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard/my-info')
        }, 2000)
      } else {
        setError(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Başarılı!</h2>
            <p className="text-gray-600 dark:text-gray-400">Alt proje bilgileriniz başarıyla kaydedildi.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Alt Proje Bilgi Girişi
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Alt proje bilgilerinizi aşağıdaki formu doldurarak ekleyin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Alt Proje Adı */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Alt Proje Adı *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Alt proje adınızı girin"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            {/* Alt Proje Ana Alanı */}
            <div>
              <label htmlFor="mainArea" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Alt Proje Ana Alanı *
              </label>
              <select
                id="mainArea"
                name="mainArea"
                required
                className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.mainArea}
                onChange={handleChange}
              >
                <option value="">Alan seçiniz</option>
                {MAIN_AREAS.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            {/* Alt Proje Türü */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Alt Proje Türü *
              </label>
              <div className="space-y-2">
                {PROJECT_TYPES.map(type => (
                  <div key={type} className="flex items-center">
                    <input
                      type="radio"
                      id={`projectType-${type}`}
                      name="projectType"
                      value={type}
                      checked={formData.projectType === type}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                    />
                    <label htmlFor={`projectType-${type}`} className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Alt Proje Konusu */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Alt Proje Konusu *
              </label>
              <select
                id="subject"
                name="subject"
                required
                className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.subject}
                onChange={handleChange}
              >
                <option value="">Konu seçiniz</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.name}>{subject.name}</option>
                ))}
              </select>
            </div>

            {/* Amaç ve Önem */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-900 dark:text-white">
                  Amaç ve Önem * (50-150 kelime)
                </label>
                {formData.purpose && <CopyButton text={formData.purpose} />}
              </div>
              <textarea
                id="purpose"
                name="purpose"
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Alt projenizin amacını ve önemini açıklayın..."
                value={formData.purpose}
                onChange={handleChange}
              />
              <div className={`text-sm mt-1 ${getWordCountStyle(wordCount.purpose)}`}>
                {wordCount.purpose} kelime
                {wordCount.purpose < 50 && ' (En az 50 kelime gerekli)'}
                {wordCount.purpose > 150 && ' (En fazla 150 kelime olmalı)'}
              </div>
            </div>

            {/* Yöntem */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="method" className="block text-sm font-medium text-gray-900 dark:text-white">
                  Yöntem * (50-150 kelime)
                </label>
                {formData.method && <CopyButton text={formData.method} />}
              </div>
              <textarea
                id="method"
                name="method"
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Kullanacağınız yöntemleri açıklayın..."
                value={formData.method}
                onChange={handleChange}
              />
              <div className={`text-sm mt-1 ${getWordCountStyle(wordCount.method)}`}>
                {wordCount.method} kelime
                {wordCount.method < 50 && ' (En az 50 kelime gerekli)'}
                {wordCount.method > 150 && ' (En fazla 150 kelime olmalı)'}
              </div>
            </div>

            {/* Beklenen Sonuç */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="expectedResult" className="block text-sm font-medium text-gray-900 dark:text-white">
                  Beklenen Sonuç * (50-150 kelime)
                </label>
                {formData.expectedResult && <CopyButton text={formData.expectedResult} />}
              </div>
              <textarea
                id="expectedResult"
                name="expectedResult"
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Beklediğiniz sonuçları açıklayın..."
                value={formData.expectedResult}
                onChange={handleChange}
              />
              <div className={`text-sm mt-1 ${getWordCountStyle(wordCount.expectedResult)}`}>
                {wordCount.expectedResult} kelime
                {wordCount.expectedResult < 50 && ' (En az 50 kelime gerekli)'}
                {wordCount.expectedResult > 150 && ' (En fazla 150 kelime olmalı)'}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/my-info')}
                className="px-4 py-2 border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}