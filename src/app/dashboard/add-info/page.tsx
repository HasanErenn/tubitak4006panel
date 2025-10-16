'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import CopyButton from '@/components/ui/CopyButton'

interface FormData {
  title: string
  mainArea: string
  projectType: string
  projectSubType: string
  subject: string
  thematicArea: string
  purpose: string
  method: string
  expectedResult: string
  surveyApplied: boolean
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
const PROJECT_TYPES_4006_A = ['Araştırma', 'Tasarım', 'İnceleme']

const PROJECT_SUB_TYPES = [
  { value: '4006-A', label: 'TUBİTAK 4006-A Alt Projesi' },
  { value: '4006-B', label: 'TUBİTAK 4006-B Alt Projesi' }
]

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

function getWordCountStyle(count: number, isA4006: boolean = false): string {
  if (isA4006) {
    // 4006-A için amaç: 20-50 kelime
    if (count >= 20 && count <= 50) {
      return 'text-green-600 dark:text-green-400'
    }
  } else {
    // 4006-B için amaç ve önem: 50-150 kelime
    if (count >= 50 && count <= 150) {
      return 'text-green-600 dark:text-green-400'
    }
  }
  return 'text-red-600 dark:text-red-400'
}

export default function AddInfoPage() {
  const router = useRouter()
  const [projectSubTypeSelected, setProjectSubTypeSelected] = useState<string>('')
  const [formData, setFormData] = useState<FormData>({
    title: '',
    mainArea: '',
    projectType: '',
    projectSubType: '',
    subject: '',
    thematicArea: '',
    purpose: '',
    method: '',
    expectedResult: '',
    surveyApplied: false
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
    if (projectSubTypeSelected === '4006-A') {
      if (!formData.thematicArea.trim()) {
        setError('Tematik alan giriniz')
        return false
      }
      if (wordCount.purpose < 20 || wordCount.purpose > 50) {
        setError('Amaç bölümü 20-50 kelime arasında olmalıdır')
        return false
      }
    } else {
      if (!formData.subject) {
        setError('Alt proje konusu seçiniz')
        return false
      }
      if (wordCount.purpose < 50 || wordCount.purpose > 150) {
        setError('Amaç ve Önem bölümü 50-150 kelime arasında olmalıdır')
        return false
      }
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
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Alt Proje Bilgi Girişi
            </h1>
            <p className="text-blue-100">
              Alt proje bilgilerinizi aşağıdaki formu doldurarak ekleyin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Proje Alt Türü Seçimi */}
            {!projectSubTypeSelected && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  Proje Türü Seçimi
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Oluşturmak istediğiniz alt proje türünü seçiniz:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PROJECT_SUB_TYPES.map((subType) => (
                    <button
                      key={subType.value}
                      type="button"
                      onClick={() => {
                        setProjectSubTypeSelected(subType.value)
                        setFormData(prev => ({ ...prev, projectSubType: subType.value }))
                      }}
                      className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {subType.label}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {subType.value === '4006-A' ? 
                          'Amaç odaklı, tematik alan tabanlı proje formu' : 
                          'Standart TUBİTAK 4006 proje formu'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ana Form - Sadece proje türü seçildikten sonra göster */}
            {projectSubTypeSelected && (
              <>
            {/* Temel Bilgiler */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Temel Proje Bilgileri
                <button
                  type="button"
                  onClick={() => {
                    setProjectSubTypeSelected('')
                    setFormData({
                      title: '',
                      mainArea: '',
                      projectType: '',
                      projectSubType: '',
                      subject: '',
                      thematicArea: '',
                      purpose: '',
                      method: '',
                      expectedResult: '',
                      surveyApplied: false
                    })
                  }}
                  className="ml-auto text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Proje Türünü Değiştir
                </button>
              </h2>
              
              <div className="space-y-6">
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    placeholder="Alt proje adınızı girin"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Alan ve Tür Seçimi */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                Alan ve Tür Seçimi
              </h2>

              <div className="space-y-6">
                {/* Alt Proje Ana Alanı */}
                <div>
                  <label htmlFor="mainArea" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Alt Proje Ana Alanı *
                  </label>
                    <select
                      id="mainArea"
                      name="mainArea"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-3 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
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
                  <div className={`grid gap-3 ${projectSubTypeSelected === '4006-A' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {(projectSubTypeSelected === '4006-A' ? PROJECT_TYPES_4006_A : PROJECT_TYPES).map(type => (
                      <div key={type} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-2 border-transparent has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50 dark:has-[:checked]:bg-purple-900/20">
                        <input
                          type="radio"
                          id={`projectType-${type}`}
                          name="projectType"
                          value={type}
                          checked={formData.projectType === type}
                          onChange={handleChange}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600"
                        />
                        <label htmlFor={`projectType-${type}`} className="ml-3 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Konu Seçimi */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                {projectSubTypeSelected === '4006-A' ? 'Tematik Alan' : 'Proje Konusu'}
              </h2>

              {/* 4006-A için Tematik Alan (Text Input) */}
              {projectSubTypeSelected === '4006-A' && (
                <div>
                  <label htmlFor="thematicArea" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Tematik Alan *
                  </label>
                  <input
                    type="text"
                    id="thematicArea"
                    name="thematicArea"
                    required
                    placeholder="Tematik alanı yazınız..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-3 focus:ring-green-500/30 focus:border-green-500 transition-all"
                    value={formData.thematicArea}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* 4006-B için Alt Proje Konusu (Dropdown) */}
              {projectSubTypeSelected === '4006-B' && (
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Alt Proje Konusu *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-3 focus:ring-green-500/30 focus:border-green-500 transition-all"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option value="">Konu seçiniz</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.name}>{subject.name}</option>
                  ))}
                </select>
              </div>
              )}
            </div>

            {/* Anket Sorusu */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-teal-200/50 dark:border-teal-800/50">
              <h3 className="font-bold text-teal-900 dark:text-teal-100 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Anket Uygulaması
              </h3>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-teal-800 dark:text-teal-200">
                  Anket uygulayacak mısınız? *
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="surveyApplied"
                      value="true"
                      checked={formData.surveyApplied === true}
                      onChange={() => setFormData({...formData, surveyApplied: true})}
                      className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 focus:ring-2"
                    />
                    <span className="ml-2 text-teal-900 dark:text-teal-100 font-medium">Evet</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="surveyApplied"
                      value="false"
                      checked={formData.surveyApplied === false}
                      onChange={() => setFormData({...formData, surveyApplied: false})}
                      className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 focus:ring-2"
                    />
                    <span className="ml-2 text-teal-900 dark:text-teal-100 font-medium">Hayır</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Detaylı Açıklamalar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Detaylı Proje Açıklamaları
              </h2>

              <div className="space-y-8">
                {/* Amaç / Amaç ve Önem */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <label htmlFor="purpose" className="block text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {projectSubTypeSelected === '4006-A' ? 'Amaç * (20-50 kelime)' : 'Amaç ve Önem * (50-150 kelime)'}
                    </label>
                    {formData.purpose && <CopyButton text={formData.purpose} />}
                  </div>
                  <textarea
                    id="purpose"
                    name="purpose"
                    required
                    rows={projectSubTypeSelected === '4006-A' ? 3 : 5}
                    className="w-full px-4 py-3 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none text-justify"
                    placeholder={projectSubTypeSelected === '4006-A' ? 'Alt projenizin amacını açıklayın...' : 'Alt projenizin amacını ve önemini açıklayın...'}
                    value={formData.purpose}
                    onChange={handleChange}
                  />
                  <div className={`text-xs mt-2 font-medium ${getWordCountStyle(wordCount.purpose, projectSubTypeSelected === '4006-A')}`}>
                    {wordCount.purpose} kelime
                    {projectSubTypeSelected === '4006-A' ? (
                      <>
                        {wordCount.purpose < 20 && ' (En az 20 kelime gerekli)'}
                        {wordCount.purpose > 50 && ' (En fazla 50 kelime olmalı)'}
                      </>
                    ) : (
                      <>
                        {wordCount.purpose < 50 && ' (En az 50 kelime gerekli)'}
                        {wordCount.purpose > 150 && ' (En fazla 150 kelime olmalı)'}
                      </>
                    )}
                  </div>
                </div>

                {/* Yöntem */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200/50 dark:border-green-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <label htmlFor="method" className="block text-sm font-semibold text-green-900 dark:text-green-100 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Yöntem * (50-150 kelime)
                    </label>
                    {formData.method && <CopyButton text={formData.method} />}
                  </div>
                  <textarea
                    id="method"
                    name="method"
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-3 focus:ring-green-500/30 focus:border-green-500 transition-all resize-none text-justify"
                    placeholder="Kullanacağınız yöntemleri açıklayın..."
                    value={formData.method}
                    onChange={handleChange}
                  />
                  <div className={`text-xs mt-2 font-medium ${getWordCountStyle(wordCount.method)}`}>
                    {wordCount.method} kelime
                    {wordCount.method < 50 && ' (En az 50 kelime gerekli)'}
                    {wordCount.method > 150 && ' (En fazla 150 kelime olmalı)'}
                  </div>
                </div>

                {/* Beklenen Sonuç */}
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-4 border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <label htmlFor="expectedResult" className="block text-sm font-semibold text-purple-900 dark:text-purple-100 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Beklenen Sonuç * (50-150 kelime)
                    </label>
                    {formData.expectedResult && <CopyButton text={formData.expectedResult} />}
                  </div>
                  <textarea
                    id="expectedResult"
                    name="expectedResult"
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-3 focus:ring-purple-500/30 focus:border-purple-500 transition-all resize-none text-justify"
                    placeholder="Beklediğiniz sonuçları açıklayın..."
                    value={formData.expectedResult}
                    onChange={handleChange}
                  />
                  <div className={`text-xs mt-2 font-medium ${getWordCountStyle(wordCount.expectedResult)}`}>
                    {wordCount.expectedResult} kelime
                    {wordCount.expectedResult < 50 && ' (En az 50 kelime gerekli)'}
                    {wordCount.expectedResult > 150 && ' (En fazla 150 kelime olmalı)'}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/50 dark:to-pink-900/50 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-6 py-4 rounded-xl text-sm font-medium shadow-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kaydediliyor...
                    </span>
                  ) : 'Alt Projeyi Kaydet'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/my-info')}
                  className="px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-semibold"
                >
                  İptal
                </button>
              </div>
            </div>
            </>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}