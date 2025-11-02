# Cloud Setup Guide - MongoDB Atlas + Cloudinary

This guide will help you set up:
1. **MongoDB Atlas** - Cloud database (free tier available)
2. **Cloudinary** - Cloud image storage (free tier available)

## Step 1: Set Up MongoDB Atlas

### 1.1 Create Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account (no credit card required)
3. Choose "Google" or "Email" signup

### 1.2 Create a Cluster
1. After login, click **"Create"** or **"Build a Database"**
2. Choose **FREE** tier (M0 Sandbox)
3. Select a cloud provider (AWS recommended)
4. Choose a region close to you
5. Click **"Create Cluster"** (takes 1-3 minutes)

### 1.3 Set Up Database Access
1. Go to **"Database Access"** in left menu
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create username and password (SAVE THESE!)
5. Set privileges to **"Atlas admin"**
6. Click **"Add User"**

### 1.4 Set Up Network Access
1. Go to **"Network Access"** in left menu
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, add specific IPs only
4. Click **"Confirm"**

### 1.5 Get Connection String
1. Go to **"Database"** in left menu
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
   ```
5. Replace `<password>` with your actual password
6. Add database name at the end: `plant-selling`
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/plant-selling
   ```

---

## Step 2: Set Up Cloudinary (Image Storage)

### 2.1 Create Account
1. Go to https://cloudinary.com/users/register/free
2. Sign up for free account (no credit card required)
3. Verify your email

### 2.2 Get API Credentials
1. After login, you'll see your **Dashboard**
2. Copy these three values:
   - **Cloud Name** (top of dashboard)
   - **API Key** (found in dashboard)
   - **API Secret** (click "Reveal" to see it)

### 2.3 Cloudinary Free Tier Limits
- ✅ 25 GB storage
- ✅ 25 GB monthly bandwidth
- ✅ Unlimited transformations
- ✅ Perfect for development and small projects

---

## Step 3: Configure Your Project

### 3.1 Install Dependencies
```bash
npm install cloudinary
```

### 3.2 Update `.env.local` File

Create or update `.env.local` in your project root:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/plant-selling

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: Next.js API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Replace:**
- `username` and `password` with your MongoDB credentials
- `cluster0.xxxxx` with your actual cluster address
- `your-cloud-name`, `your-api-key`, `your-api-secret` with your Cloudinary credentials

### 3.3 Seed Database with Cloud Images

After configuration, run:
```bash
npm run seed
```

This will:
- Connect to MongoDB Atlas
- Upload all plant images to Cloudinary
- Save plant data with cloud image URLs to database

---

## Step 4: Verify Setup

### Test MongoDB Connection
```bash
./test-mongodb.sh
```

### Test Cloudinary
Visit: `http://localhost:3000/api/plants`
- Should return plants with Cloudinary image URLs

---

## Step 5: Upload New Images

### Via API Endpoint
POST to `/api/upload` with form-data containing image file

### Via Code
```typescript
import { uploadImage } from '@/lib/cloudinary';

const imageUrl = await uploadImage('https://example.com/image.jpg', 'plant-images');
```

---

## Benefits of Cloud Setup

✅ **No Local Storage Needed**
- Images stored in Cloudinary CDN
- Fast global delivery
- Automatic optimization

✅ **Scalable Database**
- MongoDB Atlas handles scaling
- Automatic backups
- High availability

✅ **Easy Deployment**
- Works on any hosting platform
- No local dependencies
- Environment variables for configuration

---

## Troubleshooting

### MongoDB Connection Issues
- Check IP address is whitelisted in Network Access
- Verify username/password are correct
- Ensure connection string includes database name

### Cloudinary Upload Issues
- Verify API credentials in `.env.local`
- Check free tier limits haven't been exceeded
- Ensure image URLs are publicly accessible

### Images Not Loading
- Check Cloudinary URLs in database
- Verify image URLs start with `https://res.cloudinary.com/`
- Check browser console for CORS errors

---

## Need Help?

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Cloudinary Docs: https://cloudinary.com/documentation
- Test connection: `./test-mongodb.sh`


