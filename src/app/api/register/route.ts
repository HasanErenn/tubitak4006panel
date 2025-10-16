import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  schoolCode: z.string().regex(/^\d+$/, 'Okul kodu sadece rakamlardan oluşmalıdır').min(1, 'Okul kodu zorunludur'),
  role: z.enum(['IDARECI', 'OGRETMEN', 'OGRENCI']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, schoolCode, role } = registerSchema.parse(body)

    // Kullanıcının zaten var olup olmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kayıtlı' },
        { status: 400 }
      )
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 12)

    // Yeni kullanıcı oluştur
    const user = await (prisma.user as any).create({
      data: {
        name,
        email,
        password: hashedPassword,
        schoolCode,
        role: role as 'USER' | 'ADMIN' | 'IDARECI' | 'OGRETMEN' | 'TUBITAK_OKUL_YETKILISI' | 'OGRENCI',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })

    return NextResponse.json(
      { 
        message: 'Kullanıcı başarıyla oluşturuldu',
        user 
      },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Kayıt hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}