export const generateSlug = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

export const validateFileType = (file: File, expectedType: string): boolean => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  return fileExtension === expectedType.toLowerCase();
};

export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const calculateDiscountedPrice = (price: number, discount: number): number => {
  return Math.max(0, price - discount);
}; 