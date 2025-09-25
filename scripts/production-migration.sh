#!/bin/bash

# Production Migration Script for Vercel
# Bu script production database'ine güvenli migration yapar

echo "🚀 Production Migration başlıyor..."

# Environment kontrol
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable bulunamadı!"
    exit 1
fi

if [ -z "$DIRECT_URL" ]; then
    echo "❌ DIRECT_URL environment variable bulunamadı!" 
    exit 1
fi

echo "✅ Environment variables kontrol edildi"

# Prisma client generate
echo "📦 Prisma client generate ediliyor..."
npx prisma generate

# Database schema push (güvenli migration)
echo "🔄 Database schema migration yapılıyor..."
npx prisma db push --accept-data-loss=false

# Migration sonrası kontrol
echo "🔍 Migration sonrası kontrol yapılıyor..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMigration() {
  try {
    // UserInfo tablosunu kontrol et
    const userInfos = await prisma.userInfo.findMany({ take: 1 });
    
    // surveyApplied alanının varlığını kontrol et
    if (userInfos.length > 0) {
      const firstRecord = userInfos[0];
      if (firstRecord.hasOwnProperty('surveyApplied')) {
        console.log('✅ surveyApplied alanı başarıyla eklendi');
        console.log('📊 Mevcut kayıt sayısı:', await prisma.userInfo.count());
      } else {
        console.log('❌ surveyApplied alanı bulunamadı!');
        process.exit(1);
      }
    } else {
      console.log('✅ Tablo boş - migration başarılı');
    }
    
    await prisma.\$disconnect();
    console.log('🎉 Production migration tamamlandı!');
  } catch (error) {
    console.error('❌ Migration kontrol hatası:', error.message);
    process.exit(1);
  }
}

checkMigration();
"

echo "✅ Production migration başarıyla tamamlandı!"