import { runWithTenant } from "../src/context/tenantContext.js";
import { TicketStatus } from "../models/ticketStatus.js";
import { ResolutionStatus } from "../models/resolutionStatus.js";
import { IssueType } from "../models/issueType.js";
import { DeliveryStatus } from "../models/deliveryStatus.js";
import { InstallationStatus } from "../models/installationStatus.js";
import { StockInCategory } from "../models/stockInCategory.js";
import { StockOutCategory } from "../models/stockOutCategory.js";
import { LogisticsProviderCategory } from "../models/logisticsProviderCategory.js";
import { AssignedTo } from "../models/assignedTo.js";

// Default master/config data every new company starts with, so the app is usable
// immediately after provisioning. Each entry is keyed by the field name the model uses.
const DEFAULTS = [
  [TicketStatus, "name", ["Open", "In Progress", "On Hold", "Resolved", "Closed"]],
  [ResolutionStatus, "resolutionStatusName", ["Pending", "Resolved", "Unresolved"]],
  [IssueType, "issueTypeName", ["Hardware", "Software", "Installation", "Other"]],
  [DeliveryStatus, "deliveryStatusName", ["Pending", "Dispatched", "Delivered", "Returned"]],
  [InstallationStatus, "installationStatusName", ["Pending", "Scheduled", "Installed", "Cancelled"]],
  [StockInCategory, "stockInCategoryName", ["Purchase", "Return", "Transfer In", "Opening Stock"]],
  [StockOutCategory, "stockOutCategoryName", ["Sale", "Transfer Out", "Damaged", "Return"]],
  [LogisticsProviderCategory, "logisticsProviderCategoryName", ["In-House", "Third Party Courier"]],
  [AssignedTo, "name", ["Unassigned"]],
];

// Seed default master data for a tenant. Idempotent: skips any model that already
// has rows for the tenant. Runs inside the tenant context so the plugin stamps tenantId.
export async function seedTenantDefaults(tenantId) {
  await runWithTenant({ tenantId }, async () => {
    for (const [Model, field, values] of DEFAULTS) {
      const existing = await Model.countDocuments();
      if (existing > 0) continue;
      const docs = values.map((v) => ({ [field]: v }));
      await Model.insertMany(docs);
    }
  });
}

export default seedTenantDefaults;
