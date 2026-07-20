import mongoose from "mongoose";
import { RESOURCE_TO_MODEL } from "./maps.js";

// Dedicated sandbox database on the SAME cluster — keeps the production DB pristine.
let conn = null;
export function sbConn() {
  if (!conn) {
    conn = mongoose.connection.useDb(process.env.SANDBOX_DB_NAME || "sandbox_ims", {
      useCache: true,
    });
  }
  return conn;
}

// Sandbox docs are flexible (strict:false) so any entity shape is stored without
// per-entity schema duplication. Meta fields carry session ownership + expiry.
const META = {
  _sbSession: { type: String, index: true, default: null }, // null = canonical seed
  _isSeed: { type: Boolean, default: false },
  _expiresAt: { type: Date, index: true, default: null }, // null = never expires (seed)
};

const modelCache = {};

// Sandbox model for a resource key (e.g. "items" -> sb_items collection).
export function sbModelFor(resourceKey) {
  const modelName = RESOURCE_TO_MODEL[resourceKey];
  if (!modelName) return null;
  if (modelCache[resourceKey]) return modelCache[resourceKey];

  const schema = new mongoose.Schema(META, {
    strict: false,
    timestamps: true,
    minimize: false,
    versionKey: false,
  });
  const collection = "sb_" + resourceKey.replace(/-/g, "_");
  modelCache[resourceKey] = sbConn().model("Sb_" + modelName, schema, collection);
  return modelCache[resourceKey];
}

// Session registry lives in the sandbox DB too (authoritative expiry).
let sessionModel = null;
export function sbSessionModel() {
  if (sessionModel) return sessionModel;
  const schema = new mongoose.Schema(
    {
      sessionId: { type: String, unique: true, index: true },
      profile: {
        name: String,
        email: String,
        role: String,
        company: String,
      },
      expiresAt: { type: Date, index: true },
    },
    { timestamps: true, versionKey: false }
  );
  sessionModel = sbConn().model("SbSession", schema, "sb_sessions");
  return sessionModel;
}
