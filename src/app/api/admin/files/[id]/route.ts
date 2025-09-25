import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { promises as fs } from 'fs'
import path from 'path'

export async function DELETE(
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekir' },
        { status: 403 }
      )
    }

    // Dosyayı database'den bul
    const file = await prisma.sharedFile.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 404 }
      )
    }

    // Dosyayı filesystem'den sil
    const filePath = path.join(process.cwd(), 'public/uploads', file.fileName)
    try {
      await fs.unlink(filePath)
    } catch (error) {
      console.warn('Dosya filesystem\'den silinemedi:', error)
      // Devam et - database'den silmeyi dene
    }

    // Database'den sil
    await prisma.sharedFile.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Dosya başarıyla silindi'
    })

  } catch (error) {
    console.error('Dosya silme hatası:', error)
    return NextResponse.json(
      { error: 'Dosya silinirken hata oluştu' },
      { status: 500 }
    )
  }
}