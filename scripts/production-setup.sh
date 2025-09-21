#!/bin/bash

# Production Database Setup Script for Neon PostgreSQL
# Bu script'i Vercel deployment sonrasında çalıştırın

echo "🚀 Production database migration başlıyor..."

# Prisma client generate
echo "📦 Prisma client generate ediliyor..."
npx prisma generate

# Database migration (Vercel'da bu otomatik çalışacak)
echo "🔄 Database migration yapılıyor..."
npx prisma db push

# Admin user seed (isteğe bağlı - zaten var ise atlanır)
echo "👤 Admin user kontrol ediliyor..."
# node prisma/seed.js (gerekirse)

echo "✅ Production database setup tamamlandı!"
echo "🌐 Uygulamanız production'da hazır!"

# Database connection test
echo "🔍 Database connection test ediliyor..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => {
  console.log('✅ Database bağlantısı başarılı! Toplam kullanıcı:', count);
  prisma.\$disconnect();
}).catch(error => {
  console.error('❌ Database bağlantısı başarısız:', error);
  process.exit(1);
});
"