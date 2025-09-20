'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'

interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  _count: {
    userInfos: number
  }
}

interface EditUserData {
  name: string
  role: 'USER' | 'ADMIN'
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditUserData>({
    name: '',
    role: 'USER'
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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

    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
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

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Paneli</h1>
          <p className="text-muted-foreground">
            Kullanıcı yönetimi ve sistem istatistikleri
          </p>
        </div>

        {/* İstatistikler */}
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
              Admin Kullanıcı
            </h3>
            <p className="text-2xl font-bold text-foreground">
              {users.filter(u => u.role === 'ADMIN').length}
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-sm font-medium text-muted-foreground">
              Normal Kullanıcı
            </h3>
            <p className="text-2xl font-bold text-foreground">
              {users.filter(u => u.role === 'USER').length}
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-sm font-medium text-muted-foreground">
              Toplam Bilgi
            </h3>
            <p className="text-2xl font-bold text-foreground">
              {users.reduce((total, user) => total + user._count.userInfos, 0)}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-destructive/10 p-4">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

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
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Bilgi Sayısı
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {user.role}
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
                            {user.id !== session.user.id && (
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
                Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve kullanıcının tüm bilgileri de silinecektir.
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
      </div>
    </DashboardLayout>
  )
}