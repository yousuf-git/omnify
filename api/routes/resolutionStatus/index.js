// import express from "express";
// import {
//   createResolutionStatus,
//   deleteResolutionStatus,
//   getResolutionStatusById,
//   getResolutionStatuses,
//   updateResolutionStatus,
// } from "../../controllers/resolutionStatus/index.js";
// import multer from "multer";
// import { authenticateToken } from "../../middleware/auth.js";

// const upload = multer();
// const router = express.Router();

// router.get("/api/resolution-status", authenticateToken,getResolutionStatuses);
// router.get("/api/resolution-status/:id", authenticateToken,getResolutionStatusById);
// router.post("/api/resolution-status", upload.none(), authenticateToken,createResolutionStatus);
// router.put("/api/resolution-status/:id", authenticateToken,updateResolutionStatus);
// router.delete("/api/resolution-status/:id", authenticateToken,deleteResolutionStatus);

// export default router;

import express from "express";
import {
  createResolutionStatus,
  softDeleteResolutionStatus,
  hardDeleteResolutionStatus,
  restoreResolutionStatus,
  getResolutionStatusById,
  getResolutionStatuses,
  updateResolutionStatus,
} from "../../controllers/resolutionStatus/index.js";
import multer from "multer";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/resolution-status", authenticateToken, getResolutionStatuses);
router.get("/api/resolution-status/:id", authenticateToken, getResolutionStatusById);
router.post("/api/resolution-status", upload.none(), authenticateToken, createResolutionStatus);
router.put("/api/resolution-status/:id", authenticateToken, updateResolutionStatus);

// Soft delete (toggle active status)
router.patch("/api/resolution-status/:id/soft-delete", authenticateToken, softDeleteResolutionStatus);

// Hard delete (permanent delete)
router.delete("/api/resolution-status/:id/hard-delete", authenticateToken, hardDeleteResolutionStatus);

// Restore soft deleted resolution status
router.patch("/api/resolution-status/:id/restore", authenticateToken, restoreResolutionStatus);

export default router;