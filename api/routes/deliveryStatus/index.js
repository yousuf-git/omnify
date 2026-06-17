// import express from "express";
// import {
//   createDeliveryStatus,
//   deleteDeliveryStatus,
//   getDeliveryStatusById,
//   getDeliveryStatuses,
//   updateDeliveryStatus,
// } from "../../controllers/deliveryStatus/index.js";
// import multer from "multer";
// import { authenticateToken } from "../../middleware/auth.js";

// const upload = multer();
// const router = express.Router();

// router.get("/api/delivery-status", authenticateToken,getDeliveryStatuses);
// router.get("/api/delivery-status/:id", authenticateToken,getDeliveryStatusById);
// router.post("/api/delivery-status", upload.none(), authenticateToken,createDeliveryStatus);
// router.put("/api/delivery-status/:id", authenticateToken,updateDeliveryStatus);
// router.delete("/api/delivery-status/:id", authenticateToken,deleteDeliveryStatus);

// export default router;


import express from "express";
import {
  createDeliveryStatus,
  softDeleteDeliveryStatus,
  hardDeleteDeliveryStatus,
  restoreDeliveryStatus,
  getDeliveryStatusById,
  getDeliveryStatuses,
  updateDeliveryStatus,
} from "../../controllers/deliveryStatus/index.js";
import multer from "multer";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/delivery-status", authenticateToken, getDeliveryStatuses);
router.get("/api/delivery-status/:id", authenticateToken, getDeliveryStatusById);
router.post("/api/delivery-status", upload.none(), authenticateToken, createDeliveryStatus);
router.put("/api/delivery-status/:id", authenticateToken, updateDeliveryStatus);

// Soft delete (toggle active status)
router.patch("/api/delivery-status/:id/soft-delete", authenticateToken, softDeleteDeliveryStatus);

// Hard delete (permanent delete)
router.delete("/api/delivery-status/:id/hard-delete", authenticateToken, hardDeleteDeliveryStatus);

// Restore soft deleted delivery status
router.patch("/api/delivery-status/:id/restore", authenticateToken, restoreDeliveryStatus);

export default router;