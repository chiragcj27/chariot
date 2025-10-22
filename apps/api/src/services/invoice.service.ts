import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import chromium from 'chromium';
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
  private browser: any = null;
  private isBrowserReady = false;
  private pdfCache = new Map<string, { buffer: Buffer; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): InvoiceService {
    if (!InvoiceService.instance) {
      InvoiceService.instance = new InvoiceService();
    }
    return InvoiceService.instance;
  }

  private async getBrowser() {
    if (this.browser && this.isBrowserReady) {
      return this.browser;
    }

    console.log('Initializing browser for PDF generation...');
    
    // Configure Puppeteer for production deployment
    const launchOptions: Parameters<typeof puppeteer.launch>[0] = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-plugins',
        '--single-process',
        '--no-zygote',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--memory-pressure-off',
        '--max_old_space_size=4096'
      ],
      timeout: 60000
    };
    
    // For Render deployment, use bundled Chromium
    const isRender = process.env.RENDER === 'true' || process.env.RENDER;
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isRender || isProduction) {
      // Use bundled Chromium for Render/production
      console.log('Using bundled Chromium for production deployment...');
      launchOptions.executablePath = chromium.path;
    } else {
      // Try to find Chrome executable for local development
      const possiblePaths = [
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chrome',
        '/usr/bin/chrome-browser',
        '/opt/google/chrome/chrome'
      ];
      
      let chromeFound = false;
      for (const chromePath of possiblePaths) {
        if (fs.existsSync(chromePath)) {
          launchOptions.executablePath = chromePath;
          console.log('Found Chrome at:', chromePath);
          chromeFound = true;
          break;
        }
      }
      
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        chromeFound = true;
        console.log('Using custom Puppeteer executable:', process.env.PUPPETEER_EXECUTABLE_PATH);
      }
      
      // If no Chrome found, use bundled Chromium
      if (!chromeFound) {
        console.log('No Chrome/Chromium found, using bundled Chromium...');
        launchOptions.executablePath = chromium.path;
      }
    }
    
    console.log('Launching Puppeteer for PDF generation...');
    console.log('Launch options:', { 
      executablePath: launchOptions.executablePath || 'bundled',
      argsCount: launchOptions.args?.length || 0,
      timeout: launchOptions.timeout
    });
    
    this.browser = await puppeteer.launch(launchOptions);
    this.isBrowserReady = true;
    
    // Set up browser cleanup on process exit
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
    
    return this.browser;
  }

  private async cleanup() {
    if (this.browser) {
      console.log('Cleaning up browser instance...');
      await this.browser.close();
      this.browser = null;
      this.isBrowserReady = false;
    }
  }

  private getCacheKey(invoiceData: InvoiceData): string {
    // Create a unique cache key based on order and user data
    const orderId = invoiceData.order._id || invoiceData.order.id;
    const userId = invoiceData.user._id || invoiceData.user.id;
    const orderNumber = invoiceData.order.orderNumber;
    const total = invoiceData.order.total;
    
    return `invoice_${orderId}_${userId}_${orderNumber}_${total}`;
  }

  private getCachedPDF(cacheKey: string): Buffer | null {
    const cached = this.pdfCache.get(cacheKey);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.pdfCache.delete(cacheKey);
      return null;
    }
    
    console.log('Returning cached PDF for key:', cacheKey);
    return cached.buffer;
  }

  private setCachedPDF(cacheKey: string, buffer: Buffer): void {
    this.pdfCache.set(cacheKey, {
      buffer: buffer,
      timestamp: Date.now()
    });
    
    // Clean up old cache entries
    this.cleanupCache();
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.pdfCache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.pdfCache.delete(key);
      }
    }
  }

  public generateInvoiceHTML(invoiceData: InvoiceData): string {
    console.log('Generating invoice HTML...');
    
    // Load logos
    const chariotLogo = this.loadLogo('chariot');
    const chandraLogo = this.loadLogo('chandra');
    
    return this.createInvoiceHTML(invoiceData, chariotLogo, chandraLogo);
  }

  public async generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
    console.log('Generating invoice PDF...');
    
    // Check cache first
    const cacheKey = this.getCacheKey(invoiceData);
    const cachedPDF = this.getCachedPDF(cacheKey);
    if (cachedPDF) {
      console.log('Returning cached PDF, size:', cachedPDF.length, 'bytes');
      return cachedPDF;
    }
    
    try {
      // Load logos
      const chariotLogo = this.loadLogo('chariot');
      const chandraLogo = this.loadLogo('chandra');
      
      // Generate HTML
      const htmlContent = this.createInvoiceHTML(invoiceData, chariotLogo, chandraLogo);
      
      // Get or create browser instance
      const browser = await this.getBrowser();
      const page = await browser.newPage();
      
      try {
        // Set viewport and content
        await page.setViewport({ width: 1200, height: 800 });
        await page.setContent(htmlContent, { 
          waitUntil: 'domcontentloaded',
          timeout: 30000 
        });
        
        // Wait for content to load (reduced from 2000ms to 1000ms)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate PDF
        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '0.5in',
            right: '0.5in',
            bottom: '0.5in',
            left: '0.5in'
          },
          timeout: 30000
        });
        
        const buffer = Buffer.from(pdfBuffer);
        
        // Cache the PDF
        this.setCachedPDF(cacheKey, buffer);
        
        console.log('PDF generated successfully, size:', buffer.length, 'bytes');
        return buffer;
        
      } finally {
        await page.close();
      }
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        NODE_ENV: process.env.NODE_ENV,
        RENDER: !!process.env.RENDER,
        VERCEL: !!process.env.VERCEL
      });
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private loadLogo(logoType: 'chariot' | 'chandra'): string | null {
    try {
      let logoPath: string | undefined;
      
      // Try to find the logo in the local public directory first
      const logoFileName = logoType === 'chariot' ? 'chariot.svg' : 'chandra.png';
      const localPath = path.resolve(process.cwd(), './public', logoFileName);
      const websitePath = path.resolve(process.cwd(), '../website/public', logoFileName);
      
      if (fs.existsSync(localPath)) {
        logoPath = localPath;
      } else if (fs.existsSync(websitePath)) {
        // Fallback to website directory (for development)
        logoPath = websitePath;
      }
      
      if (!logoPath || !fs.existsSync(logoPath)) {
        console.warn(`${logoType} logo not found. Checked paths:`);
        console.warn(`  - Local: ${localPath}`);
        console.warn(`  - Website: ${websitePath}`);
        return null;
      }
      
      const imgBuffer = fs.readFileSync(logoPath);
      const mimeType = logoType === 'chariot' ? 'image/svg+xml' : 'image/png';
      const base64 = imgBuffer.toString('base64');
      
      console.log(`Successfully loaded ${logoType} logo from:`, logoPath);
      return `data:${mimeType};base64,${base64}`;
      
    } catch (error) {
      console.warn(`Unable to load ${logoType} logo:`, error);
      return null;
    }
  }

  private createInvoiceHTML(data: InvoiceData, chariotLogo?: string | null, chandraLogo?: string | null): string {
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
            background-color: white;
            color: #000;
            line-height: 1.4;
            margin: 0;
            padding: 0;
          }
          
          .invoice-container {
            background-color: white;
            min-height: 100vh;
            padding: 20px;
          }
          
          .invoice {
            background-color: white;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
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
            font-size: 24px;
            font-weight: bold;
            color: #FA7035;
            text-transform: uppercase;
            margin-bottom: 20px;
            margin-top: 5px;
          }
          
          .company-details {
            font-size: 12px;
            line-height: 1.4;
            color: #666;
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
            align-items: center;
            gap: 40px;
          }
          
          .footer-company {
            flex: 0 0 auto;
            text-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .footer-logo {
            max-width: 120px;
            height: auto;
            object-fit: contain;
          }
          
          .footer-info {
            flex: 1;
            font-size: 12px;
            line-height: 1.4;
            text-align: left;
            display: flex;
            flex-direction: column;
            justify-content: center;
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
                ${chariotLogo 
                  ? `<img class="logo" src="${chariotLogo}" alt="The Chariot Logo" />`
                  : `<div class="company-name">THE CHARIOT</div>`
                }
              </div>
              <div class="invoice-title">Tax Invoice</div>
            </div>
            
            <!-- Billing Section -->
            <div class="billing-section">
              <div class="billed-to">
                <h3>Billed To:</h3>
                <div class="customer-info">
                  ${user.companyInformation?.name || user.firstName + ' ' + user.lastName || 'Customer Name'}<br>
                  ${user.companyInformation?.telephone || user.phoneNumber || ''}<br>
                  ${user.companyInformation?.address || user.streetAddress || ''}<br>
                  ${user.city || ''}${user.companyInformation?.state ? `, ${user.companyInformation.state}` : ''}${user.companyInformation?.zipcode || user.postalCode ? `, ${user.companyInformation.zipcode || user.postalCode}` : ''}<br>
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
                ${chandraLogo 
                  ? `<img class="footer-logo" src="${chandraLogo}" alt="Chandra Jewels Logo" />`
                  : `<div style="font-size: 18px; font-weight: bold; color: #FA7035; text-transform: uppercase;">CHANDRA<br><span style="font-size: 14px; font-weight: normal;">JEWELS</span></div>`
                }
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