import express from "express";
import multer from "multer";
import {
  createItem,
  softDeleteItem,
  hardDeleteItem,
  restoreItem,
  getItem,
  getItemById,
  updateItem,
} from "../../controllers/item/index.js";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/items", authenticateToken, getItem);
router.get("/api/items/:id", authenticateToken, getItemById);
router.post("/api/items", upload.none(), authenticateToken, createItem);
router.put("/api/items/:id", authenticateToken, updateItem);

// Soft delete (toggle active status)
router.patch("/api/items/:id/soft-delete", authenticateToken, softDeleteItem);

// Hard delete (permanent delete)
router.delete("/api/items/:id/hard-delete", authenticateToken, hardDeleteItem);

// Restore soft deleted item
router.patch("/api/items/:id/restore", authenticateToken, restoreItem);

export default router;