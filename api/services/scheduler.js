import cron from "node-cron";
import ItemStockRecord from "../models/itemStockRecord.js";
import { Tenant } from "../models/tenant.js";
import { runWithTenant } from "../src/context/tenantContext.js";

// Roll a single tenant's stock records into a new financial year:
// close the current records and open new ones carrying remaining stock forward.
async function rolloverTenant(tenantId) {
  await runWithTenant({ tenantId }, async () => {
    const allRecords = await ItemStockRecord.find();

    for (const record of allRecords) {
      const currentRemaining = record.remainingStock;
      record.closingStock = currentRemaining;
      await record.save();

      const newRecord = new ItemStockRecord({
        itemId: record.itemId,
        openingStock: currentRemaining,
        remainingStock: currentRemaining,
        closingStock: 0, // set at next year's rollover
        transactions: [], // fresh for the new year
      });
      await newRecord.save();
    }
  });
}

// Runs daily; each tenant rolls over on the last day of the month preceding its
// financial-year start month (e.g. fyStartMonth=4 → rollover on 31 March).
cron.schedule("59 23 * * *", async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isLastDayOfMonth = tomorrow.getDate() === 1;
    if (!isLastDayOfMonth) return;

    const currentMonth = now.getMonth() + 1; // 1-12

    const tenants = await Tenant.find({ isActive: true });
    for (const tenant of tenants) {
      const fyStartMonth = tenant.settings?.localization?.fyStartMonth || 4;
      const fyEndMonth = fyStartMonth === 1 ? 12 : fyStartMonth - 1;
      if (currentMonth !== fyEndMonth) continue;

      try {
        await rolloverTenant(tenant._id);
      } catch (err) {
        console.error(`Error rolling over stock for tenant ${tenant._id}:`, err);
      }
    }
  } catch (error) {
    console.error("Error in yearly stock rollover scheduler:", error);
  }
});

// Sandbox cleanup: every 2 hours, delete expired sandbox session data + records.
// Canonical seed (_expiresAt = null) is never touched.
import { purgeExpiredSandbox } from "../controllers/sandbox/index.js";
cron.schedule("0 */2 * * *", async () => {
  try {
    const result = await purgeExpiredSandbox();
    if (result.docs || result.sessions) {
      console.log(`[sandbox] purged ${result.docs} docs, ${result.sessions} sessions`);
    }
  } catch (err) {
    console.error("Error in sandbox purge scheduler:", err);
  }
});
