'use client'

import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Footer from '@/components/layouts/Footer'

export default function IletisimPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent relative overflow-hidden flex flex-col">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-semibold">Ana Sayfa</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Page Title */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              İletişim
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Benimle iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.
            </p>
          </div>

          {/* İletişim Bilgileri */}
          <div className="flex justify-center">
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-200/50 dark:border-gray-700/50 max-w-2xl w-full">
              
              <div className="space-y-8 text-center">
                <div>
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Hasan EREN</h2>
                  <p className="text-lg text-muted-foreground">Öğretmen</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      {/* <h3 className="font-semibold text-foreground mb-1">Çalıştığım Kurum</h3> */}
                      <p className="text-muted-foreground">Maltepe Fen Lisesi</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground mb-1">E-posta</h3>
                      <p className="text-muted-foreground">hasaneren@maltepefenlisesi.k12.tr</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}