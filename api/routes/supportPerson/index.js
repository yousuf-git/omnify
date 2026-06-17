// import express from "express";
// import {
//   createSupportPerson,
//   deleteSupportPerson,
//   getSupportPersonById,
//   getSupportPersons,
//   importSupportPersons,
//   updateSupportPerson,
// } from "../../controllers/supportPerson/index.js";
// import multer from "multer";
// import { authenticateToken } from "../../middleware/auth.js";

// const upload = multer();
// const router = express.Router();

// router.get("/api/support-person", authenticateToken,getSupportPersons);
// router.get("/api/support-person/:id", authenticateToken,getSupportPersonById);
// router.post("/api/support-person", upload.none(), authenticateToken,createSupportPerson);
// router.put("/api/support-person/:id", authenticateToken,updateSupportPerson);
// router.delete("/api/support-person/:id", authenticateToken,deleteSupportPerson);
// router.post('/import',upload.none(), authenticateToken, importSupportPersons);
// export default router;


import express from "express";
import {
  createSupportPerson,
  softDeleteSupportPerson,
  hardDeleteSupportPerson,
  restoreSupportPerson,
  getSupportPersonById,
  getSupportPersons,
  updateSupportPerson,
  importSupportPersons,
} from "../../controllers/supportPerson/index.js";
import multer from "multer";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/support-person", authenticateToken, getSupportPersons);
router.get("/api/support-person/:id", authenticateToken, getSupportPersonById);
router.post("/api/support-person", upload.none(), authenticateToken, createSupportPerson);
router.put("/api/support-person/:id", authenticateToken, updateSupportPerson);

// Soft delete (toggle active status)
router.patch("/api/support-person/:id/soft-delete", authenticateToken, softDeleteSupportPerson);

// Hard delete (permanent delete)
router.delete("/api/support-person/:id/hard-delete", authenticateToken, hardDeleteSupportPerson);

// Restore soft deleted support person
router.patch("/api/support-person/:id/restore", authenticateToken, restoreSupportPerson);

router.post('/import', upload.none(), authenticateToken, importSupportPersons);

export default router;