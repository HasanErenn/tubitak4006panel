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
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  name: string
  email: string
}

// HTML to PDF Export Function - Original approach with optimizations
export const exportToPDF = async (userInfo: UserInfo, user: User) => {
  try {
    // PDF içeriği için geçici div oluştur
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    tempDiv.style.top = '0'
    tempDiv.style.width = '210mm'
    tempDiv.style.height = 'auto'
    tempDiv.style.backgroundColor = 'white'
    tempDiv.style.fontFamily = 'Arial, sans-serif'
    tempDiv.style.fontSize = '14px'
    tempDiv.style.lineHeight = '1.4'
    tempDiv.style.color = '#000'
    document.body.appendChild(tempDiv)

    // PDF Template HTML içeriği - inline styles ile
    tempDiv.innerHTML = `
      <div style="padding: 32px; background: white; min-height: 100vh; font-family: Arial, sans-serif; display: flex; flex-direction: column; align-items: center;">
        <div style="width: 90%; max-width: 800px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
              <!-- Sol Logo -->
              <div style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center;">
                <img src="${window.location.origin}/sol-logo.png" style="width: 100px; height: 100px; object-fit: contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" crossorigin="anonymous" />
                <span style="font-size: 12px; display: none; color: #666;">SOL LOGO</span>
              </div>
              
              <!-- Başlık -->
              <div style="flex: 1; margin: 0 16px;">

                <h1 style="font-size: 16px; font-weight: 600; margin: 0 0 4px 0; letter-spacing: 0px;">MALTEPE FEN LİSESİ</h1>
                <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 4px 0; letter-spacing: 0px;">2025 TUBİTAK 4006-B</h2>
                <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 4px 0; letter-spacing: 0px;">ALT PROJE BAŞVURU FORMU</h2>
                
              </div>
              
              <!-- Sağ Logo -->
              <div style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center;">
                <img src="${window.location.origin}/sag-logo.png" style="width: 100px; height: 100px; object-fit: contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" crossorigin="anonymous" />
                <span style="font-size: 12px; display: none; color: #666;">SAĞ LOGO</span>
              </div>
            </div>
          </div>
          
          
        </div>

          <!-- Ana İçerik -->
          <div style="margin-bottom: 32px;">
            
            
            <table style="width: 100%; border-collapse: collapse; border: 2px solid #000; font-size: 14px;">
            <tbody>

                          <tr>
                <td style="border: 1px solid #000; padding: 12px; font-weight: bold; background: #f0f0f0;">
                  Başvuru Sahibi:
                </td>
                <td style="border: 1px solid #000; padding: 12px;">
                  ${user.name || 'Belirtilmedi'}
                </td>
              </tr>

              <tr>
                <td style="border: 1px solid #000; padding: 12px; font-weight: bold; background: #f0f0f0; width: 35%;">
                  Alt Proje Başlığı:
                </td>
                <td style="border: 1px solid #000; padding: 12px;">
                  ${userInfo.title || 'Belirtilmedi'}
                </td>
              </tr>
              
              <tr>
                <td style="border: 1px solid #000; padding: 12px; font-weight: bold; background: #f0f0f0;">
                  Ana Alan:
                </td>
                <td style="border: 1px solid #000; padding: 12px;">
                  ${userInfo.mainArea || 'Belirtilmedi'}
                </td>
              </tr>
              
              <tr>
                <td style="border: 1px solid #000; padding: 12px; font-weight: bold; background: #f0f0f0;">
                  Alt Proje Türü:
                </td>
                <td style="border: 1px solid #000; padding: 12px;">
                  ${userInfo.projectType || 'Belirtilmedi'}
                </td>
              </tr>
              
              <tr>
                <td style="border: 1px solid #000; padding: 12px; font-weight: bold; background: #f0f0f0;">
                  Alt Proje Konusu:
                </td>
                <td style="border: 1px solid #000; padding: 12px;">
                  ${userInfo.subject || 'Belirtilmedi'}
                </td>
              </tr>
              
              <tr>
                <td style="border: 1px solid #000; padding: 12px; font-weight: bold; background: #f0f0f0; vertical-align: top;">
                  Amaç ve Önem:
                </td>
                <td style="border: 1px solid #000; padding: 12px;">
                  <div style="white-space: pre-wrap; min-height: 100px; line-height: 1.5;">
                    ${userInfo.purpose || 'Belirtilmedi'}
                  </div>
                </td>
              </tr>
              
              <tr>
                <td style="border: 1px solid #000; padding: 12px; font-weight: bold; background: #f0f0f0; vertical-align: top;">
                  Yöntem:
                </td>
                <td style="border: 1px solid #000; padding: 12px;">
                  <div style="white-space: pre-wrap; min-height: 100px; line-height: 1.5;">
                    ${userInfo.method || 'Belirtilmedi'}
                  </div>
                </td>
              </tr>
              
              <tr>
                <td style="border: 1px solid #000; padding: 12px; font-weight: bold; background: #f0f0f0; vertical-align: top;">
                  Beklenen Sonuç:
                </td>
                <td style="border: 1px solid #000; padding: 12px;">
                  <div style="white-space: pre-wrap; min-height: 100px; line-height: 1.5;">
                    ${userInfo.expectedResult || 'Belirtilmedi'}
                  </div>
                </td>
              </tr>


            </tbody>
          </table>
          </div>


        </div>
      </div>
    `

    // DOM içeriğinin render olmasını bekle
    await new Promise(resolve => setTimeout(resolve, 500))

    // Canvas'a çevir - optimize edilmiş ayarlarla
    const canvas = await html2canvas(tempDiv, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: false,
      allowTaint: true,
      logging: false,
      width: tempDiv.scrollWidth,
      height: tempDiv.scrollHeight,
      removeContainer: false,
      onclone: (clonedDoc) => {
        // Clone'da stilleri tekrar uygula
        const clonedDiv = clonedDoc.body.querySelector('div')
        if (clonedDiv) {
          clonedDiv.style.fontFamily = 'Arial, sans-serif'
          clonedDiv.style.backgroundColor = '#ffffff'
        }
      }
    })

    // PDF oluştur  
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/png', 0.95)
    
    const pageWidth = 210
    const pageHeight = 297
    const canvasAspectRatio = canvas.height / canvas.width
    const pdfHeight = pageWidth * canvasAspectRatio
    
    if (pdfHeight <= pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pdfHeight)
    } else {
      // Sayfa boyutuna sığdır
      const scale = pageHeight / pdfHeight
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth * scale, pageHeight)
    }

    // Dosyayı indir
    const fileName = `${userInfo.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)

    // Temizlik
    document.body.removeChild(tempDiv)

    return { success: true, fileName }
  } catch (error) {
    console.error('PDF export error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'PDF oluşturulurken hata oluştu' }
  }
}

// PDF Template React Component (preview için)
const PDFTemplate: React.FC<{ userInfo: UserInfo; user: User }> = ({ userInfo, user }) => {
  return (
    <div className="bg-white p-8 min-h-screen font-sans text-sm flex flex-col items-center">
      <div className="w-[90%] max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-6">
            {/* Sol Logo */}
            <div className="w-24 h-24 flex items-center justify-center">
              <img 
                src="/sol-logo.png" 
                alt="Sol Logo" 
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'block'
                }}
              />
              <span className="text-sm hidden text-gray-600">SOL LOGO</span>
            </div>
            
            {/* Başlık */}
            <div className="flex-1 mx-4">
              <h1 className="text-lg font-bold mb-2 tracking-wider">TÜBİTAK 4006 TÜBA-GEBİP</h1>
              <h2 className="text-base font-semibold mb-1 tracking-wide">ALT PROJE BAŞVURU FORMU</h2>
              <p className="text-xs">Bilim İnsanı Destekleme Daire Başkanlığı</p>
            </div>
            
            {/* Sağ Logo */}
            <div className="w-24 h-24 flex items-center justify-center">
              <img 
                src="/sag-logo.png" 
                alt="Sağ Logo" 
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'block'
                }}
              />
              <span className="text-sm hidden text-gray-600">SAĞ LOGO</span>
            </div>
          </div>
          
          <hr className="border-t-2 border-black" />
        </div>

        {/* Ana İçerik */}
        <div className="mb-8">
          <h3 className="text-center text-lg font-bold mb-6 tracking-wider">PROJE BİLGİLERİ</h3>
          
          <table className="w-full border-collapse border-2 border-black text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-3 font-semibold bg-gray-100 w-1/3">
                Alt Proje Başlığı:
              </td>
              <td className="border border-black p-3">
                {userInfo.title || 'Belirtilmedi'}
              </td>
            </tr>
            
            <tr>
              <td className="border border-black p-3 font-semibold bg-gray-100">
                Ana Alan:
              </td>
              <td className="border border-black p-3">
                {userInfo.mainArea || 'Belirtilmedi'}
              </td>
            </tr>
            
            <tr>
              <td className="border border-black p-3 font-semibold bg-gray-100">
                Alt Proje Türü:
              </td>
              <td className="border border-black p-3">
                {userInfo.projectType || 'Belirtilmedi'}
              </td>
            </tr>
            
            <tr>
              <td className="border border-black p-3 font-semibold bg-gray-100">
                Alt Proje Konusu:
              </td>
              <td className="border border-black p-3">
                {userInfo.subject || 'Belirtilmedi'}
              </td>
            </tr>
            
            <tr>
              <td className="border border-black p-3 font-semibold bg-gray-100 align-top">
                Amaç ve Önem:
              </td>
              <td className="border border-black p-3">
                <div className="whitespace-pre-wrap min-h-[100px] leading-relaxed">
                  {userInfo.purpose || 'Belirtilmedi'}
                </div>
              </td>
            </tr>
            
            <tr>
              <td className="border border-black p-3 font-semibold bg-gray-100 align-top">
                Yöntem:
              </td>
              <td className="border border-black p-3">
                <div className="whitespace-pre-wrap min-h-[100px] leading-relaxed">
                  {userInfo.method || 'Belirtilmedi'}
                </div>
              </td>
            </tr>
            
            <tr>
              <td className="border border-black p-3 font-semibold bg-gray-100 align-top">
                Beklenen Sonuç:
              </td>
              <td className="border border-black p-3">
                <div className="whitespace-pre-wrap min-h-[100px] leading-relaxed">
                  {userInfo.expectedResult || 'Belirtilmedi'}
                </div>
              </td>
            </tr>

            <tr>
              <td className="border border-black p-3 font-semibold bg-gray-100">
                Başvuru Sahibi:
              </td>
              <td className="border border-black p-3">
                {user.name || 'Belirtilmedi'}
              </td>
            </tr>

            <tr>
              <td className="border border-black p-3 font-semibold bg-gray-100">
                E-posta:
              </td>
              <td className="border border-black p-3">
                {user.email || 'Belirtilmedi'}
              </td>
            </tr>

            <tr>
              <td className="border border-black p-3 font-semibold bg-gray-100">
                Oluşturma Tarihi:
              </td>
              <td className="border border-black p-3">
                {new Date(userInfo.createdAt).toLocaleDateString('tr-TR')}
              </td>
            </tr>

            <tr>
              <td className="border border-black p-3 font-semibold bg-gray-100">
                Son Güncelleme:
              </td>
              <td className="border border-black p-3">
                {new Date(userInfo.updatedAt).toLocaleDateString('tr-TR')}
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600 italic">
          Bu belge TÜBİTAK 4006 Alt Proje Yönetim Sistemi tarafından otomatik olarak oluşturulmuştur.<br />
          Oluşturma Zamanı: {new Date().toLocaleString('tr-TR')}
        </div>
      </div>
    </div>
  )
}

export default PDFTemplate