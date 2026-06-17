// import express from "express";
// import multer from "multer";
// import {
//   createWarehouse,
//   deleteWarehouse,
//   getWarehouseById,
//   getWarehouses,
//   updateWarehouse,
// } from "../../controllers/warehouse/index.js";
// import { authenticateToken } from "../../middleware/auth.js";

// const upload = multer();
// const router = express.Router();

// router.get("/api/warehouses", authenticateToken,getWarehouses);
// router.get("/api/warehouses/:id", authenticateToken,getWarehouseById);
// router.post("/api/warehouses", upload.none(), authenticateToken,createWarehouse);
// router.put("/api/warehouses/:id", authenticateToken,updateWarehouse);
// router.delete("/api/warehouses/:id", authenticateToken,deleteWarehouse);

// export default router;


import express from "express";
import multer from "multer";
import {
  createWarehouse,
  softDeleteWarehouse,
  hardDeleteWarehouse,
  restoreWarehouse,
  getWarehouseById,
  getWarehouses,
  updateWarehouse,
} from "../../controllers/warehouse/index.js";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/warehouses", authenticateToken, getWarehouses);
router.get("/api/warehouses/:id", authenticateToken, getWarehouseById);
router.post("/api/warehouses", upload.none(), authenticateToken, createWarehouse);
router.put("/api/warehouses/:id", authenticateToken, updateWarehouse);

// Soft delete (toggle active status)
router.patch("/api/warehouses/:id/soft-delete", authenticateToken, softDeleteWarehouse);

// Hard delete (permanent delete)
router.delete("/api/warehouses/:id/hard-delete", authenticateToken, hardDeleteWarehouse);

// Restore soft deleted warehouse
router.patch("/api/warehouses/:id/restore", authenticateToken, restoreWarehouse);

export default router;