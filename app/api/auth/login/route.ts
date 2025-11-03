import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    console.log('Database connected');

    const body = await request.json();
    const { email, username, password } = body;

    // Support both email and username login
    const loginIdentifier = username || email;

    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide email/username and password' },
        { status: 400 }
      );
    }

    // Check for admin login (username: admin OR email: admin@gmail.com, password: admin123)
    // Also check if user is logging in with admin email or username in the loginIdentifier
    const isAdminLogin = (
      (username === 'admin' || email === 'admin@gmail.com' || loginIdentifier === 'admin' || loginIdentifier === 'admin@gmail.com') 
      && password === 'admin123'
    );
    
    console.log('Login attempt:', { username, email, loginIdentifier, password, isAdminLogin });
    
    if (isAdminLogin) {
      console.log('Processing admin login');
      // Find admin user by username or email (don't require role in query)
      let adminUser = await User.findOne({
        $or: [
          { username: 'admin' },
          { email: 'admin@gmail.com' }
        ]
      }).select('+password');
      
      console.log('Admin user found:', adminUser ? {
        _id: adminUser._id,
        email: adminUser.email,
        username: adminUser.username,
        role: adminUser.role,
        hasPassword: !!adminUser.password
      } : 'NOT FOUND');
      
      if (!adminUser) {
        // Create admin user if it doesn't exist
        try {
          adminUser = await User.create({
            name: 'Admin',
            email: 'admin@gmail.com',
            username: 'admin',
            password: 'admin123', // Pre-save hook will hash it
            role: 'admin',
            emailVerified: true,
          });
          // Re-fetch to get the hashed password for verification
          adminUser = await User.findById(adminUser._id).select('+password');
        } catch (error: any) {
          // If email already exists, find and update it
          if (error.code === 11000) {
            adminUser = await User.findOne({ email: 'admin@gmail.com' }).select('+password');
            if (adminUser) {
              adminUser.username = 'admin';
              adminUser.role = 'admin';
              adminUser.emailVerified = true;
              adminUser.password = 'admin123'; // Pre-save hook will hash it
              await adminUser.save();
              // Re-fetch to get the updated user with hashed password
              adminUser = await User.findById(adminUser._id).select('+password');
            } else {
              return NextResponse.json(
                { success: false, error: 'Failed to create admin account' },
                { status: 500 }
              );
            }
          } else {
            throw error;
          }
        }
      } else {
        // Admin user found - ensure it has admin role and correct password
        // Verify current password
        const isCurrentPasswordCorrect = await adminUser.comparePassword('admin123');
        if (!isCurrentPasswordCorrect) {
          // Reset password to admin123
          adminUser.password = 'admin123';
          await adminUser.save();
          // Re-fetch to get the hashed password
          adminUser = await User.findById(adminUser._id).select('+password');
        }
        
        // Ensure admin role and username are set
        if (adminUser.role !== 'admin' || adminUser.username !== 'admin') {
          adminUser.role = 'admin';
          adminUser.username = 'admin';
          adminUser.emailVerified = true;
          await adminUser.save();
          adminUser = await User.findById(adminUser._id).select('+password');
        }
      }

      // Verify password for admin (final check before creating token)
      if (!adminUser) {
        console.error('Admin user is null before password verification');
        return NextResponse.json(
          { success: false, error: 'Admin user not found' },
          { status: 500 }
        );
      }

      const isMatch = await adminUser.comparePassword(password);
      
      if (!isMatch) {
        console.error('Admin password verification failed');
        return NextResponse.json(
          { success: false, error: 'Invalid admin credentials' },
          { status: 401 }
        );
      }

      // At this point, adminUser exists and password is correct
      // Just ensure role is set in database for future queries, but don't block login
      console.log('Final role check:', { 
        role: adminUser.role, 
        username: adminUser.username
      });
      
      // Try to update role in background (don't block if it fails)
      if (adminUser.role !== 'admin' || adminUser.username !== 'admin') {
        console.log('Updating admin role in database');
        User.findByIdAndUpdate(adminUser._id, {
          role: 'admin',
          username: 'admin'
        }).catch((err) => {
          console.error('Failed to update admin role in DB:', err);
          // Don't block login even if update fails
        });
      }
      
      console.log('Admin authentication successful, creating token');

      // Create JWT token for admin
      const token = jwt.sign(
        { userId: adminUser._id, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = NextResponse.json({
        success: true,
        user: {
          _id: adminUser._id.toString(),
          name: adminUser.name,
          email: adminUser.email,
          username: adminUser.username,
          role: 'admin',
          emailVerified: adminUser.emailVerified || true,
          profilePicture: adminUser.profilePicture,
        },
      });

      // Set httpOnly cookie
      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return response;
    }

    // Regular user login
    // Find user by email or username and include password
    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { username: loginIdentifier }]
    }).select('+password');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if this user is admin but logging in through regular path
    // If email is admin@gmail.com or username is admin, and password is admin123, treat as admin
    if ((user.email === 'admin@gmail.com' || user.username === 'admin') && password === 'admin123') {
      // Update user to admin if not already
      if (user.role !== 'admin') {
        user.role = 'admin';
        user.username = 'admin';
        await user.save();
      }
      
      // Create JWT token for admin
      const token = jwt.sign(
        { userId: user._id, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = NextResponse.json({
        success: true,
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          username: user.username || 'admin',
          role: 'admin',
          emailVerified: user.emailVerified || true,
          profilePicture: user.profilePicture,
        },
      });

      // Set httpOnly cookie
      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return response;
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role || 'user',
        emailVerified: user.emailVerified,
        profilePicture: user.profilePicture,
      },
    });

    // Set httpOnly cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

