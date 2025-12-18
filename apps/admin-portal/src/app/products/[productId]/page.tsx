"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { RelatedProductsDialog } from "@/components/related-products-dialog";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  Tag,
  DollarSign,
  Image as ImageIcon,
  Link as LinkIcon
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price?: {
    amount: number;
    currency: string;
  };
  creditsCost?: number;
  discountedCreditsCost?: number;
  discount?: {
    percentage: number;
  };
  status: string;
  sellerId: { _id: string; name: string; email: string };
  relatedProductsId: string[];
  adminRejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  isAdminApproved: boolean;
  isAdminRejected: boolean;
  type: string;
  tags: string[];
  theme?: string;
  season?: string;
  occasion?: string;
  featured: boolean;
  
  // Category and Item information
  categoryId?: { 
    _id: string; 
    title: string; 
    slug: string; 
  };
  itemId?: { 
    _id: string; 
    title: string; 
    slug: string; 
    description?: string;
    filters?: Array<{
      id: string;
      name: string;
      values: Array<{
        id: string;
        value: string;
        isDefault?: boolean;
      }>;
    }>;
  };
  
  // Filter values
  filterValues?: Record<string, string[]>;
  
  // Images
  images?: Array<{
    _id: string;
    url: string;
    originalname: string;
    isMain: boolean;
    isThumbnail: boolean;
  }>;
  
  // Kit fields
  isKitProduct?: boolean;
  kitId?: string;
  typeOfKit?: 'premium' | 'basic';
  kitImages?: Array<{
    _id: string;
    url: string;
    originalname: string;
  }>;
  kitFiles?: Array<{
    _id: string;
    name: string;
    url: string;
    fileType: string;
    size: number;
  }>;
  kitMainFile?: {
    name: string;
    url: string;
    key: string;
    size: number;
  };
  kitDescription?: string;
  kitInstructions?: string;
  kitContents?: string[];
  
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
  previewFile?: {
    name: string;
    url: string;
    key: string;
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
  
  // Flipbook
  flipbookUrl?: string;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [kitTitle, setKitTitle] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${params.productId}`);
      const data = await res.json();
      
      if (res.ok) {
        setProduct(data.product);
      } else {
        toast.error(data.message || "Failed to fetch product");
        router.push("/products");
      }
    } catch {
      toast.error("Error fetching product");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  }, [params.productId, router]);

  useEffect(() => {
    if (params.productId) {
      fetchProduct();
    }
  }, [params.productId, fetchProduct]);

  useEffect(() => {
    if (product?.kitId) {
      fetchKitTitle(product.kitId);
    }
  }, [product?.kitId]);

  async function fetchKitTitle(kitId: string) {
    try {
      const res = await fetch(`/api/admin/kits/${kitId}`);
      if (res.ok) {
        const data = await res.json();
        setKitTitle(data.title || data.kit?.title || kitId);
      } else {
        setKitTitle(kitId);
      }
    } catch {
      setKitTitle(kitId);
    }
  }



  async function approveProduct() {
    try {
      const res = await fetch(`/api/admin/products/${params.productId}/approve`, { 
        method: "PATCH" 
      });
      
      if (res.ok) {
        toast.success("Product approved successfully");
        fetchProduct();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to approve product");
      }
    } catch {
      toast.error("Error approving product");
    }
  }

  async function rejectProduct() {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${params.productId}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });
      
      if (res.ok) {
        toast.success("Product rejected successfully");
        setRejectDialogOpen(false);
        setRejectionReason("");
        fetchProduct();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to reject product");
      }
    } catch {
      toast.error("Error rejecting product");
    }
  }

  function getStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!product) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
            <p className="text-gray-500 mb-4">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Button onClick={() => router.push("/products")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/products")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-gray-600">Product Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(product.status)}
            {product.status.toLowerCase() === 'active' && (
              <RelatedProductsDialog 
                product={product} 
                onUpdate={fetchProduct}
                trigger={
                  <Button variant="outline">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Manage Related Products
                  </Button>
                }
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-600 mt-2">{product.description}</p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Product Type</label>
                    <p className="mt-1">{product.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge(product.status)}</div>
                  </div>
                </div>
                {/* Kit Info */}
                {product.isKitProduct && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Kit</label>
                      <p className="mt-1">{kitTitle ? kitTitle : product.kitId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Kit Type</label>
                      <p className="mt-1 capitalize">{product.typeOfKit}</p>
                    </div>
                  </div>
                )}
                {/* End Kit Info */}
                {product.categoryId && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <p className="mt-1">{product.categoryId.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Item</label>
                      <p className="mt-1">{product.itemId?.title || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {product.price && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Price</label>
                      <p className="mt-1 font-semibold">
                        {product.price.currency} {product.price.amount}
                      </p>
                    </div>
                  )}
                  
                  {product.creditsCost && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Credits Cost</label>
                      <div className="mt-1">
                        {product.discountedCreditsCost && product.discountedCreditsCost < product.creditsCost ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-green-600">
                              {product.discountedCreditsCost} credits
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {product.creditsCost} credits
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold">
                            {product.creditsCost} credits
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Images */}
            {product.images && product.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Product Images ({product.images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {product.images.map((image) => (
                      <div key={image._id} className="relative">
                        <Image
                          src={image.url}
                          alt={image.originalname}
                          width={400}
                          height={128}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <div className="absolute top-2 left-2">
                          {image.isMain && <Badge variant="default" className="text-xs">Main</Badge>}
                          {image.isThumbnail && <Badge variant="secondary" className="text-xs">Thumbnail</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Category and Item Information */}
            {(product.categoryId || product.itemId) && (
              <Card>
                <CardHeader>
                  <CardTitle>Category & Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.categoryId && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <p className="text-lg font-semibold">{product.categoryId.title}</p>
                      <p className="text-sm text-gray-500">Slug: {product.categoryId.slug}</p>
                    </div>
                  )}
                  {product.itemId && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Item</label>
                      <p className="text-lg font-semibold">{product.itemId.title}</p>
                      <p className="text-sm text-gray-500">Slug: {product.itemId.slug}</p>
                      {product.itemId.description && (
                        <p className="text-sm text-gray-600 mt-1">{product.itemId.description}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Filter Values */}
            {product.filterValues && Object.keys(product.filterValues).length > 0 && product.itemId?.filters && (
              <Card>
                <CardHeader>
                  <CardTitle>Filter Values</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.itemId.filters.map((filter) => {
                    const selectedValues = product.filterValues?.[filter.id] || [];
                    return (
                      <div key={filter.id} className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">{filter.name}</label>
                        <div className="flex flex-wrap gap-2">
                          {filter.values.map((value) => {
                            const isSelected = selectedValues.includes(value.value);
                            const isDefault = value.isDefault;
                            return (
                              <Badge 
                                key={value.id} 
                                variant={isSelected ? "default" : "outline"}
                                className={isSelected ? "" : isDefault ? "bg-green-50 text-green-700 border-green-300" : ""}
                              >
                                {value.value}
                                {isDefault && <span className="ml-1">★</span>}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Product Type Specific Details */}
            {product.type === 'physical' && (
              <Card>
                <CardHeader>
                  <CardTitle>Physical Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Stock Quantity</label>
                      <p className="text-lg font-semibold">{product.stock || 0}</p>
                    </div>
                  </div>
                  {product.dimensions && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Dimensions</label>
                      <p className="text-lg">
                        {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                      </p>
                    </div>
                  )}
                  {product.weight && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Weight</label>
                      <p className="text-lg">{product.weight.value} {product.weight.unit}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {product.type === 'digital' && (
              <Card>
                <CardHeader>
                  <CardTitle>Digital Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.kind && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Product Kind</label>
                      <p className="text-lg font-semibold capitalize">{product.kind}</p>
                    </div>
                  )}
                  {product.assetDetails && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">File Type</label>
                        <p className="text-lg">{product.assetDetails.fileType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">File Size</label>
                        <p className="text-lg">{product.assetDetails.fileSize} MB</p>
                      </div>
                    </div>
                  )}
                  {product.previewFile && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Preview File</label>
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm font-medium text-blue-900">{product.previewFile.name}</p>
                        <p className="text-xs text-blue-600 mb-2">
                          This file will be converted to flipbook upon approval
                        </p>
                        <div className="flex gap-2">
                          <a href={product.previewFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                            View PDF
                          </a>
                          {product.flipbookUrl && (
                            <a href={product.flipbookUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 text-sm">
                              View Flipbook
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Kit Information */}
            {product.isKitProduct && (
              <Card>
                <CardHeader>
                  <CardTitle>Kit Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.typeOfKit && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Kit Type</label>
                      <p className="text-lg font-semibold capitalize">{product.typeOfKit}</p>
                    </div>
                  )}
                  {product.kitDescription && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Kit Description</label>
                      <p className="text-gray-700 whitespace-pre-wrap">{product.kitDescription}</p>
                    </div>
                  )}
                  {product.kitInstructions && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Kit Instructions</label>
                      <p className="text-gray-700 whitespace-pre-wrap">{product.kitInstructions}</p>
                    </div>
                  )}
                  {product.kitContents && product.kitContents.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Kit Contents</label>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {product.kitContents.map((content, index) => (
                          <li key={index} className="text-gray-700">{content}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {product.kitMainFile && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Main Kit File</label>
                      <p className="text-sm">
                        <a href={product.kitMainFile.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">
                          {product.kitMainFile.name} ({(product.kitMainFile.size / 1024 / 1024).toFixed(2)} MB)
                        </a>
                      </p>
                    </div>
                  )}
                  {product.kitFiles && product.kitFiles.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Kit Files</label>
                      <div className="space-y-2 mt-2">
                        {product.kitFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {file.fileType} • {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                              View
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* PDF Preview Files for Flipbook Generation */}
                  {product.kitFiles && product.kitFiles.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">PDF Preview Files (Flipbook Generation)</label>
                      <div className="space-y-2 mt-2">
                        {product.kitFiles
                          .filter((file) => file.fileType === 'pdf')
                          .map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                              <div>
                                <p className="text-sm font-medium text-blue-900">{file.name}</p>
                                <p className="text-xs text-blue-600">
                                  PDF • {(file.size / 1024 / 1024).toFixed(2)} MB • Preview File
                                </p>
                                <p className="text-xs text-blue-500 mt-1">
                                  This file will be converted to flipbook upon approval
                                </p>
                              </div>
                              <div className="flex flex-col gap-1">
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                                  View PDF
                                </a>
                                {product.flipbookUrl && (
                                  <a href={product.flipbookUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 text-sm">
                                    View Flipbook
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Service Information */}
            {product.type === 'service' && (
              <Card>
                <CardHeader>
                  <CardTitle>Service Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.deliveryTime && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Delivery Time</label>
                      <p className="text-lg">
                        {product.deliveryTime.min} - {product.deliveryTime.max} {product.deliveryTime.unit}
                      </p>
                    </div>
                  )}
                  {product.revisions && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Revisions</label>
                      <p className="text-lg">
                        {product.revisions.allowed} revisions included
                        {product.revisions.cost > 0 && (
                          <span className="text-sm text-gray-500 ml-2">
                            Additional: ${product.revisions.cost} per {product.revisions.unit}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  {product.deliverables && product.deliverables.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Deliverables</label>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {product.deliverables.map((deliverable, index) => (
                          <li key={index} className="text-gray-700">{deliverable}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {product.requirements && product.requirements.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Requirements</label>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {product.requirements.map((requirement, index) => (
                          <li key={index} className="text-gray-700">{requirement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Consultation Required</label>
                    <p className="text-lg">{product.consultationRequired ? 'Yes' : 'No'}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SEO Information */}
            {product.seo && (
              <Card>
                <CardHeader>
                  <CardTitle>SEO Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.seo.metaTitle && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Meta Title</label>
                      <p className="text-sm text-gray-700">{product.seo.metaTitle}</p>
                    </div>
                  )}
                  {product.seo.metaDescription && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Meta Description</label>
                      <p className="text-sm text-gray-700">{product.seo.metaDescription}</p>
                    </div>
                  )}
                  {product.seo.metaKeywords && product.seo.metaKeywords.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Meta Keywords</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.seo.metaKeywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            {(product.theme || product.season || product.occasion || product.featured) && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.theme && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Theme</label>
                      <p className="text-lg">{product.theme}</p>
                    </div>
                  )}
                  {product.season && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Season</label>
                      <p className="text-lg">{product.season}</p>
                    </div>
                  )}
                  {product.occasion && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Occasion</label>
                      <p className="text-lg">{product.occasion}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Featured</label>
                    <p className="text-lg">{product.featured ? 'Yes' : 'No'}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Kit Images */}
            {product.isKitProduct && product.kitImages && product.kitImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Kit Images ({product.kitImages.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {product.kitImages.map((image) => (
                      <div key={image._id} className="relative">
                        <Image
                          src={image.url}
                          alt={image.originalname}
                          width={400}
                          height={128}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rejection Reason */}
            {product.status.toLowerCase() === 'rejected' && product.adminRejectionReason && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800">Rejection Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-700">{product.adminRejectionReason}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1">{product.sellerId.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1">{product.sellerId.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Timestamps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="mt-1 text-sm">{formatDate(product.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="mt-1 text-sm">{formatDate(product.updatedAt)}</p>
                </div>

              </CardContent>
            </Card>

            {/* Flipbook */}
            {product.flipbookUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5" />
                    Flipbook
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      PDF has been converted to interactive flipbook
                    </p>
                    <a 
                      href={product.flipbookUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <LinkIcon className="w-4 h-4" />
                      View Flipbook
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Related Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {product.relatedProductsId.length} related products
                  </span>
                  {product.status.toLowerCase() === 'active' && (
                    <RelatedProductsDialog 
                      product={product} 
                      onUpdate={fetchProduct}
                      trigger={
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      }
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {product.status.toLowerCase() === 'pending' && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Flipbook Status */}
                  {(product.isKitProduct || product.type === 'digital') && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-1">Flipbook Status</p>
                      {product.flipbookUrl ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">Flipbook Generated</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-600">Will generate on approval</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button 
                    onClick={approveProduct}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Product
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => setRejectDialogOpen(true)}
                    className="w-full"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Product
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Reject Dialog */}
        {rejectDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Reject Product</h3>
              <textarea
                placeholder="Please provide a reason for rejecting this product..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 border rounded-md mb-4 h-32 resize-none"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={rejectProduct}>
                  Reject Product
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 