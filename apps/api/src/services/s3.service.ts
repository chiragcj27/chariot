import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const s3Service = {
  async getUploadUrl(fileName: string, fileType: string) {
    const key = `${uuidv4()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || "",
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return {
      uploadUrl,
      key,
      url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  },

  async getFileMetadata(key: string) {
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
  }
}; 