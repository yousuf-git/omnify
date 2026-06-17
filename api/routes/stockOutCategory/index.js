// import express from "express";
// import multer from "multer";
// import {
//   createSocketOutCategory,
//   deleteSocketOutCategory,
//   getSocketOutCategoryById,
//   getSocketOutCategories,
//   updateSocketOutCategory,
// } from "../../controllers/stockOutCategory/index.js";
// import { authenticateToken } from "../../middleware/auth.js";

// const upload = multer();
// const router = express.Router();

// router.get("/api/stock-out-categories", authenticateToken,getSocketOutCategories);
// router.get("/api/stock-out-categories/:id", authenticateToken,getSocketOutCategoryById);
// router.post("/api/stock-out-categories", upload.none(), authenticateToken,createSocketOutCategory);
// router.put("/api/stock-out-categories/:id", authenticateToken,updateSocketOutCategory);
// router.delete("/api/stock-out-categories/:id", authenticateToken,deleteSocketOutCategory);

// export default router;


import express from "express";
import multer from "multer";
import {
  createSocketOutCategory,
  softDeleteSocketOutCategory,
  hardDeleteSocketOutCategory,
  restoreSocketOutCategory,
  getSocketOutCategoryById,
  getSocketOutCategories,
  updateSocketOutCategory,
} from "../../controllers/stockOutCategory/index.js";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/stock-out-categories", authenticateToken, getSocketOutCategories);
router.get("/api/stock-out-categories/:id", authenticateToken, getSocketOutCategoryById);
router.post("/api/stock-out-categories", upload.none(), authenticateToken, createSocketOutCategory);
router.put("/api/stock-out-categories/:id", authenticateToken, updateSocketOutCategory);

// Soft delete (toggle active status)
router.patch("/api/stock-out-categories/:id/soft-delete", authenticateToken, softDeleteSocketOutCategory);

// Hard delete (permanent delete)
router.delete("/api/stock-out-categories/:id/hard-delete", authenticateToken, hardDeleteSocketOutCategory);

// Restore soft deleted stock out category
router.patch("/api/stock-out-categories/:id/restore", authenticateToken, restoreSocketOutCategory);

export default router;