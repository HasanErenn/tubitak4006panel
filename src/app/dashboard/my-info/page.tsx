'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import Link from 'next/link'
import CopyButton from '@/components/ui/CopyButton'
import { exportToPDF } from '@/components/pdf/PDFTemplate'
import { useSession } from 'next-auth/react'

// Dropdown seçimleri için sabit veriler
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

interface UserInfo {
  id: string
  title: string
  mainArea: string
  projectType: string
  projectSubType: string
  subject: string | null
  thematicArea: string | null
  purpose: string
  method: string
  expectedResult: string
  surveyApplied: boolean
  isPublic: boolean
  createdAt: string
  updatedAt: string
  userId: string
}

interface EditFormData {
  title: string
  mainArea: string
  projectType: string
  projectSubType: string
  subject: string | null
  thematicArea: string | null
  purpose: string
  method: string
  expectedResult: string
  surveyApplied: boolean
}

interface WordCount {
  purpose: number
  method: number
  expectedResult: number
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

function getWordCountStyle(count: number, range?: string): string {
  let minWords = 50, maxWords = 150;
  
  if (range) {
    const [min, max] = range.split('-').map(num => parseInt(num));
    minWords = min;
    maxWords = max;
  }
  
  if (count >= minWords && count <= maxWords) {
    return 'text-green-600 dark:text-green-400'
  }
  return 'text-red-600 dark:text-red-400'
}

interface ProjectSubject {
  id: string
  name: string
  isActive: boolean
}

export default function MyInfoPage() {
  const { data: session } = useSession()
  const [userInfos, setUserInfos] = useState<UserInfo[]>([])
  const [subjects, setSubjects] = useState<ProjectSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditFormData>({
    title: '',
    mainArea: '',
    projectType: '',
    projectSubType: '4006-B',
    subject: '',
    thematicArea: '',
    purpose: '',
    method: '',
    expectedResult: '',
    surveyApplied: false
  })
  const [wordCount, setWordCount] = useState<WordCount>({
    purpose: 0,
    method: 0,
    expectedResult: 0
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchUserInfos()
    fetchSubjects()
  }, [])

  // Kelime sayısını güncelle
  useEffect(() => {
    setWordCount({
      purpose: countWords(editForm.purpose),
      method: countWords(editForm.method),
      expectedResult: countWords(editForm.expectedResult)
    })
  }, [editForm.purpose, editForm.method, editForm.expectedResult])

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

  const startEdit = (info: UserInfo) => {
    setEditingId(info.id)
    setEditForm({
      title: info.title,
      mainArea: info.mainArea,
      projectType: info.projectType,
      projectSubType: info.projectSubType,
      subject: info.subject || '',
      thematicArea: info.thematicArea || '',
      purpose: info.purpose,
      method: info.method,
      expectedResult: info.expectedResult,
      surveyApplied: info.surveyApplied
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({
      title: '',
      mainArea: '',
      projectType: '',
      projectSubType: '4006-B',
      subject: '',
      thematicArea: '',
      purpose: '',
      method: '',
      expectedResult: '',
      surveyApplied: false
    })
  }

  const validateEditForm = (): boolean => {
    if (!editForm.title.trim()) {
      setError('Alt proje adı gereklidir')
      return false
    }
    if (!editForm.mainArea) {
      setError('Alt proje ana alanı seçiniz')
      return false
    }
    if (!editForm.projectType) {
      setError('Alt proje türü seçiniz')
      return false
    }

    // 4006-A ve 4006-B için farklı konu validasyonları
    if (editForm.projectSubType === '4006-A') {
      if (!editForm.thematicArea?.trim()) {
        setError('Tematik alan gereklidir')
        return false
      }
    } else {
      if (!editForm.subject) {
        setError('Alt proje konusu seçiniz')
        return false
      }
    }

    // 4006-A için farklı kelime limitleri
    if (editForm.projectSubType === '4006-A') {
      if (wordCount.purpose < 20 || wordCount.purpose > 50) {
        setError('Amaç ve Önem bölümü 20-50 kelime arasında olmalıdır')
        return false
      }
    } else {
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

  const saveEdit = async (id: string) => {
    if (!validateEditForm()) {
      return
    }

    try {
      // Veriyi API için hazırla
      const dataToSend = {
        ...editForm,
        // 4006-A için subject null, 4006-B için thematicArea null olmalı
        subject: editForm.projectSubType === '4006-A' ? null : (editForm.subject || null),
        thematicArea: editForm.projectSubType === '4006-B' ? null : (editForm.thematicArea || null)
      }
      
      console.log('Gönderilen veri:', dataToSend)

      const response = await fetch(`/api/user-info/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        await fetchUserInfos()
        setEditingId(null)
        setError('') // Clear any previous errors
      } else {
        const data = await response.json()
        console.error('Güncelleme hatası:', data)
        
        // Detaylı hata mesajı göster
        if (data.error && Array.isArray(data.error)) {
          setError(data.error.map((err: any) => err.message).join(', '))
        } else {
          setError(data.error || 'Güncelleme başarısız')
        }
      }
    } catch (err) {
      console.error('Güncelleme exception:', err)
      setError('Güncelleme sırasında hata oluştu')
    }
  }

  const deleteInfo = async (id: string) => {
    console.log('🔥 deleteInfo fonksiyonu çağrıldı, id:', id)
    try {
      console.log('🔥 DELETE request gönderiliyor:', `/api/user-info/${id}`)
      const response = await fetch(`/api/user-info/${id}`, {
        method: 'DELETE',
      })

      console.log('🔥 DELETE response:', response.status, response.statusText)

      if (response.ok) {
        console.log('🔥 Silme başarılı, liste yenileniyor')
        await fetchUserInfos()
        setDeleteConfirm(null)
      } else {
        const data = await response.json()
        console.log('🔥 Silme hatası:', data)
        setError(data.error || 'Silme işlemi başarısız')
      }
    } catch (err) {
      console.log('🔥 Silme exception:', err)
      setError('Silme işlemi sırasında hata oluştu')
    }
  }

  const handlePDFExport = async (userInfo: UserInfo) => {
    if (!session?.user) return
    
    setPdfLoading(userInfo.id)
    try {
      const pdfUserInfo = {
        ...userInfo,
        user: {
          name: session.user.name || '',
          email: session.user.email || ''
        }
      }
      
      const result = await exportToPDF(pdfUserInfo)
      
      if (result.success) {
        // Success feedback could be added here
      } else {
        setError(result.error || 'PDF oluşturulamadı')
      }
    } catch (err) {
      setError('PDF oluşturulurken hata oluştu')
    } finally {
      setPdfLoading(null)
    }
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
            <h1 className="text-2xl font-bold text-foreground">Alt Projelerim</h1>
            <p className="text-muted-foreground">
              Kaydettiğiniz alt projeleri görüntüleyin ve yönetin
            </p>
          </div>
          <Link
            href="/dashboard/add-info"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Yeni Alt Proje Oluştur
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
              Henüz hiç alt proje oluşturulmamış
            </div>
            <Link
              href="/dashboard/add-info"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              İlk alt projenizi oluşturun
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {userInfos.map((info, index) => (
              <div key={info.id} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                {editingId === info.id ? (
                  // Edit Mode
                  <>
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                      <h3 className="text-xl font-bold flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Alt Proje Düzenleme
                      </h3>
                      <p className="text-blue-100 mt-1">Proje bilgilerinizi güncelleyin</p>
                    </div>
                    <div className="p-8">
                      <div className="grid gap-6">
                        {/* Temel Alt Proje Bilgileri */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                          <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Temel Alt Proje Bilgileri
                          </h4>
                          <div className="grid gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-blue-800 dark:text-blue-200">
                                Alt Proje Adı
                              </label>
                              <input
                                type="text"
                                name="title"
                                value={editForm.title}
                                onChange={handleEditChange}
                                className="w-full px-4 py-3 border border-blue-200 dark:border-blue-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-900/50 text-blue-900 dark:text-blue-100"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-blue-800 dark:text-blue-200">
                                {editForm.projectSubType === '4006-A' ? 'Tematik Alan' : 'Konu'}
                              </label>
                              {editForm.projectSubType === '4006-A' ? (
                                <input
                                  type="text"
                                  name="thematicArea"
                                  value={editForm.thematicArea || ''}
                                  onChange={handleEditChange}
                                  placeholder="Tematik alanı yazınız..."
                                  className="w-full px-4 py-3 border border-blue-200 dark:border-blue-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-900/50 text-blue-900 dark:text-blue-100"
                                />
                              ) : (
                                <select
                                  name="subject"
                                  value={editForm.subject || ''}
                                  onChange={handleEditChange}
                                  className="w-full px-4 py-3 border border-blue-200 dark:border-blue-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-900/50 text-blue-900 dark:text-blue-100"
                                >
                                  <option value="">Konu seçiniz</option>
                                  {subjects.map(subject => (
                                    <option key={subject.id} value={subject.name}>{subject.name}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Alan ve Tür Seçimi */}
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-6 border border-purple-200/50 dark:border-purple-800/50">
                          <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Alan ve Tür Seçimi
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-purple-800 dark:text-purple-200">
                                Ana Alan
                              </label>
                              <select
                                name="mainArea"
                                value={editForm.mainArea}
                                onChange={handleEditChange}
                                className="w-full px-4 py-3 border border-purple-200 dark:border-purple-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 dark:bg-gray-900/50 text-purple-900 dark:text-purple-100"
                              >
                                <option value="">Alan seçiniz</option>
                                {MAIN_AREAS.map(area => (
                                  <option key={area} value={area}>{area}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-purple-800 dark:text-purple-200">
                                Proje Türü
                              </label>
                              <select
                                name="projectType"
                                value={editForm.projectType}
                                onChange={handleEditChange}
                                className="w-full px-4 py-3 border border-purple-200 dark:border-purple-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 dark:bg-gray-900/50 text-purple-900 dark:text-purple-100"
                              >
                                <option value="">Tür seçiniz</option>
                                {(editForm.projectSubType === '4006-A' ? [...PROJECT_TYPES, 'İnceleme'] : PROJECT_TYPES).map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Detaylı Açıklamalar */}
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200/50 dark:border-orange-800/50">
                          <h4 className="font-bold text-orange-900 dark:text-orange-100 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                            Detaylı Açıklamalar
                          </h4>
                          <div className="grid gap-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <label className="block text-sm font-medium text-orange-800 dark:text-orange-200">
                                    Amaç ve Önem
                                  </label>
                                  <span className={`text-xs ${getWordCountStyle(wordCount.purpose, editForm.projectSubType === '4006-A' ? '20-50' : '50-150')}`}>
                                    ({wordCount.purpose} kelime - {editForm.projectSubType === '4006-A' ? '20-50' : '50-150'} arası olmalı)
                                  </span>
                                </div>
                                {editForm.purpose && <CopyButton text={editForm.purpose} />}
                              </div>
                              <textarea
                                name="purpose"
                                value={editForm.purpose}
                                onChange={handleEditChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-orange-200 dark:border-orange-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 dark:bg-gray-900/50 text-orange-900 dark:text-orange-100 resize-none text-justify"
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <label className="block text-sm font-medium text-orange-800 dark:text-orange-200">
                                    Yöntem
                                  </label>
                                  <span className={`text-xs ${getWordCountStyle(wordCount.method)}`}>
                                    ({wordCount.method} kelime - 50-150 arası olmalı)
                                  </span>
                                </div>
                                {editForm.method && <CopyButton text={editForm.method} />}
                              </div>
                              <textarea
                                name="method"
                                value={editForm.method}
                                onChange={handleEditChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-orange-200 dark:border-orange-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 dark:bg-gray-900/50 text-orange-900 dark:text-orange-100 resize-none text-justify"
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <label className="block text-sm font-medium text-orange-800 dark:text-orange-200">
                                    Beklenen Sonuç
                                  </label>
                                  <span className={`text-xs ${getWordCountStyle(wordCount.expectedResult)}`}>
                                    ({wordCount.expectedResult} kelime - 50-150 arası olmalı)
                                  </span>
                                </div>
                                {editForm.expectedResult && <CopyButton text={editForm.expectedResult} />}
                              </div>
                              <textarea
                                name="expectedResult"
                                value={editForm.expectedResult}
                                onChange={handleEditChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-orange-200 dark:border-orange-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 dark:bg-gray-900/50 text-orange-900 dark:text-orange-100 resize-none text-justify"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Anket Sorusu */}
                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-teal-200/50 dark:border-teal-800/50">
                          <h4 className="font-bold text-teal-900 dark:text-teal-100 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            Anket Uygulaması
                          </h4>
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
                                  checked={editForm.surveyApplied === true}
                                  onChange={() => setEditForm({...editForm, surveyApplied: true})}
                                  className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 focus:ring-2"
                                />
                                <span className="ml-2 text-teal-900 dark:text-teal-100 font-medium">Evet</span>
                              </label>
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="surveyApplied"
                                  value="false"
                                  checked={editForm.surveyApplied === false}
                                  onChange={() => setEditForm({...editForm, surveyApplied: false})}
                                  className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 focus:ring-2"
                                />
                                <span className="ml-2 text-teal-900 dark:text-teal-100 font-medium">Hayır</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex justify-end space-x-4">
                            <button
                              onClick={cancelEdit}
                              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-semibold"
                            >
                              İptal
                            </button>
                            <button
                              onClick={() => saveEdit(info.id)}
                              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                            >
                              Değişiklikleri Kaydet
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // View Mode
                  <>
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                              index % 4 === 0 ? 'bg-blue-500' : 
                              index % 4 === 1 ? 'bg-green-500' :
                              index % 4 === 2 ? 'bg-purple-500' : 'bg-orange-500'
                            }`}>
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold select-text cursor-text">
                                {info.title}
                              </h3>
                              <div className="flex items-center mt-1">
                                <span className="text-sm bg-white/30 px-3 py-1 rounded-full font-semibold">
                                  TUBİTAK {info.projectSubType}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-indigo-100 select-text cursor-text">
                            <div className="flex items-center">
                              <span className="font-medium">Ana Alan:</span>
                              <span className="ml-2 bg-white/20 px-2 py-1 rounded">{info.mainArea}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">Tür:</span>
                              <span className="ml-2 bg-white/20 px-2 py-1 rounded">{info.projectType}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">
                                {info.projectSubType === '4006-A' ? 'Tematik Alan:' : 'Konu:'}
                              </span>
                              <span className="ml-2 bg-white/20 px-2 py-1 rounded truncate">
                                {info.projectSubType === '4006-A' ? info.thematicArea : info.subject}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">Anket:</span>
                              <span className={`ml-2 px-2 py-1 rounded font-medium ${
                                info.surveyApplied 
                                  ? 'bg-green-500/80 text-white' 
                                  : 'bg-red-500/80 text-white'
                              }`}>
                                {info.surveyApplied ? 'Evet' : 'Hayır'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-3 ml-4">
                          <button
                            onClick={() => handlePDFExport(info)}
                            disabled={pdfLoading === info.id}
                            className="px-4 py-2 bg-green-500/80 hover:bg-green-500 disabled:bg-green-400 text-white rounded-lg transition-all flex items-center font-medium"
                          >
                            {pdfLoading === info.id ? (
                              <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                            PDF İndir
                          </button>
                          <button
                            onClick={() => startEdit(info)}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all flex items-center font-medium backdrop-blur-sm"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Düzenle
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(info.id)}
                            className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-all flex items-center font-medium"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-8">

                      <div className="grid gap-6">
                        {/* Amaç ve Önem */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-blue-900 dark:text-blue-100 flex items-center select-text cursor-text">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {info.projectSubType === '4006-A' ? 'Amaç' : 'Amaç ve Önem'}
                              </h4>
                              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full font-medium">
                                {countWords(info.purpose)} kelime
                              </span>
                            </div>
                            <CopyButton text={info.purpose} />
                          </div>
                          <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap leading-relaxed text-justify">
                            {info.purpose}
                          </div>
                        </div>

                        {/* Yöntem */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200/50 dark:border-green-800/50">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-green-900 dark:text-green-100 flex items-center select-text cursor-text">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                Yöntem
                              </h4>
                              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 rounded-full font-medium">
                                {countWords(info.method)} kelime
                              </span>
                            </div>
                            <CopyButton text={info.method} />
                          </div>
                          <div className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap leading-relaxed text-justify">
                            {info.method}
                          </div>
                        </div>

                        {/* Beklenen Sonuç */}
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-6 border border-purple-200/50 dark:border-purple-800/50">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-purple-900 dark:text-purple-100 flex items-center select-text cursor-text">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Beklenen Sonuç
                              </h4>
                              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded-full font-medium">
                                {countWords(info.expectedResult)} kelime
                              </span>
                            </div>
                            <CopyButton text={info.expectedResult} />
                          </div>
                          <div className="text-sm text-purple-800 dark:text-purple-200 whitespace-pre-wrap leading-relaxed text-justify">
                            {info.expectedResult}
                          </div>
                        </div>
                      </div>                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span>
                            Oluşturulma: {new Date(info.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                          <span>
                            Güncelleme: {new Date(info.updatedAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </div>


                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Alt Projeyi Sil
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bu işlem geri alınamaz!
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Bu alt projeyi silmek istediğinizden emin misiniz? Tüm veriler kalıcı olarak silinecektir.
            </p>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => {
                  console.log('Modal İptal butonu tıklandı!')
                  setDeleteConfirm(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  console.log('🔥 Modal SİL butonu tıklandı! ID:', deleteConfirm)
                  deleteInfo(deleteConfirm)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}