import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'TUBITAK_OKUL_YETKILISI'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    let whereClause = {}
    
    // TUBİTAK Okul Yetkilisi ise sadece kendi okul kodundaki projeleri görebilir
    if ((session.user as any).role === 'TUBITAK_OKUL_YETKILISI') {
      const userSchoolCode = (session.user as any).schoolCode
      if (!userSchoolCode) {
        return NextResponse.json({ error: 'Okul kodu bulunamadı' }, { status: 400 })
      }
      
      whereClause = {
        user: {
          schoolCode: userSchoolCode,
          role: {
            in: ['IDARECI', 'OGRETMEN', 'OGRENCI']
          }
        }
      }
    }

    const projects = await (prisma.userInfo as any).findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            schoolCode: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Admin projects fetch error:', error)
    return NextResponse.json(
      { error: 'Alt projeler yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}