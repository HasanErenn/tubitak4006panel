import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Desteklenen dosya türleri
const ALLOWED_TYPES = [
  'application/pdf',
  'image/png', 
  'image/jpeg',
  'image/jpg'
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmış olmanız gerekir' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekir' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya seçilmedi' },
        { status: 400 }
      )
    }

    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Dosya boyutu çok büyük. Maksimum 10MB olmalıdır.' },
        { status: 400 }
      )
    }

    // Dosya türü kontrolü
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Desteklenmeyen dosya türü. Sadece PDF, PNG ve JPG dosyaları yüklenebilir.' },
        { status: 400 }
      )
    }

    // Benzersiz dosya adı oluştur
    const fileExtension = path.extname(file.name)
    const uniqueFileName = `${uuidv4()}${fileExtension}`
    const filePath = path.join(process.cwd(), 'public/uploads', uniqueFileName)

    // Dosyayı kaydet
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fs.writeFile(filePath, buffer)

    // Database'e kaydet
    const sharedFile = await prisma.sharedFile.create({
      data: {
        fileName: uniqueFileName,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
        description: description || null,
        uploadedById: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      file: {
        id: sharedFile.id,
        originalName: sharedFile.originalName,
        fileType: sharedFile.fileType,
        fileSize: sharedFile.fileSize,
        description: sharedFile.description,
        createdAt: sharedFile.createdAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Dosya yükleme hatası:', error)
    return NextResponse.json(
      { error: 'Dosya yükleme sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Paylaşılan dosyaları listele (Admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmış olmanız gerekir' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekir' },
        { status: 403 }
      )
    }

    const files = await prisma.sharedFile.findMany({
      where: { isActive: true },
      include: {
        uploadedBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(files)

  } catch (error) {
    console.error('Dosya listeleme hatası:', error)
    return NextResponse.json(
      { error: 'Dosyalar listelenirken hata oluştu' },
      { status: 500 }
    )
  }
}