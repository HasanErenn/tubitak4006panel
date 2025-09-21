# TUBİTAK 4006 Proje Yönetim Sistemi

Bu proje, TUBİTAK 4006 projelerinin yönetimi için geliştirilmiş Next.js tabanlı bir web uygulamasıdır.

## Özellikler

- 🔐 NextAuth.js ile kimlik doğrulama
- 👥 Rol tabanlı erişim kontrolü (USER, ADMIN, IDARECI, OGRETMEN)
- 📄 PDF export özelliği
- 🌓 Dark/Light theme desteği
- 📱 Responsive tasarım
- 🗄️ PostgreSQL veritabanı (Production: Neon, Development: SQLite)

## Development

Geliştirme sunucusunu başlatmak için:

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresinden uygulamayı görüntüleyebilirsiniz.

## Production Deployment (Vercel + Neon)

### 1. Neon Database Setup
1. [Neon](https://neon.tech) hesabınızda yeni bir database oluşturun
2. Connection string'i kopyalayın

### 2. Vercel Environment Variables
Vercel dashboard'ında aşağıdaki environment variables'ları ekleyin:

```bash
DATABASE_URL="postgresql://username:password@ep-xyz.us-east-1.neon.tech/neondb?sslmode=require"
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="güçlü-bir-secret-key-üretin"
```

### 3. Database Migration
Deployment sonrasında database'i setup etmek için:

```bash
# Vercel'da otomatik çalışacak, manuel gerekirse:
npx prisma db push
```

### 4. Admin Account
İlk admin hesabı:
- Email: hasaneren@gmail.com
- Password: eylul1010

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/          # Admin panel
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # User dashboard
│   │   └── api/            # API routes
│   ├── components/         # Reusable components
│   ├── lib/               # Utilities & configurations
│   └── types/             # TypeScript definitions
├── prisma/                # Database schema & seeds
└── public/               # Static assets
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL (Neon), Prisma ORM
- **PDF Generation**: jsPDF + html2canvas
- **Deployment**: Vercel

## Development vs Production

- **Development**: SQLite database (`prisma/dev.db`)
- **Production**: PostgreSQL database (Neon)

Environment variables otomatik olarak `.env` dosyasından yüklenir. Production için `.env.example` dosyasına bakın.
