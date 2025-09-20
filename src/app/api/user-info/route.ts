import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const userInfoSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir'),
  description: z.string().optional(),
  content: z.string().min(1, 'İçerik gereklidir'),
  category: z.string().optional(),
  isPublic: z.boolean().default(false),
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