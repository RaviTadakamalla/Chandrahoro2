/**
 * Email Service for ChandraHoro V2.1
 * 
 * Handles sending transactional emails using Nodemailer.
 * Supports password reset, email verification, and welcome emails.
 */

import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

// Create reusable transporter
const transporter = nodemailer.createTransporter(emailConfig);

// Verify transporter configuration
if (process.env.NODE_ENV === 'development') {
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email transporter verification failed:', error);
    } else {
      console.log('Email transporter is ready');
    }
  });
}

/**
 * Email template interface
 */
interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email function
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  try {
    const mailOptions = {
      from: `"ChandraHoro" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Password reset email template
 */
export function getPasswordResetTemplate(
  name: string,
  resetUrl: string
): EmailTemplate {
  return {
    subject: 'Reset your ChandraHoro password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fef3cd; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌙 ChandraHoro</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>We received a request to reset your password for your ChandraHoro account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            </div>
            <div class="footer">
              <p>© 2025 ChandraHoro. All rights reserved.</p>
              <p>This email was sent to ${to}. If you have questions, contact support.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

/**
 * Email verification template
 */
export function getEmailVerificationTemplate(
  name: string,
  verificationUrl: string
): EmailTemplate {
  return {
    subject: 'Verify your ChandraHoro email address',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .welcome { background: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌙 ChandraHoro</h1>
              <p>Welcome to Your Vedic Astrology Journey</p>
            </div>
            <div class="content">
              <h2>Welcome ${name}!</h2>
              <p>Thank you for joining ChandraHoro. To complete your registration, please verify your email address.</p>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              <div class="welcome">
                <strong>🎉 What's Next?</strong>
                <ul>
                  <li>Complete your birth chart profile</li>
                  <li>Get your first personalized reading</li>
                  <li>Explore Vedic astrology insights</li>
                  <li>Connect with our AI astrology assistant</li>
                </ul>
              </div>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            </div>
            <div class="footer">
              <p>© 2025 ChandraHoro. All rights reserved.</p>
              <p>This email was sent to ${to}. If you have questions, contact support.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

/**
 * Welcome email template
 */
export function getWelcomeEmailTemplate(name: string): EmailTemplate {
  return {
    subject: 'Welcome to ChandraHoro - Your Vedic Astrology Journey Begins',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ChandraHoro</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .features { background: #fff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .feature { margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌙 ChandraHoro</h1>
              <p>Your Vedic Astrology Journey Begins</p>
            </div>
            <div class="content">
              <h2>Namaste ${name}!</h2>
              <p>Welcome to ChandraHoro, your personal guide to Vedic astrology and cosmic insights.</p>
              
              <div class="features">
                <h3>🌟 What You Can Do:</h3>
                <div class="feature">📊 <strong>Birth Chart Analysis:</strong> Generate detailed Vedic charts</div>
                <div class="feature">📖 <strong>Daily Readings:</strong> Personalized astrological insights</div>
                <div class="feature">🤖 <strong>AI Assistant:</strong> Ask questions about your chart</div>
                <div class="feature">💫 <strong>Dasha Periods:</strong> Understand your life cycles</div>
                <div class="feature">💕 <strong>Compatibility:</strong> Explore relationship dynamics</div>
              </div>
              
              <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Start Your Journey</a>
              
              <p>Need help getting started? Check out our <a href="${process.env.NEXTAUTH_URL}/help">help center</a> or contact our support team.</p>
            </div>
            <div class="footer">
              <p>© 2025 ChandraHoro. All rights reserved.</p>
              <p>Follow us for daily insights and updates.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
  const template = getPasswordResetTemplate(name, resetUrl);
  
  await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  });
}

/**
 * Send email verification email
 */
export async function sendEmailVerification(
  email: string,
  name: string,
  verificationToken: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;
  const template = getEmailVerificationTemplate(name, verificationUrl);
  
  await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<void> {
  const template = getWelcomeEmailTemplate(name);
  
  await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  });
}
