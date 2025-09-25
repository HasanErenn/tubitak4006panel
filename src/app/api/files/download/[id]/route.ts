import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Vercel Blob URL'ine yönlendir
    return NextResponse.redirect(file.fileName) // fileName artık blob URL'i içeriyor

  } catch (error) {
    console.error('Dosya indirme hatası:', error)
    return NextResponse.json(
      { error: 'Dosya indirme sırasında hata oluştu' },
      { status: 500 }
    )
  }
}