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

async function migrateUserRoles() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all users without a role field or with null/undefined role
    const usersWithoutRole = await User.find({
      $or: [
        { role: { $exists: false } },
        { role: null },
        { role: undefined }
      ]
    });

    console.log(`Found ${usersWithoutRole.length} users without role field`);

    // Update all users without role to have 'user' role
    const result = await User.updateMany(
      {
        $or: [
          { role: { $exists: false } },
          { role: null },
          { role: undefined }
        ]
      },
      {
        $set: { role: 'user' }
      }
    );

    console.log(`Updated ${result.modifiedCount} users with default 'user' role`);

    // Verify all users now have a role
    const usersWithoutRoleAfter = await User.find({
      $or: [
        { role: { $exists: false } },
        { role: null },
        { role: undefined }
      ]
    });

    if (usersWithoutRoleAfter.length === 0) {
      console.log('✅ All users now have a role field!');
    } else {
      console.log(`⚠️ Warning: ${usersWithoutRoleAfter.length} users still don't have a role`);
    }

    // Show summary by role
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
    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrateUserRoles();


