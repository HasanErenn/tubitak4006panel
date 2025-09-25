import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmış olmanız gerekir' },
        { status: 401 }
      )
    }

    // Dosyayı database'den bul
    const file = await prisma.sharedFile.findUnique({
      where: { 
        id: resolvedParams.id,
        isActive: true 
      }
    })

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 404 }
      )
    }

    // Dosyayı filesystem'den oku
    const filePath = path.join(process.cwd(), 'public/uploads', file.fileName)
    
    try {
      const fileBuffer = await fs.readFile(filePath)
      
      // Response headers'ını ayarla
      const response = new NextResponse(fileBuffer as unknown as BodyInit)
      response.headers.set('Content-Type', file.fileType)
      response.headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`)
      response.headers.set('Content-Length', fileBuffer.length.toString())
      
      return response
      
    } catch (error) {
      console.error('Dosya okuma hatası:', error)
      return NextResponse.json(
        { error: 'Dosya bulunamadı veya okunamadı' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Dosya indirme hatası:', error)
    return NextResponse.json(
      { error: 'Dosya indirme sırasında hata oluştu' },
      { status: 500 }
    )
  }
}