import { Request, Response } from 'express';
import { invoiceService, InvoiceData } from '../services/invoice.service';
import { Order } from '@chariot/db';
import { User } from '@chariot/db';

export const generateInvoice = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = (req as any).user?.userId;

    console.log(`Invoice request - OrderId: ${orderId}, UserId: ${userId}`);

    if (!userId) {
      console.log('Invoice request failed: No user ID in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!orderId) {
      console.log('Invoice request failed: No order ID provided');
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      console.log(`Invoice request failed: Order ${orderId} not found`);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    if (order.userId.toString() !== userId) {
      console.log(`Invoice request failed: User ${userId} does not have access to order ${orderId}`);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      console.log(`Invoice request failed: User ${userId} not found`);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`Generating invoice for order ${order.orderNumber} (${orderId}) for user ${user.email}`);

    // Company information (you can move this to environment variables)
    const companyInfo = {
      name: 'THE CHARIOT',
      address: 'B/903, Bldg. No. 70, Ajmera Pristine, Yogi Nagar, Old Ajmera High School, Borivali West, Mumbai 400 091.',
      gstin: '27AAKCC0710E1Z5',
      pan: 'AAKCC0710E',
      email: 'customercare@thechariot.net'
    };

    const invoiceData: InvoiceData = {
      order,
      user,
      companyInfo
    };

    // Try to generate PDF first
    try {
      console.log('Starting PDF generation...');
      const pdfBuffer = await invoiceService.generateInvoicePDF(invoiceData);
      console.log('PDF generation completed successfully');

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.orderNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send the PDF buffer
      res.send(pdfBuffer);
      return;
    } catch (pdfError) {
      console.error('PDF generation failed, falling back to HTML:', pdfError);
      
      // Fallback to HTML generation
      const htmlContent = invoiceService.generateInvoiceHTML(invoiceData);
      console.log('HTML fallback generation completed');

      // Set response headers for HTML download
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.orderNumber}.html"`);

      // Send the HTML content
      res.send(htmlContent);
      return;
    }

  } catch (error) {
    console.error('Error generating invoice:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      RENDER: !!process.env.RENDER,
      VERCEL: !!process.env.VERCEL,
      PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH
    });
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('PDF generation failed')) {
        return res.status(500).json({ 
          message: 'Failed to generate PDF. Please try again later.',
          error: 'PDF_GENERATION_FAILED',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      if (error.message.includes('timeout')) {
        return res.status(500).json({ 
          message: 'PDF generation timed out. Please try again.',
          error: 'TIMEOUT',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      if (error.message.includes('Chrome') || error.message.includes('Chromium')) {
        return res.status(500).json({ 
          message: 'PDF service unavailable. Please try again later.',
          error: 'CHROME_NOT_FOUND',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: 'UNKNOWN_ERROR',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
};


export const generateInvoiceForOrder = async (orderId: string, userId: string): Promise<Buffer | null> => {
  try {
    // Find the order
    const order = await Order.findById(orderId).populate('userId');
    if (!order) {
      console.error('Order not found:', orderId);
      return null;
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found:', userId);
      return null;
    }

    // Company information
    const companyInfo = {
      name: 'THE CHARIOT',
      address: 'B/903, Bldg. No. 70, Ajmera Pristine, Yogi Nagar, Old Ajmera High School, Borivali West, Mumbai 400 091.',
      gstin: '27AAKCC0710E1Z5',
      pan: 'AAKCC0710E',
      email: 'customercare@thechariot.net'
    };

    const invoiceData: InvoiceData = {
      order,
      user,
      companyInfo
    };

    // Generate PDF
    const pdfBuffer = await invoiceService.generateInvoicePDF(invoiceData);
    return pdfBuffer;

  } catch (error) {
    console.error('Error generating invoice for order:', error);
    return null;
  }
};
