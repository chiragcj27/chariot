import { Request, Response } from 'express';
import { invoiceService, InvoiceData } from '../services/invoice.service';
import { Order } from '@chariot/db';
import { User } from '@chariot/db';

export const generateInvoice = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    if (order.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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
    const pdfBuffer = await invoiceService.generateInvoicePDF(invoiceData);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.orderNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send the PDF
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Internal server error' });
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
