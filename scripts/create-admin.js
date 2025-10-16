const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  // Admin kullanıcı oluştur
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tubitak.com' },
    update: {},
    create: {
      email: 'admin@tubitak.com',
      password: hashedPassword,
      name: 'Admin User',
      schoolCode: '12345',
      role: 'ADMIN'
    }
  })

  console.log('Admin kullanıcı oluşturuldu:')
  console.log('Email: admin@tubitak.com')
  console.log('Password: admin123')
  console.log('Role: ADMIN')
}

createAdmin()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })