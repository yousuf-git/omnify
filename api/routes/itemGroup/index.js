// import express from "express";
// import multer from "multer";
// import {
//   createItemGroup,
//   deleteItemGroup,
//   getItemGroupById,
//   getItemGroups,
//   updateItemGroup,
// } from "../../controllers/itemGroup/index.js";
// import { authenticateToken } from "../../middleware/auth.js";

// const upload = multer();
// const router = express.Router();

// router.get("/api/item-groups", authenticateToken,getItemGroups);
// router.get("/api/item-groups/:id", authenticateToken,getItemGroupById);
// router.post("/api/item-groups", upload.none(), authenticateToken,createItemGroup);
// router.put("/api/item-groups/:id", authenticateToken,updateItemGroup);
// router.delete("/api/item-groups/:id", authenticateToken,deleteItemGroup);

// export default router;


import express from "express";
import multer from "multer";
import {
  createItemGroup,
  softDeleteItemGroup,
  hardDeleteItemGroup,
  restoreItemGroup,
  getItemGroupById,
  getItemGroups,
  updateItemGroup,
} from "../../controllers/itemGroup/index.js";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/item-groups", authenticateToken, getItemGroups);
router.get("/api/item-groups/:id", authenticateToken, getItemGroupById);
router.post("/api/item-groups", upload.none(), authenticateToken, createItemGroup);
router.put("/api/item-groups/:id", authenticateToken, updateItemGroup);

// Soft delete (toggle active status)
router.patch("/api/item-groups/:id/soft-delete", authenticateToken, softDeleteItemGroup);

// Hard delete (permanent delete)
router.delete("/api/item-groups/:id/hard-delete", authenticateToken, hardDeleteItemGroup);

// Restore soft deleted item group
router.patch("/api/item-groups/:id/restore", authenticateToken, restoreItemGroup);

export default router;