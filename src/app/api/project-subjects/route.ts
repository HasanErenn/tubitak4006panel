import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Alt proje konularını getir
export async function GET() {
  try {
    const subjects = await prisma.projectSubject.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(subjects)
  } catch (error) {
    console.error('Alt proje konuları getirme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// POST - Yeni alt proje konusu ekle (sadece admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'IDARECI')) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    const { name } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Geçerli bir konu adı giriniz' },
        { status: 400 }
      )
    }

    const subject = await prisma.projectSubject.create({
      data: {
        name: name.trim(),
        isActive: true
      }
    })

    return NextResponse.json(subject, { status: 201 })
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu konu adı zaten mevcut' },
        { status: 400 }
      )
    }

    console.error('Alt proje konusu ekleme hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}