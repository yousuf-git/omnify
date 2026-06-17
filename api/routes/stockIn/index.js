import express from "express";
import multer from "multer";
import {
  createStockIn,
  deleteStockIn,
  getStockInById,
  getStockIns,
  updateStockIn,
} from "../../controllers/stockIn/index.js";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/stock-ins", authenticateToken,getStockIns);
router.get("/api/stock-ins/:id", authenticateToken,getStockInById);
router.post("/api/stock-ins", upload.none(), authenticateToken,createStockIn);
router.put("/api/stock-ins/:id", authenticateToken,updateStockIn);
router.delete("/api/stock-ins/:id", authenticateToken,deleteStockIn);

export default router;
