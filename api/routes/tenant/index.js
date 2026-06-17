import express from "express";
import { authenticateToken, requireRole } from "../../middleware/auth.js";
import { getCurrentTenant, updateCurrentTenantSettings } from "../../controllers/tenant/index.js";

const router = express.Router();

router.get("/api/tenant", authenticateToken, getCurrentTenant);
router.put("/api/tenant/settings", authenticateToken, requireRole(["admin"]), updateCurrentTenantSettings);

export default router;
