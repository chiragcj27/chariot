'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { productTypes, currencies, digitalKinds, timeUnits, fileTypes } from './constants';
import { TagInput } from './TagInput';
import ImageUpload from './ImageUpload';
import { useCategories } from '@/hooks/useCategories';
import { useKits } from '@/hooks/useKits';

interface ProductFormData {
  name: string;
  description: string;
  type: 'physical' | 'digital' | 'service';
  categoryId: string;
  itemId: string;
  price?: {
    amount?: number;
    currency: string;
  };
  creditsCost?: number;
  discountedCreditsCost?: number;
  discount?: {
    percentage: number;
  };
  theme?: string;
  season?: string;
  occasion?: string;
  tags: string[];
  featured: boolean;
  status: 'draft' | 'pending' | 'active' | 'inactive' | 'rejected' | 'archived' | 'deleted';
  
  // Kit related fields
  isKitProduct?: boolean;
  kitId?: string;
  typeOfKit?: 'premium' | 'basic';
  
  // Physical product specific
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  stock: number;
  
  // Digital product specific
  kind?: string;
  assetDetails?: {
    file: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
  };
  
  // Service product specific
  deliveryTime?: {
    min: number;
    max: number;
    unit: string;
  };
  revisions?: {
    allowed: number;
    cost: number;
    unit: string;
  };
  deliverables: string[];
  requirements: string[];
  consultationRequired: boolean;
  
  // SEO
  seo?: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
  };
  
  // Images
  images: (string | { _id: string; url: string })[];
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
}

export default function ProductForm({ initialData, onSubmit, isLoading = false }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    type: 'physical',
    categoryId: '',
    itemId: '',
    price: {
      amount: undefined,
      currency: 'USD'
    },
    tags: [],
    featured: false,
    status: 'draft',
    stock: 0,
    deliverables: [],
    requirements: [],
    consultationRequired: false,
    images: [],
    ...initialData
  });

  // Set selected category and item when initial data is provided
  useEffect(() => {
    if (initialData?.categoryId) {
      setSelectedCategory(initialData.categoryId);
    }
    if (initialData?.itemId) {
      setSelectedItem(initialData.itemId);
    }
  }, [initialData]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('');

  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { kits, isLoading: kitsLoading, error: kitsError } = useKits();
  
  // Get items for the selected category
  const selectedCategoryData = categories.find(cat => cat._id === selectedCategory);
  const items = selectedCategoryData?.items || [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.itemId) {
      newErrors.itemId = 'Item is required';
    }

    // Validate that at least one pricing option is provided
    const hasPrice = formData.price && formData.price.amount && formData.price.amount > 0;
    const hasCredits = formData.creditsCost && formData.creditsCost > 0;
    
    if (!hasPrice && !hasCredits) {
      newErrors.pricing = 'At least one pricing option (price or credits) is required';
    }

    // Validate individual pricing fields if they are set
    if (formData.price && formData.price.amount !== undefined && formData.price.amount <= 0) {
      newErrors.price = 'Price amount must be greater than 0';
    }

    if (formData.creditsCost && formData.creditsCost !== undefined && formData.creditsCost <= 0) {
      newErrors.creditsCost = 'Credits cost must be greater than 0';
    }

    if (formData.discountedCreditsCost && formData.discountedCreditsCost !== undefined && formData.discountedCreditsCost <= 0) {
      newErrors.discountedCreditsCost = 'Discounted credits cost must be greater than 0';
    }

    if (formData.discount && formData.discount.percentage !== undefined && formData.discount.percentage < 0) {
      newErrors.discount = 'Discount percentage cannot be negative';
    }

    if (formData.type === 'physical' && formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    if (formData.type === 'digital' && !formData.kind) {
      newErrors.kind = 'Digital product kind is required';
    }

    if (formData.type === 'service') {
      if (!formData.deliveryTime?.min || !formData.deliveryTime?.max) {
        newErrors.deliveryTime = 'Delivery time is required';
      }
      if (!formData.revisions?.allowed) {
        newErrors.revisions = 'Number of revisions is required';
      }
    }

    // Validate kit fields if this is a kit product
    if (formData.isKitProduct) {
      if (!formData.kitId) {
        newErrors.kitId = 'Kit selection is required for kit products';
      }
      if (!formData.typeOfKit) {
        newErrors.typeOfKit = 'Kit type is required for kit products';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setFormData(prev => ({
      ...prev,
      categoryId: categoryId,
      itemId: ''
    }));
    setSelectedItem('');
  };

  const handleItemChange = (itemId: string) => {
    setSelectedItem(itemId);
    setFormData(prev => ({
      ...prev,
      itemId: itemId
    }));
  };

  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, '']
    }));
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  const updateDeliverable = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.map((item, i) => i === index ? value : item)
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((item, i) => i === index ? value : item)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="type">Product Type *</Label>
              <Select value={formData.type} onValueChange={(value: unknown) => setFormData(prev => ({ ...prev, type: value as 'physical' | 'digital' | 'service' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter product description"
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              {categoriesLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span className="text-sm text-gray-500">Loading categories...</span>
                </div>
              ) : categoriesError ? (
                <div className="text-red-500 text-sm">Error loading categories: {categoriesError}</div>
              ) : (
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
            </div>

            <div>
              <Label htmlFor="item">Item *</Label>
              <Select value={selectedItem} onValueChange={handleItemChange} disabled={!selectedCategory}>
                <SelectTrigger className={errors.itemId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.itemId && <p className="text-red-500 text-sm mt-1">{errors.itemId}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <TagInput
              items={formData.tags}
              onAdd={(tag) => setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))}
              onRemove={(tag) => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
              placeholder="Add tags..."
            />
          </div>

          {/* Kit Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isKitProduct"
                checked={formData.isKitProduct || false}
                onCheckedChange={(checked) => {
                  setFormData(prev => ({
                    ...prev,
                    isKitProduct: checked,
                    kitId: checked ? prev.kitId : undefined,
                    typeOfKit: checked ? prev.typeOfKit : undefined
                  }));
                }}
              />
              <Label htmlFor="isKitProduct">This is a kit product</Label>
            </div>

            {formData.isKitProduct && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kit">Kit *</Label>
                  {kitsLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      <span className="text-sm text-gray-500">Loading kits...</span>
                    </div>
                  ) : kitsError ? (
                    <div className="text-red-500 text-sm">Error loading kits: {kitsError}</div>
                  ) : (
                    <Select 
                      value={formData.kitId || ''} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, kitId: value }))}
                    >
                      <SelectTrigger className={errors.kitId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select kit" />
                      </SelectTrigger>
                      <SelectContent>
                        {kits.map(kit => (
                          <SelectItem key={kit._id} value={kit._id}>
                            {kit.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.kitId && <p className="text-red-500 text-sm mt-1">{errors.kitId}</p>}
                </div>

                <div>
                  <Label htmlFor="typeOfKit">Kit Type *</Label>
                  <Select 
                    value={formData.typeOfKit || ''} 
                    onValueChange={(value: 'premium' | 'basic') => setFormData(prev => ({ ...prev, typeOfKit: value }))}
                    disabled={!formData.kitId}
                  >
                    <SelectTrigger className={errors.typeOfKit ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select kit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.typeOfKit && <p className="text-red-500 text-sm mt-1">{errors.typeOfKit}</p>}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <p className="text-sm text-gray-600">You can set a price, credits cost, or both</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.pricing && (
            <Alert variant="destructive">
              <AlertDescription>{errors.pricing}</AlertDescription>
            </Alert>
          )}

          {/* Price Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Price (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price Amount</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price?.amount || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    price: { 
                      ...prev.price!, 
                      amount: e.target.value === '' ? undefined : parseFloat(e.target.value) || 0 
                    }
                  }))}
                  placeholder="0.00"
                  className={errors.price ? 'border-red-500' : ''}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty if using credits only</p>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.price?.currency || 'USD'} onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  price: { ...prev.price!, currency: value }
                }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount?.percentage || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    discount: { percentage: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }
                  }))}
                  placeholder="0"
                  className={errors.discount ? 'border-red-500' : ''}
                />
                {errors.discount && <p className="text-red-500 text-sm mt-1">{errors.discount}</p>}
              </div>
            </div>
          </div>

          {/* Credits Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Credits (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="creditsCost">Credits Cost</Label>
                <Input
                  id="creditsCost"
                  type="number"
                  min="0"
                  value={formData.creditsCost || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    creditsCost: e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined
                  }))}
                  placeholder="Enter credits cost"
                  className={errors.creditsCost ? 'border-red-500' : ''}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty if using price only</p>
                {errors.creditsCost && <p className="text-red-500 text-sm mt-1">{errors.creditsCost}</p>}
              </div>

              <div>
                <Label htmlFor="discountedCreditsCost">Discounted Credits Cost</Label>
                <Input
                  id="discountedCreditsCost"
                  type="number"
                  min="0"
                  value={formData.discountedCreditsCost || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    discountedCreditsCost: e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined
                  }))}
                  placeholder="Enter discounted credits cost"
                  className={errors.discountedCreditsCost ? 'border-red-500' : ''}
                />
                {errors.discountedCreditsCost && <p className="text-red-500 text-sm mt-1">{errors.discountedCreditsCost}</p>}
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Pricing Summary</h4>
            <div className="space-y-1 text-sm">
              {formData.price && formData.price.amount && formData.price.amount > 0 ? (
                <p className="text-gray-700">
                  Price: ${formData.price.amount} {formData.price.currency}
                  {formData.discount && formData.discount.percentage > 0 && (
                    <span className="text-green-600 ml-2">
                      (with {formData.discount.percentage}% discount)
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-gray-500">No price set</p>
              )}
              {formData.creditsCost && formData.creditsCost > 0 ? (
                <p className="text-gray-700">
                  Credits: {formData.creditsCost} credits
                  {formData.discountedCreditsCost && formData.discountedCreditsCost > 0 && (
                    <span className="text-green-600 ml-2">
                      (discounted: {formData.discountedCreditsCost} credits)
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-gray-500">No credits set</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Type Specific Fields */}
      {formData.type === 'physical' && (
        <Card>
          <CardHeader>
            <CardTitle>Physical Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className={errors.stock ? 'border-red-500' : ''}
                />
                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="length">Length</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.01"
                  value={formData.dimensions?.length || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dimensions: { ...prev.dimensions!, length: parseFloat(e.target.value) || 0 }
                  }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.01"
                  value={formData.dimensions?.width || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dimensions: { ...prev.dimensions!, width: parseFloat(e.target.value) || 0 }
                  }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  value={formData.dimensions?.height || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dimensions: { ...prev.dimensions!, height: parseFloat(e.target.value) || 0 }
                  }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="dimensionUnit">Unit</Label>
                <Select value={formData.dimensions?.unit || 'cm'} onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions!, unit: value }
                }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="in">in</SelectItem>
                    <SelectItem value="mm">mm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight?.value || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    weight: { ...prev.weight!, value: parseFloat(e.target.value) || 0 }
                  }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="weightUnit">Weight Unit</Label>
                <Select value={formData.weight?.unit || 'kg'} onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  weight: { ...prev.weight!, unit: value }
                }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="oz">oz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {formData.type === 'digital' && (
        <Card>
          <CardHeader>
            <CardTitle>Digital Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="kind">Digital Product Kind *</Label>
              <Select value={formData.kind || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, kind: value }))}>
                <SelectTrigger className={errors.kind ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select digital product kind" />
                </SelectTrigger>
                <SelectContent>
                  {digitalKinds.map(kind => (
                    <SelectItem key={kind} value={kind}>{kind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kind && <p className="text-red-500 text-sm mt-1">{errors.kind}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fileType">File Type</Label>
                <Select value={formData.assetDetails?.fileType || ''} onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  assetDetails: { ...prev.assetDetails!, fileType: value }
                }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fileTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fileSize">File Size (MB)</Label>
                <Input
                  id="fileSize"
                  type="number"
                  step="0.01"
                  value={formData.assetDetails?.fileSize || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    assetDetails: { ...prev.assetDetails!, fileSize: parseFloat(e.target.value) || 0 }
                  }))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {formData.type === 'service' && (
        <Card>
          <CardHeader>
            <CardTitle>Service Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="deliveryMin">Delivery Time Min</Label>
                <Input
                  id="deliveryMin"
                  type="number"
                  min="1"
                  value={formData.deliveryTime?.min || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    deliveryTime: { ...prev.deliveryTime!, min: parseInt(e.target.value) || 0 }
                  }))}
                  placeholder="1"
                  className={errors.deliveryTime ? 'border-red-500' : ''}
                />
              </div>
              <div>
                <Label htmlFor="deliveryMax">Delivery Time Max</Label>
                <Input
                  id="deliveryMax"
                  type="number"
                  min="1"
                  value={formData.deliveryTime?.max || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    deliveryTime: { ...prev.deliveryTime!, max: parseInt(e.target.value) || 0 }
                  }))}
                  placeholder="7"
                  className={errors.deliveryTime ? 'border-red-500' : ''}
                />
              </div>
              <div>
                <Label htmlFor="deliveryUnit">Time Unit</Label>
                <Select value={formData.deliveryTime?.unit || 'days'} onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  deliveryTime: { ...prev.deliveryTime!, unit: value }
                }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeUnits.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {errors.deliveryTime && <p className="text-red-500 text-sm">{errors.deliveryTime}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="revisionsAllowed">Revisions Allowed</Label>
                <Input
                  id="revisionsAllowed"
                  type="number"
                  min="0"
                  value={formData.revisions?.allowed || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    revisions: { ...prev.revisions!, allowed: parseInt(e.target.value) || 0 }
                  }))}
                  placeholder="0"
                  className={errors.revisions ? 'border-red-500' : ''}
                />
              </div>
              <div>
                <Label htmlFor="revisionCost">Revision Cost</Label>
                <Input
                  id="revisionCost"
                  type="number"
                  step="0.01"
                  value={formData.revisions?.cost || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    revisions: { ...prev.revisions!, cost: parseFloat(e.target.value) || 0 }
                  }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="revisionUnit">Cost Unit</Label>
                <Select value={formData.revisions?.unit || 'USD'} onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  revisions: { ...prev.revisions!, unit: value }
                }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {errors.revisions && <p className="text-red-500 text-sm">{errors.revisions}</p>}

            <div>
              <Label>Deliverables</Label>
              <div className="space-y-2">
                {formData.deliverables.map((deliverable, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={deliverable}
                      onChange={(e) => updateDeliverable(index, e.target.value)}
                      placeholder="Enter deliverable"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDeliverable(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addDeliverable}>
                  Add Deliverable
                </Button>
              </div>
            </div>

            <div>
              <Label>Requirements</Label>
              <div className="space-y-2">
                {formData.requirements.map((requirement, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder="Enter requirement"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
                  Add Requirement
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="consultation"
                checked={formData.consultationRequired}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consultationRequired: checked }))}
              />
              <Label htmlFor="consultation">Consultation Required</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Input
                id="theme"
                value={formData.theme || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                placeholder="e.g., Modern, Vintage"
              />
            </div>
            <div>
              <Label htmlFor="season">Season</Label>
              <Input
                id="season"
                value={formData.season || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, season: e.target.value }))}
                placeholder="e.g., Spring, Summer"
              />
            </div>
            <div>
              <Label htmlFor="occasion">Occasion</Label>
              <Input
                id="occasion"
                value={formData.occasion || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, occasion: e.target.value }))}
                placeholder="e.g., Wedding, Birthday"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
            />
            <Label htmlFor="featured">Featured Product</Label>
          </div>
        </CardContent>
      </Card>

      {/* Product Images */}
      <ImageUpload
        images={formData.images}
        onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
        maxImages={5}
      />

      {/* SEO Information */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              value={formData.seo?.metaTitle || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                seo: { ...prev.seo!, metaTitle: e.target.value }
              }))}
              placeholder="Enter meta title"
            />
          </div>
          <div>
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={formData.seo?.metaDescription || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                seo: { ...prev.seo!, metaDescription: e.target.value }
              }))}
              placeholder="Enter meta description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
          disabled={isLoading}
        >
          Save as Draft
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Product'}
        </Button>
      </div>
    </form>
  );
} 