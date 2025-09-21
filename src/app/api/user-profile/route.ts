import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, currentPassword, newPassword } = body

    // Validasyon
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Ad ve email alanları gereklidir' },
        { status: 400 }
      )
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçersiz email formatı' },
        { status: 400 }
      )
    }

    // Mevcut kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Email değişikliği kontrolü - başka kullanıcı tarafından kullanılıyor mu?
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu email adresi başka bir kullanıcı tarafından kullanılıyor' },
          { status: 400 }
        )
      }
    }

    // Şifre değişikliği varsa kontrol et
    let hashedNewPassword = user.password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Şifre değiştirmek için mevcut şifrenizi girmelisiniz' },
          { status: 400 }
        )
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Yeni şifre en az 6 karakter olmalıdır' },
          { status: 400 }
        )
      }

      // Mevcut şifre doğrulaması
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Mevcut şifre yanlış' },
          { status: 400 }
        )
      }

      // Yeni şifreyi hashle
      hashedNewPassword = await bcrypt.hash(newPassword, 12)
    }

    // Kullanıcı bilgilerini güncelle
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
        password: hashedNewPassword,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı bilgileri başarıyla güncellendi',
      user: updatedUser
    })

  } catch (error) {
    console.error('User profile update error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('User profile fetch error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}