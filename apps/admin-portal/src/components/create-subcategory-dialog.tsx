"use client"

import type React from "react"

import { useState } from "react"
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
import { menuApi } from "@/lib/api/menu"

interface SubCategory {
  _id: string
  title: string
  slug: string
  description: string
  categoryId: string
  items?: Array<{
    _id: string
    title: string
    slug: string
    description: string
    image: string
    subCategoryId: string
  }>
}

interface CreateSubCategoryDialogProps {
  children: React.ReactNode
  categoryId: string
  onSubCategoryCreated?: string
}

export function CreateSubCategoryDialog({
  children,
  categoryId,
  onSubCategoryCreated = "subcategory-created",
}: CreateSubCategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { subCategory } = await menuApi.createSubCategory({
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        categoryId,
      })

      // Dispatch custom event instead of callback
      const event = new CustomEvent<SubCategory>(onSubCategoryCreated, { detail: subCategory })
      window.dispatchEvent(event)

      setFormData({ title: "", slug: "", description: "" })
      setOpen(false)
    } catch (error) {
      console.error("Error creating subcategory:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Subcategory</DialogTitle>
          <DialogDescription>Add a new subcategory to organize your items.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter subcategory title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="subcategory-slug"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter subcategory description"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Subcategory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
