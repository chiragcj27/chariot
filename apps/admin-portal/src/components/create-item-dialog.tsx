"use client"

import type React from "react"

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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"

interface Item {
  _id: string
  title: string
  slug: string
  description: string
  image: string
  subCategoryId: string
}

interface CreateItemDialogProps {
  children: React.ReactNode
  subCategoryId: string
  onItemCreated?: string
}

export function CreateItemDialog({
  children,
  subCategoryId,
  onItemCreated = "item-created",
}: CreateItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
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
      // First, get the pre-signed URL from our API
      const getUrlResponse = await fetch("http://localhost:3001/api/assets/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          folder: "items",
        }),
      });

      if (!getUrlResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, url } = await getUrlResponse.json();

      console.log('Debug S3 Upload:', {
        uploadUrl,
        url,
        fileType: file.type,
        fileSize: file.size,
        fileName: file.name
      });

      // Upload the file directly to S3 using the pre-signed URL
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        console.error("S3 Upload failed:", {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          headers: Object.fromEntries(uploadResponse.headers.entries())
        });
        throw new Error(`Failed to upload to S3: ${uploadResponse.statusText}`);
      }

      // Return the final URL where the image can be accessed
      return url;
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let finalImageUrl = formData.imageUrl

      // Upload image if file is selected
      if (selectedFile) {
        finalImageUrl = await uploadImage(selectedFile)
      }

      // Prepare the item data according to the API expectations
      const itemData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        subCategoryId: subCategoryId,
        image: finalImageUrl ? {
          filename: selectedFile?.name || "image.jpg",
          originalname: selectedFile?.name || "image.jpg",
          url: finalImageUrl,
          size: selectedFile?.size || 0,
          mimetype: selectedFile?.type || "image/jpeg",
          bucket: "chariot-images",
          imageType: "item",
          status: "uploaded"
        } : undefined
      }

      // Make the API call to create the item
      const response = await fetch("http://localhost:3001/api/menu/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Failed to create item:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          requestData: itemData
        });
        throw new Error(errorData.message || `Failed to create item: ${response.statusText}`);
      }

      const { items } = await response.json()
      const newItem = items[0] // Since we're creating one item at a time

      // Dispatch custom event with the created item
      const event = new CustomEvent<Item>(onItemCreated, { detail: newItem })
      window.dispatchEvent(event)

      // Reset form
      setFormData({ title: "", slug: "", description: "", imageUrl: "" })
      setSelectedFile(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setOpen(false)
    } catch (error) {
      console.error("Error creating item:", error)
      alert(error instanceof Error ? error.message : "Failed to create item")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ title: "", slug: "", description: "", imageUrl: "" })
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
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>Add a new item to this subcategory.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter item title"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="item-slug"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter item description (optional)"
                rows={3}
              />
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
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg"
                            }}
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
                    placeholder="https://example.com/image.jpg"
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
                          e.currentTarget.src = "/placeholder.svg"
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
              {uploadingImage ? "Uploading..." : loading ? "Creating..." : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
