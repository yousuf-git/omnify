// import express from "express";
// import multer from "multer";
// import {
//   getInstallationStatuses,
//   getInstallationStatusById,
//   createInstallationStatus,
//   updateInstallationStatus,
//   deleteInstallationStatus,
// } from "../../controllers/installationStatus/index.js";
// import { authenticateToken } from "../../middleware/auth.js";

// const upload = multer();
// const router = express.Router();

// router.get("/api/installation-status", authenticateToken,getInstallationStatuses);
// router.get("/api/installation-status/:id", authenticateToken,getInstallationStatusById);
// router.post(
//   "/api/installation-status",
//   upload.none(),
//   authenticateToken,
//   createInstallationStatus
// );
// router.put("/api/installation-status/:id", authenticateToken,updateInstallationStatus);
// router.delete("/api/installation-status/:id", authenticateToken,deleteInstallationStatus);

// export default router;



import express from "express";
import multer from "multer";
import {
  getInstallationStatuses,
  getInstallationStatusById,
  createInstallationStatus,
  updateInstallationStatus,
  softDeleteInstallationStatus,
  hardDeleteInstallationStatus,
  restoreInstallationStatus,
} from "../../controllers/installationStatus/index.js";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/installation-status", authenticateToken, getInstallationStatuses);
router.get("/api/installation-status/:id", authenticateToken, getInstallationStatusById);
router.post(
  "/api/installation-status",
  upload.none(),
  authenticateToken,
  createInstallationStatus
);
router.put("/api/installation-status/:id", authenticateToken, updateInstallationStatus);

// Soft delete (toggle active status)
router.patch("/api/installation-status/:id/soft-delete", authenticateToken, softDeleteInstallationStatus);

// Hard delete (permanent delete)
router.delete("/api/installation-status/:id/hard-delete", authenticateToken, hardDeleteInstallationStatus);

// Restore soft deleted installation status
router.patch("/api/installation-status/:id/restore", authenticateToken, restoreInstallationStatus);

export default router;