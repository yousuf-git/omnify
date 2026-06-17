import express from "express";
import { authenticateToken, requireRole } from "../../middleware/auth.js";
import {
  listTenants,
  getTenant,
  createTenant,
  updateTenant,
  toggleTenant,
  platformOverview,
} from "../../controllers/admin/tenants/index.js";

const router = express.Router();

// All routes are platform super-admin only.
router.use(authenticateToken, requireRole(["superadmin"]));

router.get("/overview/stats", platformOverview);
router.get("/", listTenants);
router.post("/", createTenant);
router.get("/:id", getTenant);
router.put("/:id/toggle", toggleTenant);
router.put("/:id", updateTenant);

export default router;
