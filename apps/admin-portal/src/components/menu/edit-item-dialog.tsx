"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Loader2, Upload, X, Plus, Trash2 } from "lucide-react"
import { menuApi } from "@/lib/api/menu"
import { toast } from "sonner"
import Image from "next/image"

interface FilterValue {
  id: string;
  name: string;
  value: string;
}

interface Filter {
  id: string;
  name: string;
  values: FilterValue[];
}

interface EditItemDialogProps {
  item: {
    _id: string
    title: string
    slug: string
    description?: string
    image?: {
      url: string
      filename: string
      originalname: string
      size: number
      mimetype: string
      bucket: string
      imageType: string
      status: string
    }
    onHover?: {
      url: string
      filename: string
      originalname: string
      size: number
      mimetype: string
      bucket: string
      imageType: string
      status: string
    }
    categoryId: string
    filters?: Filter[]
  }
  children: React.ReactNode
  onItemUpdated?: (item: {
    _id: string
    title: string
    slug: string
    description?: string
    image?: {
      url: string
      filename: string
      originalname: string
      size: number
      mimetype: string
      bucket: string
      imageType: string
      status: string
    }
    onHover?: {
      url: string
      filename: string
      originalname: string
      size: number
      mimetype: string
      bucket: string
      imageType: string
      status: string
    }
    categoryId: string
    filters?: Filter[]
  }) => void
}

export function EditItemDialog({ item, children, onItemUpdated }: EditItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description || "")
  const [titleError, setTitleError] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [hoverImageFile, setHoverImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(item.image?.url || null)
  const [hoverImagePreview, setHoverImagePreview] = useState<string | null>(item.onHover?.url || null)
  const [filters, setFilters] = useState<Filter[]>(item.filters || [])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const onHoverFileInputRef = useRef<HTMLInputElement>(null)

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addFilter = () => {
    const newFilter: Filter = {
      id: generateId(),
      name: "",
      values: []
    }
    setFilters([...filters, newFilter])
  }

  const removeFilter = (filterId: string) => {
    setFilters(filters.filter(filter => filter.id !== filterId))
  }

  const updateFilterName = (filterId: string, name: string) => {
    setFilters(filters.map(filter => 
      filter.id === filterId ? { ...filter, name } : filter
    ))
  }

  const addFilterValue = (filterId: string) => {
    const newValue: FilterValue = {
      id: generateId(),
      name: "",
      value: ""
    }
    setFilters(filters.map(filter => 
      filter.id === filterId 
        ? { ...filter, values: [...filter.values, newValue] }
        : filter
    ))
  }

  const removeFilterValue = (filterId: string, valueId: string) => {
    setFilters(filters.map(filter => 
      filter.id === filterId 
        ? { ...filter, values: filter.values.filter(value => value.id !== valueId) }
        : filter
    ))
  }

  const updateFilterValue = (filterId: string, valueId: string, field: 'name' | 'value', newValue: string) => {
    setFilters(filters.map(filter => 
      filter.id === filterId 
        ? { 
            ...filter, 
            values: filter.values.map(value => 
              value.id === valueId 
                ? { ...value, [field]: newValue }
                : value
            )
          }
        : filter
    ))
  }

  useEffect(() => {
    setTitle(item.title)
    setDescription(item.description || "")
    setImagePreview(item.image?.url || null)
    setHoverImagePreview(item.onHover?.url || null)
    setFilters(item.filters || [])
  }, [item])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'hover') => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === 'main') {
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
      } else {
        setHoverImageFile(file)
        setHoverImagePreview(URL.createObjectURL(file))
      }
    }
  }

  const removeImage = (type: 'main' | 'hover') => {
    if (type === 'main') {
      setImageFile(null)
      setImagePreview(null)
    } else {
      setHoverImageFile(null)
      setHoverImagePreview(null)
    }
  }

  const uploadImage = async (file: File): Promise<{
    url: string
    filename: string
    originalname: string
    size: number
    mimetype: string
    bucket: string
    imageType: string
    status: string
  }> => {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await fetch('/api/assets/upload-url', {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error('Failed to upload image')
    }
    
    return response.json()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setTitleError("Title is required")
      return
    }

    setLoading(true)
    try {
      let imageData: {
        url: string
        filename: string
        originalname: string
        size: number
        mimetype: string
        bucket: string
        imageType: string
        status: string
      } | undefined = undefined
      let hoverImageData: {
        url: string
        filename: string
        originalname: string
        size: number
        mimetype: string
        bucket: string
        imageType: string
        status: string
      } | undefined = undefined

      // Upload new images if selected
      if (imageFile) {
        imageData = await uploadImage(imageFile)
      }
      
      if (hoverImageFile) {
        hoverImageData = await uploadImage(hoverImageFile)
      }

      const updateData: {
        title: string
        description?: string
        filters: Filter[]
        image?: {
          url: string
          filename: string
          originalname: string
          size: number
          mimetype: string
          bucket: string
          imageType: string
          status: string
        }
        onHover?: {
          url: string
          filename: string
          originalname: string
          size: number
          mimetype: string
          bucket: string
          imageType: string
          status: string
        }
      } = {
        title: title.trim(),
        description: description.trim() || undefined,
        filters: filters, // Always send filters, even if empty array
      }

      if (imageData) {
        updateData.image = imageData
      }

      if (hoverImageData) {
        updateData.onHover = hoverImageData
      }

      const response = await menuApi.updateItem(item._id, updateData)

      toast.success("Item updated successfully")
      setOpen(false)
      
      // Dispatch custom event for parent component
      window.dispatchEvent(
        new CustomEvent('itemUpdated', {
          detail: response.item
        })
      )
      
      if (onItemUpdated) {
        onItemUpdated(response.item)
      }
    } catch (error) {
      console.error('Failed to update item:', error)
      toast.error("Failed to update item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Update the item details including title, description, images, and filters.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    setTitleError("")
                  }}
                  className={`col-span-3 ${titleError ? 'border-red-500' : ''}`}
                  placeholder="Enter item title"
                />
              </div>
              {titleError && (
                <p className="text-red-500 text-sm col-span-4 text-right">{titleError}</p>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter item description"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              {/* Main Image */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Main Image</Label>
                <div className="col-span-3 space-y-2">
                  {imagePreview && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                      <Image
                        src={imagePreview}
                        alt="Main image preview"
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeImage('main')}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'main')}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Hover Image */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Hover Image</Label>
                <div className="col-span-3 space-y-2">
                  {hoverImagePreview && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                      <Image
                        src={hoverImagePreview}
                        alt="Hover image preview"
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeImage('hover')}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input
                      ref={onHoverFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'hover')}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onHoverFileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Filters</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFilter}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Filter
                </Button>
              </div>

              {filters.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No filters added yet. Click &quot;Add Filter&quot; to get started.</p>
                </div>
              )}

              <div className="space-y-4">
                {filters.map((filter) => (
                  <div key={filter.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        placeholder="Filter name (e.g., Size, Color, Material)"
                        value={filter.name}
                        onChange={(e) => updateFilterName(filter.id, e.target.value)}
                        className="flex-1 mr-2"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFilter(filter.id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Filter Values</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addFilterValue(filter.id)}
                          className="flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add Value
                        </Button>
                      </div>

                      {filter.values.length === 0 && (
                        <p className="text-sm text-muted-foreground">No values added yet.</p>
                      )}

                      <div className="space-y-2">
                        {filter.values.map((value) => (
                          <div key={value.id} className="flex items-center gap-2">
                            <Input
                              placeholder="Value name"
                              value={value.name}
                              onChange={(e) => updateFilterValue(filter.id, value.id, 'name', e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              placeholder="Value"
                              value={value.value}
                              onChange={(e) => updateFilterValue(filter.id, value.id, 'value', e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeFilterValue(filter.id, value.id)}
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Item
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
