import express from "express";
import {
  createAssignedTo,
  getAssignedToList,
  getAssignedToById,
  updateAssignedTo,
  softDeleteAssignedTo,
  hardDeleteAssignedTo,
} from "../../controllers/assignedTo/index.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = express.Router();

// Create a new Assigned To
router.post("/api/assigned-to", authenticateToken, createAssignedTo);

// Get all Assigned To entries
router.get("/api/assigned-to", authenticateToken, getAssignedToList);

// Get Assigned To by ID
router.get("/api/assigned-to/:id", authenticateToken, getAssignedToById);

// Update Assigned To
router.put("/api/assigned-to/:id", authenticateToken, updateAssignedTo);

// Soft delete (toggle active status)
router.patch("/api/assigned-to/:id/soft-delete", authenticateToken, softDeleteAssignedTo);

// Hard delete (permanent delete)
router.delete("/api/assigned-to/:id/hard-delete", authenticateToken, hardDeleteAssignedTo);

export default router;
