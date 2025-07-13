"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Search, X, Link } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  status: string;
  sellerId: { _id: string; name: string; email: string };
  relatedProductsId: string[];
}

interface RelatedProductsDialogProps {
  product: Product;
  onUpdate: () => void;
  trigger?: React.ReactNode;
}

export function RelatedProductsDialog({ product, onUpdate, trigger }: RelatedProductsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products?status=active");
      const data = await res.json();
      
      if (res.ok) {
        // Filter out the current product from the list
        const filteredProducts = data.products.filter((p: Product) => p._id !== product._id);
        setAllProducts(filteredProducts);
      } else {
        toast.error(data.message || "Failed to fetch products");
      }
    } catch (error) {
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  }, [product._id]);

  useEffect(() => {
    if (isOpen) {
      fetchAllProducts();
      setSelectedProducts(product.relatedProductsId || []);
    }
  }, [isOpen, product.relatedProductsId, fetchAllProducts]);

  const handleSave = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/products/${product._id}/related-products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relatedProductsId: selectedProducts }),
      });

      if (res.ok) {
        toast.success("Related products updated successfully");
        onUpdate();
        setIsOpen(false);
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update related products");
      }
    } catch (error) {
      toast.error("Error updating related products");
    } finally {
      setUpdating(false);
    }
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sellerId.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRelatedProducts = () => {
    return allProducts.filter(p => selectedProducts.includes(p._id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Link className="w-4 h-4 mr-1" />
            Manage Related Products
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Related Products for &quot;{product.name}&quot;</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products by name, description, or seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4">
            {/* Available Products */}
            <div className="flex flex-col">
              <Label className="mb-2">Available Products ({filteredProducts.length})</Label>
              <div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No products found
                  </div>
                ) : (
                  filteredProducts.map((p) => (
                    <Card 
                      key={p._id} 
                      className={`cursor-pointer transition-colors ${
                        selectedProducts.includes(p._id) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleProduct(p._id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-1">{p.name}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                              {p.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              by {p.sellerId.name}
                            </p>
                          </div>
                          {selectedProducts.includes(p._id) && (
                            <Badge variant="default" className="ml-2 text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Selected Products */}
            <div className="flex flex-col">
              <Label className="mb-2">Selected Related Products ({selectedProducts.length})</Label>
              <div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-2">
                {getRelatedProducts().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No related products selected
                  </div>
                ) : (
                  getRelatedProducts().map((p) => (
                    <Card key={p._id} className="border-blue-500 bg-blue-50">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-1">{p.name}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                              {p.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              by {p.sellerId.name}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProduct(p._id);
                            }}
                            className="ml-2 h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updating}>
            {updating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 