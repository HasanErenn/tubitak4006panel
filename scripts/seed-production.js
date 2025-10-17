const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedProjectSubjects() {
  console.log('Production database\'ine proje konuları ekleniyor...')

  const subjects = [
    // Fen Bilimleri
    'Kimya',
    'Fizik', 
    'Biyoloji',
    'Matematik',
    'Bilgisayar Bilimleri',
    
    // Sosyal Bilimler
    'Tarih',
    'Coğrafya',
    'Sosyoloji',
    'Psikoloji',
    'Felsefe',
    
    // Teknoloji
    'Mühendislik',
    'Robotik',
    'Yazılım',
    'Elektronik',
    'Mekatronik',
    
    // Sanat & Tasarım
    'Sanat',
    'Tasarım',
    'Müzik',
    'Edebiyat',
    'Dil Bilimi'
  ]

  try {
    for (const subjectName of subjects) {
      await prisma.projectSubject.upsert({
        where: { name: subjectName },
        update: {},
        create: {
          name: subjectName,
          isActive: true
        }
      })
      console.log(`✅ ${subjectName} eklendi`)
    }

    console.log('\\n🎉 Proje konuları başarıyla eklendi!')
    
    const count = await prisma.projectSubject.count()
    console.log(`📊 Toplam ${count} proje konusu mevcut`)

  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedProjectSubjects()