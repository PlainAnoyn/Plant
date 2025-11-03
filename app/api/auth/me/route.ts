import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    await connectDB();

    // Get user
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    // If user is admin by email or username, ensure role is admin
    let userRole = user.role || 'user';
    if ((user.email === 'admin@gmail.com' || user.username === 'admin') && (userRole !== 'admin')) {
      // Update role in background
      User.findByIdAndUpdate(user._id, { role: 'admin', username: 'admin' }).catch(console.error);
      userRole = 'admin';
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username || (user.email === 'admin@gmail.com' ? 'admin' : undefined),
        role: userRole,
        emailVerified: user.emailVerified,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    );
  }
}

