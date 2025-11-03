const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },
  profilePicture: { type: String, trim: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function setAdminRole() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find admin user by email or username
    const adminUser = await User.findOne({
      $or: [
        { email: 'admin@gmail.com' },
        { username: 'admin' }
      ]
    });

    if (!adminUser) {
      console.log('Admin user not found. Creating admin user...');
      
      // Create admin user
      const newAdmin = await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        emailVerified: true,
      });
      
      console.log(`✅ Created admin user with ID: ${newAdmin._id}`);
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Username: ${newAdmin.username}`);
      console.log(`   Role: ${newAdmin.role}`);
    } else {
      // Update existing admin user
      adminUser.role = 'admin';
      adminUser.username = 'admin';
      if (!adminUser.emailVerified) {
        adminUser.emailVerified = true;
      }
      await adminUser.save();
      
      console.log(`✅ Updated admin user:`);
      console.log(`   ID: ${adminUser._id}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Username: ${adminUser.username || 'admin'}`);
      console.log(`   Role: ${adminUser.role}`);
    }

    // Verify the admin user
    const verifiedAdmin = await User.findOne({
      $or: [
        { email: 'admin@gmail.com' },
        { username: 'admin' }
      ]
    });

    console.log('\n✅ Admin user verified:');
    console.log(`   Role: ${verifiedAdmin.role}`);
    console.log(`   Email: ${verifiedAdmin.email}`);
    console.log(`   Username: ${verifiedAdmin.username || 'admin'}`);

    // Show role distribution
    const roleCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\nRole distribution:');
    roleCounts.forEach(({ _id, count }) => {
      console.log(`  ${_id || 'undefined'}: ${count}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Admin role set successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

setAdminRole();


