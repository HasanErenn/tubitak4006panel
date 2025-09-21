'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'

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
  user: {
    name: string
    email: string
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProject, setSelectedProject] = useState<UserInfo | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchProjects()
  }, [session, status, router])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      } else {
        setError('Alt projeler yüklenirken hata oluştu')
      }
    } catch (error) {
      setError('Alt projeler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleProjectDetail = (project: UserInfo) => {
    setSelectedProject(project)
  }

  const closeDetail = () => {
    setSelectedProject(null)
  }

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Başarılı kopyalama bildirimi (isteğe bağlı)
    }).catch(err => {
      console.error('Kopyalama başarısız:', err)
    })
  }

  const downloadPDF = async (project: UserInfo) => {
    try {
      // PDF export fonksiyonunu import et
      const { exportToPDF } = await import('@/components/pdf/PDFTemplate')
      
      // UserInfo formatına dönüştür
      const userInfo = {
        id: project.id,
        title: project.title,
        mainArea: project.mainArea,
        projectType: project.projectType,
        subject: project.subject,
        purpose: project.purpose,
        method: project.method,
        expectedResult: project.expectedResult,
        createdAt: project.createdAt,
        updatedAt: project.createdAt
      }

      const user = {
        id: '',
        name: project.user.name,
        email: project.user.email
      }

      // PDF'i indir
      await exportToPDF(userInfo, user)
    } catch (error) {
      console.error('PDF indirme hatası:', error)
      alert('PDF indirme sırasında bir hata oluştu.')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <div className="text-foreground">Yükleniyor...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Paneli - Alt Projeler</h1>
          <p className="text-muted-foreground">
            Sistemde kayıtlı tüm alt projeleri görüntüleyebilirsiniz
          </p>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-sm font-medium text-muted-foreground">
              Toplam Alt Proje
            </h3>
            <p className="text-2xl font-bold text-foreground">
              {projects.length}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-destructive/10 p-4">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

        {/* Alt Proje Listesi */}
        <div className="bg-card border border-gray-200/50 dark:border-gray-700/50 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-lg font-semibold text-foreground">
              Alt Projeler
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    İsim Soyisim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Proje Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ana Alan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-muted/25">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">
                        {project.user.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {project.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">
                        {project.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {project.projectType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {project.mainArea}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(project.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleProjectDetail(project)}
                          className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90"
                        >
                          Detay
                        </button>
                        <button
                          onClick={() => downloadPDF(project)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          PDF İndir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Project Detail Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="px-6 py-4 border-b border-gray-300 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-900">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Alt Proje Detayları
                </h3>
                <button
                  onClick={closeDetail}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 bg-white dark:bg-gray-900">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sol Kolon */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Kullanıcı Bilgileri
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-3 rounded-lg">
                        <p className="font-medium text-gray-900 dark:text-white">{selectedProject.user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedProject.user.email}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Alt Proje Adı
                      </label>
                      <div 
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => copyToClipboard(selectedProject.title, 'Alt Proje Adı')}
                        title="Kopyalamak için tıklayın"
                      >
                        <p className="text-gray-900 dark:text-white">{selectedProject.title}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Alt Proje Ana Alanı
                      </label>
                      <div 
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => copyToClipboard(selectedProject.mainArea, 'Alt Proje Ana Alanı')}
                        title="Kopyalamak için tıklayın"
                      >
                        <p className="text-gray-900 dark:text-white">{selectedProject.mainArea}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Alt Proje Türü
                      </label>
                      <div 
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => copyToClipboard(selectedProject.projectType, 'Alt Proje Türü')}
                        title="Kopyalamak için tıklayın"
                      >
                        <p className="text-gray-900 dark:text-white">{selectedProject.projectType}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Alt Proje Konusu
                      </label>
                      <div 
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => copyToClipboard(selectedProject.subject, 'Alt Proje Konusu')}
                        title="Kopyalamak için tıklayın"
                      >
                        <p className="text-gray-900 dark:text-white">{selectedProject.subject}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Oluşturulma Tarihi
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-3 rounded-lg">
                        <p className="text-gray-900 dark:text-white">{new Date(selectedProject.createdAt).toLocaleString('tr-TR')}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sağ Kolon */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                          Amaç ve Önem
                        </label>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {countWords(selectedProject.purpose)} kelime
                        </span>
                      </div>
                      <div 
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-3 rounded-lg h-32 overflow-y-auto cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => copyToClipboard(selectedProject.purpose, 'Amaç ve Önem')}
                        title="Kopyalamak için tıklayın"
                      >
                        <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-white">{selectedProject.purpose}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                          Yöntem
                        </label>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {countWords(selectedProject.method)} kelime
                        </span>
                      </div>
                      <div 
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-3 rounded-lg h-32 overflow-y-auto cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => copyToClipboard(selectedProject.method, 'Yöntem')}
                        title="Kopyalamak için tıklayın"
                      >
                        <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-white">{selectedProject.method}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                          Beklenen Sonuç
                        </label>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {countWords(selectedProject.expectedResult)} kelime
                        </span>
                      </div>
                      <div 
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-3 rounded-lg h-32 overflow-y-auto cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => copyToClipboard(selectedProject.expectedResult, 'Beklenen Sonuç')}
                        title="Kopyalamak için tıklayın"
                      >
                        <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-white">{selectedProject.expectedResult}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end border-t border-gray-300 dark:border-gray-600 pt-4">
                  <button
                    onClick={closeDetail}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}