'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Footer from '@/components/layouts/Footer'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Yükleniyor...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 flex flex-col">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">

                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    TUBİTAK 4006 Proje Yönetim Sistemi
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {session.user.name} Hoşgeldiniz
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin
                </Link>
              )}
              <ThemeToggle />
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card/60 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {session.user.role === 'ADMIN' ? (
              // Admin Menüsü
              <Link
                href="/admin"
                className={`inline-flex items-center px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-300 ${
                  pathname === '/admin'
                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 border-b-2 border-blue-500 shadow-lg transform scale-105'
                    : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 border-b-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Alt Projeler
              </Link>
            ) : (
              // Normal Kullanıcı Menüsü
              <>
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-300 ${
                    pathname === '/dashboard'
                      ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 border-b-2 border-blue-500 shadow-lg transform scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 border-b-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v14l-5-3-5 3V5z" />
                  </svg>
                  Yönetim Sayfası
                </Link>
                <Link
                  href="/dashboard/add-info"
                  className={`inline-flex items-center px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-300 ${
                    pathname === '/dashboard/add-info'
                      ? 'text-white bg-gradient-to-r from-green-600 to-emerald-600 border-b-2 border-green-500 shadow-lg transform scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 border-b-2 border-transparent hover:border-green-200 dark:hover:border-green-800'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Alt Proje Oluştur
                </Link>
                <Link
                  href="/dashboard/my-info"
                  className={`inline-flex items-center px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-300 ${
                    pathname === '/dashboard/my-info'
                      ? 'text-white bg-gradient-to-r from-orange-600 to-amber-600 border-b-2 border-orange-500 shadow-lg transform scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:hover:from-orange-900/20 dark:hover:to-amber-900/20 border-b-2 border-transparent hover:border-orange-200 dark:hover:border-orange-800'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Alt Projelerim
                </Link>
              </>
            )}
            <Link
              href="/dashboard/timeline"
              className={`inline-flex items-center px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-300 ${
                pathname === '/dashboard/timeline'
                  ? 'text-white bg-gradient-to-r from-green-600 to-teal-600 border-b-2 border-green-500 shadow-lg transform scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 dark:hover:from-green-900/20 dark:hover:to-teal-900/20 border-b-2 border-transparent hover:border-green-200 dark:hover:border-green-800'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Proje Timeline
            </Link>
            <Link
              href="/dashboard/shared-files"
              className={`inline-flex items-center px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-300 ${
                pathname === '/dashboard/shared-files'
                  ? 'text-white bg-gradient-to-r from-purple-600 to-indigo-600 border-b-2 border-purple-500 shadow-lg transform scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20 border-b-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Paylaşılan Dosyalar
            </Link>
            <Link
              href="/dashboard/profile"
              className={`inline-flex items-center px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-300 ${
                pathname === '/dashboard/profile'
                  ? 'text-white bg-gradient-to-r from-pink-600 to-rose-600 border-b-2 border-pink-500 shadow-lg transform scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 dark:hover:from-pink-900/20 dark:hover:to-rose-900/20 border-b-2 border-transparent hover:border-pink-200 dark:hover:border-pink-800'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Kullanıcı Bilgilerim
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 flex-1">
        <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm min-h-[calc(100vh-240px)]">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}