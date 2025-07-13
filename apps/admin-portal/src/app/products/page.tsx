"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Eye, AlertCircle, Link } from "lucide-react";
import { RelatedProductsDialog } from "@/components/related-products-dialog";

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
}

interface Seller {
  _id: string;
  name: string;
  email: string;
}

type StatusFilter = 'all' | 'pending' | 'active' | 'rejected';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSeller && selectedSeller !== 'all') params.append("sellerId", selectedSeller);
      if (search) params.append("name", search);
      if (statusFilter !== 'all') params.append("status", statusFilter);
      
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      
      if (res.ok) {
        setProducts(data.products || []);
      } else {
        toast.error(data.message || "Failed to fetch products");
      }
    } catch (error) {
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  }, [selectedSeller, search, statusFilter]);

  async function fetchSellers() {
    try {
      const res = await fetch("/api/admin/sellers");
      const data = await res.json();
      setSellers(data.sellers || []);
    } catch (error) {
      toast.error("Failed to fetch sellers");
    }
  }

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function approveProduct(productId: string) {
    try {
      const res = await fetch(`/api/admin/products/${productId}/approve`, { 
        method: "PATCH" 
      });
      
      if (res.ok) {
        toast.success("Product approved successfully");
        fetchProducts();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to approve product");
      }
    } catch (error) {
      toast.error("Error approving product");
    }
  }

  async function rejectProduct() {
    if (!selectedProduct || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${selectedProduct._id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });
      
      if (res.ok) {
        toast.success("Product rejected successfully");
        setRejectDialogOpen(false);
        setRejectionReason("");
        setSelectedProduct(null);
        fetchProducts();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to reject product");
      }
    } catch (error) {
      toast.error("Error rejecting product");
    }
  }

  function openRejectDialog(product: Product) {
    setSelectedProduct(product);
    setRejectionReason("");
    setRejectDialogOpen(true);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const filteredProducts = products.filter(product => {
    if (statusFilter === 'all') return true;
    return product.status.toLowerCase() === statusFilter;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Products Management</h1>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {filteredProducts.length} {statusFilter === 'all' ? 'Total' : statusFilter} Products
          </Badge>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="seller-filter">Seller</Label>
                                 <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                   <SelectTrigger>
                     <SelectValue placeholder="All Sellers" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Sellers</SelectItem>
                     {sellers.map((seller) => (
                       <SelectItem key={seller._id} value={seller._id}>
                         {seller.name} ({seller.email})
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
              
              <div>
                <Label htmlFor="search">Search Products</Label>
                <Input
                  id="search"
                  placeholder="Search by product name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={fetchProducts} disabled={loading} className="w-full">
                  {loading ? "Loading..." : "Refresh"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 text-center">
                {statusFilter === 'pending' 
                  ? "No pending products for approval"
                  : `No ${statusFilter} products found`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product._id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        by {product.sellerId?.name || "Unknown Seller"}
                      </p>
                    </div>
                    {getStatusBadge(product.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {product.description || "No description available"}
                    </p>
                  </div>
                  
                                     <div className="space-y-2">
                     {product.price && (
                       <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-500">Price:</span>
                         <span className="font-semibold">
                           {product.price.currency} {product.price.amount}
                         </span>
                       </div>
                     )}
                     
                     {product.creditsCost && (
                       <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-500">Credits:</span>
                         <div className="flex items-center gap-2">
                           {product.discountedCreditsCost && product.discountedCreditsCost < product.creditsCost ? (
                             <>
                               <span className="font-semibold text-green-600">
                                 {product.discountedCreditsCost} credits
                               </span>
                               <span className="text-sm text-gray-400 line-through">
                                 {product.creditsCost} credits
                               </span>
                             </>
                           ) : (
                             <span className="font-semibold">
                               {product.creditsCost} credits
                             </span>
                           )}
                         </div>
                       </div>
                     )}
                   </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Link className="w-3 h-3" />
                      Related: {product.relatedProductsId.length}
                    </span>
                    <span>Created: {formatDate(product.createdAt)}</span>
                  </div>
                  
                  {product.status.toLowerCase() === 'rejected' && product.adminRejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-800">
                        <strong>Rejection Reason:</strong> {product.adminRejectionReason}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    {product.status.toLowerCase() === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => approveProduct(product._id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => openRejectDialog(product)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {product.status.toLowerCase() === 'active' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => router.push(`/products/${product._id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <RelatedProductsDialog 
                          product={product} 
                          onUpdate={fetchProducts}
                          trigger={
                            <Button size="sm" variant="outline">
                              <Link className="w-4 h-4 mr-1" />
                              Related
                            </Button>
                          }
                        />
                      </>
                    )}
                    
                    {product.status.toLowerCase() === 'rejected' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => router.push(`/products/${product._id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Please provide a reason for rejecting this product..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={rejectProduct}>
                  Reject Product
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
} 