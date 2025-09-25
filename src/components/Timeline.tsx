'use client'

import { useState, useEffect } from 'react'

interface TimelineItem {
  id: string
  title: string
  description: string
  targetDate: string
  status: 'pending' | 'in-progress' | 'completed' | 'delayed'
  order: number
  createdAt: string
  createdBy: {
    name: string | null
    email: string
  }
}

const statusConfig = {
  pending: {
    label: 'Bekliyor',
    color: 'border-gray-400 bg-gray-100',
    icon: '⏳',
    textColor: 'text-gray-600'
  },
  'in-progress': {
    label: 'Devam Ediyor',
    color: 'border-blue-500 bg-blue-100',
    icon: '🚀',
    textColor: 'text-blue-600'
  },
  completed: {
    label: 'Tamamlandı',
    color: 'border-green-500 bg-green-100',
    icon: '✅',
    textColor: 'text-green-600'
  },
  delayed: {
    label: 'Gecikti',
    color: 'border-red-500 bg-red-100',
    icon: '⚠️',
    textColor: 'text-red-600'
  }
}

interface TimelineProps {
  showAll?: boolean // Ana sayfada false, dashboard'da true
}

export default function Timeline({ showAll = false }: TimelineProps) {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await fetch('/api/timeline')
        if (response.ok) {
          const data = await response.json()
          // Ana sayfada sadece ilk 5 öğeyi göster
          setTimelineItems(showAll ? data : data.slice(0, 5))
        }
      } catch (error) {
        console.error('Timeline yüklenirken hata:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimeline()
  }, [showAll])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const isDatePassed = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (timelineItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Henüz timeline öğesi bulunmuyor.
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Timeline çizgisi */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-600"></div>

      {/* Timeline öğeleri */}
      <div className="space-y-8">
        {timelineItems.map((item) => {
          const config = statusConfig[item.status]
          const isPassed = isDatePassed(item.targetDate)
          
          return (
            <div key={item.id} className="relative flex items-start group">
              {/* Timeline noktası */}
              <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 ${config.color} transition-all duration-300 group-hover:scale-110`}>
                <span className="text-2xl">{config.icon}</span>
              </div>

              {/* İçerik kartı */}
              <div className="ml-6 flex-1">
                <div className="bg-white rounded-lg shadow-md border-l-4 border-l-blue-500 p-6 hover:shadow-lg transition-shadow duration-300">
                  {/* Başlık ve durum */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${config.color} ${config.textColor}`}>
                      {config.label}
                    </div>
                  </div>

                  {/* Açıklama */}
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Tarih ve meta bilgiler */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center ${isPassed && item.status !== 'completed' ? 'text-red-600' : 'text-gray-600'}`}>
                        <span className="mr-2">📅</span>
                        <span className="font-medium">
                          {formatDate(item.targetDate)}
                        </span>
                        {isPassed && item.status !== 'completed' && (
                          <span className="ml-2 text-red-500 font-medium">(Geçti)</span>
                        )}
                      </div>
                    </div>
                    
                    {item.createdBy.name && (
                      <div className="text-gray-500">
                        <span className="mr-1">👤</span>
                        {item.createdBy.name}
                      </div>
                    )}
                  </div>

                  {/* İlerleme çubuğu */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span>İlerleme</span>
                      <span>
                        {item.status === 'completed' ? '100%' : 
                         item.status === 'in-progress' ? '50%' : 
                         item.status === 'delayed' ? '25%' : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          item.status === 'completed' ? 'bg-green-500' : 
                          item.status === 'in-progress' ? 'bg-blue-500' : 
                          item.status === 'delayed' ? 'bg-red-500' : 'bg-gray-400'
                        }`}
                        style={{
                          width: item.status === 'completed' ? '100%' : 
                                 item.status === 'in-progress' ? '50%' : 
                                 item.status === 'delayed' ? '25%' : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Ana sayfada "Daha fazla" linki */}
      {!showAll && timelineItems.length === 5 && (
        <div className="text-center mt-8">
          <a 
            href="/dashboard/timeline" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            <span>Tüm Timeline&apos;ı Görüntüle</span>
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}
    </div>
  )
}