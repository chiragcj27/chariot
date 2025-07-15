"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "../ui/switch"
import { toast } from "sonner"
import { Loader2, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Banner {
    _id: string;
    url: string;
    redirectUrl: string;
    deviceType: 'desktop' | 'mobile' | 'both';
    rotationOrder: number;
    isActive: boolean;
    filename: string;
}

export default function BannerSettings() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [redirectUrl, setRedirectUrl] = useState("");
    const [deviceType, setDeviceType] = useState<'desktop' | 'mobile' | 'both'>('both');

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/landing/banners`);
            if (!response.ok) throw new Error('Failed to fetch banners');
            const data = await response.json();
            setBanners(data);
        } catch (error) {
            toast.error("Failed to fetch banners");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select a file first");
            return;
        }

        try {
            setUploading(true);
            // First get the upload URL
            const uploadResponse = await fetch(`${API_URL}/assets/upload-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName: selectedFile.name,
                    fileType: selectedFile.type,
                    folder: 'banners'
                })
            });
            
            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.message || 'Failed to get upload URL');
            }
            const uploadData = await uploadResponse.json();
            
            if (!uploadData.uploadUrl || !uploadData.key || !uploadData.url) {
                throw new Error('Invalid upload response data');
            }

            // Upload to S3
            await fetch(uploadData.uploadUrl, {
                method: 'PUT',
                body: selectedFile,
                headers: {
                    'Content-Type': selectedFile.type,
                },
            });

            // Calculate the next rotation order
            const nextRotationOrder = banners.length > 0 
                ? Math.max(...banners.map(b => b.rotationOrder)) + 1 
                : 0;

            // Create banner record
            const bannerResponse = await fetch(`${API_URL}/landing/banners`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: uploadData.key,
                    originalname: selectedFile.name,
                    url: uploadData.url,
                    size: selectedFile.size,
                    mimetype: selectedFile.type,
                    redirectUrl,
                    deviceType,
                    rotationOrder: nextRotationOrder,
                    isActive: true
                })
            });

            if (!bannerResponse.ok) {
                const errorData = await bannerResponse.json();
                throw new Error(errorData.message || 'Failed to create banner');
            }
            const bannerData = await bannerResponse.json();
            
            setBanners([...banners, bannerData]);
            toast.success("Banner uploaded successfully");
            
            // Reset form
            setSelectedFile(null);
            setRedirectUrl("");
            setDeviceType('both');
        } catch (error) {
            toast.error("Failed to upload banner");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            // First get the banner details to get the filename
            const bannerToDelete = banners.find(banner => banner._id === id);
            if (!bannerToDelete) {
                throw new Error('Banner not found');
            }

            // Delete the banner from S3
            const deleteResponse = await fetch(`${API_URL}/assets/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    key: bannerToDelete.filename,
                })
            });
            if (!deleteResponse.ok) throw new Error('Failed to delete banner from S3');

            // Then delete the banner record
            const response = await fetch(`${API_URL}/landing/banners/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete banner');
            
            setBanners(banners.filter(banner => banner._id !== id));
            toast.success("Banner deleted successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete banner");
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`${API_URL}/landing/banners/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isActive: !currentStatus
                })
            });

            if (!response.ok) throw new Error('Failed to update banner status');
            
            setBanners(banners.map(banner => 
                banner._id === id ? { ...banner, isActive: !currentStatus } : banner
            ));
            toast.success(`Banner ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        } catch (error) {
            toast.error("Failed to update banner status");
        }
    };

    const handleReorder = async (id: string, direction: 'up' | 'down') => {
        const currentIndex = banners.findIndex(banner => banner._id === id);
        if (
            (direction === 'up' && currentIndex === 0) ||
            (direction === 'down' && currentIndex === banners.length - 1)
        ) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const newBanners = [...banners];
        const temp = newBanners[currentIndex];
        newBanners[currentIndex] = newBanners[newIndex];
        newBanners[newIndex] = temp;

        // Update rotation orders
        const updatedBanners = newBanners.map((banner, index) => ({
            ...banner,
            rotationOrder: index
        }));

        try {
            await Promise.all(
                updatedBanners.map(banner =>
                    fetch(`${API_URL}/landing/banners/${banner._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            rotationOrder: banner.rotationOrder
                        })
                    })
                )
            );
            setBanners(updatedBanners);
            toast.success("Banner order updated successfully");
        } catch (error) {
            toast.error("Failed to update banner order");
        }
    };

    return (
        <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Banner Settings
                    </CardTitle>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {banners.length} {banners.length === 1 ? 'Banner' : 'Banners'} Total
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <Tabs defaultValue="manage" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manage">Manage Banners</TabsTrigger>
                        <TabsTrigger value="upload">Upload New</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manage" className="space-y-6">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : banners.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center p-12 text-center space-y-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                            >
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                                    <Image 
                                        src="/empty-state.svg" 
                                        alt="No banners" 
                                        width={48} 
                                        height={48}
                                        className="opacity-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        No Banners Yet
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                                        Upload your first banner to get started. You can manage multiple banners and control their display order.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Active Banners
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Drag to reorder or use the arrow buttons
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
                                        <Select defaultValue="order">
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue placeholder="Sort by" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="order">Display Order</SelectItem>
                                                <SelectItem value="date">Upload Date</SelectItem>
                                                <SelectItem value="name">Name</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Separator />
                                <div className="grid gap-4">
                                    <AnimatePresence>
                                        {banners.map((banner) => (
                                            <motion.div 
                                                key={banner._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                                            >
                                                <div className="relative w-32 h-20 overflow-hidden rounded-lg">
                                                    <Image 
                                                        src={banner.url} 
                                                        alt="Banner preview" 
                                                        fill
                                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={cn(
                                                            "px-2 py-1 text-xs font-medium rounded-full",
                                                            banner.deviceType === 'both' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                                                            banner.deviceType === 'desktop' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                                                            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                                        )}>
                                                            {banner.deviceType}
                                                        </span>
                                                        <Switch
                                                            checked={banner.isActive}
                                                            onCheckedChange={() => handleToggleActive(banner._id, banner.isActive)}
                                                            className="data-[state=checked]:bg-blue-600"
                                                        />
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                        {banner.redirectUrl}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleReorder(banner._id, 'up')}
                                                        disabled={banners.findIndex(b => b._id === banner._id) === 0}
                                                        className="hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                    >
                                                        <ArrowUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleReorder(banner._id, 'down')}
                                                        disabled={banners.findIndex(b => b._id === banner._id) === banners.length - 1}
                                                        className="hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                    >
                                                        <ArrowDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(banner._id)}
                                                        className="hover:bg-red-50 dark:hover:bg-red-900/30"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="upload">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-2xl mx-auto space-y-6"
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Banner Image
                                    </Label>
                                    <div className="relative">
                                        <Input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Recommended size: 1920x600px. Max file size: 5MB
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Redirect URL
                                    </Label>
                                    <Input 
                                        type="url" 
                                        placeholder="https://example.com"
                                        value={redirectUrl}
                                        onChange={(e) => setRedirectUrl(e.target.value)}
                                        className="focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Device Type
                                    </Label>
                                    <Select 
                                        value={deviceType} 
                                        onValueChange={(value: 'desktop' | 'mobile' | 'both') => setDeviceType(value)}
                                    >
                                        <SelectTrigger className="focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                                            <SelectValue placeholder="Select device type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="both">Both Desktop & Mobile</SelectItem>
                                            <SelectItem value="desktop">Desktop Only</SelectItem>
                                            <SelectItem value="mobile">Mobile Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button 
                                onClick={handleUpload} 
                                disabled={!selectedFile || uploading}
                                className={cn(
                                    "w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                    "transform hover:scale-[1.02] active:scale-[0.98]"
                                )}
                            >
                                {uploading ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center justify-center"
                                    >
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </motion.div>
                                ) : (
                                    'Upload Banner'
                                )}
                            </Button>
                        </motion.div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}