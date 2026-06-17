// import express from "express";
// import multer from "multer";
// import {
//   createStore,
//   deleteStore,
//   getStoreById,
//   getStores,
//   getStoresByPartyId,
//   importStores,
//   updateStore,
// } from "../../controllers/store/index.js";
// import { authenticateToken } from "../../middleware/auth.js";

// const upload = multer();
// const router = express.Router();

// router.get("/api/stores", authenticateToken,getStores);
// router.get("/api/stores/:id", authenticateToken,getStoreById);
// router.get("/api/storeByPartyId/:id", authenticateToken,getStoresByPartyId)
// router.post("/api/stores", upload.none(), authenticateToken,createStore);
// router.put("/api/stores/:id", authenticateToken,updateStore);
// router.post('/import',upload.none(), authenticateToken, importStores);
// router.delete("/api/stores/:id", authenticateToken,deleteStore);

// export default router;


import express from "express";
import multer from "multer";
import {
  createStore,
  softDeleteStore,
  hardDeleteStore,
  restoreStore,
  getStoreById,
  getStores,
  getStoresByPartyId,
  importStores,
  updateStore,
} from "../../controllers/store/index.js";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/stores", authenticateToken, getStores);
router.get("/api/stores/:id", authenticateToken, getStoreById);
router.get("/api/storeByPartyId/:id", authenticateToken, getStoresByPartyId);
router.post("/api/stores", upload.none(), authenticateToken, createStore);
router.put("/api/stores/:id", authenticateToken, updateStore);
router.post('/import', upload.none(), authenticateToken, importStores);

// Soft delete (toggle active status)
router.patch("/api/stores/:id/soft-delete", authenticateToken, softDeleteStore);

// Hard delete (permanent delete)
router.delete("/api/stores/:id/hard-delete", authenticateToken, hardDeleteStore);

// Restore soft deleted store
router.patch("/api/stores/:id/restore", authenticateToken, restoreStore);

export default router;