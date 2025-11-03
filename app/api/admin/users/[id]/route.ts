import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to check if user is admin
async function checkAdmin(request: NextRequest): Promise<{ success: boolean; userId?: string; error?: string }> {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return { success: false, error: 'Not authenticated' };
  }

  let decoded: { userId: string };
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }

  const user = await User.findById(decoded.userId).lean();
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // Check if user is admin by role OR by email/username
  const isAdmin = user.role === 'admin' || 
                  user.email === 'admin@gmail.com' || 
                  user.username === 'admin';
  
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized - Admin access required' };
  }

  return { success: true, userId: decoded.userId };
}

// Update user (admin only) - mainly for role updates
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();

    // Check admin access
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.error?.includes('Unauthorized') ? 403 : 401 }
      );
    }

    // Handle async params
    const resolvedParams = await Promise.resolve(params);
    const userId = resolvedParams.id;

    const body = await request.json();
    const { role, name, email, username, isBlacklisted, blacklistReason } = body;

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update role if provided and valid
    if (role && ['user', 'moderator', 'admin'].includes(role)) {
      user.role = role;
    }

    // Handle blacklisting
    if (typeof isBlacklisted === 'boolean') {
      user.isBlacklisted = isBlacklisted;
      if (isBlacklisted) {
        user.blacklistedBy = adminCheck.userId;
        user.blacklistedAt = new Date();
        if (blacklistReason) {
          user.blacklistReason = blacklistReason.trim();
        }
      } else {
        user.blacklistedBy = undefined;
        user.blacklistedAt = undefined;
        user.blacklistReason = undefined;
      }
    }

    // Update other fields if provided
    if (name) {
      user.name = name;
    }

    if (email && email !== user.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return NextResponse.json(
          { success: false, error: 'Email already in use' },
          { status: 400 }
        );
      }
      user.email = email;
      user.emailVerified = false; // Require re-verification if email changed
    }

    if (username && username !== user.username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== userId) {
        return NextResponse.json(
          { success: false, error: 'Username already in use' },
          { status: 400 }
        );
      }
      user.username = username;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        emailVerified: user.emailVerified,
        profilePicture: user.profilePicture,
        isBlacklisted: user.isBlacklisted || false,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Admin update user error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();

    // Check admin access
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.error?.includes('Unauthorized') ? 403 : 401 }
      );
    }

    // Handle async params
    const resolvedParams = await Promise.resolve(params);
    const userId = resolvedParams.id;

    // Prevent admin from deleting themselves
    if (userId === adminCheck.userId) {
      return NextResponse.json(
        { success: false, error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Admin delete user error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

