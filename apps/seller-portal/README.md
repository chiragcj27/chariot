# Seller Portal - Product Management

This is the seller portal for the Chariot platform, allowing sellers to manage their products.

## Features

### Product Management
- **Product Listing**: View all your products with filtering by status
- **Product Creation**: Create new products with comprehensive forms
- **Product Editing**: Edit existing products
- **Product Details**: View detailed product information
- **Product Deletion**: Delete products with confirmation

### Product Types Supported
1. **Physical Products**
   - Stock management
   - Dimensions and weight
   - Shipping information

2. **Digital Products**
   - File type and size
   - Digital asset details
   - Download management

3. **Service Products**
   - Delivery timeframes
   - Revision policies
   - Deliverables and requirements
   - Consultation options

### Product Features
- **Pricing**: Set prices in multiple currencies
- **Credits System**: Set credit costs for products
- **Discounts**: Apply percentage discounts
- **Tags**: Add tags for better categorization
- **SEO**: Meta title and description
- **Images**: Upload up to 5 product images
- **Status Management**: Draft, Pending, Active, Inactive, Rejected

### Product Status Flow
1. **Draft**: Product is saved but not submitted for review
2. **Pending**: Product submitted for admin approval
3. **Active**: Product approved and live on the platform
4. **Inactive**: Product temporarily disabled
5. **Rejected**: Product rejected by admin (with reason)

## Pages

### `/dashboard/products`
- Main products listing page
- Filter by status
- Pagination support
- Quick actions (View, Edit, Delete)

### `/dashboard/products/create`
- Product creation form
- Dynamic form based on product type
- Image upload with drag & drop
- Validation and error handling

### `/dashboard/products/[productId]`
- Product detail view
- Complete product information
- Edit and delete actions
- Status and approval information

### `/dashboard/products/[productId]/edit`
- Product editing form
- Pre-populated with existing data
- Same validation as creation form

## API Endpoints

### Frontend API Routes
- `GET /api/products` - Get seller's products with pagination
- `POST /api/products` - Create new product
- `PUT /api/products?id=[productId]` - Update product
- `GET /api/products/[productId]` - Get single product
- `DELETE /api/products/[productId]` - Delete product

### Backend API Routes
- `GET /api/products/seller` - Get seller's own products
- `POST /api/products` - Create product
- `PUT /api/products/:productId` - Update product
- `GET /api/products/:productId` - Get product by ID
- `DELETE /api/products/:productId` - Delete product

## Components

### ProductForm
Comprehensive form component that handles all product types with:
- Dynamic fields based on product type
- Validation
- Image upload integration
- Tag management

### ImageUpload
Drag & drop image upload component with:
- Multiple image support
- File validation
- Preview functionality
- Size and type restrictions

### TagInput
Tag management component for adding and removing product tags.

## Usage

1. **Creating a Product**:
   - Navigate to `/dashboard/products/create`
   - Fill out the form with product details
   - Upload images
   - Save as draft or submit for approval

2. **Managing Products**:
   - View all products at `/dashboard/products`
   - Filter by status to find specific products
   - Use pagination for large product catalogs

3. **Editing Products**:
   - Click "Edit" on any product card
   - Modify the product information
   - Save changes

4. **Viewing Product Details**:
   - Click "View" on any product card
   - See complete product information
   - Check approval status and admin feedback

## Authentication

All product management features require seller authentication. The portal uses JWT tokens stored in cookies for authentication.

## Error Handling

The portal includes comprehensive error handling:
- Form validation errors
- API error responses
- Network connectivity issues
- File upload errors

## Responsive Design

The seller portal is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
