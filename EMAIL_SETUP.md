# Email Verification Setup Guide

## Email Service Configuration

The application uses **Nodemailer** for sending verification emails. You can configure it with various email providers.

### Option 1: Gmail (Easy for Development)

1. Go to your Google Account settings
2. Enable "2-Step Verification"
3. Generate an "App Password" for this application
4. Add to `.env.local`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=PlantShop
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Option 2: SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com
2. Create an API key
3. Add to `.env.local`:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM_NAME=PlantShop
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Option 3: Mailgun

1. Sign up at https://www.mailgun.com
2. Get your SMTP credentials
3. Add to `.env.local`:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
SMTP_FROM_NAME=PlantShop
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Option 4: Resend (Modern, Developer-Friendly)

Update `lib/email.ts` to use Resend API instead of SMTP. Then add:

```env
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Option 5: AWS SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-ses-smtp-username
SMTP_PASS=your-aws-ses-smtp-password
SMTP_FROM_NAME=PlantShop
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Testing Without Email Service

If you don't configure email service, the signup will still work, but verification emails won't be sent. Users can:
1. Still create accounts
2. Resend verification emails later when email is configured
3. Access the cart (you can add email verification requirement later)

## Features Implemented

✅ Email verification on signup
✅ Verification link (valid for 24 hours)
✅ Resend verification email
✅ Email verification status display
✅ Beautiful HTML email templates
✅ Automatic redirect after verification

## Next Steps

1. Choose an email provider
2. Configure SMTP settings in `.env.local`
3. Test the signup flow
4. Check spam folder if emails don't arrive
5. (Optional) Restrict cart access until email is verified


