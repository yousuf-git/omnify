// import express from "express";
// import multer from "multer";
// import {
//   createSocketInCategory,
//   deleteSocketInCategory,
//   getSocketInCategoryById,
//   getSocketInCategories,
//   updateSocketInCategory,
// } from "../../controllers/stockInCategory/index.js";
// import { authenticateToken } from "../../middleware/auth.js";

// const upload = multer();
// const router = express.Router();

// router.get("/api/stock-in-categories", authenticateToken,getSocketInCategories);
// router.get("/api/stock-in-categories/:id", authenticateToken,getSocketInCategoryById);
// router.post("/api/stock-in-categories", upload.none(), authenticateToken,createSocketInCategory);
// router.put("/api/stock-in-categories/:id", authenticateToken,updateSocketInCategory);
// router.delete("/api/stock-in-categories/:id", authenticateToken,deleteSocketInCategory);

// export default router;


import express from "express";
import multer from "multer";
import {
  createSocketInCategory,
  softDeleteSocketInCategory,
  hardDeleteSocketInCategory,
  restoreSocketInCategory,
  getSocketInCategoryById,
  getSocketInCategories,
  updateSocketInCategory,
} from "../../controllers/stockInCategory/index.js";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/stock-in-categories", authenticateToken, getSocketInCategories);
router.get("/api/stock-in-categories/:id", authenticateToken, getSocketInCategoryById);
router.post("/api/stock-in-categories", upload.none(), authenticateToken, createSocketInCategory);
router.put("/api/stock-in-categories/:id", authenticateToken, updateSocketInCategory);

// Soft delete (toggle active status)
router.patch("/api/stock-in-categories/:id/soft-delete", authenticateToken, softDeleteSocketInCategory);

// Hard delete (permanent delete)
router.delete("/api/stock-in-categories/:id/hard-delete", authenticateToken, hardDeleteSocketInCategory);

// Restore soft deleted stock in category
router.patch("/api/stock-in-categories/:id/restore", authenticateToken, restoreSocketInCategory);

export default router;