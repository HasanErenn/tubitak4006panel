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
  subject: z.string().nullable().optional(),
  thematicArea: z.string().nullable().optional(),
  purpose: z.string().min(1, 'Amaç gereklidir'),
  method: z.string().min(1, 'Yöntem gereklidir'),
  expectedResult: z.string().min(1, 'Beklenen sonuç gereklidir'),
  surveyApplied: z.boolean(),
}).refine((data) => {
  // 4006-A için tematik alan gerekli
  if (data.projectSubType === '4006-A') {
    return data.thematicArea && typeof data.thematicArea === 'string' && data.thematicArea.trim().length > 0
  }
  // 4006-B için subject gerekli
  if (data.projectSubType === '4006-B') {
    return data.subject && typeof data.subject === 'string' && data.subject.trim().length > 0
  }
  return true
}, {
  message: 'Proje türüne göre gerekli alanları doldurun',
  path: ['projectSubType']
}).refine((data) => {
  // Amaç kelime sayısı kontrolü
  const purposeWordCount = data.purpose.trim().split(/\s+/).filter(word => word.length > 0).length
  
  if (data.projectSubType === '4006-A') {
    return purposeWordCount >= 20 && purposeWordCount <= 50
  }
  if (data.projectSubType === '4006-B') {
    return purposeWordCount >= 50 && purposeWordCount <= 150
  }
  return true
}, {
  message: 'Amaç kelime sayısı proje türüne uygun değil',
  path: ['purpose']
}).refine((data) => {
  // Yöntem kelime sayısı kontrolü
  const methodWordCount = data.method.trim().split(/\s+/).filter(word => word.length > 0).length
  return methodWordCount >= 50 && methodWordCount <= 150
}, {
  message: 'Yöntem 50-150 kelime arasında olmalıdır',
  path: ['method']
}).refine((data) => {
  // Beklenen sonuç kelime sayısı kontrolü
  const expectedResultWordCount = data.expectedResult.trim().split(/\s+/).filter(word => word.length > 0).length
  return expectedResultWordCount >= 50 && expectedResultWordCount <= 150
}, {
  message: 'Beklenen sonuç 50-150 kelime arasında olmalıdır',
  path: ['expectedResult']
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