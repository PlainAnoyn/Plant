#!/bin/bash

echo "🌱 Plant Selling - Setup Status Checker"
echo "========================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Run: ./setup-cloud.sh"
    exit 1
fi

echo "✓ .env.local file exists"
echo ""

# Check MongoDB configuration
MONGO_URI=$(grep MONGODB_URI .env.local | cut -d '=' -f2 | tr -d ' ')

if [ -z "$MONGO_URI" ]; then
    echo "❌ MONGODB_URI not set in .env.local"
elif [[ "$MONGO_URI" == *"localhost"* ]] || [[ "$MONGO_URI" == *"127.0.0.1"* ]]; then
    echo "⚠️  MONGODB_URI is set to localhost (not MongoDB Atlas)"
    echo "   Current: $MONGO_URI"
    echo ""
    echo "   To use MongoDB Atlas:"
    echo "   1. Go to https://www.mongodb.com/cloud/atlas/register"
    echo "   2. Create free cluster"
    echo "   3. Update MONGODB_URI in .env.local"
else
    echo "✓ MONGODB_URI configured (looks like Atlas)"
    echo "   URI: ${MONGO_URI:0:30}..."
fi

echo ""

# Check Cloudinary configuration
CLOUD_NAME=$(grep CLOUDINARY_CLOUD_NAME .env.local | cut -d '=' -f2 | tr -d ' ')
API_KEY=$(grep CLOUDINARY_API_KEY .env.local | cut -d '=' -f2 | tr -d ' ')
API_SECRET=$(grep CLOUDINARY_API_SECRET .env.local | cut -d '=' -f2 | tr -d ' ')

if [ -z "$CLOUD_NAME" ] || [ "$CLOUD_NAME" == "your-cloud-name" ]; then
    echo "⚠️  Cloudinary not configured"
    echo "   Images will use direct URLs (not uploaded to cloud)"
    echo ""
    echo "   To set up Cloudinary:"
    echo "   1. Go to https://cloudinary.com/users/register/free"
    echo "   2. Get your credentials"
    echo "   3. Update CLOUDINARY_* in .env.local"
else
    echo "✓ Cloudinary configured"
    echo "   Cloud Name: $CLOUD_NAME"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
if [[ "$MONGO_URI" == *"localhost"* ]] || [[ "$MONGO_URI" == *"127.0.0.1"* ]]; then
    echo "📋 Next Steps:"
    echo "   1. Set up MongoDB Atlas (see CLOUD_SETUP.md)"
    echo "   2. Update MONGODB_URI in .env.local"
    echo "   3. (Optional) Set up Cloudinary for image storage"
    echo "   4. Run: npm run seed"
else
    echo "✓ Ready to seed database!"
    echo ""
    echo "Run: npm run seed"
fi

echo ""


