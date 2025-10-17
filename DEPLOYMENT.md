# 🚀 Vercel Deployment Rehberi

Bu proje Vercel + Neon PostgreSQL ile production'a deploy edilmeye hazır hale getirilmiştir.

## 📋 Deployment Adımları

### 1. Neon Database Kurulumu
```bash
# 1. https://neon.tech adresine gidin
# 2. Hesap oluşturun
# 3. Yeni proje oluşturun
# 4. Connection string'i kopyalayın
```

### 2. Vercel'a Deploy
```bash
# Repository'yi GitHub'a push edin
git add .
git commit -m "Production deployment hazırlığı"
git push

# Vercel'da projeyi import edin
# https://vercel.com/dashboard -> Add New -> Import
```

### 3. Environment Variables (Vercel Dashboard)
Vercel Dashboard → Project Settings → Environment Variables:

```env
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/database?sslmode=require
DIRECT_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/database?sslmode=require
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-strong-secret-key
```

### 4. İlk Deployment Sonrası
```bash
# Database şemasını push et
npx prisma db push

# Admin kullanıcı oluştur
node scripts/create-admin.js
```

## 🔧 Geliştirme

### Local Development
```bash
npm install
npm run dev
```

### Production Build Test
```bash
npm run build
npm run start
```

## 🗂️ Proje Yapısı

```
├── src/
│   ├── app/                 # Next.js 13+ App Router
│   ├── components/          # React Components
│   ├── lib/                 # Utilities & Config
│   └── types/               # TypeScript Types
├── prisma/                  # Database Schema
├── scripts/                 # Deployment Scripts
├── public/                  # Static Assets
└── .env.vercel.template     # Environment Variables Template
```

## 🌐 Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Auth:** NextAuth.js
- **Deployment:** Vercel

## 📞 İletişim

- **Geliştirici:** Hasan EREN
- **Kurum:** Maltepe Fen Lisesi
- **E-posta:** hasan.eren@maltepefen.k12.tr

---

⚡ **Powered by Vercel + Neon PostgreSQL**