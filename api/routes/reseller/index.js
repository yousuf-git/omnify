// import express from "express";
// import multer from "multer";
// import {
//   createReseller,
//   deleteReseller,
//   getResellerById,
//   getResellers,
//   updateReseller,
// } from "../../controllers/reseller/index.js";
// import { authenticateToken } from "../../middleware/auth.js";

// const upload = multer();
// const router = express.Router();

// router.get("/api/resellers", authenticateToken,getResellers);
// router.get("/api/resellers/:id", authenticateToken,getResellerById);
// router.post("/api/resellers", upload.none(), authenticateToken,createReseller);
// router.put("/api/resellers/:id", authenticateToken,updateReseller);
// router.delete("/api/resellers/:id", authenticateToken,deleteReseller);

// export default router;


import express from "express";
import multer from "multer";
import {
  createReseller,
  softDeleteReseller,
  hardDeleteReseller,
  restoreReseller,
  getResellerById,
  getResellers,
  updateReseller,
} from "../../controllers/reseller/index.js";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/resellers", authenticateToken, getResellers);
router.get("/api/resellers/:id", authenticateToken, getResellerById);
router.post("/api/resellers", upload.none(), authenticateToken, createReseller);
router.put("/api/resellers/:id", authenticateToken, updateReseller);

// Soft delete (toggle active status)
router.patch("/api/resellers/:id/soft-delete", authenticateToken, softDeleteReseller);

// Hard delete (permanent delete)
router.delete("/api/resellers/:id/hard-delete", authenticateToken, hardDeleteReseller);

// Restore soft deleted reseller
router.patch("/api/resellers/:id/restore", authenticateToken, restoreReseller);

export default router;