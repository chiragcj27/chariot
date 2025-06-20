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
}; 