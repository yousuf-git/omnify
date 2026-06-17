import mongoose from "mongoose";

// A Tenant is a company using Omnify. It lives ABOVE the per-tenant data, so it
// opts out of the global tenant plugin (skipTenantPlugin) and is managed only by
// the platform super-admin.
const tenantSchema = new mongoose.Schema(
  {
    tenantName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      profile: {
        companyName: { type: String, trim: true, default: "" },
        contactEmail: { type: String, trim: true, default: "" },
        phone: { type: String, trim: true, default: "" },
        address: { type: String, trim: true, default: "" },
        logoKey: { type: String, trim: true, default: "" },
      },
      branding: {
        primaryColor: { type: String, trim: true, default: "" },
      },
      localization: {
        currency: { type: String, trim: true, default: "INR" },
        dateFormat: { type: String, trim: true, default: "dd/MM/yyyy" },
        timezone: { type: String, trim: true, default: "Asia/Kolkata" },
        // Month (1-12) the financial year starts on; drives the stock rollover cron.
        fyStartMonth: { type: Number, min: 1, max: 12, default: 4 },
      },
    },
  },
  {
    timestamps: true,
    skipTenantPlugin: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Tenant = mongoose.model("Tenant", tenantSchema);
export default Tenant;
