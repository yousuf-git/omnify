// Seeds the canonical sandbox data (_isSeed:true, never expires) into the
// dedicated sandbox DB. Idempotent: clears existing seed first.
//   node scripts/seedSandbox.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { SEED } from "../services/sandboxSeedData.js";
import { RESOURCE_ORDER, REF_GRAPH } from "../src/sandbox/maps.js";
import { sbModelFor } from "../src/sandbox/sandboxDb.js";

dotenv.config();
const { ObjectId } = mongoose.Types;

async function run() {
  const uri =
    process.env.SANDBOX_SEED_MONGO_URI ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/ims";
  await mongoose.connect(uri);
  console.log(`Connected. Seeding sandbox DB "${process.env.SANDBOX_DB_NAME || "sandbox_ims"}"`);

  // Allocate a stable ObjectId per seed key across all resources.
  const keyMap = new Map();
  for (const key of RESOURCE_ORDER) {
    for (const doc of SEED[key] || []) keyMap.set(doc.key, new ObjectId());
  }

  const resolve = (val, array) => {
    if (val == null) return val;
    if (array) {
      const arr = Array.isArray(val) ? val : [val];
      return arr.map((k) => keyMap.get(k) || k);
    }
    return keyMap.get(val) || val;
  };

  let total = 0;
  for (const key of RESOURCE_ORDER) {
    const Model = sbModelFor(key);
    if (!Model) continue;
    const refs = REF_GRAPH[key] || [];
    const docs = (SEED[key] || []).map((src) => {
      const d = { ...src };
      const _id = keyMap.get(d.key);
      delete d.key;
      for (const r of refs) {
        if (d[r.field] == null) continue;
        d[r.field] = resolve(d[r.field], r.array);
      }
      return { ...d, _id, _isSeed: true, _sbSession: null, _expiresAt: null };
    });

    await Model.deleteMany({ _isSeed: true });
    if (docs.length) await Model.insertMany(docs, { ordered: false });
    console.log(`  ${key}: ${docs.length}`);
    total += docs.length;
  }

  console.log(`\nDone. ${total} canonical seed docs across ${RESOURCE_ORDER.length} collections.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
