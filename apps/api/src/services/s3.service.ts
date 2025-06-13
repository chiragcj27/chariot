import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const s3Service = {
  async getUploadUrl(fileName: string, fileType: string, folder: string) {
    try {
      const bucket = process.env.AWS_S3_BUCKET || "";
      const region = process.env.AWS_REGION || "";


      const key = `${folder}/${uuidv4()}-${fileName}`;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      return {
        uploadUrl,
        key,
        url: `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`,
      };
    } catch (error) {
      console.error("Error in getUploadUrl:", error);
      throw error;
    }
  },

  async getFileMetadata(key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET || "",
        Key: key,
      });

      const response = await s3Client.send(command);
      return {
        size: response.ContentLength,
        mimetype: response.ContentType,
        lastModified: response.LastModified,
      };
    } catch (error) {
      console.error('Error in getFileMetadata:', error);
      throw error;
    }
  },

  async deleteAsset(key: string) {
    try {
      const bucket = process.env.AWS_S3_BUCKET || "";
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await s3Client.send(command);
    } catch (error) {
      console.error('Error in deleteAsset:', error);
      throw error;
    }
  }
}; 