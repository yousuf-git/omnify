import express from "express";
import multer from "multer";
import {
  checkStockItemStatusStockItem,
  createStockItem,
  deleteStockItem,
  getAvailableStockItems,
  getStockItemById,
  getStockItems,
  updateStockItem,
} from "../../controllers/stockItem/index.js";

import { checkStockOutStatus } from "../../controllers/stockItem/index.js";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/stock-items", authenticateToken,getStockItems);
router.get("/api/available-stock-items", authenticateToken,getAvailableStockItems);
router.get("/api/stock-items/check", authenticateToken,checkStockOutStatus);
router.get("/api/stock-items/:id", authenticateToken,getStockItemById);
router.post("/api/stock-items", upload.none(), authenticateToken,createStockItem);
router.put("/api/stock-items/:id", authenticateToken,updateStockItem);
router.delete("/api/stock-items/:id", authenticateToken,deleteStockItem);
router.get("/api/stock-items/check-by-id/:stockItemId", authenticateToken,checkStockItemStatusStockItem);

export default router;
