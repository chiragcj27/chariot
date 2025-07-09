import { Request, Response } from "express";
import { Kit, KitImage } from "@chariot/db";
import { s3Service } from "../services/s3.service";
import mongoose from "mongoose";

export const kitController = {
    async createKit(req: Request, res: Response) {
        try {
            const { title, description, testimonials } = req.body;

            if (!title || !description) {
                return res.status(400).json({
                    message: "Title and description are required"
                });
            }

            // Create slug from title
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            // Check if kit with same slug already exists
            const existingKit = await Kit.findOne({ slug });
            if (existingKit) {
                return res.status(400).json({
                    message: "A kit with this title already exists"
                });
            }

            const kit = await Kit.create({
                title,
                slug,
                description,
                testimonials: testimonials || [],
                carouselImages: []
            });

            res.status(201).json({
                message: "Kit created successfully",
                kit
            });
        } catch (error) {
            console.error('Error in createKit:', error);
            res.status(500).json({
                message: "Error creating kit",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    },

    async saveKitImages(req: Request, res: Response) {
        try {
            const { kitId, images } = req.body;

            if (!kitId || !mongoose.Types.ObjectId.isValid(kitId)) {
                return res.status(400).json({
                    message: "Valid kit ID is required"
                });
            }

            if (!images || !Array.isArray(images)) {
                return res.status(400).json({
                    message: "Images array is required"
                });
            }

            const kit = await Kit.findById(kitId);
            if (!kit) {
                return res.status(404).json({
                    message: "Kit not found"
                });
            }

            const savedImages = [];
            let mainImageId = null;
            let thumbnailImageId = null;
            const carouselImageIds = [];

            for (const imageData of images) {
                const { filename, originalname, url, size, mimetype, isMain, isCarousel, isThumbnail } = imageData;

                const kitImage = await KitImage.create({
                    kitId: kit._id,
                    filename,
                    originalname,
                    url,
                    size,
                    mimetype,
                    status: 'uploaded',
                    imageType: 'kit',
                    isMain,
                    isCarousel,
                    isThumbnail
                });

                savedImages.push(kitImage);

                if (isMain) {
                    mainImageId = kitImage._id;
                } else if (isThumbnail) {
                    thumbnailImageId = kitImage._id;
                } else if (isCarousel) {
                    carouselImageIds.push(kitImage._id);
                }
            }

            // Update kit with image references
            const updateData: any = {};
            if (mainImageId) {
                updateData.mainImage = mainImageId;
            }
            if (thumbnailImageId) {
                updateData.thumbnail = thumbnailImageId;
            }
            if (carouselImageIds.length > 0) {
                updateData.carouselImages = carouselImageIds;
            }

            const updatedKit = await Kit.findByIdAndUpdate(
                kitId,
                updateData,
                { new: true }
            ).populate('mainImage').populate('thumbnail').populate('carouselImages');

            res.status(200).json({
                message: "Kit images saved successfully",
                kit: updatedKit,
                images: savedImages
            });
        } catch (error) {
            console.error('Error in saveKitImages:', error);
            res.status(500).json({
                message: "Error saving kit images",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    },

    async getAllKits(req: Request, res: Response) {
        try {
            const kits = await Kit.find()
                .populate('mainImage')
                .populate('thumbnail')
                .populate('carouselImages')
                .sort({ createdAt: -1 });

            res.status(200).json(kits);
        } catch (error) {
            console.error('Error in getAllKits:', error);
            res.status(500).json({
                message: "Error fetching kits",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    },

    async getKitBySlug(req: Request, res: Response) {
        try {
            const { slug } = req.params;

            const kit = await Kit.findOne({ slug })
                .populate('mainImage')
                .populate('thumbnail')
                .populate('carouselImages');

            if (!kit) {
                return res.status(404).json({
                    message: "Kit not found"
                });
            }

            res.status(200).json(kit);
        } catch (error) {
            console.error('Error in getKitBySlug:', error);
            res.status(500).json({
                message: "Error fetching kit",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    },

    async updateKit(req: Request, res: Response) {
        try {
            const { kitId } = req.params;
            const { title, description, testimonials } = req.body;

            if (!kitId || !mongoose.Types.ObjectId.isValid(kitId)) {
                return res.status(400).json({
                    message: "Invalid kit ID"
                });
            }

            const updateData: any = {};
            if (title) {
                updateData.title = title;
                updateData.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }
            if (description) updateData.description = description;
            if (testimonials) updateData.testimonials = testimonials;

            const kit = await Kit.findByIdAndUpdate(
                kitId!,
                updateData,
                { new: true }
            ).populate('mainImage').populate('thumbnail').populate('carouselImages');

            if (!kit) {
                return res.status(404).json({
                    message: "Kit not found"
                });
            }

            res.status(200).json({
                message: "Kit updated successfully",
                kit
            });
        } catch (error) {
            console.error('Error in updateKit:', error);
            res.status(500).json({
                message: "Error updating kit",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    },

    async deleteKit(req: Request, res: Response) {
        try {
            const { kitId } = req.params;

            if (!kitId || !mongoose.Types.ObjectId.isValid(kitId)) {
                return res.status(400).json({
                    message: "Invalid kit ID"
                });
            }

            const kit = await Kit.findById(kitId!);
            if (!kit) {
                return res.status(404).json({
                    message: "Kit not found"
                });
            }

            // Delete associated images from S3 and database
            const imagesToDelete = [];
            if (kit.thumbnail) {
                imagesToDelete.push(kit.thumbnail);
            }
            if (kit.mainImage) {
                imagesToDelete.push(kit.mainImage);
            }
            if (kit.carouselImages && kit.carouselImages.length > 0) {
                imagesToDelete.push(...kit.carouselImages);
            }

            // Delete images from S3 and database
            for (const imageId of imagesToDelete) {
                const image = await KitImage.findById(imageId);
                if (image) {
                    try {
                        await s3Service.deleteAsset(image.filename);
                    } catch (s3Error) {
                        console.error('Error deleting from S3:', s3Error);
                    }
                    await KitImage.findByIdAndDelete(imageId);
                }
            }

            await Kit.findByIdAndDelete(kitId!);

            res.status(200).json({
                message: "Kit deleted successfully"
            });
        } catch (error) {
            console.error('Error in deleteKit:', error);
            res.status(500).json({
                message: "Error deleting kit",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    },
};