'use client'

import React from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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

interface User {
  name: string
  email: string
}

interface PDFTemplateProps {
  userInfo: UserInfo
  user: User
}

const PDFTemplate: React.FC<PDFTemplateProps> = ({ userInfo, user }) => {
  return (
    <div 
      id="pdf-content" 
      className="bg-white text-black p-8 max-w-4xl mx-auto"
      style={{ 
        width: '210mm', 
        minHeight: '297mm',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        lineHeight: '1.4'
      }}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-300">
        {/* Sol Logo */}
        <div className="w-20 h-20">
          <img 
            src="/sol-logo.svg" 
            alt="Sol Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Orta Başlık */}
        <div className="text-center flex-1 mx-4">
          <h1 className="text-xl font-bold mb-2">TÜBİTAK 4006 TÜBA-GEBÄ İP</h1>
          <h2 className="text-lg font-semibold mb-1">ALT PROJE BAŞVURU FORMU</h2>
          <p className="text-sm text-gray-600">Bilim İnsanı Destekleme Daire Başkanlığı</p>
        </div>
        
        {/* Sağ Logo */}
        <div className="w-20 h-20">
          <img 
            src="/sag-logo.svg" 
            alt="Sağ Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Form Tablosu */}
      <div className="border-2 border-black">
        {/* Tablo Başlığı */}
        <div className="bg-gray-100 border-b-2 border-black p-3 text-center">
          <h3 className="font-bold text-base">PROJE BİLGİLERİ</h3>
        </div>

        {/* Form Alanları */}
        <table className="w-full text-sm">
          <tbody>
            {/* Proje Başlığı */}
            <tr>
              <td className="border-b border-r border-black p-3 font-semibold bg-gray-50 w-1/3">
                Alt Proje Başlığı:
              </td>
              <td className="border-b border-black p-3">
                {userInfo.title}
              </td>
            </tr>

            {/* Ana Alan */}
            <tr>
              <td className="border-b border-r border-black p-3 font-semibold bg-gray-50">
                Ana Alan:
              </td>
              <td className="border-b border-black p-3">
                {userInfo.mainArea}
              </td>
            </tr>

            {/* Proje Türü */}
            <tr>
              <td className="border-b border-r border-black p-3 font-semibold bg-gray-50">
                Alt Proje Türü:
              </td>
              <td className="border-b border-black p-3">
                {userInfo.projectType}
              </td>
            </tr>

            {/* Proje Konusu */}
            <tr>
              <td className="border-b border-r border-black p-3 font-semibold bg-gray-50">
                Alt Proje Konusu:
              </td>
              <td className="border-b border-black p-3">
                {userInfo.subject}
              </td>
            </tr>

            {/* Amaç ve Önem */}
            <tr>
              <td className="border-b border-r border-black p-3 font-semibold bg-gray-50 align-top">
                Amaç ve Önem:
              </td>
              <td className="border-b border-black p-3">
                <div className="whitespace-pre-wrap min-h-[100px]">
                  {userInfo.purpose}
                </div>
              </td>
            </tr>

            {/* Yöntem */}
            <tr>
              <td className="border-b border-r border-black p-3 font-semibold bg-gray-50 align-top">
                Yöntem:
              </td>
              <td className="border-b border-black p-3">
                <div className="whitespace-pre-wrap min-h-[100px]">
                  {userInfo.method}
                </div>
              </td>
            </tr>

            {/* Beklenen Sonuç */}
            <tr>
              <td className="border-b border-r border-black p-3 font-semibold bg-gray-50 align-top">
                Beklenen Sonuç:
              </td>
              <td className="border-b border-black p-3">
                <div className="whitespace-pre-wrap min-h-[100px]">
                  {userInfo.expectedResult}
                </div>
              </td>
            </tr>

            {/* Başvuru Bilgileri */}
            <tr>
              <td className="border-b border-r border-black p-3 font-semibold bg-gray-50">
                Başvuru Sahibi:
              </td>
              <td className="border-b border-black p-3">
                {user.name}
              </td>
            </tr>

            <tr>
              <td className="border-b border-r border-black p-3 font-semibold bg-gray-50">
                E-posta:
              </td>
              <td className="border-b border-black p-3">
                {user.email}
              </td>
            </tr>

            <tr>
              <td className="border-b border-r border-black p-3 font-semibold bg-gray-50">
                Oluşturma Tarihi:
              </td>
              <td className="border-b border-black p-3">
                {new Date(userInfo.createdAt).toLocaleDateString('tr-TR')}
              </td>
            </tr>

            <tr>
              <td className="border-r border-black p-3 font-semibold bg-gray-50">
                Son Güncelleme:
              </td>
              <td className="border-black p-3">
                {new Date(userInfo.updatedAt).toLocaleDateString('tr-TR')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>Bu belge TÜBİTAK 4006 Alt Proje Yönetim Sistemi tarafından otomatik olarak oluşturulmuştur.</p>
        <p>Oluşturma Zamanı: {new Date().toLocaleString('tr-TR')}</p>
      </div>
    </div>
  )
}

export default PDFTemplate

// PDF Export Function
export const exportToPDF = async (userInfo: UserInfo, user: User) => {
  try {
    // PDF içeriği için geçici div oluştur
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    tempDiv.style.top = '0'
    tempDiv.style.width = '210mm'
    tempDiv.style.backgroundColor = 'white'
    document.body.appendChild(tempDiv)

    // PDF Template içeriğini direkt HTML olarak ekle
    tempDiv.innerHTML = `
      <div style="
        width: 210mm; 
        min-height: 297mm;
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 1.4;
        padding: 32px;
        background: white;
        color: black;
      ">
        <!-- Header Section -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #9CA3AF;">
          <!-- Sol Logo -->
          <div style="width: 80px; height: 80px; background: #E5E7EB; border: 2px solid #9CA3AF; display: flex; align-items: center; justify-content: center; font-size: 8px;">
            SOL LOGO
          </div>
          
          <!-- Orta Başlık -->
          <div style="text-align: center; flex: 1; margin: 0 16px;">
            <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">TÜBİTAK 4006 TÜBA-GEBİP</h1>
            <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">ALT PROJE BAŞVURU FORMU</h2>
            <p style="font-size: 14px; color: #6B7280;">Bilim İnsanı Destekleme Daire Başkanlığı</p>
          </div>
          
          <!-- Sağ Logo -->
          <div style="width: 80px; height: 80px; background: #E5E7EB; border: 2px solid #9CA3AF; display: flex; align-items: center; justify-content: center; font-size: 8px;">
            SAĞ LOGO
          </div>
        </div>

        <!-- Form Tablosu -->
        <div style="border: 2px solid black;">
          <!-- Tablo Başlığı -->
          <div style="background: #F3F4F6; border-bottom: 2px solid black; padding: 12px; text-align: center;">
            <h3 style="font-weight: bold; font-size: 16px; margin: 0;">PROJE BİLGİLERİ</h3>
          </div>

          <!-- Form Alanları -->
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="border-bottom: 1px solid black; border-right: 1px solid black; padding: 12px; font-weight: 600; background: #F9FAFB; width: 33%;">
                Alt Proje Başlığı:
              </td>
              <td style="border-bottom: 1px solid black; padding: 12px;">
                ${userInfo.title}
              </td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid black; border-right: 1px solid black; padding: 12px; font-weight: 600; background: #F9FAFB;">
                Ana Alan:
              </td>
              <td style="border-bottom: 1px solid black; padding: 12px;">
                ${userInfo.mainArea}
              </td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid black; border-right: 1px solid black; padding: 12px; font-weight: 600; background: #F9FAFB;">
                Alt Proje Türü:
              </td>
              <td style="border-bottom: 1px solid black; padding: 12px;">
                ${userInfo.projectType}
              </td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid black; border-right: 1px solid black; padding: 12px; font-weight: 600; background: #F9FAFB;">
                Alt Proje Konusu:
              </td>
              <td style="border-bottom: 1px solid black; padding: 12px;">
                ${userInfo.subject}
              </td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid black; border-right: 1px solid black; padding: 12px; font-weight: 600; background: #F9FAFB; vertical-align: top;">
                Amaç ve Önem:
              </td>
              <td style="border-bottom: 1px solid black; padding: 12px;">
                <div style="white-space: pre-wrap; min-height: 100px;">
                  ${userInfo.purpose}
                </div>
              </td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid black; border-right: 1px solid black; padding: 12px; font-weight: 600; background: #F9FAFB; vertical-align: top;">
                Yöntem:
              </td>
              <td style="border-bottom: 1px solid black; padding: 12px;">
                <div style="white-space: pre-wrap; min-height: 100px;">
                  ${userInfo.method}
                </div>
              </td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid black; border-right: 1px solid black; padding: 12px; font-weight: 600; background: #F9FAFB; vertical-align: top;">
                Beklenen Sonuç:
              </td>
              <td style="border-bottom: 1px solid black; padding: 12px;">
                <div style="white-space: pre-wrap; min-height: 100px;">
                  ${userInfo.expectedResult}
                </div>
              </td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid black; border-right: 1px solid black; padding: 12px; font-weight: 600; background: #F9FAFB;">
                Başvuru Sahibi:
              </td>
              <td style="border-bottom: 1px solid black; padding: 12px;">
                ${user.name}
              </td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid black; border-right: 1px solid black; padding: 12px; font-weight: 600; background: #F9FAFB;">
                E-posta:
              </td>
              <td style="border-bottom: 1px solid black; padding: 12px;">
                ${user.email}
              </td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid black; border-right: 1px solid black; padding: 12px; font-weight: 600; background: #F9FAFB;">
                Oluşturma Tarihi:
              </td>
              <td style="border-bottom: 1px solid black; padding: 12px;">
                ${new Date(userInfo.createdAt).toLocaleDateString('tr-TR')}
              </td>
            </tr>
            <tr>
              <td style="border-right: 1px solid black; padding: 12px; font-weight: 600; background: #F9FAFB;">
                Son Güncelleme:
              </td>
              <td style="padding: 12px;">
                ${new Date(userInfo.updatedAt).toLocaleDateString('tr-TR')}
              </td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="margin-top: 32px; text-align: center; font-size: 10px; color: #6B7280;">
          <p>Bu belge TÜBİTAK 4006 Alt Proje Yönetim Sistemi tarafından otomatik olarak oluşturulmuştur.</p>
          <p>Oluşturma Zamanı: ${new Date().toLocaleString('tr-TR')}</p>
        </div>
      </div>
    `

    // Kısa bir süre bekle (render için)
    await new Promise(resolve => setTimeout(resolve, 500))

    // PDF oluştur
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123 // A4 height in pixels at 96 DPI
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Dosyayı indir
    const fileName = `${userInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)

    // Temizlik
    document.body.removeChild(tempDiv)

    return { success: true, fileName }
  } catch (error) {
    console.error('PDF export error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'PDF oluşturulurken hata oluştu' }
  }
}