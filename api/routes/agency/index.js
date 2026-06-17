// import express from "express";
// import {
//   createAgency,
//   deleteAgency,
//   getAgencyById,
//   getAgencies,
//   updateAgency,
//   importAgencies,
// } from "../../controllers/agency/index.js";
// import multer from "multer";
// import { authenticateToken } from "../../middleware/auth.js";

// const upload = multer();
// const router = express.Router();

// router.get("/api/agency", authenticateToken, getAgencies);
// router.get("/api/agency/:id", authenticateToken,getAgencyById);
// router.post("/api/agency", upload.none(), authenticateToken,createAgency);
// router.put("/api/agency/:id", authenticateToken,updateAgency);
// router.delete("/api/agency/:id", authenticateToken,deleteAgency);
// router.post('/import',upload.none(), authenticateToken, importAgencies);
// export default router;

import express from "express";
import {
  createAgency,
  softDeleteAgency,
  hardDeleteAgency,
  restoreAgency,
  getAgencyById,
  getAgencies,
  updateAgency,
  importAgencies,
} from "../../controllers/agency/index.js";
import multer from "multer";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/agency", authenticateToken, getAgencies);
router.get("/api/agency/:id", authenticateToken, getAgencyById);
router.post("/api/agency", upload.none(), authenticateToken, createAgency);
router.put("/api/agency/:id", authenticateToken, updateAgency);

// Soft delete (toggle active status)
router.patch("/api/agency/:id/soft-delete", authenticateToken, softDeleteAgency);

// Hard delete (permanent delete)
router.delete("/api/agency/:id/hard-delete", authenticateToken, hardDeleteAgency);

// Restore soft deleted agency
router.patch("/api/agency/:id/restore", authenticateToken, restoreAgency);

router.post('/import', upload.none(), authenticateToken, importAgencies);

export default router;