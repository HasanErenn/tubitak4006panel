import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'IDARECI')) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    const { name, isActive } = await request.json()

    const subject = await prisma.projectSubject.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(typeof isActive === 'boolean' && { isActive })
      }
    })

    return NextResponse.json(subject)
  } catch (error) {
    console.error('Alt proje konusu güncelleme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'IDARECI')) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    await prisma.projectSubject.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Konu başarıyla silindi' })
  } catch (error) {
    console.error('Alt proje konusu silme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}