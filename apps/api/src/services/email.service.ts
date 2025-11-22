import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Only try to load .env files in development/local environments
// In production (e.g., Render), environment variables are set via the platform's dashboard
const isProduction = process.env.NODE_ENV === 'production';
const isRender = process.env.RENDER === 'true' || process.env.RENDER_SERVICE_NAME;

if (!isProduction || !isRender) {
  // Try to load .env file - check multiple possible locations (only for local/dev)
  const envPaths = [
    path.resolve(__dirname, '../../.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'apps/api/.env'),
  ];

  // Load .env from the first location that exists
  let envLoaded = false;
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      envLoaded = true;
      console.log(`📧 Loaded .env from: ${envPath}`);
      break;
    }
  }

  if (!envLoaded) {
    // If no .env file found, try default dotenv behavior
    dotenv.config();
    console.warn('⚠️  No .env file found in expected locations. Using default dotenv behavior.');
    console.warn('   Expected locations:', envPaths);
  }
} else {
  // In production on Render, environment variables are already in process.env
  console.log('📧 Running on Render - using environment variables from Render dashboard');
}

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to get from email address at runtime
// IMPORTANT: Must use an email address from your verified domain in Resend
// If using thechariot.net domain, use something like: customercare@thechariot.net
// This function checks the environment variable at runtime to ensure we get the latest value
function getFromEmail(): string {
  // Re-check environment variable at runtime (in case it was set after module load)
  const rawEmail = process.env.RESEND_FROM_EMAIL?.trim() || '';
  const fromEmail = rawEmail.replace(/^["']|["']$/g, '') || 'onboarding@resend.dev';
  
  return fromEmail;
}

// Debug logging on module load
console.log('📧 Resend Email Configuration (on load):');
console.log('   RESEND_FROM_EMAIL (raw):', process.env.RESEND_FROM_EMAIL || 'undefined');
console.log('   RESEND_FROM_EMAIL (processed):', getFromEmail());
console.log('   RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('   RENDER:', isRender ? '✅ Yes' : '❌ No');
console.log('   Current working directory:', process.cwd());
console.log('   __dirname:', __dirname);

if (!process.env.RESEND_FROM_EMAIL || getFromEmail() === 'onboarding@resend.dev') {
  console.warn('⚠️  RESEND_FROM_EMAIL not set or invalid. Using default onboarding@resend.dev which only works in testing mode.');
  console.warn('⚠️  To send emails to all recipients, set RESEND_FROM_EMAIL to an email from your verified domain (e.g., customercare@thechariot.net)');
  
  if (isRender) {
    console.warn('⚠️  [RENDER] Set RESEND_FROM_EMAIL in your Render dashboard:');
    console.warn('   1. Go to your Render service dashboard');
    console.warn('   2. Navigate to Environment tab');
    console.warn('   3. Add environment variable: RESEND_FROM_EMAIL=customercare@thechariot.net');
    console.warn('   4. Save and redeploy your service');
  } else {
    console.warn('⚠️  Make sure your .env file is in apps/api/.env and contains: RESEND_FROM_EMAIL=customercare@thechariot.net');
    console.warn('⚠️  Restart the server after adding RESEND_FROM_EMAIL to your .env file');
  }
}



export const emailService = {
  async sendSellerApprovalEmail(sellerEmail: string, sellerName: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: getFromEmail(),
        to: sellerEmail,
        subject: 'Your Seller Account Has Been Approved!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to Chariot Marketplace!</h2>
            <p>Dear ${sellerName},</p>
            <p>Great news! Your seller account has been approved by our admin team.</p>
            <p>You can now:</p>
            <ul>
              <li>Sign in to your seller portal</li>
              <li>Add your products</li>
              <li>Start selling on our platform</li>
            </ul>
            <p>Please visit <a href="${process.env.SELLER_PORTAL_URL || 'http://localhost:3002'}/login">Seller Portal</a> to get started.</p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br>The Chariot Team</p>
          </div>
        `,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending seller approval email:', error);
      throw error;
    }
  },

  async sendSellerRejectionEmail(sellerEmail: string, sellerName: string, reason: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: getFromEmail(),
        to: sellerEmail,
        subject: 'Seller Account Application Update',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Seller Account Application</h2>
            <p>Dear ${sellerName},</p>
            <p>Thank you for your interest in becoming a seller on Chariot Marketplace.</p>
            <p>After careful review, we regret to inform you that your seller account application has not been approved at this time.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>You may reapply in the future with updated information.</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>The Chariot Team</p>
          </div>
        `,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending seller rejection email:', error);
      throw error;
    }
  },

  async sendNewSellerNotification(adminEmail: string, sellerName: string, sellerEmail: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: getFromEmail(),
        to: adminEmail,
        subject: 'New Seller Registration Requires Approval',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Seller Registration</h2>
            <p>A new seller has registered and requires your approval:</p>
            <p><strong>Name:</strong> ${sellerName}</p>
            <p><strong>Email:</strong> ${sellerEmail}</p>
            <p>Please review their application in the admin portal.</p>
            <p>Best regards,<br>The Chariot System</p>
          </div>
        `,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending new seller notification email:', error);
      throw error;
    }
  },

  async sendSellerBlacklistEmail(sellerEmail: string, sellerName: string, reason: string, expiryDate: Date) {
    try {
      const { data, error } = await resend.emails.send({
        from: getFromEmail(),
        to: sellerEmail,
        subject: 'Your Seller Account Has Been Temporarily Suspended',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Account Suspension Notice</h2>
            <p>Dear ${sellerName},</p>
            <p>Your seller account has been temporarily suspended due to the following reason:</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p><strong>Suspension Expires:</strong> ${expiryDate.toLocaleDateString()}</p>
            <p>During this suspension period, you will not be able to:</p>
            <ul>
              <li>Add new products</li>
              <li>Receive new orders</li>
              <li>Access your seller dashboard</li>
            </ul>
            <p>If you believe this suspension is in error, you may submit a reapplication through your dashboard.</p>
            <p>Best regards,<br>The Chariot Team</p>
          </div>
        `,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending seller blacklist email:', error);
      throw error;
    }
  },

  async sendSellerBlacklistRemovalEmail(sellerEmail: string, sellerName: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: getFromEmail(),
        to: sellerEmail,
        subject: 'Your Seller Account Has Been Reactivated',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Account Reactivation Notice</h2>
            <p>Dear ${sellerName},</p>
            <p>Good news! Your seller account has been reactivated and removed from the blacklist.</p>
            <p>You can now:</p>
            <ul>
              <li>Access your seller portal</li>
              <li>Upload and manage products</li>
              <li>Process orders</li>
              <li>Continue selling on our platform</li>
            </ul>
            <p>Please visit <a href="${process.env.SELLER_PORTAL_URL || 'http://localhost:3002'}/login">Seller Portal</a> to resume your business.</p>
            <p>We appreciate your cooperation and look forward to your continued success on our platform.</p>
            <p>Best regards,<br>The Chariot Team</p>
          </div>
        `,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending seller blacklist removal email:', error);
      throw error;
    }
  },

  async sendSellerReapplicationNotification(adminEmail: string, sellerName: string, sellerEmail: string, reapplicationReason: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: getFromEmail(),
        to: adminEmail,
        subject: 'Seller Reapplication Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Seller Reapplication</h2>
            <p>A blacklisted seller has submitted a reapplication request:</p>
            <p><strong>Seller Name:</strong> ${sellerName}</p>
            <p><strong>Seller Email:</strong> ${sellerEmail}</p>
            <p><strong>Reapplication Reason:</strong> ${reapplicationReason}</p>
            <p>Please review this request in the admin portal and take appropriate action.</p>
            <p>Best regards,<br>The Chariot System</p>
          </div>
        `,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending seller reapplication notification email:', error);
      throw error;
    }
  },

  async sendNewBuyerNotification(adminEmail: string, buyerName: string, buyerEmail: string, companyName: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: getFromEmail(),
        to: adminEmail,
        subject: 'New Buyer Registration Requires Approval',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Buyer Registration</h2>
            <p>A new buyer has registered and requires your approval:</p>
            <p><strong>Buyer Name:</strong> ${buyerName}</p>
            <p><strong>Company Name:</strong> ${companyName}</p>
            <p><strong>Email:</strong> ${buyerEmail}</p>
            <p>Please review their application in the admin portal and approve/reject accordingly.</p>
            <p>Best regards,<br>The Chariot System</p>
          </div>
        `,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending new buyer notification email:', error);
      throw error;
    }
  },

  async sendBuyerApprovalEmail(buyerEmail: string, buyerName: string, userAccountId: string, password: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: getFromEmail(),
        to: buyerEmail,
        subject: 'Your Buyer Account Has Been Approved!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to Chariot Marketplace!</h2>
            <p>Dear ${buyerName},</p>
            <p>Great news! Your buyer account has been approved by our admin team.</p>
            <p><strong>Your login credentials:</strong></p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>User Account ID:</strong> ${userAccountId}</p>
              <p><strong>Password:</strong> ${password}</p>
            </div>
            <p><em>Example: User Account ID: CHARIOT1A2B3, Password: K9m#Np2x</em></p>
            <p>Please visit <a href="${process.env.WEBSITE_URL || 'http://localhost:3000'}/login">Chariot Marketplace</a> to login and start shopping.</p>
            <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br>The Chariot Team</p>
          </div>
        `,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending buyer approval email:', error);
      throw error;
    }
  },



  async sendBuyerRejectionEmail(buyerEmail: string, buyerName: string, reason: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: getFromEmail(),
        to: buyerEmail,
        subject: 'Buyer Account Application Update',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Buyer Account Application</h2>
            <p>Dear ${buyerName},</p>
            <p>Thank you for your interest in becoming a buyer on Chariot Marketplace.</p>
            <p>After careful review, we regret to inform you that your buyer account application has not been approved at this time.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>You may reapply in the future with updated information.</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>The Chariot Team</p>
          </div>
        `,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending buyer rejection email:', error);
      throw error;
    }
  },

  async sendPasswordResetOTP(email: string, otp: string, userName: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: getFromEmail(),
        to: email,
        subject: 'Password Reset OTP - Chariot Marketplace',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Password Reset Request</h2>
            <p>Dear ${userName},</p>
            <p>We received a request to reset your password for your Chariot Marketplace account.</p>
            <p>Your One-Time Password (OTP) is:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #2563eb;">
              <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
            </div>
            <p><strong>This OTP will expire in 10 minutes.</strong></p>
            <p>If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
            <p>For security reasons, please do not share this OTP with anyone.</p>
            <p>Best regards,<br>The Chariot Team</p>
          </div>
        `,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending password reset OTP email:', error);
      throw error;
    }
  },

  async sendSaleNotification(
    sellerEmail: string,
    sellerName: string,
    productName: string,
    productSku: string,
    orderNumber: string,
    saleAmount: number,
    commissionAmount: number,
    sellerEarnings: number
  ) {
    try {
      // Get from email at runtime to ensure we have the latest value
      const currentFromEmail = getFromEmail();
      
      console.log('📧 Sending sale notification email:');
      console.log('   From:', currentFromEmail);
      console.log('   To:', sellerEmail);
      console.log('   RESEND_FROM_EMAIL env var:', process.env.RESEND_FROM_EMAIL);
      
      const { data, error } = await resend.emails.send({
        from: currentFromEmail,
        to: sellerEmail,
        subject: '🎉 New Sale Alert!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Congratulations! You have a new sale!</h2>
            <p>Dear ${sellerName},</p>
            <p>Great news! You've just made a sale on Chariot Marketplace.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Sale Details:</h3>
              <p><strong>Product:</strong> ${productName}</p>
              <p><strong>SKU:</strong> ${productSku}</p>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Sale Amount:</strong> $${saleAmount.toFixed(2)}</p>
              <p><strong>Commission:</strong> $${commissionAmount.toFixed(2)}</p>
              <p><strong>Your Earnings:</strong> $${sellerEarnings.toFixed(2)}</p>
            </div>
            
            <p>Your earnings will be processed according to your payout schedule. Keep up the great work!</p>
            <p>Best regards,<br>The Chariot Team</p>
          </div>
        `,
      });

      if (error) {
        console.error('❌ Resend API Error:', error);
        console.error('   Error details:', JSON.stringify(error, null, 2));
        console.error('   From email used:', currentFromEmail);
        console.error('   To email:', sellerEmail);
        throw error;
      }

      console.log('✅ Sale notification email sent successfully');
      return data;
    } catch (error: any) {
      console.error('❌ Error sending sale notification email:', error);
      if (error?.message?.includes('validation_error')) {
        console.error('   This is a Resend validation error. Common causes:');
        console.error('   1. RESEND_FROM_EMAIL is not set or using default onboarding@resend.dev');
        console.error('   2. The from email domain is not verified in Resend');
        console.error('   3. The from email format is incorrect');
        console.error('   Current RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'NOT SET');
        console.error('   Current from email value:', getFromEmail());
        
        const isRender = process.env.RENDER === 'true' || process.env.RENDER_SERVICE_NAME;
        if (isRender) {
          console.error('   [RENDER] To fix this:');
          console.error('   1. Go to your Render service dashboard');
          console.error('   2. Navigate to Environment tab');
          console.error('   3. Add: RESEND_FROM_EMAIL=customercare@thechariot.net');
          console.error('   4. Make sure thechariot.net domain is verified in Resend');
          console.error('   5. Save and redeploy your service');
        } else {
          console.error('   [LOCAL] To fix this:');
          console.error('   1. Add RESEND_FROM_EMAIL=customercare@thechariot.net to your .env file');
          console.error('   2. Make sure thechariot.net domain is verified in Resend');
          console.error('   3. Restart your server');
        }
      }
      throw error;
    }
  },

  async sendAdminSaleNotification(
    adminEmail: string,
    productName: string,
    productSku: string,
    sellerName: string,
    orderNumber: string,
    saleAmount: number,
    commissionAmount: number
  ) {
    try {
      const { data, error } = await resend.emails.send({
        from: getFromEmail(),
        to: adminEmail,
        subject: 'New Marketplace Sale',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Marketplace Sale</h2>
            <p>A new sale has been completed on the marketplace.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Sale Details:</h3>
              <p><strong>Product:</strong> ${productName}</p>
              <p><strong>SKU:</strong> ${productSku}</p>
              <p><strong>Seller:</strong> ${sellerName}</p>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Sale Amount:</strong> $${saleAmount.toFixed(2)}</p>
              <p><strong>Platform Commission:</strong> $${commissionAmount.toFixed(2)}</p>
            </div>
            
            <p>You can view detailed analytics in your admin dashboard.</p>
            <p>Best regards,<br>The Chariot System</p>
          </div>
        `,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending admin sale notification email:', error);
      throw error;
    }
  },

  async sendCommissionEarnedNotification(
    sellerEmail: string,
    sellerName: string,
    period: string,
    totalEarnings: number,
    commissionEarned: number
  ) {
    try {
      const { data, error } = await resend.emails.send({
        from: getFromEmail(),
        to: sellerEmail,
        subject: `Commission Summary - ${period}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Commission Summary</h2>
            <p>Dear ${sellerName},</p>
            <p>Here's your commission summary for ${period}:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Summary:</h3>
              <p><strong>Period:</strong> ${period}</p>
              <p><strong>Total Sales:</strong> $${totalEarnings.toFixed(2)}</p>
              <p><strong>Commission Earned:</strong> $${commissionEarned.toFixed(2)}</p>
            </div>
            
            <p>Your commission will be processed according to your payout schedule.</p>
            <p>Best regards,<br>The Chariot Team</p>
          </div>
        `,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending commission earned notification email:', error);
      throw error;
    }
  },
}; 