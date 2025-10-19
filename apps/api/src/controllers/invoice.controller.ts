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

    // Generate PDF
    console.log('Starting PDF generation...');
    const pdfBuffer = await invoiceService.generateInvoicePDF(invoiceData);
    console.log('PDF generation completed successfully');

    // Set response headers for PDF download (HTML-generated PDFs only)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.orderNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send the content
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating invoice:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('PDF generation failed')) {
        return res.status(500).json({ 
          message: 'Failed to generate PDF. Please try again later.',
          error: 'PDF_GENERATION_FAILED'
        });
      }
      if (error.message.includes('timeout')) {
        return res.status(500).json({ 
          message: 'PDF generation timed out. Please try again.',
          error: 'TIMEOUT'
        });
      }
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: 'UNKNOWN_ERROR'
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
