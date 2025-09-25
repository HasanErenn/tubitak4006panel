import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const userInfoSchema = z.object({
  title: z.string().min(1, 'Alt proje adı gereklidir'),
  mainArea: z.string().min(1, 'Ana alan seçimi gereklidir'),
  projectType: z.string().min(1, 'Proje türü seçimi gereklidir'),
  subject: z.string().min(1, 'Konu seçimi gereklidir'),
  purpose: z.string().min(50, 'Amaç en az 50 kelime olmalıdır').max(1500, 'Amaç en fazla 150 kelime olmalıdır'),
  method: z.string().min(50, 'Yöntem en az 50 kelime olmalıdır').max(1500, 'Yöntem en fazla 150 kelime olmalıdır'),
  expectedResult: z.string().min(50, 'Beklenen sonuç en az 50 kelime olmalıdır').max(1500, 'Beklenen sonuç en fazla 150 kelime olmalıdır'),
  surveyApplied: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmış olmanız gerekir' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = userInfoSchema.parse(body)

    const userInfo = await prisma.userInfo.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        isPublic: false, // Sadece Admin'ler görebilir
      },
    })

    return NextResponse.json(userInfo, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Bilgi kayıt hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmış olmanız gerekir' },
        { status: 401 }
      )
    }

    const userInfos = await prisma.userInfo.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(userInfos)

  } catch (error) {
    console.error('Bilgi getirme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}