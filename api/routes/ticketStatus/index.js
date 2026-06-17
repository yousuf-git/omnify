// import express from "express";
// import {
//   createTicketStatus,
//   deleteTicketStatus,
//   getTicketStatusById,
//   getTicketStatuses,
//   updateTicketStatus,
// } from "../../controllers/ticketStatus/index.js";
// import multer from "multer";
// import { authenticateToken } from "../../middleware/auth.js";

// const upload = multer();
// const router = express.Router();

// router.get("/api/ticket-status", authenticateToken,getTicketStatuses);
// router.get("/api/ticket-status/:id", authenticateToken,getTicketStatusById);
// router.post("/api/ticket-status", upload.none(), authenticateToken,createTicketStatus);
// router.put("/api/ticket-status/:id", authenticateToken,updateTicketStatus);
// router.delete("/api/ticket-status/:id", authenticateToken,deleteTicketStatus);

// export default router;


import express from "express";
import {
  createTicketStatus,
  softDeleteTicketStatus,
  hardDeleteTicketStatus,
  restoreTicketStatus,
  getTicketStatusById,
  getTicketStatuses,
  updateTicketStatus,
} from "../../controllers/ticketStatus/index.js";
import multer from "multer";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/ticket-status", authenticateToken, getTicketStatuses);
router.get("/api/ticket-status/:id", authenticateToken, getTicketStatusById);
router.post("/api/ticket-status", upload.none(), authenticateToken, createTicketStatus);
router.put("/api/ticket-status/:id", authenticateToken, updateTicketStatus);

// Soft delete (toggle active status)
router.patch("/api/ticket-status/:id/soft-delete", authenticateToken, softDeleteTicketStatus);

// Hard delete (permanent delete)
router.delete("/api/ticket-status/:id/hard-delete", authenticateToken, hardDeleteTicketStatus);

// Restore soft deleted ticket status
router.patch("/api/ticket-status/:id/restore", authenticateToken, restoreTicketStatus);

export default router;