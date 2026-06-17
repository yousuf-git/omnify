import { Tenant } from "../../models/tenant.js";

// GET /api/tenant — the current user's company (profile + settings).
export const getCurrentTenant = async (req, res) => {
  try {
    if (!req.user?.tenantId) {
      return res.status(404).json({ message: "No company associated with this account" });
    }
    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) return res.status(404).json({ message: "Company not found" });
    res.json(tenant);
  } catch (error) {
    console.error("Get current tenant error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /api/tenant/settings — update the current company's settings (admin only).
export const updateCurrentTenantSettings = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) return res.status(404).json({ message: "Company not found" });

    const incoming = req.body || {};
    const current = tenant.settings?.toObject?.() ?? tenant.settings ?? {};
    tenant.settings = {
      ...current,
      ...incoming,
      profile: { ...(current.profile || {}), ...(incoming.profile || {}) },
      branding: { ...(current.branding || {}), ...(incoming.branding || {}) },
      localization: { ...(current.localization || {}), ...(incoming.localization || {}) },
    };
    if (typeof incoming.tenantName === "string" && incoming.tenantName.trim()) {
      tenant.tenantName = incoming.tenantName.trim();
    }
    await tenant.save();

    res.json({ message: "Settings updated successfully", tenant });
  } catch (error) {
    console.error("Update tenant settings error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
