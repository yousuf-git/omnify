import express from "express";
import multer from "multer";
import {
  getUploadUrl,
  getDownloadUrl,
  getMultipleDownloadUrls,
  getPublicImageUrl,
  getDeleteUrl,
  deleteImage,
  deleteMultipleImages,
  getBatchUploadUrls,
} from "../../controllers/image/index.js";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

// Generate pre-signed URL for uploading single image
router.post("/api/images/upload-url", upload.none(), authenticateToken,getUploadUrl);

// Generate pre-signed URLs for batch upload
router.post("/api/images/batch-upload-urls", upload.none(), authenticateToken,getBatchUploadUrls);

// Generate pre-signed URL for downloading/viewing single image (key as query param)
router.get("/api/images/download-url", authenticateToken,getDownloadUrl);

// Generate download URLs for multiple images
router.post("/api/images/download-urls", upload.none(), authenticateToken,getMultipleDownloadUrls);

// Get public URL for an image (key as query param)
router.get("/api/images/public-url", authenticateToken,getPublicImageUrl);

// Generate pre-signed URL for deleting single image (key as query param)
router.get("/api/images/delete-url", authenticateToken,getDeleteUrl);

// Direct server-side deletion of single image (key as query param)
router.delete("/api/images/delete", authenticateToken,deleteImage);

// Direct server-side deletion of multiple images (keys in request body)
router.delete("/api/images", upload.none(), authenticateToken,deleteMultipleImages);

// router.delete("/api/images/delete-multiple", upload.none(), deleteMultipleImages);

export default router;