'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { KitImageUpload } from '@/components/kit-image-upload';
import { Plus, Edit, Trash2, Image as ImageIcon, Upload } from 'lucide-react';

interface KitImage {
  _id?: string;
  url: string;
  originalname: string;
  filename?: string;
  isMain: boolean;
  isCarousel: boolean;
  isThumbnail: boolean;
  file?: File;
  previewUrl?: string;
}

interface Kit {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: {
    _id: string;
    url: string;
    originalname: string;
  };
  mainImage?: {
    _id: string;
    url: string;
    originalname: string;
  };
  carouselImages?: Array<{
    _id: string;
    url: string;
    originalname: string;
  }>;
  testimonials?: string[];
  createdAt: string;
  updatedAt: string;
}

interface KitFormData {
  title: string;
  description: string;
  testimonials: string[];
  images: KitImage[];
}

export default function KitPage() {
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | null>(null);
  const [formData, setFormData] = useState<KitFormData>({
    title: '',
    description: '',
    testimonials: [''],
    images: [],
  });

  useEffect(() => {
    fetchKits();
  }, []);

  const fetchKits = async () => {
    try {
      const response = await fetch('/api/admin/kits');
      if (response.ok) {
        const data = await response.json();
        setKits(data);
      } else {
        toast.error('Failed to fetch kits');
      }
    } catch (error) {
      console.error('Error fetching kits:', error);
      toast.error('Failed to fetch kits');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKit = async () => {
    try {
      const response = await fetch('/api/admin/kits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          testimonials: formData.testimonials.filter(t => t.trim() !== ''),
        }),
      });

      if (response.ok) {
        const kitData = await response.json();
        const kit = kitData.kit;

        // Save images to database if there are any
        if (formData.images.length > 0) {
          const imagesToSave = formData.images.map(img => ({
            filename: img.filename || img.url.split('/').pop() || img.originalname,
            originalname: img.originalname,
            url: img.url,
            size: img.file?.size || 0,
            mimetype: img.file?.type || 'image/jpeg',
            isMain: img.isMain,
            isCarousel: img.isCarousel,
            isThumbnail: img.isThumbnail
          }));

          const imageResponse = await fetch('/api/admin/kits/images', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              kitId: kit._id,
              images: imagesToSave,
            }),
          });

          if (!imageResponse.ok) {
            console.error('Failed to save kit images');
            toast.error('Kit created but failed to save images');
          }
        }

        toast.success('Kit created successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        fetchKits();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create kit');
      }
    } catch (error) {
      console.error('Error creating kit:', error);
      toast.error('Failed to create kit');
    }
  };

  const handleUpdateKit = async () => {
    if (!editingKit) return;

    try {
      const response = await fetch(`/api/admin/kits/${editingKit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          testimonials: formData.testimonials.filter(t => t.trim() !== ''),
        }),
      });

      if (response.ok) {
        // Save images to database if there are any
        if (formData.images.length > 0) {
          const imagesToSave = formData.images.map(img => ({
            filename: img.filename || img.url.split('/').pop() || img.originalname,
            originalname: img.originalname,
            url: img.url,
            size: img.file?.size || 0,
            mimetype: img.file?.type || 'image/jpeg',
            isMain: img.isMain,
            isCarousel: img.isCarousel,
            isThumbnail: img.isThumbnail
          }));

          const imageResponse = await fetch('/api/admin/kits/images', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              kitId: editingKit._id,
              images: imagesToSave,
            }),
          });

          if (!imageResponse.ok) {
            console.error('Failed to save kit images');
            toast.error('Kit updated but failed to save images');
          }
        }

        toast.success('Kit updated successfully');
        setIsEditDialogOpen(false);
        setEditingKit(null);
        resetForm();
        fetchKits();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update kit');
      }
    } catch (error) {
      console.error('Error updating kit:', error);
      toast.error('Failed to update kit');
    }
  };

  const handleDeleteKit = async (kitId: string) => {
    if (!confirm('Are you sure you want to delete this kit?')) return;

    try {
      const response = await fetch(`/api/admin/kits/${kitId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Kit deleted successfully');
        fetchKits();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete kit');
      }
    } catch (error) {
      console.error('Error deleting kit:', error);
      toast.error('Failed to delete kit');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      testimonials: [''],
      images: [],
    });
  };

  const openEditDialog = (kit: Kit) => {
    setEditingKit(kit);
    setFormData({
      title: kit.title,
      description: kit.description,
      testimonials: kit.testimonials?.length ? kit.testimonials : [''],
      images: [
        ...(kit.thumbnail ? [{
          _id: kit.thumbnail._id,
          url: kit.thumbnail.url,
          originalname: kit.thumbnail.originalname,
          isMain: false,
          isCarousel: false,
          isThumbnail: true,
        }] : []),
        ...(kit.mainImage ? [{
          _id: kit.mainImage._id,
          url: kit.mainImage.url,
          originalname: kit.mainImage.originalname,
          isMain: true,
          isCarousel: false,
          isThumbnail: false,
        }] : []),
        ...(kit.carouselImages?.map(img => ({
          _id: img._id,
          url: img.url,
          originalname: img.originalname,
          isMain: false,
          isCarousel: true,
          isThumbnail: false,
        })) || []),
      ],
    });
    setIsEditDialogOpen(true);
  };

  const addTestimonial = () => {
    setFormData(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, ''],
    }));
  };

  const removeTestimonial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index),
    }));
  };

  const updateTestimonial = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      testimonials: prev.testimonials.map((t, i) => i === index ? value : t),
    }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Kits</h1>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Kits</h1>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Kit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Kit</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter kit title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter kit description"
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="images">
                  <KitImageUpload
                    images={formData.images}
                    onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                  />
                </TabsContent>

                <TabsContent value="testimonials" className="space-y-4">
                  <Label>Testimonials</Label>
                  <div className="space-y-2">
                    {formData.testimonials.map((testimonial, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={testimonial}
                          onChange={(e) => updateTestimonial(index, e.target.value)}
                          placeholder={`Testimonial ${index + 1}`}
                        />
                        {formData.testimonials.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeTestimonial(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTestimonial}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Testimonial
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateKit}>
                  Create Kit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {kits.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No kits found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first kit.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Kit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kits.map((kit) => (
              <Card key={kit._id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  {kit.thumbnail ? (
                    <img
                      src={kit.thumbnail.url}
                      alt={kit.title}
                      className="w-full h-full object-cover"
                    />
                  ) : kit.mainImage ? (
                    <img
                      src={kit.mainImage.url}
                      alt={kit.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon className="h-12 w-12 mb-2" />
                      <span className="text-sm">No image</span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{kit.title}</CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {kit.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary">
                      {kit.carouselImages?.length || 0} images
                    </Badge>
                    <div className="flex gap-2">
                      {kit.thumbnail && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Thumbnail
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {kit.testimonials?.length || 0} testimonials
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(kit)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteKit(kit._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Kit</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter kit title"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter kit description"
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="images">
                <KitImageUpload
                  images={formData.images}
                  onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                  kitId={editingKit?._id}
                />
              </TabsContent>

              <TabsContent value="testimonials" className="space-y-4">
                <Label>Testimonials</Label>
                <div className="space-y-2">
                  {formData.testimonials.map((testimonial, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={testimonial}
                        onChange={(e) => updateTestimonial(index, e.target.value)}
                        placeholder={`Testimonial ${index + 1}`}
                      />
                      {formData.testimonials.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTestimonial(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTestimonial}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Testimonial
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateKit}>
                Update Kit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
