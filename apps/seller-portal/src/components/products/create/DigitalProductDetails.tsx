import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileText, Upload } from 'lucide-react';
import { Control, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { ProductFormData, DigitalProductFormData, digitalKinds, fileTypes } from '@/types/products/create/product.types';
import { validateFileType } from '@/utils/products/create/form.utils';

interface DigitalProductDetailsProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<DigitalProductFormData>;
  watchedFields: Partial<DigitalProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
}

export const DigitalProductDetails: React.FC<DigitalProductDetailsProps> = ({ 
  watchedFields,
  setValue
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDigitalProduct = watchedFields.type === "DIGITAL";
  const fileType = watchedFields.assetDetails?.fileType;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && isDigitalProduct) {
      if (fileType && !validateFileType(file, fileType)) {
        alert(`Please upload a file with .${fileType} extension`);
        return;
      }

      // Here you would typically handle the file upload to your server
      // For now, we'll just update the form state
      setValue("assetDetails.previewFile", file.name);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileTypeChange = (value: string) => {
    setValue("assetDetails.fileType", value);
  };

  const handleKindChange = (value: string) => {
    setValue("kind", value);
  };

  if (!isDigitalProduct) return null;

  return (
    <Card className="shadow-lg border-2 border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Digital Product Details
        </CardTitle>
        <CardDescription>
          Configure digital asset settings
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="kind">Digital Product Kind *</Label>
            <Select onValueChange={handleKindChange} value={watchedFields.kind}>
              <SelectTrigger>
                <SelectValue placeholder="Select kind" />
              </SelectTrigger>
              <SelectContent>
                {digitalKinds.map((kind) => (
                  <SelectItem key={kind} value={kind}>
                    {kind.charAt(0).toUpperCase() + kind.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileType">File Type *</Label>
            <Select onValueChange={handleFileTypeChange} value={watchedFields.assetDetails?.fileType}>
              <SelectTrigger>
                <SelectValue placeholder="Select file type" />
              </SelectTrigger>
              <SelectContent>
                {fileTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Preview File *</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Upload preview file</p>
            <p className="text-sm text-gray-500">
              {isDigitalProduct && fileType
                ? `Accepted file type: ${fileType.toUpperCase()}`
                : 'Select file type first'}
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={fileType ? `.${fileType}` : undefined}
              className="hidden"
            />
            <Button 
              variant="outline" 
              className="mt-4" 
              disabled={!isDigitalProduct || !fileType}
              onClick={handleChooseFile}
              type="button"
            >
              Choose File
            </Button>
            {isDigitalProduct && watchedFields.assetDetails?.previewFile && (
              <p className="mt-2 text-sm text-green-600">
                File selected: {watchedFields.assetDetails.previewFile}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 