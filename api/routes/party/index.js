// import express from "express";
// import multer from "multer";
// import {
//   createParty,
//   deleteParty,
//   getPartyById,
//   getParties,
//   updateParty,
// } from "../../controllers/party/index.js";
// import { authenticateToken } from "../../middleware/auth.js";

// const upload = multer();
// const router = express.Router();

// router.get("/api/parties", authenticateToken,getParties);
// router.get("/api/parties/:id", authenticateToken,getPartyById);
// router.post("/api/parties", upload.none(), authenticateToken,createParty);
// router.put("/api/parties/:id", authenticateToken,updateParty);
// router.delete("/api/parties/:id", authenticateToken,deleteParty);

// export default router;


import express from "express";
import multer from "multer";
import {
  createParty,
  getPartyById,
  getParties,
  updateParty,
  softDeleteParty,
  hardDeleteParty,
  restoreParty,
  getDeletedParties,
  importParties,
} from "../../controllers/party/index.js";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

// Main routes
router.get("/api/parties", authenticateToken, getParties);
router.get("/api/parties/:id", authenticateToken, getPartyById);
router.post("/api/parties", upload.none(), authenticateToken, createParty);
router.put("/api/parties/:id", authenticateToken, updateParty);

// Delete operations
router.put("/api/parties/:id/soft-delete", authenticateToken, softDeleteParty);
router.delete("/api/parties/:id/hard-delete", authenticateToken, hardDeleteParty);
router.patch("/api/parties/:id/restore", authenticateToken, restoreParty);

// Deleted parties
router.get("/api/parties/trash/deleted", authenticateToken, getDeletedParties);

// Import
router.post("/api/parties/import", authenticateToken, importParties);

export default router;