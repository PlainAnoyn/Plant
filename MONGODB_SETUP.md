# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Recommended - Free Cloud Database)

1. **Create a free MongoDB Atlas account:**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free (no credit card required)

2. **Create a cluster:**
   - Click "Create" or "Build a Database"
   - Choose the FREE tier (M0)
   - Select a cloud provider and region
   - Click "Create Cluster"

3. **Set up database access:**
   - Go to "Database Access" in the left menu
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these!)
   - Set user privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Set up network access:**
   - Go to "Network Access" in the left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP address
   - Click "Confirm"

5. **Get your connection string:**
   - Go to "Database" in the left menu
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: mongodb+srv://username:password@cluster.mongodb.net/)
   - Replace `<password>` with your actual password
   - Replace `<database>` with `plant-selling` or just remove it

6. **Update .env.local:**
   - Replace MONGODB_URI with your Atlas connection string
   - Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/plant-selling

## Option 2: Local MongoDB Installation

If you prefer to run MongoDB locally:

1. **Install MongoDB:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # Or use MongoDB Community Edition
   # Follow instructions at: https://docs.mongodb.com/manual/installation/
   ```

2. **Start MongoDB service:**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

3. **Verify it's running:**
   ```bash
   sudo systemctl status mongod
   ```

4. **Your .env.local should already be correct:**
   ```
   MONGODB_URI=mongodb://localhost:27017/plant-selling
   ```

## After Setup:

Once MongoDB is connected, run:
```bash
npm run seed
```

This will add 12 sample plants to your database!


