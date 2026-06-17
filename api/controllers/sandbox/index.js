import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { sbModelFor, sbSessionModel } from "../../src/sandbox/sandboxDb.js";
import { signSandboxToken } from "../../middleware/sandboxAuth.js";
import { RESOURCE_ORDER, REF_GRAPH, RESOURCE_TO_MODEL } from "../../src/sandbox/maps.js";

const SESSION_HOURS = 6;
const { ObjectId } = mongoose.Types;

const remap = (val, map) => {
  if (val == null) return val;
  const mapped = map.get(String(val));
  return mapped || val;
};

// Clone every canonical seed doc (_isSeed) into a fresh, fully-mutable session copy.
// New _ids are generated and all cross-references are remapped so relations stay intact.
async function cloneSeedIntoSession(sessionId, expiresAt) {
  // Pass 1: load seed per resource, allocate new ids.
  const loaded = {}; // resourceKey -> [{doc, newId}]
  const idMap = new Map(); // String(oldId) -> new ObjectId
  for (const key of RESOURCE_ORDER) {
    const Model = sbModelFor(key);
    if (!Model) continue;
    const docs = await Model.find({ _isSeed: true }).lean();
    loaded[key] = docs.map((doc) => {
      const newId = new ObjectId();
      idMap.set(String(doc._id), newId);
      return { doc, newId };
    });
  }

  // Pass 2: rewrite refs + meta, insert.
  for (const key of RESOURCE_ORDER) {
    const Model = sbModelFor(key);
    if (!Model || !loaded[key]?.length) continue;
    const refs = REF_GRAPH[key] || [];
    const rows = loaded[key].map(({ doc, newId }) => {
      const clone = { ...doc };
      delete clone.__v;
      delete clone.createdAt;
      delete clone.updatedAt;
      clone._id = newId;
      clone._sbSession = sessionId;
      clone._isSeed = false;
      clone._expiresAt = expiresAt;
      for (const r of refs) {
        if (clone[r.field] == null) continue;
        clone[r.field] = r.array
          ? (Array.isArray(clone[r.field]) ? clone[r.field] : [clone[r.field]]).map((v) => remap(v, idMap))
          : remap(clone[r.field], idMap);
      }
      return clone;
    });
    await Model.insertMany(rows, { ordered: false });
  }
}

// POST /sandbox/session/start  { name, email, role, company }
export const startSession = async (req, res) => {
  try {
    const { name = "Guest", email = "", role = "admin", company = "Acme Distribution Inc." } =
      req.body || {};
    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600 * 1000);

    await sbSessionModel().create({
      sessionId,
      profile: { name, email, role, company },
      expiresAt,
    });
    await cloneSeedIntoSession(sessionId, expiresAt);

    const token = signSandboxToken(sessionId);
    res.status(201).json({ token, expiresAt, profile: { name, email, role, company } });
  } catch (err) {
    console.error("startSession error:", err);
    res.status(500).json({ message: "Failed to start sandbox: " + err.message });
  }
};

// GET /sandbox/session/me  (token) -> validate + profile
export const getMe = (req, res) => {
  const s = req.sandboxSession;
  res.json({ valid: true, profile: s.profile, expiresAt: s.expiresAt });
};

// --- generic CRUD, all scoped to the active session ---
const modelOr404 = (req, res) => {
  const Model = sbModelFor(req.params.resource);
  if (!Model) {
    res.status(404).json({ message: `Unknown sandbox resource: ${req.params.resource}` });
    return null;
  }
  return Model;
};

// Mirror the real API's populate: replace ref ids with the referenced docs so
// the frontend can render related names (city/state/status/item/etc.).
async function populateRefs(rows, resourceKey, sessionId) {
  const refs = REF_GRAPH[resourceKey];
  if (!refs?.length || !rows.length) return rows;
  for (const r of refs) {
    const Target = sbModelFor(r.target);
    if (!Target) continue;
    const ids = new Set();
    for (const row of rows) {
      const v = row[r.field];
      if (v == null) continue;
      (r.array ? (Array.isArray(v) ? v : [v]) : [v]).forEach((x) => x && ids.add(String(x)));
    }
    if (!ids.size) continue;
    const docs = await Target.find({ _sbSession: sessionId, _id: { $in: [...ids] } }).lean();
    const map = new Map(docs.map((d) => [String(d._id), d]));
    for (const row of rows) {
      const v = row[r.field];
      if (v == null) continue;
      row[r.field] = r.array
        ? (Array.isArray(v) ? v : [v]).map((x) => map.get(String(x)) || x)
        : map.get(String(v)) || v;
    }
  }
  return rows;
}

export const list = async (req, res) => {
  const Model = modelOr404(req, res);
  if (!Model) return;
  const sessionId = req.sandboxSession.sessionId;
  const rows = await Model.find({ _sbSession: sessionId }).sort({ createdAt: -1 }).lean();
  await populateRefs(rows, req.params.resource, sessionId);
  res.json(rows);
};

export const getOne = async (req, res) => {
  const Model = modelOr404(req, res);
  if (!Model) return;
  const sessionId = req.sandboxSession.sessionId;
  const row = await Model.findOne({ _id: req.params.id, _sbSession: sessionId }).lean();
  if (!row) return res.status(404).json({ message: "Not found" });
  await populateRefs([row], req.params.resource, sessionId);
  res.json(row);
};

export const create = async (req, res) => {
  const Model = modelOr404(req, res);
  if (!Model) return;
  const session = req.sandboxSession;
  const body = { ...req.body };
  delete body._id;
  const doc = await Model.create({
    ...body,
    _sbSession: session.sessionId,
    _isSeed: false,
    _expiresAt: session.expiresAt,
  });
  res.status(201).json(doc.toObject());
};

// Handles plain id, or sub-actions "<id>/toggle" | "<id>/soft-delete" | "<id>/restore".
export const update = async (req, res) => {
  const Model = modelOr404(req, res);
  if (!Model) return;
  const sessionId = req.sandboxSession.sessionId;
  const id = req.params.id;
  const action = req.params.action;
  const doc = await Model.findOne({ _id: id, _sbSession: sessionId });
  if (!doc) return res.status(404).json({ message: "Not found" });

  if (action === "toggle" || action === "soft-delete") {
    // strict:false → undeclared paths must be set via .set() to be persisted.
    doc.set("isActive", !doc.get("isActive"));
  } else if (action === "restore") {
    doc.set("isActive", true);
  } else {
    const body = { ...req.body };
    delete body._id;
    delete body._sbSession;
    delete body._isSeed;
    delete body._expiresAt;
    doc.set(body);
  }
  await doc.save();
  res.json(doc.toObject());
};

export const remove = async (req, res) => {
  const Model = modelOr404(req, res);
  if (!Model) return;
  await Model.deleteOne({ _id: req.params.id, _sbSession: req.sandboxSession.sessionId });
  res.json({ message: "Deleted" });
};

// GET /sandbox/storeByPartyId/:partyId
export const storesByParty = async (req, res) => {
  const Model = sbModelFor("stores");
  const rows = await Model.find({
    _sbSession: req.sandboxSession.sessionId,
    partyId: req.params.partyId,
  }).lean();
  res.json(rows);
};

// Cron entry: delete expired session docs + session records (seed has _expiresAt null).
export async function purgeExpiredSandbox() {
  const now = new Date();
  let removed = 0;
  for (const key of Object.keys(RESOURCE_TO_MODEL)) {
    const Model = sbModelFor(key);
    if (!Model) continue;
    const r = await Model.deleteMany({ _expiresAt: { $ne: null, $lte: now } });
    removed += r.deletedCount || 0;
  }
  const s = await sbSessionModel().deleteMany({ expiresAt: { $lte: now } });
  return { docs: removed, sessions: s.deletedCount || 0 };
}
