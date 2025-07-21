# Digital Product ZIP Upload and Download System

## Overview

This system provides secure ZIP file upload for digital products and protected download functionality for customers who have purchased the products. The system is designed to be piracy-proof with multiple security layers.

## Architecture

### Frontend Components

1. **ZipUpload Component** (`apps/seller-portal/src/components/product-form/ZipUpload.tsx`)
   - Handles ZIP file upload for digital products
   - Validates file type (ZIP only) and size (max 100MB)
   - Uploads to private S3 bucket
   - Shows upload progress and file information

2. **DigitalProductDownload Component** (`apps/website/src/components/DigitalProductDownload.tsx`)
   - Provides download button for purchased digital products
   - Handles authentication and purchase verification
   - Generates secure, time-limited download URLs

3. **ProductForm Integration**
   - Includes ZIP upload for digital product type
   - Validates ZIP file requirement for digital products
   - Stores ZIP file metadata in product record

### Backend Services

1. **Asset Controller** (`apps/api/src/controllers/asset.controller.ts`)
   - `getZipUploadUrl`: Generates signed upload URLs for ZIP files
   - `getDigitalProductDownloadUrl`: Generates secure download URLs
   - Validates file types and handles authentication

2. **S3 Service** (`apps/api/src/services/s3.service.ts`)
   - `getZipUploadUrl`: Creates signed URLs for private bucket uploads
   - `getDigitalProductDownloadUrl`: Creates short-lived download URLs
   - Handles private bucket operations for digital products

3. **API Routes**
   - `/api/assets/upload-zip-url`: ZIP file upload endpoint
   - `/api/assets/digital-product/:productId/download`: Secure download endpoint

## Security Features

### 1. Private S3 Bucket
- Digital product ZIP files are stored in a private S3 bucket
- No public read access to prevent direct URL access
- Separate bucket from public assets

### 2. Signed URLs
- Upload URLs: 1-hour expiration
- Download URLs: 5-minute expiration
- Prevents URL sharing and unauthorized access

### 3. Authentication & Authorization
- All uploads require seller authentication
- All downloads require user authentication
- Purchase verification (to be implemented with order system)

### 4. File Validation
- ZIP files only (MIME type and extension validation)
- File size limits (100MB max)
- Malware scanning (recommended for production)

### 5. Audit Logging
- All download attempts are logged
- Includes user ID, product ID, timestamp, and IP address
- Helps detect suspicious activity

## Environment Variables

Add these to your `.env` files:

```env
# S3 Configuration
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-public-bucket
AWS_S3_PRIVATE_BUCKET=your-private-bucket  # For digital products
```

## Usage

### For Sellers (Upload)

1. Create a digital product in the seller portal
2. Select "Digital" as product type
3. Upload ZIP file using the ZipUpload component
4. File is automatically uploaded to private S3 bucket
5. ZIP file metadata is stored with the product

### For Customers (Download)

1. Purchase a digital product
2. Navigate to product page
3. Click "Download Digital Product" button
4. System verifies purchase and generates secure download URL
5. File downloads with 5-minute expiration

## Implementation Status

### ✅ Completed
- ZIP upload component and validation
- Private S3 bucket integration
- Secure download URL generation
- Frontend download component
- Basic authentication checks

### 🔄 In Progress
- Order system integration
- Purchase verification
- Download analytics

### 📋 TODO
- Implement order/purchase system
- Add purchase verification to download endpoint
- Implement download analytics and reporting
- Add file integrity checks (checksums)
- Implement rate limiting for downloads
- Add watermarking for extra protection
- Set up monitoring and alerting

## Security Best Practices

1. **Use Private Bucket**: Always store digital products in a private S3 bucket
2. **Short-lived URLs**: Keep download URLs short-lived (5 minutes max)
3. **Purchase Verification**: Always verify purchase before allowing download
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Audit Logging**: Log all download attempts for security monitoring
6. **File Validation**: Validate file types and scan for malware
7. **Access Control**: Use proper IAM roles and policies

## Testing

### Manual Testing
1. Upload a ZIP file as a seller
2. Verify file appears in private S3 bucket
3. Test download with authenticated user
4. Verify download URL expiration
5. Test unauthorized access attempts

### Automated Testing
- Unit tests for file validation
- Integration tests for upload/download flow
- Security tests for authentication bypass attempts

## Monitoring

Monitor these metrics:
- Upload success/failure rates
- Download success/failure rates
- Authentication failures
- Suspicious download patterns
- S3 bucket access logs

## Future Enhancements

1. **Watermarking**: Add unique identifiers to downloaded files
2. **DRM**: Implement digital rights management
3. **Streaming**: Support for large file streaming
4. **CDN Integration**: Use CDN for faster downloads
5. **Multi-part Uploads**: Support for very large files
6. **File Versioning**: Support for product updates 