import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Timeline oluşturma şeması
const timelineSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir'),
  description: z.string().min(1, 'Açıklama gereklidir'),
  targetDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Geçerli bir tarih formatı gereklidir'
  }),
  status: z.enum(['pending', 'in-progress', 'completed', 'delayed']),
  order: z.number().int().min(0),
})

// Timeline öğelerini listeleme - GET
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    // Timeline öğelerini sıraya göre getir
    const timelineItems = await prisma.timeline.findMany({
      where: {
        isActive: true
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(timelineItems)
  } catch (error) {
    console.error('Timeline listesi alınırken hata:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// Yeni timeline öğesi oluşturma - POST
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = timelineSchema.parse(body)

    // Timeline öğesi oluştur
    const timelineItem = await prisma.timeline.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        targetDate: new Date(validatedData.targetDate),
        status: validatedData.status,
        order: validatedData.order,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(timelineItem, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Timeline oluşturulurken hata:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}