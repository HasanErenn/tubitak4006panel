'use client'

import DashboardLayout from '@/components/layouts/DashboardLayout'
import Timeline from '@/components/Timeline'

export default function TimelinePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Başlık */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Proje Timeline</h1>
          <p className="mt-2 text-gray-600">
            TUBİTAK 4006 projemizin detaylı ilerleme durumu ve tüm önemli tarihler
          </p>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-sm text-gray-600">Bekleyen</div>
            <div className="text-lg font-semibold text-gray-700">-</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🚀</div>
            <div className="text-sm text-blue-600">Devam Eden</div>
            <div className="text-lg font-semibold text-blue-700">-</div>
          </div>
          <div className="bg-green-100 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-sm text-green-600">Tamamlanan</div>
            <div className="text-lg font-semibold text-green-700">-</div>
          </div>
          <div className="bg-red-100 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="text-sm text-red-600">Geciken</div>
            <div className="text-lg font-semibold text-red-700">-</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <Timeline showAll={true} />
        </div>
      </div>
    </DashboardLayout>
  )
}