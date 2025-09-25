import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Timeline güncelleme şeması
const updateTimelineSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir').optional(),
  description: z.string().min(1, 'Açıklama gereklidir').optional(),
  targetDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Geçerli bir tarih formatı gereklidir'
  }).optional(),
  status: z.enum(['pending', 'in-progress', 'completed', 'delayed']).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

// Timeline öğesi güncelleme - PUT
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateTimelineSchema.parse(body)

    // Timeline öğesinin var olup olmadığını kontrol et
    const existingItem = await prisma.timeline.findUnique({
      where: { id }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Timeline öğesi bulunamadı' },
        { status: 404 }
      )
    }

    // Update verileri hazırla
    const updateData: {
      title?: string
      description?: string
      targetDate?: Date
      status?: 'pending' | 'in-progress' | 'completed' | 'delayed'
      order?: number
      isActive?: boolean
    } = {}
    
    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description
    }
    if (validatedData.targetDate !== undefined) {
      updateData.targetDate = new Date(validatedData.targetDate)
    }
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
    }
    if (validatedData.order !== undefined) {
      updateData.order = validatedData.order
    }
    if (validatedData.isActive !== undefined) {
      updateData.isActive = validatedData.isActive
    }

    // Timeline öğesini güncelle
    const updatedItem = await prisma.timeline.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedItem)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Timeline güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// Timeline öğesi silme - DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Timeline öğesinin var olup olmadığını kontrol et
    const existingItem = await prisma.timeline.findUnique({
      where: { id }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Timeline öğesi bulunamadı' },
        { status: 404 }
      )
    }

    // Timeline öğesini sil
    await prisma.timeline.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Timeline öğesi başarıyla silindi' })
  } catch (error) {
    console.error('Timeline silinirken hata:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}