import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const emailService = {
  async sendSellerApprovalEmail(sellerEmail: string, sellerName: string) {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
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
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Seller approval email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending seller approval email:', error);
      throw error;
    }
  },

  async sendSellerRejectionEmail(sellerEmail: string, sellerName: string, reason: string) {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
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
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Seller rejection email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending seller rejection email:', error);
      throw error;
    }
  },

  async sendNewSellerNotification(adminEmail: string, sellerName: string, sellerEmail: string) {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
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
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('New seller notification email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending new seller notification email:', error);
      throw error;
    }
  },

  async sendSellerBlacklistEmail(sellerEmail: string, sellerName: string, reason: string, expiryDate: Date) {
    try {
      const formattedExpiryDate = expiryDate.toLocaleDateString();
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: sellerEmail,
        subject: 'Your Seller Account Has Been Blacklisted',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Account Blacklist Notice</h2>
            <p>Dear ${sellerName},</p>
            <p>We regret to inform you that your seller account has been temporarily blacklisted due to a violation of our platform policies.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p><strong>Blacklist Expiry Date:</strong> ${formattedExpiryDate}</p>
            <p>During this period:</p>
            <ul>
              <li>All your products have been temporarily deactivated</li>
              <li>You cannot upload new products</li>
              <li>You cannot process new orders</li>
            </ul>
            <p>After the blacklist period expires, you may reapply for reactivation by contacting our support team.</p>
            <p>If you believe this action was taken in error, please contact our support team immediately.</p>
            <p>Best regards,<br>The Chariot Team</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Seller blacklist email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending seller blacklist email:', error);
      throw error;
    }
  },

  async sendSellerBlacklistRemovalEmail(sellerEmail: string, sellerName: string) {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
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
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Seller blacklist removal email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending seller blacklist removal email:', error);
      throw error;
    }
  },

  async sendSellerReapplicationNotification(adminEmail: string, sellerName: string, sellerEmail: string, reapplicationReason: string) {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
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
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Seller reapplication notification email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending seller reapplication notification email:', error);
      throw error;
    }
  },
}; 