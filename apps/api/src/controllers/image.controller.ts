import { Request, Response } from "express";
import { s3Service } from "../services/s3.service";

export const imageController = {
  async getUploadUrl(req: Request, res: Response) {
    try {
      const { fileName, fileType } = req.body;

      if (!fileName || !fileType) {
        return res.status(400).json({
          message: "File name and file type are required"
        });
      }

      const uploadData = await s3Service.getUploadUrl(fileName, fileType);
      res.status(200).json(uploadData);
    } catch (error) {
      res.status(500).json({
        message: "Error generating upload URL",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },

}; 