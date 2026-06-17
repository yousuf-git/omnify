import express from "express";
import {
  createTicket,
  deleteTicket,
  getTicketById,
  getTickets,
  updateTicket,
  updateTicketResolution,
  getTicketsByType,
  getTicketPublicInfo,
} from "../../controllers/ticket/index.js";
import multer from "multer";
import { authenticateToken } from "../../middleware/auth.js";

const upload = multer();
const router = express.Router();

router.get("/api/ticket", authenticateToken,getTickets);
router.get("/api/ticket/:id", authenticateToken,getTicketById);
router.get("/api/ticket/type/:type", authenticateToken,getTicketsByType);
router.get("/api/ticket/:id/public",getTicketPublicInfo);
router.post("/api/ticket", upload.none(), authenticateToken,createTicket);
router.put("/api/ticket/:id", authenticateToken,updateTicket);
router.put("/api/ticket/:id/resolution", authenticateToken,updateTicketResolution);
router.delete("/api/ticket/:id", authenticateToken,deleteTicket);

export default router;