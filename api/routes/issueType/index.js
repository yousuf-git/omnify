// import express from "express";
// import {
//   createIssueType,
//   deleteIssueType,
//   getIssueTypeById,
//   getIssueTypes,
//   updateIssueType,
// } from "../../controllers/issueType/index.js";
// import multer from "multer";
// import { authenticateToken } from "../../middleware/auth.js";

// const upload = multer();
// const router = express.Router();

// router.get("/api/issue-type", authenticateToken,getIssueTypes);
// router.get("/api/issue-type/:id", authenticateToken,getIssueTypeById);
// router.post("/api/issue-type", upload.none(), authenticateToken,createIssueType);
// router.put("/api/issue-type/:id", authenticateToken,updateIssueType);
// router.delete("/api/issue-type/:id", authenticateToken,deleteIssueType);

// export default router;


import express from "express";
import {
  createIssueType,
  softDeleteIssueType,
  hardDeleteIssueType,
  restoreIssueType,
  getIssueTypeById,
  getIssueTypes,
  updateIssueType,
} from "../../controllers/issueType/index.js";
import multer from "multer";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/issue-type", authenticateToken, getIssueTypes);
router.get("/api/issue-type/:id", authenticateToken, getIssueTypeById);
router.post("/api/issue-type", upload.none(), authenticateToken, createIssueType);
router.put("/api/issue-type/:id", authenticateToken, updateIssueType);

// Soft delete (toggle active status)
router.patch("/api/issue-type/:id/soft-delete", authenticateToken, softDeleteIssueType);

// Hard delete (permanent delete)
router.delete("/api/issue-type/:id/hard-delete", authenticateToken, hardDeleteIssueType);

// Restore soft deleted issue type
router.patch("/api/issue-type/:id/restore", authenticateToken, restoreIssueType);

export default router;