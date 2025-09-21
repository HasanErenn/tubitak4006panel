const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Alt proje konularını ekle
  const subjects = [
    'Çevre ve Çevreyi Koruma',
    'STEAM (Fen, Teknoloji, Mühendislik, Sanat ve Matematik)',
    'Yenilenebilir Enerji',
    'Kültürel Miras',
    'Oyun ve Oyunlaştırma'
  ]

  for (const subjectName of subjects) {
    await prisma.projectSubject.upsert({
      where: { name: subjectName },
      update: {},
      create: {
        name: subjectName,
        isActive: true
      }
    })
  }

  console.log('Seed veriler başarıyla eklendi!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })