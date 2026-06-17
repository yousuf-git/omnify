import { Tenant } from "../../../models/tenant.js";
import { User } from "../../../models/User.js";
import { seedTenantDefaults } from "../../../services/seedTenant.js";

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// GET /api/admin/tenants — list all companies with their user counts.
export const listTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });

    const counts = await User.aggregate([
      { $match: { tenantId: { $ne: null } } },
      { $group: { _id: "$tenantId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    const result = tenants.map((t) => ({
      ...t.toObject(),
      userCount: countMap.get(String(t._id)) || 0,
    }));

    res.json(result);
  } catch (error) {
    console.error("List tenants error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/admin/tenants/:id
export const getTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: "Company not found" });

    const userCount = await User.countDocuments({ tenantId: tenant._id });
    res.json({ ...tenant.toObject(), userCount });
  } catch (error) {
    console.error("Get tenant error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/admin/tenants — create a company, its first admin user, and seed defaults.
export const createTenant = async (req, res) => {
  try {
    const { tenantName, slug, adminName, adminEmail, adminPassword, settings } = req.body;

    if (!tenantName || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({
        message: "Company name, admin name, admin email and admin password are required",
      });
    }
    if (String(adminPassword).length < 6) {
      return res.status(400).json({ message: "Admin password must be at least 6 characters" });
    }

    const finalSlug = slugify(slug || tenantName);
    if (!finalSlug) {
      return res.status(400).json({ message: "Could not derive a valid company slug" });
    }

    const existingTenant = await Tenant.findOne({ slug: finalSlug });
    if (existingTenant) {
      return res.status(400).json({ message: "A company with this slug already exists" });
    }

    const existingUser = await User.findOne({ email: String(adminEmail).toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    const tenant = await Tenant.create({
      tenantName,
      slug: finalSlug,
      settings: {
        ...(settings || {}),
        profile: { companyName: tenantName, contactEmail: adminEmail, ...(settings?.profile || {}) },
      },
    });

    // Create the company's first admin (tenantId set explicitly — request runs in the
    // super-admin context which is unscoped).
    const admin = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      tenantId: tenant._id,
    });
    await admin.save();

    await seedTenantDefaults(tenant._id);

    res.status(201).json({
      message: "Company created successfully",
      tenant: tenant.toObject(),
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.error("Create tenant error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Company slug or admin email already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /api/admin/tenants/:id — update company name/active state/settings.
export const updateTenant = async (req, res) => {
  try {
    const { tenantName, isActive, settings } = req.body;
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: "Company not found" });

    if (typeof tenantName === "string") tenant.tenantName = tenantName;
    if (typeof isActive === "boolean") tenant.isActive = isActive;
    if (settings && typeof settings === "object") {
      tenant.settings = { ...tenant.settings.toObject?.() ?? tenant.settings, ...settings };
    }
    await tenant.save();

    res.json({ message: "Company updated successfully", tenant: tenant.toObject() });
  } catch (error) {
    console.error("Update tenant error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /api/admin/tenants/:id/toggle — enable/disable a company.
export const toggleTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: "Company not found" });

    tenant.isActive = !tenant.isActive;
    await tenant.save();

    res.json({
      message: `Company ${tenant.isActive ? "enabled" : "disabled"} successfully`,
      tenant: tenant.toObject(),
    });
  } catch (error) {
    console.error("Toggle tenant error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/admin/tenants/overview/stats — platform dashboard aggregates.
export const platformOverview = async (req, res) => {
  try {
    const [totalTenants, activeTenants, totalUsers] = await Promise.all([
      Tenant.countDocuments(),
      Tenant.countDocuments({ isActive: true }),
      User.countDocuments({ tenantId: { $ne: null } }),
    ]);

    const recentTenants = await Tenant.find().sort({ createdAt: -1 }).limit(5);

    const usersByTenant = await User.aggregate([
      { $match: { tenantId: { $ne: null } } },
      { $group: { _id: "$tenantId", count: { $sum: 1 } } },
    ]);

    res.json({
      totalTenants,
      activeTenants,
      disabledTenants: totalTenants - activeTenants,
      totalUsers,
      recentTenants,
      usersByTenant,
    });
  } catch (error) {
    console.error("Platform overview error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
