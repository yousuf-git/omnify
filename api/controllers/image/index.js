import {
  generateUploadUrl,
  generateDownloadUrl,
  generateDeleteUrl,
  deleteObject,
  getPublicUrl
} from "../../src/config/s3.js";
import { getTenantId } from "../../src/context/tenantContext.js";

// Tenant-scoped upload prefix so each company's images are isolated in the bucket.
const imagePrefix = () => `images/${getTenantId() || "shared"}`;

// Get pre-signed URL for uploading image to S3
export const getUploadUrl = async (req, res) => {
  try {
    const { fileName, contentType = "image/jpeg" } = req.body;
    // fileName = fileName + extension

    // Validate input
    if (!fileName) {
      return res.status(400).json({ 
        message: "fileName is required" 
      });
    }

    // Validate content type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(contentType.toLowerCase())) {
      return res.status(400).json({ 
        message: "Invalid content type. Allowed types: " + allowedTypes.join(", ")
      });
    }

    // Generate unique key for the file
    const now = new Date();
    const datetime = now.toISOString().slice(0, 23);
    const uniqueKey = `${imagePrefix()}/${datetime}-${fileName}`;

    // Generate pre-signed URL for upload
    const uploadUrl = await generateUploadUrl(uniqueKey, contentType, 3600); // 1 hour expiry

    res.status(200).json({
      success: true,
      uploadUrl,
      key: uniqueKey,
      message: "Upload URL generated successfully"
    });

  } catch (error) {
    res.status(500).json({ 
      message: error.message + " - Error generating upload URL" 
    });
  }
};

// Get pre-signed URL for downloading/viewing image from S3
export const getDownloadUrl = async (req, res) => {
  try {
    const { key } = req.query;

    // Validate input
    if (!key) {
      return res.status(400).json({ 
        message: "S3 key is required as query parameter" 
      });
    }

    // key = `images/${key}`; // Assuming images are stored under 'images/' prefix
    // Generate pre-signed URL for download
    const downloadUrl = await generateDownloadUrl(key, 3600); // 1 hour expiry

    res.status(200).json({
      success: true,
      downloadUrl,
      key,
      message: "Download URL generated successfully"
    });

  } catch (error) {
    res.status(500).json({ 
      message: error.message + " - Error generating download URL" 
    });
  }
};

// Get multiple download URLs for an array of keys
export const getMultipleDownloadUrls = async (req, res) => {
  try {
    const { keys } = req.body;

    // Validate input
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ 
        message: "keys array is required and cannot be empty" 
      });
    }

    if (keys.length > 50) {
      return res.status(400).json({ 
        message: "Maximum 50 keys allowed per request" 
      });
    }

    // Generate download URLs for all keys
    const urlPromises = keys.map(async (key) => {
      try {
        const downloadUrl = await generateDownloadUrl(key, 3600);
        return { key, downloadUrl, success: true };
      } catch (error) {
        return { key, error: error.message, success: false };
      }
    });

    const results = await Promise.all(urlPromises);

    res.status(200).json({
      success: true,
      results,
      message: "Download URLs generated successfully"
    });

  } catch (error) {
    res.status(500).json({ 
      message: error.message + " - Error generating download URLs" 
    });
  }
};

// Get public URL (if bucket allows public access)
export const getPublicImageUrl = async (req, res) => {
  try {
    const { key } = req.query;

    // Validate input
    if (!key) {
      return res.status(400).json({ 
        message: "S3 key is required as query parameter" 
      });
    }

    const publicUrl = getPublicUrl(key);

    res.status(200).json({
      success: true,
      publicUrl,
      key,
      message: "Public URL generated successfully"
    });

  } catch (error) {
    res.status(500).json({ 
      message: error.message + " - Error generating public URL" 
    });
  }
};

// Get pre-signed URL for deleting image from S3
export const getDeleteUrl = async (req, res) => {
  try {
    const { key } = req.query;

    // Validate input
    if (!key) {
      return res.status(400).json({ 
        message: "S3 key is required as query parameter" 
      });
    }

    // Generate pre-signed URL for delete
    const deleteUrl = await generateDeleteUrl(key, 3600); // 1 hour expiry

    res.status(200).json({
      success: true,
      deleteUrl,
      key,
      message: "Delete URL generated successfully"
    });

  } catch (error) {
    res.status(500).json({ 
      message: error.message + " - Error generating delete URL" 
    });
  }
};

// Direct delete operation (server-side deletion)
export const deleteImage = async (req, res) => {
  try {
    const { key } = req.query;

    // Validate input
    if (!key) {
      return res.status(400).json({ 
        message: "S3 key is required as query parameter" 
      });
    }

    // Delete object from S3
    const result = await deleteObject(key);

    res.status(200).json({
      success: true,
      key,
      message: result.message
    });

  } catch (error) {
    res.status(500).json({ 
      message: error.message + " - Error deleting image" 
    });
  }
};

// Delete multiple images
export const deleteMultipleImages = async (req, res) => {
  try {
    const { keys } = req.body;

    // Validate input
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ 
        message: "keys array is required and cannot be empty" 
      });
    }

    if (keys.length > 50) {
      return res.status(400).json({ 
        message: "Maximum 50 keys allowed per request" 
      });
    }

    // Delete all images
    const deletePromises = keys.map(async (key) => {
      try {
        await deleteObject(key);
        return { key, success: true, message: "Deleted successfully" };
      } catch (error) {
        return { key, success: false, error: error.message };
      }
    });

    const results = await Promise.all(deletePromises);

    res.status(200).json({
      success: true,
      results,
      message: "Bulk delete operation completed"
    });

  } catch (error) {
    res.status(500).json({ 
      message: error.message + " - Error deleting images" 
    });
  }
};

// Get batch upload URLs for multiple files
export const getBatchUploadUrls = async (req, res) => {
  try {
    const { files } = req.body;

    // Validate input
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ 
        message: "files array is required and cannot be empty" 
      });
    }

    if (files.length > 20) {
      return res.status(400).json({ 
        message: "Maximum 20 files allowed per batch upload request" 
      });
    }

    // Validate each file
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    
    for (const file of files) {
      if (!file.fileName) {
        return res.status(400).json({ 
          message: "fileName is required for all files" 
        });
      }

      const contentType = file.contentType || "image/jpeg";
      if (!allowedTypes.includes(contentType.toLowerCase())) {
        return res.status(400).json({ 
          message: `Invalid content type for ${file.fileName}. Allowed types: ${allowedTypes.join(", ")}`
        });
      }
    }

    // Generate upload URLs for all files
    const urlPromises = files.map(async (file) => {
      try {
        // const fileExtension = file.fileName.split('.').pop();
        const now = new Date();
        const datetime = now.toISOString().slice(0, 23);
        const uniqueKey = `${imagePrefix()}/${datetime}-${file.fileName}`;
        const contentType = file.contentType || "image/jpeg";
        
        const uploadUrl = await generateUploadUrl(uniqueKey, contentType, 3600);
        
        return { 
          fileName: file.fileName,
          key: uniqueKey, 
          uploadUrl, 
          contentType,
          success: true 
        };
      } catch (error) {
        return { 
          fileName: file.fileName,
          error: error.message, 
          success: false 
        };
      }
    });

    const results = await Promise.all(urlPromises);

    res.status(200).json({
      success: true,
      results,
      message: "Batch upload URLs generated successfully"
    });

  } catch (error) {
    res.status(500).json({ 
      message: error.message + " - Error generating batch upload URLs" 
    });
  }
};