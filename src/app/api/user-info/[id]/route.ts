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
      console.log('Zod validation error:', error.issues)
      const errorMessages = error.issues.map(issue => {
        if (issue.path.includes('purpose')) {
          return 'Amaç kelime sayısı proje türüne uygun değil'
        } else if (issue.path.includes('method')) {
          return 'Yöntem 50-150 kelime arasında olmalıdır'
        } else if (issue.path.includes('expectedResult')) {
          return 'Beklenen sonuç 50-150 kelime arasında olmalıdır'
        } else if (issue.path.includes('projectSubType')) {
          return 'Proje türüne göre gerekli alanları doldurun'
        }
        return issue.message
      })
      
      return NextResponse.json(
        { error: errorMessages.join(', '), details: error.issues },
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