/**
 * Generates a unique SKU (Stock Keeping Unit) based on the product name
 * @param productName - The name of the product
 * @returns A unique SKU string
 */
export function generateSku(productName: string): string {
  // Remove special characters and convert to uppercase
  const cleanName = productName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
  
  // Take first 3 characters of each word (max 3 words)
  const words = cleanName.split(' ').slice(0, 3);
  const prefix = words.map(word => word.slice(0, 3)).join('');
  
  // Add timestamp for uniqueness
  const timestamp = Date.now().toString().slice(-6);
  
  // Add random 3-digit number for extra uniqueness
  const random = Math.floor(Math.random() * 900) + 100;
  
  return `${prefix}-${timestamp}-${random}`;
}
