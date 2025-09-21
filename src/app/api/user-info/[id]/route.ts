import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const userInfoUpdateSchema = z.object({
  title: z.string().min(1, 'Alt proje adı gereklidir'),
  mainArea: z.string().min(1, 'Ana alan seçimi gereklidir'),
  projectType: z.string().min(1, 'Proje türü seçimi gereklidir'),
  subject: z.string().min(1, 'Konu seçimi gereklidir'),
  purpose: z.string().min(50, 'Amaç en az 50 kelime olmalıdır').max(1500, 'Amaç en fazla 150 kelime olmalıdır'),
  method: z.string().min(50, 'Yöntem en az 50 kelime olmalıdır').max(1500, 'Yöntem en fazla 150 kelime olmalıdır'),
  expectedResult: z.string().min(50, 'Beklenen sonuç en az 50 kelime olmalıdır').max(1500, 'Beklenen sonuç en fazla 150 kelime olmalıdır'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmış olmanız gerekir' },
        { status: 401 }
      )
    }

    const userInfo = await prisma.userInfo.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!userInfo) {
      return NextResponse.json(
        { error: 'Bilgi bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(userInfo)

  } catch (error) {
    console.error('Bilgi getirme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmış olmanız gerekir' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = userInfoUpdateSchema.parse(body)

    const userInfo = await prisma.userInfo.updateMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: validatedData,
    })

    if (userInfo.count === 0) {
      return NextResponse.json(
        { error: 'Bilgi bulunamadı veya güncellenemedi' },
        { status: 404 }
      )
    }

    const updatedUserInfo = await prisma.userInfo.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json(updatedUserInfo)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Bilgi güncelleme hatası:', error)
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
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmış olmanız gerekir' },
        { status: 401 }
      )
    }

    const userInfo = await prisma.userInfo.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (userInfo.count === 0) {
      return NextResponse.json(
        { error: 'Bilgi bulunamadı veya silinemedi' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Bilgi başarıyla silindi' })

  } catch (error) {
    console.error('Bilgi silme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}