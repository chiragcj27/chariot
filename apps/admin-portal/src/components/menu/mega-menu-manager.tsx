"use client"

import { useState, useEffect } from "react"
import { Plus, ChevronDown, Edit, Trash2, Sparkles, Package, Tag, ImageIcon } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CreateCategoryDialog } from "@/components/menu/create-category-dialog"
import { CreateItemDialog } from "@/components/menu/create-item-dialog"
import { Badge } from "@/components/ui/badge"
import { CreateFeaturedItemDialog } from "@/components/menu/create-featured-item-dialog"
import { cn } from "@/lib/utils"
import { menuApi } from "@/lib/api/menu"

interface Item {
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
}

interface FeaturedItem {
  id: string
  title: string
  price: number
  image: string
  slug: string
  categoryId: string
}

interface Category {
  _id: string
  title: string
  slug: string
  featuredItems?: FeaturedItem[]
  items?: Item[]
}

export function MegaMenuManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Add event listeners for dialog events
  useEffect(() => {
    const handleCategoryCreated = (event: CustomEvent<Category>) => {
      setCategories((prev) => [...prev, event.detail])
    }

    const handleItemCreated = (event: CustomEvent<Item>) => {
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === event.detail.categoryId
            ? { ...cat, items: [...(cat.items || []), event.detail] }
            : cat,
        ),
      )
    }

    const handleFeaturedItemCreated = (event: CustomEvent<FeaturedItem>) => {
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === event.detail.categoryId
            ? { ...cat, featuredItems: [...(cat.featuredItems || []), event.detail] }
            : cat,
        ),
      )
    }

    window.addEventListener('categoryCreated', handleCategoryCreated as EventListener)
    window.addEventListener('item-created', handleItemCreated as EventListener)
    window.addEventListener('featured-item-created', handleFeaturedItemCreated as EventListener)

    return () => {
      window.removeEventListener('categoryCreated', handleCategoryCreated as EventListener)
      window.removeEventListener('item-created', handleItemCreated as EventListener)
      window.removeEventListener('featured-item-created', handleFeaturedItemCreated as EventListener)
    }
  }, [])

  useEffect(() => {
    const fetchMenuStructure = async () => {
      try {
        const data = await menuApi.getFullMenuStructure()
        setCategories(data as Category[])
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch menu structure:', error)
        setLoading(false)
      }
    }

    fetchMenuStructure()
  }, [])

  const toggleCategory = (categoryId: string) => {
    const newOpen = new Set(openCategories)
    if (newOpen.has(categoryId)) {
      newOpen.delete(categoryId)
    } else {
      newOpen.add(categoryId)
    }
    setOpenCategories(newOpen)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-indigo-600 rounded-full animate-spin animation-delay-150"></div>
        </div>
        <p className="text-lg font-medium text-muted-foreground animate-pulse">Loading menu structure...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            <p className="text-sm text-muted-foreground">Manage your top-level menu categories</p>
          </div>
        </div>
        <CreateCategoryDialog>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </CreateCategoryDialog>
      </div>

      <div className="space-y-4">
        {categories.map((category, index) => (
          <Card
            key={category._id}
            className={cn(
              "border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] bg-white/90 backdrop-blur-sm",
              "animate-in slide-in-from-left-5 fade-in-0",
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Collapsible open={openCategories.has(category._id)} onOpenChange={() => toggleCategory(category._id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={cn(
                          "transition-transform duration-200",
                          openCategories.has(category._id) ? "rotate-0" : "-rotate-90",
                        )}
                      >
                        <ChevronDown className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Tag className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">{category.title}</CardTitle>
                          <p className="text-sm text-muted-foreground font-mono">/{category.slug}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        {category.items?.length || 0} items
                      </Badge>
                      {category.featuredItems && category.featuredItems.length > 0 && (
                        <Badge variant="outline" className="border-yellow-300 text-yellow-700 bg-yellow-50">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {category.featuredItems.length} featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent className="animate-in slide-in-from-top-2 fade-in-0 duration-200">
                <CardContent className="pt-0 space-y-6">
                  {/* Items Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-green-600" />
                        <h4 className="font-medium text-green-900">Items</h4>
                      </div>
                      <CreateItemDialog categoryId={category._id}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Item
                        </Button>
                      </CreateItemDialog>
                    </div>

                    <div className="space-y-2 ml-6">
                      {category.items?.map((item) => (
                        <div
                          key={item._id}
                          className="group flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        >
                                                  <div className="flex items-center space-x-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border group">
                            {item.image ? (
                              <>
                                <Image
                                  src={item.image.url}
                                  alt={item.title}
                                  fill
                                  sizes="(max-width: 40px) 100vw, 40px"
                                  className="object-cover transition-opacity duration-200 group-hover:opacity-0"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg"
                                  }}
                                />
                                {item.onHover && (
                                  <Image
                                    src={item.onHover.url}
                                    alt={`${item.title} on hover`}
                                    fill
                                    sizes="(max-width: 40px) 100vw, 40px"
                                    className="object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                                    onError={(e) => {
                                      e.currentTarget.src = item.image?.url || "/placeholder.svg"
                                    }}
                                  />
                                )}
                              </>
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                            <div>
                              <h6 className="text-sm font-medium">{item.title}</h6>
                              {item.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!category.items || category.items.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm italic">No items yet. Add your first item above.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Featured Items Section */}
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-yellow-600" />
                        <h4 className="font-medium text-yellow-900">Featured Items</h4>
                      </div>
                      <CreateFeaturedItemDialog categoryId={category._id}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Featured Item
                        </Button>
                      </CreateFeaturedItemDialog>
                    </div>

                    <div className="space-y-3 ml-6">
                      {category.featuredItems?.map((featuredItem) => (
                        <div
                          key={featuredItem.id}
                          className="group flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50/50 to-amber-50/50 rounded-lg border border-yellow-200/50 hover:border-yellow-300 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-yellow-200">
                              <Image
                                src={featuredItem.image || "/placeholder.svg"}
                                alt={featuredItem.title}
                                fill
                                sizes="(max-width: 48px) 100vw, 48px"
                                className="object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg"
                                }}
                              />
                            </div>
                            <div>
                              <h6 className="text-sm font-semibold text-yellow-900">{featuredItem.title}</h6>
                              <p className="text-xs text-yellow-700 font-medium">${featuredItem.price}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-yellow-100 hover:text-yellow-700"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!category.featuredItems || category.featuredItems.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm italic">No featured items yet. Add your first featured item above.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
        {categories.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No categories yet</h3>
            <p className="text-sm">Create your first category to get started with menu management.</p>
          </div>
        )}
      </div>
    </div>
  )
}




/*
    // Simulate API call
    setTimeout(() => {
      setCategories([
        {
          _id: "1",
          title: "Marketing & Sales",
          slug: "marketing-sales",
          featuredItems: [
            {
              id: "1",
              title: "Catalogs",
              price: 1000,
              image: "/placeholder.svg?height=100&width=100",
              slug: "catalogs",
              categoryId: "1",
            },
            {
              id: "2",
              title: "Flyers",
              price: 1999,
              image: "/placeholder.svg?height=100&width=100",
              slug: "flyers",
              categoryId: "1",
            },
          ],
          items: [
            {
              _id: "1",
              title: "Catalogs",
              slug: "catalogs",
              description: "All the catalogs we have",
              image: "/placeholder.svg?height=50&width=50",
              categoryId: "1",
            },
            {
              _id: "2",
              title: "Leaflets",
              slug: "leaflets",
              description: "All the leaflets we have",
              image: "/placeholder.svg?height=50&width=50",
              categoryId: "1",
            },
          ],
        },
        {
          _id: "2",
          title: "Design Services",
          slug: "design-services",
          featuredItems: [
            {
              id: "3",
              title: "3D Modeling",
              price: 299,
              image: "/placeholder.svg?height=100&width=100",
              slug: "3d-modeling",
              categoryId: "2",
            },
          ],
          items: [],
        },
      ]

*/