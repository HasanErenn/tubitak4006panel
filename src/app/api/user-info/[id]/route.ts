import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const userInfoUpdateSchema = z.object({
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

    const userInfo = await prisma.userInfo.findFirst({
      where: {
        id: resolvedParams.id,
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

    const body = await request.json()
    const validatedData = userInfoUpdateSchema.parse(body)

    const updateData: any = {
      title: validatedData.title,
      mainArea: validatedData.mainArea,
      projectType: validatedData.projectType,
      projectSubType: validatedData.projectSubType,
      purpose: validatedData.purpose,
      method: validatedData.method,
      expectedResult: validatedData.expectedResult,
      surveyApplied: validatedData.surveyApplied,
    }

    // Proje türüne göre uygun alanı ekle/sıfırla
    if (validatedData.projectSubType === '4006-A') {
      updateData.thematicArea = validatedData.thematicArea
      updateData.subject = null // 4006-A'da subject kullanılmaz
    } else {
      updateData.subject = validatedData.subject
      updateData.thematicArea = null // 4006-B'de thematicArea kullanılmaz
    }

    const userInfo = await prisma.userInfo.updateMany({
      where: {
        id: resolvedParams.id,
        userId: session.user.id,
      },
      data: updateData,
    })

    if (userInfo.count === 0) {
      return NextResponse.json(
        { error: 'Bilgi bulunamadı veya güncellenemedi' },
        { status: 404 }
      )
    }

    const updatedUserInfo = await prisma.userInfo.findFirst({
      where: {
        id: resolvedParams.id,
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

    const userInfo = await prisma.userInfo.deleteMany({
      where: {
        id: resolvedParams.id,
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