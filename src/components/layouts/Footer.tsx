'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function Footer() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <footer className="relative z-10 border-t border-gray-200/50 bg-white mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Hasan EREN tarafından hazırlanmıştır
            </p>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer 
      className={`relative z-10 border-t mt-auto transition-colors duration-200 ${
        theme === 'dark' 
          ? 'border-gray-700/50 bg-gray-800' 
          : 'border-gray-200/50 bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className={`text-sm transition-colors duration-200 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Hasan EREN tarafından hazırlanmıştır
          </p>
        </div>
      </div>
    </footer>
  )
}