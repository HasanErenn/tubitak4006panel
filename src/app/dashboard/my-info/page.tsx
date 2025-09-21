'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import Link from 'next/link'
import CopyButton from '@/components/ui/CopyButton'
import { exportToPDF } from '@/components/pdf/PDFTemplate'
import { useSession } from 'next-auth/react'

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
  userId: string
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

interface WordCount {
  purpose: number
  method: number
  expectedResult: number
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

function getWordCountStyle(count: number): string {
  if (count >= 50 && count <= 150) {
    return 'text-green-600 dark:text-green-400'
  }
  return 'text-red-600 dark:text-red-400'
}

export default function MyInfoPage() {
  const { data: session } = useSession()
  const [userInfos, setUserInfos] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditFormData>({
    title: '',
    mainArea: '',
    projectType: '',
    subject: '',
    purpose: '',
    method: '',
    expectedResult: ''
  })
  const [wordCount, setWordCount] = useState<WordCount>({
    purpose: 0,
    method: 0,
    expectedResult: 0
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchUserInfos()
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
    if (!editForm.subject) {
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

  const saveEdit = async (id: string) => {
    if (!validateEditForm()) {
      return
    }

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
        setError('') // Clear any previous errors
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

  const handlePDFExport = async (userInfo: UserInfo) => {
    if (!session?.user) return
    
    setPdfLoading(userInfo.id)
    try {
      const result = await exportToPDF(userInfo, {
        name: session.user.name || '',
        email: session.user.email || ''
      })
      
      if (result.success) {
        // Success feedback could be added here
      } else {
        setError(result.error || 'PDF oluşturulamadı')
      }
    } catch (error) {
      setError('PDF oluşturulurken hata oluştu')
    } finally {
      setPdfLoading(null)
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
                                Konu
                              </label>
                              <input
                                type="text"
                                name="subject"
                                value={editForm.subject}
                                onChange={handleEditChange}
                                className="w-full px-4 py-3 border border-blue-200 dark:border-blue-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-900/50 text-blue-900 dark:text-blue-100"
                              />
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
                              <input
                                type="text"
                                name="mainArea"
                                value={editForm.mainArea}
                                onChange={handleEditChange}
                                className="w-full px-4 py-3 border border-purple-200 dark:border-purple-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 dark:bg-gray-900/50 text-purple-900 dark:text-purple-100"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-purple-800 dark:text-purple-200">
                                Proje Türü
                              </label>
                              <input
                                type="text"
                                name="projectType"
                                value={editForm.projectType}
                                onChange={handleEditChange}
                                className="w-full px-4 py-3 border border-purple-200 dark:border-purple-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 dark:bg-gray-900/50 text-purple-900 dark:text-purple-100"
                              />
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
                                  <span className={`text-xs ${getWordCountStyle(wordCount.purpose)}`}>
                                    ({wordCount.purpose} kelime - 50-150 arası olmalı)
                                  </span>
                                </div>
                                {editForm.purpose && <CopyButton text={editForm.purpose} />}
                              </div>
                              <textarea
                                name="purpose"
                                value={editForm.purpose}
                                onChange={handleEditChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-orange-200 dark:border-orange-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 dark:bg-gray-900/50 text-orange-900 dark:text-orange-100 resize-none"
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
                                className="w-full px-4 py-3 border border-orange-200 dark:border-orange-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 dark:bg-gray-900/50 text-orange-900 dark:text-orange-100 resize-none"
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
                                className="w-full px-4 py-3 border border-orange-200 dark:border-orange-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 dark:bg-gray-900/50 text-orange-900 dark:text-orange-100 resize-none"
                              />
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
                            <h3 className="text-xl font-bold select-text cursor-text">
                              {info.title}
                            </h3>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm text-indigo-100 select-text cursor-text">
                            <div className="flex items-center">
                              <span className="font-medium">Ana Alan:</span>
                              <span className="ml-2 bg-white/20 px-2 py-1 rounded">{info.mainArea}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">Tür:</span>
                              <span className="ml-2 bg-white/20 px-2 py-1 rounded">{info.projectType}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">Konu:</span>
                              <span className="ml-2 bg-white/20 px-2 py-1 rounded truncate">{info.subject}</span>
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
                            <h4 className="font-bold text-blue-900 dark:text-blue-100 flex items-center select-text cursor-text">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Amaç ve Önem
                            </h4>
                            <CopyButton text={info.purpose} />
                          </div>
                          <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap leading-relaxed">
                            {info.purpose}
                          </div>
                        </div>

                        {/* Yöntem */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200/50 dark:border-green-800/50">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-green-900 dark:text-green-100 flex items-center select-text cursor-text">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              Yöntem
                            </h4>
                            <CopyButton text={info.method} />
                          </div>
                          <div className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap leading-relaxed">
                            {info.method}
                          </div>
                        </div>

                        {/* Beklenen Sonuç */}
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-6 border border-purple-200/50 dark:border-purple-800/50">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-purple-900 dark:text-purple-100 flex items-center select-text cursor-text">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              Beklenen Sonuç
                            </h4>
                            <CopyButton text={info.expectedResult} />
                          </div>
                          <div className="text-sm text-purple-800 dark:text-purple-200 whitespace-pre-wrap leading-relaxed">
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