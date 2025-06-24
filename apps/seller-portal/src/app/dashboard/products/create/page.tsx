"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Resolver } from 'react-hook-form';
import ProductCreationGuard from '@/components/product-creation-guard';

// Import all modular components
import { CategorySelector } from '@/components/product-form/CategorySelector';
import { BasicProductDetails } from '@/components/product-form/BasicProductDetails';
import { DigitalProductFields } from '@/components/product-form/DigitalProductFields';
import { ServiceProductFields } from '@/components/product-form/ServiceProductFields';
import { PricingSection } from '@/components/product-form/PricingSection';
import { AdditionalInformation } from '@/components/product-form/AdditionalInformation';
import { SEOSection } from '@/components/product-form/SEOSection';
import { ImageUpload } from '@/components/product-form/ImageUpload';

// Import types and constants
import { ProductFormData, baseProductSchema, serviceProductSchema, digitalProductSchema, SubCategory, CategoryItem } from '@/types/products/create/product.types';
import { 
  productTypes, 
  productStatuses, 
  currencies, 
  digitalKinds, 
  timeUnits, 
  fileTypes 
} from '@/components/product-form/constants';
import { ImageFile } from '@/types/image';

// Import custom hook
import { useCategories } from '@/hooks/useCategories';
import { useProductForm } from '@/hooks/useProductForm';

export default function CreateProductPage() {
  // User state for blacklist check
  const [userInfo, setUserInfo] = useState<any>(null);

  // API data
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  
  // Category state
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [availableSubCategories, setAvailableSubCategories] = useState<SubCategory[]>([]);
  const [availableItems, setAvailableItems] = useState<CategoryItem[]>([]);
  const [formStep, setFormStep] = useState(0);
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [productType, setProductType] = useState<"PHYSICAL" | "DIGITAL" | "SERVICE">("PHYSICAL");

  // Check user blacklist status on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserInfo(user);
    }
  }, []);

  // Form setup
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(
      productType === "SERVICE" 
        ? serviceProductSchema 
        : productType === "DIGITAL" 
          ? digitalProductSchema 
          : baseProductSchema
    ) as Resolver<ProductFormData>,
    defaultValues: {
      type: "PHYSICAL",
      status: "DRAFT",
      featured: false,
      tags: [],
      price: { amount: 0, currency: "INR" },
      discount: { percentage: 0 },
      seo: { metaKeywords: [] },
      deliverables: [],
      requirements: [],
      consultationRequired: false,
      assetDetails: {
        file: null,
        fileType: "",
        fileSize: 0,
        fileUrl: ""
      },
      deliveryTime: {
        min: 1,
        max: 7,
        unit: "days"
      },
      revisions: {
        allowed: 3,
        cost: 0,
        unit: "INR"
      }
    }
  });

  const watchedFields = watch();
  const selectedProductType = watch("type");

  // Update product type when it changes
  useEffect(() => {
    setProductType(selectedProductType);
    // Reset assetDetails when switching to digital product type
    if (selectedProductType === "DIGITAL") {
      setValue("assetDetails", {
        file: null,
        fileType: "",
        fileSize: 0,
        fileUrl: ""
      });
    }
  }, [selectedProductType]);

  // Category selection effects
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const category = categories.find(cat => cat._id === selectedCategory);
      if (category) {
        setAvailableSubCategories(category.subCategories);
        setSelectedSubCategory("");
        setSelectedItem("");
        setAvailableItems([]);
        setFormStep(1);
      }
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    if (selectedSubCategory && availableSubCategories.length > 0) {
      const subCategory = availableSubCategories.find(sub => sub._id === selectedSubCategory);
      if (subCategory) {
        setAvailableItems(subCategory.items);
        setSelectedItem("");
        if (subCategory.items.length > 0) {
          setFormStep(2);
        } else {
          setFormStep(3);
        }
      }
    }
  }, [selectedSubCategory, availableSubCategories]);

  useEffect(() => {
    if (selectedItem) {
      setFormStep(3);
    }
  }, [selectedItem]);

  // Helper functions
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setValue("slug", generateSlug(name));
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setValue("categoryId", categoryId);
  };

  const handleSubCategoryChange = (subCategoryId: string) => {
    setSelectedSubCategory(subCategoryId);
    setValue("subCategoryId", subCategoryId);
  };

  const handleItemChange = (itemId: string) => {
    setSelectedItem(itemId);
    setValue("itemId", itemId);
    
    // Auto-populate price from selected item
    const selectedItemData = availableItems.find(item => item._id === itemId);
    if (selectedItemData) {
      setValue("price.amount", selectedItemData.price);
    }
  };

  // Tag management functions
  const addTag = (tag: string) => {
    if (tag && !watchedFields.tags.includes(tag)) {
      setValue("tags", [...watchedFields.tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue("tags", watchedFields.tags.filter(tag => tag !== tagToRemove));
  };

  // SEO keyword management
  const addKeyword = (keyword: string) => {
    if (keyword && !watchedFields.seo?.metaKeywords?.includes(keyword)) {
      const currentKeywords = watchedFields.seo?.metaKeywords || [];
      setValue("seo.metaKeywords", [...currentKeywords, keyword]);
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    const currentKeywords = watchedFields.seo?.metaKeywords || [];
    setValue("seo.metaKeywords", currentKeywords.filter(keyword => keyword !== keywordToRemove));
  };

  // Service product management functions
  const addDeliverable = (deliverable: string) => {
    if (deliverable && !watchedFields.deliverables?.includes(deliverable)) {
      const currentDeliverables = watchedFields.deliverables || [];
      setValue("deliverables", [...currentDeliverables, deliverable]);
    }
  };

  const removeDeliverable = (deliverableToRemove: string) => {
    const currentDeliverables = watchedFields.deliverables || [];
    setValue("deliverables", currentDeliverables.filter(deliverable => deliverable !== deliverableToRemove));
  };

  const addRequirement = (requirement: string) => {
    if (requirement && !watchedFields.requirements?.includes(requirement)) {
      const currentRequirements = watchedFields.requirements || [];
      setValue("requirements", [...currentRequirements, requirement]);
    }
  };

  const removeRequirement = (requirementToRemove: string) => {
    const currentRequirements = watchedFields.requirements || [];
    setValue("requirements", currentRequirements.filter(requirement => requirement !== requirementToRemove));
  };

  const handleImagesSelected = (images: ImageFile[]) => {
    setSelectedImages(images);
  };

  // Form submission
  const { createProduct, isSubmitting, error: productError } = useProductForm();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: ProductFormData) => {
    try {
      setSubmitError(null);
      const result = await createProduct(data, selectedImages);
      console.log('Product created successfully:', result);
      // TODO: Add success notification and redirect
    } catch (error) {
      console.error('Error creating product:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create product');
    }
  };

  // Error state
  if (categoriesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Categories</h2>
            <p className="text-red-600 mb-4">{categoriesError}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProductCreationGuard
      isBlacklisted={userInfo?.isBlacklisted || false}
      blacklistReason={userInfo?.blacklistInfo?.blacklistReason}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Product</h1>
            <p className="text-gray-600">Add a new product to your selling portal with detailed information and categorization.</p>
          </div>

          {(submitError || productError) && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Creating Product</h3>
              <p className="text-red-600">{submitError || productError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Selection */}
            <CategorySelector
              control={control}
              errors={errors}
              categories={categories}
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              selectedItem={selectedItem}
              availableSubCategories={availableSubCategories}
              availableItems={availableItems}
              formStep={formStep}
              isLoading={categoriesLoading}
              onCategoryChange={handleCategoryChange}
              onSubCategoryChange={handleSubCategoryChange}
              onItemChange={handleItemChange}
            />

            {/* Product Details - Shows after category selection */}
            <div className={`transition-all duration-500 transform ${formStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <div className="space-y-6">
                {/* Basic Product Details */}
                <BasicProductDetails
                  control={control}
                  errors={errors}
                  onNameChange={handleNameChange}
                  productTypes={productTypes}
                  productStatuses={productStatuses}
                />

                {/* Digital Product Specific Fields */}
                {selectedProductType === "DIGITAL" && (
                  <DigitalProductFields
                    control={control}
                    digitalKinds={digitalKinds}
                    fileTypes={fileTypes}
                    setValue={setValue}
                  />
                )}

                {/* Service Product Specific Fields */}
                {selectedProductType === "SERVICE" && (
                  <ServiceProductFields
                    control={control}
                    timeUnits={timeUnits}
                    currencies={currencies}
                    deliverables={watchedFields.deliverables || []}
                    requirements={watchedFields.requirements || []}
                    onAddDeliverable={addDeliverable}
                    onRemoveDeliverable={removeDeliverable}
                    onAddRequirement={addRequirement}
                    onRemoveRequirement={removeRequirement}
                  />
                )}

                {/* Pricing Section */}
                <PricingSection
                  control={control}
                  currencies={currencies}
                />

                {/* Additional Information */}
                <AdditionalInformation
                  control={control}
                  errors={errors}
                  tags={watchedFields.tags}
                  onAddTag={addTag}
                  onRemoveTag={removeTag}
                />

                {/* SEO Section */}
                <SEOSection
                  control={control}
                  metaKeywords={watchedFields.seo?.metaKeywords || []}
                  onAddKeyword={addKeyword}
                  onRemoveKeyword={removeKeyword}
                />

                {/* Image Upload */}
                <ImageUpload 
                  onImagesSelected={handleImagesSelected} 
                  selectedImages={selectedImages} 
                />

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    Save as Draft
                  </Button>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Product...' : 'Create Product'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProductCreationGuard>
  );
}