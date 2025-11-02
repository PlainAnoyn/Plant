#!/bin/bash

echo "🌱 Plant Selling - Cloud Setup Helper"
echo "======================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
# MongoDB Atlas Connection
# Get your connection string from: https://www.mongodb.com/cloud/atlas
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/plant-selling

# Cloudinary Configuration
# Get credentials from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: Next.js API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF
    echo "✓ Created .env.local file"
else
    echo "✓ .env.local already exists"
fi

echo ""
echo "📋 Setup Checklist:"
echo ""
echo "1. MongoDB Atlas Setup:"
echo "   → Visit: https://www.mongodb.com/cloud/atlas/register"
echo "   → Create free cluster"
echo "   → Set up database user"
echo "   → Whitelist IP address (0.0.0.0/0 for development)"
echo "   → Copy connection string"
echo "   → Update MONGODB_URI in .env.local"
echo ""
echo "2. Cloudinary Setup:"
echo "   → Visit: https://cloudinary.com/users/register/free"
echo "   → Create free account"
echo "   → Copy Cloud Name, API Key, API Secret"
echo "   → Update CLOUDINARY_* in .env.local"
echo ""
echo "3. After Configuration:"
echo "   → Run: npm run seed"
echo "   → This will upload images to Cloudinary and seed database"
echo ""
echo "📖 Full instructions: See CLOUD_SETUP.md"
echo ""

# Check if credentials are configured
if grep -q "your-cloud-name" .env.local 2>/dev/null || grep -q "username:password" .env.local 2>/dev/null; then
    echo "⚠️  Please update .env.local with your actual credentials!"
    echo ""
    echo "Open .env.local and replace:"
    echo "  - MongoDB connection string"
    echo "  - Cloudinary credentials"
else
    echo "✓ .env.local appears to be configured"
    echo ""
    echo "Ready to seed database? Run: npm run seed"
fi


