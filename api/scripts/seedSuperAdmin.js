// Seed the platform super-admin. Run manually:
//   node scripts/seedSuperAdmin.js
// Configure via env (or defaults below):
//   SUPERADMIN_NAME, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD
import "../src/bootstrap/registerPlugins.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../src/config/db.js";
import { User } from "../models/User.js";

dotenv.config();

const NAME = process.env.SUPERADMIN_NAME || "Platform Admin";
const EMAIL = (process.env.SUPERADMIN_EMAIL || "superadmin@omnify.app").toLowerCase();
const PASSWORD = process.env.SUPERADMIN_PASSWORD || "ChangeMe123!";

async function run() {
  await connectDB();

  const existing = await User.findOne({ email: EMAIL });
  if (existing) {
    if (existing.role !== "superadmin") {
      existing.role = "superadmin";
      existing.tenantId = null;
      await existing.save();
      console.log(`Updated existing user ${EMAIL} to superadmin.`);
    } else {
      console.log(`Super-admin ${EMAIL} already exists. Nothing to do.`);
    }
  } else {
    await User.create({
      name: NAME,
      email: EMAIL,
      password: PASSWORD,
      role: "superadmin",
      tenantId: null,
    });
    console.log(`Created super-admin: ${EMAIL}`);
    if (!process.env.SUPERADMIN_PASSWORD) {
      console.log("WARNING: used default password 'ChangeMe123!' — change it immediately.");
    }
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed super-admin failed:", err);
  process.exit(1);
});
