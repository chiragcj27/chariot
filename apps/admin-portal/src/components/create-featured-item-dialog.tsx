"use client"

import type React from "react"
import Image from "next/image"

import { useState, useRef } from "react"
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
import { Upload, X, ImageIcon, Star } from "lucide-react"

interface FeaturedItem {
  id: string
  title: string
  slug: string
  price: number
  image: string
  categoryId: string
}

interface CreateFeaturedItemDialogProps {
  children: React.ReactNode
  categoryId: string
  onFeaturedItemCreated?: string
}

export function CreateFeaturedItemDialog({
  children,
  categoryId,
  onFeaturedItemCreated = "featured-item-created",
}: CreateFeaturedItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    price: "",
    imageUrl: "",
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      setSelectedFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setImagePreview(null)
    setFormData({ ...formData, imageUrl: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    setUploadingImage(true)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("image", file)

      // Upload to API
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Upload failed")
      }

      return data.imageUrl
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload image. Please try again.")
      throw error
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let finalImageUrl = formData.imageUrl

      // Upload image if file is selected
      if (selectedFile) {
        finalImageUrl = await uploadImage(selectedFile)
      }

      // Validate price
      const price = Number.parseFloat(formData.price)
      if (isNaN(price) || price < 0) {
        alert("Please enter a valid price")
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newFeaturedItem = {
        id: Date.now().toString(),
        title: formData.title,
        slug: formData.slug,
        price: price,
        image: finalImageUrl || "/placeholder.svg?height=100&width=100",
        categoryId,
      }

      // Dispatch custom event instead of callback
      const event = new CustomEvent<FeaturedItem>(onFeaturedItemCreated, { detail: newFeaturedItem })
      window.dispatchEvent(event)

      // Reset form
      setFormData({ title: "", slug: "", price: "", imageUrl: "" })
      setSelectedFile(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setOpen(false)
    } catch (error) {
      console.error("Error creating featured item:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ title: "", slug: "", price: "", imageUrl: "" })
    setSelectedFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) {
          resetForm()
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Create Featured Item
          </DialogTitle>
          <DialogDescription>Add a featured item to highlight in this category&apos;s mega menu.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter featured item title"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="featured-item-slug"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="pl-8"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Image</Label>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                  <TabsTrigger value="url">Image URL</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-3">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    {imagePreview ? (
                      <div className="space-y-3">
                        <div className="relative inline-block">
                          <Image
                            src={imagePreview || "/placeholder.svg"}
                            alt="Preview"
                            width={128}
                            height={128}
                            className="w-32 h-32 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium">{selectedFile?.name}</p>
                          <p>{selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <div className="mt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="mx-auto"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Image
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-3">
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/featured-image.jpg"
                  />
                  {formData.imageUrl && (
                    <div className="relative inline-block">
                      <Image
                        src={formData.imageUrl || "/placeholder.svg"}
                        alt="URL Preview"
                        width={128}
                        height={128}
                        className="w-32 h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=128&width=128"
                        }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Enter a direct link to an image file</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploadingImage}>
              {uploadingImage ? "Uploading..." : loading ? "Creating..." : "Create Featured Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
