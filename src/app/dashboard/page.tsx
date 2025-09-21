'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import Link from 'next/link'

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
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [userInfos, setUserInfos] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchUserInfos()
    }
  }, [session])

  const fetchUserInfos = async () => {
    try {
      const response = await fetch('/api/user-info')
      if (response.ok) {
        const data = await response.json()
        setUserInfos(data)
      }
    } catch (error) {
      console.error('Bilgiler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">TUBİTAK 4006 Alt Proje Yönetim Sayfası</h1>
          <p className="text-muted-foreground">
            Alt proje yönetim sisteminize hoş geldiniz
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8 max-w-md">
          <div className="bg-card p-6 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-sm font-medium text-muted-foreground">
              Toplam Alt Proje
            </h3>
            <p className="text-2xl font-bold text-foreground">
              {userInfos.length}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/dashboard/add-info"
            className="block p-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">Yeni Alt Proje Oluştur</h3>
            <p className="text-primary-foreground/80">
              Sisteme yeni bir alt proje girişi yapın
            </p>
          </Link>
          
          <Link
            href="/dashboard/my-info"
            className="block p-6 bg-card border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:bg-accent transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              Alt Projelerimi Görüntüle
            </h3>
            <p className="text-muted-foreground">
              Kaydettiğiniz alt projeleri yönetin
            </p>
          </Link>
        </div>

        {/* Recent Items */}
        <div className="bg-card border border-gray-200/50 dark:border-gray-700/50 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-lg font-semibold text-foreground">
              Oluşturduğum Alt Projeler
            </h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <p className="text-muted-foreground">Yükleniyor...</p>
            ) : userInfos.length === 0 ? (
              <p className="text-muted-foreground">
                Henüz hiç alt proje oluşturulmamış.{' '}
                <Link
                  href="/dashboard/add-info"
                  className="text-primary hover:text-primary/80"
                >
                  İlk alt projenizi oluşturun
                </Link>
              </p>
            ) : (
              <div className="space-y-4">
                {userInfos.slice(0, 5).map((info) => (
                  <div
                    key={info.id}
                    className="flex justify-between items-start p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-1">
                        {info.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {info.mainArea} • {info.projectType} • {info.subject}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>
                          {new Date(info.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {userInfos.length > 5 && (
                  <div className="text-center pt-4">
                    <Link
                      href="/dashboard/my-info"
                      className="text-primary hover:text-primary/80 text-sm"
                    >
                      Tümünü görüntüle ({userInfos.length} alt proje)
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}