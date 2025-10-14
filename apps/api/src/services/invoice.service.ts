import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { Order } from '@chariot/db';
import { User } from '@chariot/db';

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
      const chariotLogoPath = path.resolve(process.cwd(), '../website/public/chariot.svg');
      if (fs.existsSync(chariotLogoPath)) {
        const imgBuffer = fs.readFileSync(chariotLogoPath);
        embeddedLogoDataUrl = `data:image/svg+xml;base64,${imgBuffer.toString('base64')}`;
      }
    } catch (logoError) {
      console.warn('Unable to embed chariot logo:', logoError);
    }

    const htmlContent = this.generateInvoiceHTML(invoiceData, embeddedLogoDataUrl);
    
    try {
      // Launch Puppeteer (compatible with Linux/Render). Use env executable if provided.
      const launchOptions: Parameters<typeof puppeteer.launch>[0] = {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      };
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      }

      const browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();

      // Set HTML directly to the page
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // Generate PDF
      const pdfUint8Array = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true
      });

      // Ensure Node Buffer for downstream consumers
      const pdfBuffer = Buffer.from(pdfUint8Array);

      await browser.close();

      return pdfBuffer;
    } catch (error) {
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
            width: 140px;
            height: 80px;
            margin-bottom: 10px;
            border-radius: 0px;
            object-fit: contain;
          }
          
          .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #FA7035;
            text-transform: uppercase;
            margin-bottom: 20px;
            margin-top: 5px;
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
            font-size: 18px;
            font-weight: bold;
            color: #FA7035;
            text-transform: uppercase;
          }
          
          .footer-company .subtitle {
            font-size: 14px;
            display: block;
            margin-top: 2px;
            font-weight: normal;
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
            
              </div>
              <div class="invoice-title">Tax Invoice</div>
            </div>
            
            <!-- Billing Section -->
            <div class="billing-section">
              <div class="billed-to">
                <h3>Billed To:</h3>
                <div class="customer-info">
                  ${user.companyInformation.name || user.firstName + ' ' + user.lastName || 'Customer Name'}<br>
                  ${user.companyInformation.telephone || user.phoneNumber || '+123-456-7890'}<br>
                  ${user.companyInformation.address || user.streetAddress || 'Address not provided'}<br>
                  ${user.city || ''}${user.companyInformation.state ? `${user.companyInformation.state}` : ''}${user.companyInformation.zipcode || user.postalCode ? `, ${user.companyInformation.zipcode || user.postalCode}` : ''}<br>
                </div>
              </div>
              <div class="invoice-details">
                <div><strong>Order No.</strong> ${order.orderNumber || order.id || 'N/A'}</div>
                <div><strong>Invoice No.</strong> ${order.invoiceNumber || order._id?.toString().slice(-5).toUpperCase() || 'N/A'}</div>
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
                ${order.items && order.items.length > 0 ? order.items.map((item: any) => `
                  <tr>
                    <td class="item-description">${item.productName || item.name || item.title || 'Product'}</td>
                    <td class="quantity">${item.quantity || 1}</td>
                    <td class="unit-price">$${(item.unitPrice || item.price || (item.totalPrice / (item.quantity || 1))).toFixed(2)}</td>
                    <td class="total">$${(item.totalPrice || item.price || item.unitPrice || 0).toFixed(2)}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td class="item-description">No items found</td>
                    <td class="quantity">0</td>
                    <td class="unit-price">$0.00</td>
                    <td class="total">$0.00</td>
                  </tr>
                `}
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
                CHANDRA
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