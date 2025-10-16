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
  surveyApplied: boolean
  isPublic: boolean
  createdAt: string
  user: {
    name: string
    email: string
  }
}

interface User {
  id: string
  name: string
  email: string
  schoolCode: string | null
  role: 'USER' | 'ADMIN' | 'IDARECI' | 'OGRETMEN' | 'TUBITAK_OKUL_YETKILISI' | 'OGRENCI'
  createdAt: string
  _count: {
    userInfos: number
  }
}

interface EditUserData {
  name: string
  role: 'USER' | 'ADMIN' | 'IDARECI' | 'OGRETMEN' | 'TUBITAK_OKUL_YETKILISI' | 'OGRENCI'
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'projects' | 'users'>('projects')
  
  // Project states
  const [projects, setProjects] = useState<UserInfo[]>([])
  const [selectedProject, setSelectedProject] = useState<UserInfo | null>(null)
  
  // User states
  const [users, setUsers] = useState<User[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditUserData>({
    name: '',
    role: 'USER'
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  
  // Global states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'ADMIN' && (session.user as any).role !== 'TUBITAK_OKUL_YETKILISI') {
      router.push('/dashboard')
      return
    }

    if (activeTab === 'projects') {
      fetchProjects()
    } else {
      fetchUsers()
    }
  }, [session, status, router, activeTab])

  const fetchProjects = async () => {
    setLoading(true)
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

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        setError('Kullanıcı listesi yüklenirken hata oluştu')
      }
    } catch (error) {
      setError('Kullanıcı listesi yüklenirken hata oluştu')
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
        surveyApplied: project.surveyApplied,
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

  // User management functions
  const startEdit = (user: User) => {
    setEditingId(user.id)
    setEditForm({
      name: user.name,
      role: user.role
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({
      name: '',
      role: 'USER'
    })
  }

  const saveEdit = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        await fetchUsers()
        setEditingId(null)
      } else {
        const data = await response.json()
        setError(data.error || 'Güncelleme başarısız')
      }
    } catch (error) {
      setError('Güncelleme sırasında hata oluştu')
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchUsers()
        setDeleteConfirm(null)
      } else {
        const data = await response.json()
        setError(data.error || 'Silme işlemi başarısız')
      }
    } catch (error) {
      setError('Silme işlemi sırasında hata oluştu')
    }
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditForm({
      ...editForm,
      [name]: value
    })
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

  if (!session || (!['ADMIN', 'TUBITAK_OKUL_YETKILISI'].includes((session.user as any).role))) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Paneli</h1>
          <p className="text-muted-foreground">
            Sistem yönetimi ve kullanıcı işlemleri
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'projects'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                Alt Projeler
              </button>
              {session.user.role === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }`}
                >
                  Üyelik Yönetimi
                </button>
              )}

              <button
                onClick={() => router.push('/admin/timeline')}
                className="py-2 px-1 border-b-2 font-medium text-sm border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
              >
                Timeline Yönetimi
              </button>
            </nav>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-destructive/10 p-4">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <>
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Anket Uygulanacak mı?
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-3 rounded-lg">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedProject.surveyApplied 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {selectedProject.surveyApplied ? '✓ Evet' : '✗ Hayır'}
                        </span>
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
                        <p 
                          className="text-sm text-gray-900 dark:text-white" 
                          style={{ 
                            textAlign: 'justify', 
                            textJustify: 'inter-word',
                            whiteSpace: 'pre-line',
                            lineHeight: '1.5'
                          }}
                        >
                          {selectedProject.purpose}
                        </p>
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
                        <p 
                          className="text-sm text-gray-900 dark:text-white" 
                          style={{ 
                            textAlign: 'justify', 
                            textJustify: 'inter-word',
                            whiteSpace: 'pre-line',
                            lineHeight: '1.5'
                          }}
                        >
                          {selectedProject.method}
                        </p>
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
                        <p 
                          className="text-sm text-gray-900 dark:text-white" 
                          style={{ 
                            textAlign: 'justify', 
                            textJustify: 'inter-word',
                            whiteSpace: 'pre-line',
                            lineHeight: '1.5'
                          }}
                        >
                          {selectedProject.expectedResult}
                        </p>
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
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            {/* User İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-card p-6 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Toplam Kullanıcı
                </h3>
                <p className="text-2xl font-bold text-foreground">
                  {users.length}
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Admin
                </h3>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.role === 'ADMIN').length}
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-sm font-medium text-muted-foreground">
                  İdareci
                </h3>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.role === 'IDARECI').length}
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Öğretmen/Kullanıcı
                </h3>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.role === 'USER' || u.role === 'OGRETMEN').length}
                </p>
              </div>
            </div>

            {/* Kullanıcı Listesi */}
            <div className="bg-card border border-gray-200/50 dark:border-gray-700/50 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <h2 className="text-lg font-semibold text-foreground">
                  Kullanıcı Yönetimi
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Kullanıcı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        E-posta
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Okul Kodu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Alt Proje Sayısı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Kayıt Tarihi
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/25">
                        {editingId === user.id ? (
                          // Edit Mode
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                name="name"
                                value={editForm.name}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 text-sm border border-gray-200/50 dark:border-gray-700/50 rounded bg-background text-foreground"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                name="role"
                                value={editForm.role}
                                onChange={handleEditChange}
                                className="text-sm border border-gray-200/50 dark:border-gray-700/50 rounded bg-background text-foreground px-2 py-1"
                              >
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="IDARECI">İdareci</option>
                                <option value="OGRETMEN">Öğretmen</option>
                                <option value="TUBITAK_OKUL_YETKILISI">TUBİTAK Okul Yetkilisi</option>
                                <option value="OGRENCI">Öğrenci</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {user._count.userInfos}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => saveEdit(user.id)}
                                  className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90"
                                >
                                  Kaydet
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="px-3 py-1 border border-gray-200/50 dark:border-gray-700/50 text-foreground rounded text-xs hover:bg-accent"
                                >
                                  İptal
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          // View Mode
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-foreground">
                                  {user.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {user.schoolCode || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === 'ADMIN'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : user.role === 'IDARECI'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                  : user.role === 'OGRETMEN'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : user.role === 'TUBITAK_OKUL_YETKILISI'
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                  : user.role === 'OGRENCI'
                                  ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {user.role === 'TUBITAK_OKUL_YETKILISI' ? 'TUBİTAK Okul Yetkilisi' : 
                                 user.role === 'OGRENCI' ? 'Öğrenci' :
                                 user.role === 'IDARECI' ? 'İdareci' :
                                 user.role === 'OGRETMEN' ? 'Öğretmen' :
                                 user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {user._count.userInfos}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => startEdit(user)}
                                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/80"
                                >
                                  Düzenle
                                </button>
                                {user.id !== session?.user.id && (
                                  <button
                                    onClick={() => setDeleteConfirm(user.id)}
                                    className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-xs hover:bg-destructive/80"
                                  >
                                    Sil
                                  </button>
                                )}
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-card border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Kullanıcıyı Sil
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve kullanıcının tüm alt projeleri de silinecektir.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-4 py-2 border border-gray-200/50 dark:border-gray-700/50 text-foreground rounded hover:bg-accent"
                    >
                      İptal
                    </button>
                    <button
                      onClick={() => deleteUser(deleteConfirm)}
                      className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/80"
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
    </DashboardLayout>
  )
}