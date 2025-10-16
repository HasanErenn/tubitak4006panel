#!/bin/bash

# Vercel Production Deployment Script
echo "🚀 Starting Vercel deployment preparation..."

# Step 1: Update Prisma schema to use PostgreSQL
echo "📝 Updating Prisma schema for PostgreSQL..."

# Step 2: Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Step 3: Push database schema to production
echo "📊 Pushing database schema to Neon PostgreSQL..."
npx prisma db push --accept-data-loss

echo "✅ Deployment preparation completed!"
echo ""
echo "📋 Next steps for Vercel:"
echo "1. Set environment variables in Vercel dashboard:"
echo "   - DATABASE_URL (PostgreSQL connection)"
echo "   - DIRECT_URL (PostgreSQL direct connection)"
echo "   - NEXTAUTH_URL (your domain)"
echo "   - NEXTAUTH_SECRET (strong secret)"
echo ""
echo "2. Deploy to Vercel:"
echo "   vercel --prod"
echo ""
echo "3. Create admin user in production:"
echo "   node scripts/create-admin.js"