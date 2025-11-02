import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { uploadImageFromBuffer } from '@/lib/cloudinary';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Check if Cloudinary is configured
    const cloudinaryConfigured = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    // Get user from token
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const profilePictureFile = formData.get('profilePicture') as File | null;

    // Update name
    if (name) {
      user.name = name;
    }

    // Update email (check if it's not taken)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Email already in use' },
          { status: 400 }
        );
      }
      user.email = email;
      user.emailVerified = false; // Require re-verification if email changed
    }

    // Handle profile picture upload
    if (profilePictureFile) {
      try {
        // Check file size
        if (profilePictureFile.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, error: 'Image size must be less than 5MB' },
            { status: 400 }
          );
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(profilePictureFile.type)) {
          return NextResponse.json(
            { success: false, error: 'Invalid image type. Please use JPG, PNG, GIF, or WEBP' },
            { status: 400 }
          );
        }

        const bytes = await profilePictureFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        if (cloudinaryConfigured) {
          const imageUrl = await uploadImageFromBuffer(buffer, 'profile-pictures');
          if (!imageUrl) {
            throw new Error('Failed to get image URL from Cloudinary');
          }
          user.profilePicture = imageUrl as string;
        } else {
          // Fallback: You might want to handle local storage or base64
          return NextResponse.json(
            { success: false, error: 'Image upload service not configured. Please configure Cloudinary in your environment variables.' },
            { status: 500 }
          );
        }
      } catch (error: any) {
        console.error('Profile picture upload error:', error);
        return NextResponse.json(
          { success: false, error: error.message || 'Failed to upload profile picture. Please try again.' },
          { status: 500 }
        );
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

