export interface ImageFile {
  file: File;
  previewUrl: string;
  isMain: boolean;
}

export interface ProductImageData {
  productId: string;
  key: string;
  isMain: boolean;
  originalName: string;
  mimeType: string;
  size: number;
} 