import { Request, Response } from "express";
import { s3Service } from "../services/s3.service";

export const assetController = {
  async getUploadUrl(req: Request, res: Response) {
    try {
      const { fileName, fileType, folder } = req.body;

      if (!fileName || !fileType || !folder) {
        return res.status(400).json({
          message: "File name and file type are required"
        });
      }

      const uploadData = await s3Service.getUploadUrl(fileName, fileType, folder);
      res.status(200).json(uploadData);
    } catch (error) {
      console.error('Error in getUploadUrl:', error);
      res.status(500).json({
        message: "Error generating upload URL",
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      });
    }
  },

  async deleteAsset(req: Request, res: Response) {
    try {
      const { key } = req.body;
      const deleteResponse = await s3Service.deleteAsset(key);
      res.status(200).json({
        message: "Asset deleted successfully",
        deleteResponse
      });
    } catch (error) {
      console.error('Error in deleteAsset:', error);
      res.status(500).json({
        message: "Error deleting asset",
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      });
    }
  }

}; 