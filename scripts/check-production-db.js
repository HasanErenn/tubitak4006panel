// Production Database Check Script
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProductionDB() {
  try {
    console.log('🔍 Production database kontrolü başlıyor...');
    
    // Toplam kullanıcı sayısı
    const userCount = await prisma.user.count();
    console.log('👥 Toplam kullanıcı:', userCount);
    
    // Toplam alt proje sayısı
    const projectCount = await prisma.userInfo.count();
    console.log('📊 Toplam alt proje:', projectCount);
    
    // surveyApplied alanı kontrolü
    const projects = await prisma.userInfo.findMany({ take: 5 });
    console.log('🔍 İlk 5 alt proje surveyApplied durumu:');
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.title}: surveyApplied = ${project.surveyApplied}`);
    });
    
    // Anket "Evet" diyenlerin sayısı
    const surveyYesCount = await prisma.userInfo.count({
      where: { surveyApplied: true }
    });
    
    // Anket "Hayır" diyenlerin sayısı  
    const surveyNoCount = await prisma.userInfo.count({
      where: { surveyApplied: false }
    });
    
    console.log('📈 Anket istatistikleri:');
    console.log('   Evet diyen:', surveyYesCount);
    console.log('   Hayır diyen:', surveyNoCount);
    
    await prisma.$disconnect();
    console.log('✅ Production database kontrolü tamamlandı!');
    
  } catch (error) {
    console.error('❌ Database kontrol hatası:', error);
    process.exit(1);
  }
}

checkProductionDB();