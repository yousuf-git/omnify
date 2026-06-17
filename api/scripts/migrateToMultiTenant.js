// One-time migration: move the existing single-company data under one tenant.
// Run manually (after deploying the multi-tenant code):
//   node scripts/migrateToMultiTenant.js
//
// It creates the "Core Tech Solutions" tenant, stamps tenantId on every existing
// document and user, then rebuilds indexes (dropping old global-unique indexes and
// creating the new per-tenant compound unique indexes).
import "../src/bootstrap/registerPlugins.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../src/config/db.js";
import { Tenant } from "../models/tenant.js";

// Models whose unique indexes changed to per-tenant compound — need syncIndexes.
import { Item } from "../models/item.js";
import State from "../models/state.js";
import { Ticket } from "../models/ticket.js";
import { AssignedTo } from "../models/assignedTo.js";
import { User } from "../models/User.js";

dotenv.config();

const TENANT_NAME = "Core Tech Solutions";
const TENANT_SLUG = "core-tech-solutions";

// Collections that must NOT be stamped with a tenantId.
const SKIP_COLLECTIONS = new Set(["tenants", "counters"]);

async function run() {
  await connectDB();
  const db = mongoose.connection.db;

  // 1. Create (or reuse) the tenant.
  let tenant = await Tenant.findOne({ slug: TENANT_SLUG });
  if (!tenant) {
    tenant = await Tenant.create({
      tenantName: TENANT_NAME,
      slug: TENANT_SLUG,
      settings: { profile: { companyName: TENANT_NAME } },
    });
    console.log(`Created tenant "${TENANT_NAME}" (${tenant._id}).`);
  } else {
    console.log(`Tenant "${TENANT_NAME}" already exists (${tenant._id}).`);
  }

  // 2. Stamp tenantId on every data document missing one.
  const collections = await db.listCollections().toArray();
  for (const { name } of collections) {
    if (SKIP_COLLECTIONS.has(name)) continue;

    if (name === "users") {
      const r = await db.collection("users").updateMany(
        { role: { $ne: "superadmin" }, $or: [{ tenantId: { $exists: false } }, { tenantId: null }] },
        { $set: { tenantId: tenant._id } }
      );
      console.log(`users: stamped ${r.modifiedCount} document(s).`);
      continue;
    }

    const r = await db.collection(name).updateMany(
      { $or: [{ tenantId: { $exists: false } }, { tenantId: null }] },
      { $set: { tenantId: tenant._id } }
    );
    if (r.modifiedCount) console.log(`${name}: stamped ${r.modifiedCount} document(s).`);
  }

  // 3. Rebuild indexes (drops old global-unique, builds per-tenant compound unique).
  for (const Model of [Item, State, Ticket, AssignedTo, User]) {
    await Model.syncIndexes();
    console.log(`Synced indexes for ${Model.modelName}.`);
  }

  console.log("Migration complete.");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
