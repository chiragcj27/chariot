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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Loader2, Upload, X, Plus, Trash2 } from "lucide-react"
import { menuApi } from "@/lib/api/menu"
import { toast } from "sonner"
import Image from "next/image"

interface FeaturedItem {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  categoryId: string;
}

interface EditCategoryDialogProps {
  category: {
    _id: string
    title: string
    slug: string
    featuredItems?: FeaturedItem[]
  }
  children: React.ReactNode
  onCategoryUpdated?: (category: {
    _id: string
    title: string
    slug: string
    featuredItems?: FeaturedItem[]
  }) => void
}

export function EditCategoryDialog({ category, children, onCategoryUpdated }: EditCategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(category.title)
  const [slug, setSlug] = useState(category.slug)
  const [titleError, setTitleError] = useState("")
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>(category.featuredItems || [])
  const [newFeaturedItem, setNewFeaturedItem] = useState({
    title: "",
    price: "",
    image: "",
    slug: ""
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const addFeaturedItem = () => {
    if (!newFeaturedItem.title.trim() || !newFeaturedItem.price.trim()) {
      toast.error("Please fill in title and price")
      return
    }

    const price = parseFloat(newFeaturedItem.price)
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price")
      return
    }

    const newItem: FeaturedItem = {
      id: generateId(),
      title: newFeaturedItem.title.trim(),
      price,
      image: newFeaturedItem.image || "/placeholder.svg",
      slug: generateSlug(newFeaturedItem.title),
      categoryId: category._id
    }

    setFeaturedItems([...featuredItems, newItem])
    setNewFeaturedItem({
      title: "",
      price: "",
      image: "",
      slug: ""
    })
    setImageFile(null)
    setImagePreview(null)
  }

  const removeFeaturedItem = (itemId: string) => {
    setFeaturedItems(featuredItems.filter(item => item.id !== itemId))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await fetch('/api/assets/upload-url', {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error('Failed to upload image')
    }
    
    const data = await response.json()
    return data.url
  }

  useEffect(() => {
    setTitle(category.title)
    setSlug(category.slug)
    setFeaturedItems(category.featuredItems || [])
  }, [category])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    setSlug(generateSlug(value))
    setTitleError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setTitleError("Title is required")
      return
    }

    setLoading(true)
    try {
      // Upload new image if selected
      if (imageFile) {
        await uploadImage(imageFile)
      }

      const response = await menuApi.updateCategory(category._id, {
        title: title.trim(),
        slug: slug.trim(),
        featuredItems: featuredItems.map(item => ({
          _id: item.id,
          title: item.title,
          price: item.price,
          image: item.image,
          slug: item.slug,
          categoryId: item.categoryId
        })),
      })

      toast.success("Category updated successfully")
      setOpen(false)
      
      // Dispatch custom event for parent component
      window.dispatchEvent(
        new CustomEvent('categoryUpdated', {
          detail: response.category
        })
      )
      
      if (onCategoryUpdated) {
        onCategoryUpdated({
          _id: response.category._id,
          title: response.category.title,
          slug: response.category.slug,
          featuredItems: response.category.featuredItems?.map(item => ({
            id: item._id,
            title: item.title,
            price: item.price,
            image: item.image,
            slug: item.slug,
            categoryId: item.categoryId
          }))
        })
      }
    } catch (error) {
      console.error('Failed to update category:', error)
      toast.error("Failed to update category")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update the category details including title, slug, and featured items.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="featured">Featured Items</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className={`col-span-3 ${titleError ? 'border-red-500' : ''}`}
                  placeholder="Enter category title"
                />
              </div>
              {titleError && (
                <p className="text-red-500 text-sm col-span-4 text-right">{titleError}</p>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slug" className="text-right">
                  Slug
                </Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="col-span-3"
                  placeholder="category-slug"
                />
              </div>
            </TabsContent>

            <TabsContent value="featured" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Featured Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFeaturedItem}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Featured Item
                </Button>
              </div>

              {/* Add New Featured Item Form */}
              <div className="border rounded-lg p-4 space-y-3">
                <Label className="text-sm font-medium">Add New Featured Item</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Item title"
                    value={newFeaturedItem.title}
                    onChange={(e) => setNewFeaturedItem({
                      ...newFeaturedItem,
                      title: e.target.value,
                      slug: generateSlug(e.target.value)
                    })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Price"
                    value={newFeaturedItem.price}
                    onChange={(e) => setNewFeaturedItem({
                      ...newFeaturedItem,
                      price: e.target.value
                    })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
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
                {imagePreview && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                    <Image
                      src={imagePreview}
                      alt="Image preview"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Existing Featured Items */}
              {featuredItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No featured items added yet.</p>
                </div>
              )}

              <div className="space-y-3">
                {featuredItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h6 className="text-sm font-semibold">{item.title}</h6>
                        <p className="text-xs text-muted-foreground">${item.price}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFeaturedItem(item.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </Button>
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
                  Update Category
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
