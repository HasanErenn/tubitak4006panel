import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Kullanıcılar için paylaşılan dosyaları listele
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmış olmanız gerekir' },
        { status: 401 }
      )
    }

    const files = await prisma.sharedFile.findMany({
      where: { isActive: true },
      select: {
        id: true,
        originalName: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        description: true,
        createdAt: true,
        uploadedBy: {
          select: { 
            name: true, 
            email: true 
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(files)

  } catch (error) {
    console.error('Dosya listeleme hatası:', error)
    return NextResponse.json(
      { error: 'Dosyalar listelenirken hata oluştu' },
      { status: 500 }
    )
  }
}