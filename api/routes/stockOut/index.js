import express from "express";
import multer from "multer";
import {
  createStockOut,
  deleteStockOut,
  getStockOutById,
  getStockOuts,
  updateStockOut,
} from "../../controllers/stockOut/index.js";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/stock-outs", authenticateToken,getStockOuts);
router.get("/api/stock-outs/:id", authenticateToken,getStockOutById);
router.post("/api/stock-outs", upload.none(), authenticateToken,createStockOut);
router.put("/api/stock-outs/:id", authenticateToken,updateStockOut);
router.delete("/api/stock-outs/:id", authenticateToken,deleteStockOut);

export default router;
