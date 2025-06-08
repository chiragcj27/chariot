"use client";

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Resolver, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { CategorySelection } from '@/components/products/create/CategorySelection';
import { ProductDetails } from '@/components/products/create/ProductDetails';
import { DigitalProductDetails } from '@/components/products/create/DigitalProductDetails';
import { ServiceProductDetails } from '@/components/products/create/ServiceProductDetails';
import { PricingSection } from '@/components/products/create/PricingSection';
import { AdditionalInformation } from '@/components/products/create/AdditionalInformation';
import { SEOSection } from '@/components/products/create/SEOSection';
import { ImageUpload } from '@/components/products/create/ImageUpload';
import { FormButtons } from '@/components/products/create/FormButtons';
import { productSchema, ProductFormData, ServiceProductFormData, DigitalProductFormData, MenuStructure } from '@/types/products/create/product.types';
import { generateSlug } from '@/utils/products/create/form.utils';

export default function CreateProductPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [formStep, setFormStep] = useState(0);
  const [menuStructure, setMenuStructure] = useState<MenuStructure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
    defaultValues: {
      type: "PHYSICAL",
      name: "",
      description: "",
      categoryId: "",
      subCategoryId: "",
      itemId: "",
      status: "DRAFT",
      price: { amount: 0, currency: "USD" },
      discount: { amount: 0, currency: "USD" },
      tags: [],
      featured: false,
      slug: "",
      seo: { metaKeywords: [] }
    } as ProductFormData
  });

  const watchedFields = watch();

  // Fetch menu structure
  useEffect(() => {
    const fetchMenuStructure = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/menu/structure');
        const data = await response.json();
        setMenuStructure(data);
      } catch (error) {
        console.error('Failed to fetch menu structure:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuStructure();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setSelectedSubCategory("");
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedSubCategory) {
      setValue("itemId", "");
    }
  }, [selectedSubCategory]);

  const onSubmit: SubmitHandler<ProductFormData> = async (data: ProductFormData) => {
    setIsSubmitting(true);
    const validationResult = productSchema.safeParse(data);
    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error);
      setIsSubmitting(false);
      return;
    }
    console.log("Product data:", data);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (name: string) => {
    setValue("name", name);
    setValue("slug", generateSlug(name));
  };

  const handlePrevious = () => {
    setFormStep((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (formStep === 0) {
      if (!selectedCategory || !selectedSubCategory || !watchedFields.itemId) {
        return;
      }
    }
    setFormStep((prev) => Math.min(3, prev + 1));
  };

  const totalSteps = 4;

  const renderStep = () => {
    switch (formStep) {
      case 0:
        return (
          <CategorySelection
            menuStructure={menuStructure}
            selectedCategory={selectedCategory}
            selectedSubCategory={selectedSubCategory}
            formStep={formStep}
            onCategoryChange={(value) => {
              setSelectedCategory(value);
              setValue("categoryId", value);
              setValue("subCategoryId", "");
              setValue("itemId", "");
            }}
            onSubCategoryChange={(value) => {
              setSelectedSubCategory(value);
              setValue("subCategoryId", value);
              setValue("itemId", "");
            }}
            onItemChange={(value) => setValue("itemId", value)}
            control={control}
            errors={errors}
          />
        );
      case 1:
        return (
          <>
            <ProductDetails
              control={control}
              setValue={setValue}
              errors={errors}
              onNameChange={handleNameChange}
            />
            <PricingSection
              control={control}
              errors={errors}
            />
          </>
        );
      case 2:
        return (
          <>
            <DigitalProductDetails
              control={control}
              errors={errors as FieldErrors<DigitalProductFormData>}
              watchedFields={watchedFields as Partial<DigitalProductFormData>}
              setValue={setValue}
            />
            <ServiceProductDetails
              control={control}
              errors={errors as FieldErrors<ServiceProductFormData>}
              setValue={setValue}
            />
            <ImageUpload
              control={control}
              errors={errors}
              setValue={setValue}
            />
          </>
        );
      case 3:
        return (
          <>
            <AdditionalInformation
              control={control}
              errors={errors}
            />
            <SEOSection
              control={control}
              errors={errors}
            />
          </>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Product</h1>
          <p className="text-gray-600">Add a new product to your selling portal with detailed information and categorization.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {renderStep()}
          <FormButtons
            currentStep={formStep}
            totalSteps={totalSteps}
            isSubmitting={isSubmitting}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit(onSubmit)}
          />
        </form>
      </div>
    </div>
  );
}