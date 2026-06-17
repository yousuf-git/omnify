import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// =============== Generate pre-signed URL for PUT (upload) ===============
export const generateUploadUrl = async (key, contentType = "image/jpeg", expiresIn = 3600) => {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return uploadUrl;
  } catch (error) {
    throw new Error(`Failed to generate upload URL: ${error.message}`);
  }
};

// ===============Generate pre-signed URL for GET (download/view) ===============
export const generateDownloadUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return downloadUrl;
  } catch (error) {
    throw new Error(`Failed to generate download URL: ${error.message}`);
  }
};

// =============== Generate pre-signed URL for DELETE ===============
export const generateDeleteUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const deleteUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return deleteUrl;
  } catch (error) {
    throw new Error(`Failed to generate delete URL: ${error.message}`);
  }
};

// =============== Direct delete operation (for server-side deletion) ===============
export const deleteObject = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return { success: true, message: `Object ${key} deleted successfully` };
  } catch (error) {
    throw new Error(`Failed to delete object: ${error.message}`);
  }
};

// Get public URL (if bucket policy allows public access)
export const getPublicUrl = (key) => {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
};

export { s3Client, BUCKET_NAME };