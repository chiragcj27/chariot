"use client"

import { useState, useEffect } from "react"
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
import { Edit, Loader2, Upload, X } from "lucide-react"
import { menuApi } from "@/lib/api/menu"
import { toast } from "sonner"
import Image from "next/image"

interface EditFeaturedItemDialogProps {
  featuredItem: {
    id: string
    title: string
    price: number
    image: string
    slug: string
    categoryId: string
  }
  children: React.ReactNode
  onFeaturedItemUpdated?: (featuredItem: {
    _id: string
    title: string
    price: number
    image: string
    slug: string
    categoryId: string
  }) => void
}

export function EditFeaturedItemDialog({ featuredItem, children, onFeaturedItemUpdated }: EditFeaturedItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(featuredItem.title)
  const [price, setPrice] = useState(featuredItem.price.toString())
  const [slug, setSlug] = useState(featuredItem.slug)
  const [titleError, setTitleError] = useState("")
  const [priceError, setPriceError] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(featuredItem.image)



  useEffect(() => {
    setTitle(featuredItem.title)
    setPrice(featuredItem.price.toString())
    setSlug(featuredItem.slug)
    setImagePreview(featuredItem.image)
  }, [featuredItem])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview("")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    let hasError = false
    
    if (!title.trim()) {
      setTitleError("Title is required")
      hasError = true
    } else {
      setTitleError("")
    }

    const priceValue = parseFloat(price)
    if (isNaN(priceValue) || priceValue < 0) {
      setPriceError("Price must be a valid positive number")
      hasError = true
    } else {
      setPriceError("")
    }

    if (hasError) return

    setLoading(true)
    try {
      let imageUrl = featuredItem.image

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const updateData = {
        title: title.trim(),
        price: priceValue,
        image: imageUrl,
        slug: slug.trim(),
      }

      const response = await menuApi.updateFeaturedItem(featuredItem.categoryId, featuredItem.id, updateData)
      const updatedItem = response.featuredItem

      toast.success("Featured item updated successfully")
      setOpen(false)
      
      // Dispatch custom event for parent component
      window.dispatchEvent(
        new CustomEvent('featuredItemUpdated', {
          detail: updatedItem
        })
      )
      
      if (onFeaturedItemUpdated) {
        onFeaturedItemUpdated(updatedItem)
      }
    } catch (error) {
      console.error('Failed to update featured item:', error)
      toast.error("Failed to update featured item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Featured Item</DialogTitle>
          <DialogDescription>
            Update the featured item details including title, price, and image.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value)
                  setPriceError("")
                }}
                className={`col-span-3 ${priceError ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
            </div>
            {priceError && (
              <p className="text-red-500 text-sm col-span-4 text-right">{priceError}</p>
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
                placeholder="item-slug"
              />
            </div>

            {/* Image */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Image</Label>
              <div className="col-span-3 space-y-2">
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
                      onClick={removeImage}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('featured-image')?.click()}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
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
                  Update Featured Item
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
