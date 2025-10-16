import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const userInfoSchema = z.object({
  title: z.string().min(1, 'Alt proje adı gereklidir'),
  mainArea: z.string().min(1, 'Ana alan seçimi gereklidir'),
  projectType: z.string().min(1, 'Proje türü seçimi gereklidir'),
  projectSubType: z.string().min(1, 'Proje alt türü gereklidir'),
  subject: z.string().optional(),
  thematicArea: z.string().optional(),
  purpose: z.string().min(20, 'Amaç en az 20 kelime olmalıdır').max(1500, 'Amaç en fazla 150 kelime olmalıdır'),
  method: z.string().min(50, 'Yöntem en az 50 kelime olmalıdır').max(1500, 'Yöntem en fazla 150 kelime olmalıdır'),
  expectedResult: z.string().min(50, 'Beklenen sonuç en az 50 kelime olmalıdır').max(1500, 'Beklenen sonuç en fazla 150 kelime olmalıdır'),
  surveyApplied: z.boolean(),
}).refine((data) => {
  // 4006-A için tematik alan gerekli
  if (data.projectSubType === '4006-A') {
    return data.thematicArea && data.thematicArea.trim().length > 0
  }
  // 4006-B için subject gerekli
  if (data.projectSubType === '4006-B') {
    return data.subject && data.subject.trim().length > 0
  }
  return true
}, {
  message: 'Proje türüne göre gerekli alanları doldurun',
  path: ['projectSubType']
}).refine((data) => {
  // 4006-A için amaç 20-50 kelime
  if (data.projectSubType === '4006-A') {
    const wordCount = data.purpose.trim().split(/\s+/).length
    return wordCount >= 20 && wordCount <= 50
  }
  // 4006-B için amaç 50-150 kelime
  if (data.projectSubType === '4006-B') {
    const wordCount = data.purpose.trim().split(/\s+/).length
    return wordCount >= 50 && wordCount <= 150
  }
  return true
}, {
  message: 'Amaç kelime sayısı proje türüne uygun değil',
  path: ['purpose']
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

    const createData: any = {
      title: validatedData.title,
      mainArea: validatedData.mainArea,
      projectType: validatedData.projectType,
      projectSubType: validatedData.projectSubType,
      purpose: validatedData.purpose,
      method: validatedData.method,
      expectedResult: validatedData.expectedResult,
      surveyApplied: validatedData.surveyApplied,
      userId: session.user.id,
      isPublic: false, // Sadece Admin'ler görebilir
    }

    // Proje türüne göre uygun alanı ekle
    if (validatedData.projectSubType === '4006-A' && validatedData.thematicArea) {
      createData.thematicArea = validatedData.thematicArea
    }
    if (validatedData.projectSubType === '4006-B' && validatedData.subject) {
      createData.subject = validatedData.subject
    }

    const userInfo = await prisma.userInfo.create({
      data: createData,
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