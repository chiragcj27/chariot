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
  categoryId?: { _id: string; title: string; slug: string };
  itemId?: { _id: string; title: string; slug: string };
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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