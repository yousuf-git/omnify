import express from "express";
import multer from "multer";
import {
  createItemStockRecord,
  deleteItemStockRecord,
  getItemStockRecordById,
  getItemStockRecords,
  updateItemStockRecord,
} from "../../controllers/itemStockRecord/index.js";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/item-stock-records", authenticateToken,getItemStockRecords);
router.get("/api/item-stock-records/:id", authenticateToken,getItemStockRecordById);
router.post("/api/item-stock-records", upload.none(), authenticateToken,createItemStockRecord);
router.put("/api/item-stock-records/:id", authenticateToken,updateItemStockRecord);
router.delete("/api/item-stock-records/:id", authenticateToken,deleteItemStockRecord);

export default router;
