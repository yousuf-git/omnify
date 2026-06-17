// import express from "express";
// import multer from "multer";
// import {
//   createLogisticsProviderCategory,
//   deleteLogisticsProviderCategory,
//   getLogisticsProviderCategoryById,
//   getLogisticsProviderCategories,
//   updateLogisticsProviderCategory,
// } from "../../controllers/logisticsProviderCategory/index.js";
// import { authenticateToken } from "../../middleware/auth.js";

// const upload = multer();
// const router = express.Router();

// router.get(
//   "/api/logistics-provider-categories",
//   authenticateToken,
//   getLogisticsProviderCategories
// );
// router.get(
//   "/api/logistics-provider-categories/:id",
//   authenticateToken,
//   getLogisticsProviderCategoryById
// );
// router.post(
//   "/api/logistics-provider-categories",
//   upload.none(),
//   authenticateToken,
//   createLogisticsProviderCategory
// );
// router.put(
//   "/api/logistics-provider-categories/:id",
//   authenticateToken,
//   updateLogisticsProviderCategory
// );
// router.delete(
//   "/api/logistics-provider-categories/:id",
//   authenticateToken,
//   deleteLogisticsProviderCategory
// );

// export default router;


import express from "express";
import multer from "multer";
import {
  createLogisticsProviderCategory,
  softDeleteLogisticsProviderCategory,
  hardDeleteLogisticsProviderCategory,
  restoreLogisticsProviderCategory,
  getLogisticsProviderCategoryById,
  getLogisticsProviderCategories,
  updateLogisticsProviderCategory,
} from "../../controllers/logisticsProviderCategory/index.js";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get(
  "/api/logistics-provider-categories",
  authenticateToken,
  getLogisticsProviderCategories
);
router.get(
  "/api/logistics-provider-categories/:id",
  authenticateToken,
  getLogisticsProviderCategoryById
);
router.post(
  "/api/logistics-provider-categories",
  upload.none(),
  authenticateToken,
  createLogisticsProviderCategory
);
router.put(
  "/api/logistics-provider-categories/:id",
  authenticateToken,
  updateLogisticsProviderCategory
);

// Soft delete (toggle active status)
router.patch(
  "/api/logistics-provider-categories/:id/soft-delete",
  authenticateToken,
  softDeleteLogisticsProviderCategory
);

// Hard delete (permanent delete)
router.delete(
  "/api/logistics-provider-categories/:id/hard-delete",
  authenticateToken,
  hardDeleteLogisticsProviderCategory
);

// Restore soft deleted category
router.patch(
  "/api/logistics-provider-categories/:id/restore",
  authenticateToken,
  restoreLogisticsProviderCategory
);

export default router;