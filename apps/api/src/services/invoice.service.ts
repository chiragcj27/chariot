import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { Order } from '@chariot/db';
import { User } from '@chariot/db';

const execAsync = promisify(exec);

export interface InvoiceData {
  order: any;
  user: any;
  companyInfo: {
    name: string;
    logo?: string;
    address: string;
    gstin: string;
    pan: string;
    email: string;
  };
}

export class InvoiceService {
  private static instance: InvoiceService;

  public static getInstance(): InvoiceService {
    if (!InvoiceService.instance) {
      InvoiceService.instance = new InvoiceService();
    }
    return InvoiceService.instance;
  }

  public async generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
    console.log('Starting invoice generation with HTML/CSS...');
    return await this.generateInvoiceWithHTML(invoiceData);
  }

  private async generateInvoiceWithHTML(invoiceData: InvoiceData): Promise<Buffer> {
    console.log('Generating invoice with HTML/CSS...');
    
    // Resolve Chariot logo from website public folder and embed as data URL
    let embeddedLogoDataUrl: string | undefined;
    try {
      const chariotLogoPath = path.resolve(process.cwd(), '../website/public/chariot.png');
      if (fs.existsSync(chariotLogoPath)) {
        const imgBuffer = fs.readFileSync(chariotLogoPath);
        embeddedLogoDataUrl = `data:image/png;base64,${imgBuffer.toString('base64')}`;
      }
    } catch (logoError) {
      console.warn('Unable to embed chariot logo:', logoError);
    }

    const htmlContent = this.generateInvoiceHTML(invoiceData, embeddedLogoDataUrl);
    const tempDir = path.join(__dirname, '../../temp');
    const htmlFile = path.join(tempDir, `invoice-${Date.now()}.html`);
    const pdfFile = path.join(tempDir, `invoice-${Date.now()}.pdf`);
    
    try {
      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Write HTML to file
      fs.writeFileSync(htmlFile, htmlContent);
      
      // Use Chrome headless to generate PDF (works on macOS)
      const chromeCommand = `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --headless --disable-gpu --no-sandbox --print-to-pdf="${pdfFile}" "${htmlFile}"`;
      
      await execAsync(chromeCommand);
      
      // Read the generated PDF
      const pdfBuffer = fs.readFileSync(pdfFile);
      
      // Clean up temp files
      fs.unlinkSync(htmlFile);
      fs.unlinkSync(pdfFile);
      
      return pdfBuffer;
    } catch (error) {
      // Clean up temp files on error
      try {
        if (fs.existsSync(htmlFile)) fs.unlinkSync(htmlFile);
        if (fs.existsSync(pdfFile)) fs.unlinkSync(pdfFile);
      } catch (cleanupError) {
        console.error('Error cleaning up temp files:', cleanupError);
      }
      throw error;
    }
  }


  private generateInvoiceHTML(data: InvoiceData, logoDataUrl?: string): string {
    const { order, user, companyInfo } = data;
    
    // Format date
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Calculate totals
    const subtotal = order.subtotal || 0;
    const tax = order.tax || 0;
    const total = order.total || 0;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${order.orderNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            color: #000;
            line-height: 1.4;
          }
          
          .invoice-container {
            background-color: #f5f5f5;
            min-height: 100vh;
            padding: 40px;
          }
          
          .invoice {
            background-color: white;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          
          /* Header Section */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
          }
          
          .company-info {
            flex: 1;
          }
          
          .logo {
            width: 120px;
            height: 120px;
            margin-bottom: 5px;
            border-radius: 0px;
            object-fit: contain;
          }
          
          .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #FFA07A;
            text-transform: uppercase;
            margin-bottom: 20px;
          }
          
          .invoice-title {
            font-size: 28px;
            font-weight: bold;
            text-transform: uppercase;
            text-align: right;
          }
          
          /* Billing Section */
          .billing-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
          }
          
          .billed-to {
            flex: 1;
          }
          
          .billed-to h3 {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 10px;
          }
          
          .customer-info {
            font-size: 14px;
            line-height: 1.6;
          }
          
          .invoice-details {
            text-align: right;
            font-size: 14px;
          }
          
          .invoice-details div {
            margin-bottom: 5px;
          }
          
          /* Items Table */
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          .items-table th {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            padding: 15px 10px;
            border-bottom: 1px solid #000;
          }
          
          .items-table td {
            padding: 15px 10px;
            border-bottom: 1px solid #000;
            font-size: 14px;
          }
          
          .items-table .item-description {
            text-align: left;
          }
          
          .items-table .quantity,
          .items-table .unit-price,
          .items-table .total {
            text-align: center;
          }
          
          /* Summary Section */
          .summary {
            text-align: right;
            margin-top: 20px;
          }
          
          .summary-row {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 10px;
          }
          
          .summary-label {
            width: 150px;
            text-align: right;
            margin-right: 20px;
            font-size: 14px;
          }
          
          .summary-value {
            width: 100px;
            text-align: right;
            font-size: 14px;
          }
          
          .summary-row.total {
            border-top: 1px solid #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          
          .summary-row.total .summary-label,
          .summary-row.total .summary-value {
            font-weight: bold;
            font-size: 16px;
          }
          
          /* Footer */
          .footer {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          
          .footer-company {
            font-size: 16px;
            font-weight: bold;
            color: #FFA07A;
            text-transform: uppercase;
          }
          
          .footer-company .subtitle {
            font-size: 12px;
            display: block;
            margin-top: 2px;
          }
          
          .footer-info {
            font-size: 12px;
            line-height: 1.4;
            text-align: right;
          }
          
          .footer-info div {
            margin-bottom: 2px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice">
            <!-- Header -->
            <div class="header">
              <div class="company-info">
                ${ (logoDataUrl || companyInfo.logo)
                  ? `<img class=\"logo\" src=\"${logoDataUrl || companyInfo.logo}\" alt=\"Chariot Logo\" />`
                  : `<div class=\"logo\" style=\"background-color:#FFA07A;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:24px;\">A</div>`
                }
                <div class="company-name">${companyInfo.name}</div>
              </div>
              <div class="invoice-title">Tax Invoice</div>
            </div>
            
            <!-- Billing Section -->
            <div class="billing-section">
              <div class="billed-to">
                <h3>Billed To:</h3>
                <div class="customer-info">
                  ${user.name}<br>
                  ${user.phone || '+123-456-7890'}<br>
                  ${user.address || 'Address not provided'}<br>
                  ${user.city || ''}${user.state ? `, ${user.state}` : ''}${user.zipCode ? `, ${user.zipCode}` : ''}<br>
                  ${user.country || 'USA'}
                </div>
              </div>
              <div class="invoice-details">
                <div><strong>Order No.</strong> ${order.orderNumber}</div>
                <div><strong>Invoice No.</strong> ${order._id.toString().slice(-5).toUpperCase()}</div>
                <div><strong>Date:</strong> ${orderDate}</div>
              </div>
            </div>
            
            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th class="item-description">Item Description:</th>
                  <th class="quantity">Quantity</th>
                  <th class="unit-price">Unit Price</th>
                  <th class="total">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map((item: any) => `
                  <tr>
                    <td class="item-description">${item.productName}</td>
                    <td class="quantity">${item.quantity}</td>
                    <td class="unit-price">$${item.unitPrice || (item.totalPrice / item.quantity).toFixed(2)}</td>
                    <td class="total">$${item.totalPrice.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <!-- Summary -->
            <div class="summary">
              <div class="summary-row">
                <span class="summary-label">Subtotal:</span>
                <span class="summary-value">$${subtotal.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Tax (0%):</span>
                <span class="summary-value">$${tax.toFixed(2)}</span>
              </div>
              <div class="summary-row total">
                <span class="summary-label">Total:</span>
                <span class="summary-value">$${total.toFixed(2)}</span>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <div class="footer-company">
                ${companyInfo.name.toUpperCase()}
                <span class="subtitle">JEWELS</span>
              </div>
              <div class="footer-info">
                <div>${companyInfo.address}</div>
                <div>GSTIN No: ${companyInfo.gstin}, PAN Number: ${companyInfo.pan}</div>
                <div>Contact Us: ${companyInfo.email}</div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const invoiceService = InvoiceService.getInstance();