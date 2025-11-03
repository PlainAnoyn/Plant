import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'PlantShop'}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify Your Email - PlantShop',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fefdfb; padding: 30px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; padding: 12px 30px; background: #047857; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌱 Welcome to PlantShop!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
              <p>Click the button below to verify your email:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                Or copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #047857; word-break: break-all;">${verificationUrl}</a>
              </p>
              <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
                This link will expire in 24 hours.
              </p>
            </div>
            <div class="footer">
              <p>If you didn't create an account, please ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} PlantShop. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to PlantShop!
      
      Hi ${name},
      
      Thank you for signing up! Please verify your email address by clicking the link below:
      
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account, please ignore this email.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'PlantShop'}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset Your Password - PlantShop',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fefdfb; padding: 30px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; padding: 12px 30px; background: #047857; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>You requested to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #047857; word-break: break-all;">${resetUrl}</a>
              </p>
              <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
                This link will expire in 1 hour.
              </p>
              <p style="margin-top: 20px; font-size: 14px; color: #dc2626;">
                If you didn't request a password reset, please ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} PlantShop. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

// Order confirmation email
export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderId: string,
  orderItems: Array<{ name: string; quantity: number; price: number }>,
  totalPrice: number,
  shippingAddress: any
) {
  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${orderId}`;
  
  const itemsHtml = orderItems.map(
    (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name} x ${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
  ).join('');

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'PlantShop'}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Order Confirmed - #${orderId.slice(-8).toUpperCase()} - PlantShop`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fefdfb; padding: 30px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; padding: 12px 30px; background: #047857; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f3f4f6; padding: 10px; text-align: left; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Order Confirmed!</h1>
              <p>Order #${orderId.slice(-8).toUpperCase()}</p>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for your order! We're excited to send your plants on their way to you.</p>
              
              <h3 style="margin-top: 30px;">Order Details:</h3>
              <table>
                <thead>
                  <tr>
                    <th style="padding: 10px; border-bottom: 2px solid #e5e7eb;">Item</th>
                    <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr>
                    <td style="padding: 10px; border-top: 2px solid #e5e7eb; font-weight: bold;">Total</td>
                    <td style="padding: 10px; border-top: 2px solid #e5e7eb; text-align: right; font-weight: bold; font-size: 18px;">$${totalPrice.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <h3 style="margin-top: 30px;">Shipping Address:</h3>
              <p>
                ${shippingAddress.fullName}<br>
                ${shippingAddress.address}<br>
                ${shippingAddress.city}, ${shippingAddress.country}
              </p>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${orderUrl}" class="button">View Order Details</a>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                We'll send you another email when your order ships. If you have any questions, please contact us at support@plantshop.com
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} PlantShop. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    }
    return { success: true };
  } catch (error) {
    console.error('Order confirmation email error:', error);
    // Don't fail order creation if email fails
    return { success: false, error };
  }
}

// Order shipped email
export async function sendOrderShippedEmail(
  email: string,
  name: string,
  orderId: string,
  trackingNumber?: string
) {
  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${orderId}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'PlantShop'}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your Order Has Shipped! - #${orderId.slice(-8).toUpperCase()} - PlantShop`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fefdfb; padding: 30px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; padding: 12px 30px; background: #047857; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚚 Your Order Has Shipped!</h1>
              <p>Order #${orderId.slice(-8).toUpperCase()}</p>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Great news! Your order has been shipped and is on its way to you.</p>
              ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
              <p>You can expect to receive your plants within 3-5 business days.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${orderUrl}" class="button">Track Your Order</a>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                If you have any questions, please contact us at support@plantshop.com
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} PlantShop. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    }
    return { success: true };
  } catch (error) {
    console.error('Order shipped email error:', error);
    return { success: false, error };
  }
}

// Order delivered email
export async function sendOrderDeliveredEmail(
  email: string,
  name: string,
  orderId: string
) {
  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${orderId}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'PlantShop'}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your Order Has Been Delivered! - #${orderId.slice(-8).toUpperCase()} - PlantShop`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fefdfb; padding: 30px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; padding: 12px 30px; background: #047857; color: white; text-decoration: none; border-radius: 6px; margin: 20px 10px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Your Order Has Been Delivered!</h1>
              <p>Order #${orderId.slice(-8).toUpperCase()}</p>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>We hope you're loving your new plants! Your order has been successfully delivered.</p>
              <p>We'd love to hear about your experience. Please consider leaving a review to help other plant lovers!</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${orderUrl}" class="button">View Order</a>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                Thank you for choosing PlantShop! If you need any help with plant care, feel free to reach out at support@plantshop.com
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} PlantShop. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    }
    return { success: true };
  } catch (error) {
    console.error('Order delivered email error:', error);
    return { success: false, error };
  }
}

