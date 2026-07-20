import { Router } from "express";
import mongoose from "mongoose";
import os from "os";
import { execSync } from "child_process";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import { state, getReqPerMinute, eventLoopLag } from "../../src/metrics.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const router = Router();

function pkgVersion(name) {
  try {
    return require(`${name}/package.json`).version;
  } catch {
    return "—";
  }
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getDisk() {
  try {
    const out = execSync("df -k / 2>/dev/null | tail -1").toString().trim();
    const [, total, used, free, pctStr] = out.split(/\s+/);
    return {
      total: parseInt(total) * 1024,
      used: parseInt(used) * 1024,
      free: parseInt(free) * 1024,
      pct: parseInt(pctStr),
    };
  } catch {
    return null;
  }
}

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const iface of Object.values(nets)) {
    for (const addr of iface ?? []) {
      if (addr.family === "IPv4" && !addr.internal) return addr.address;
    }
  }
  return "127.0.0.1";
}

async function getDbMetrics() {
  const conn = mongoose.connection;
  const stateMap = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  const result = {
    state: stateMap[conn.readyState] ?? "unknown",
    readyState: conn.readyState,
    name: conn.name ?? "—",
    collections: 0,
    ping: null,
  };
  if (conn.readyState === 1) {
    try {
      const t0 = Date.now();
      await conn.db.admin().ping();
      result.ping = Date.now() - t0;
      const cols = await conn.db.listCollections().toArray();
      result.collections = cols.length;
    } catch {}
  }
  return result;
}

// HTML dashboard
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../src/templates/health.html"));
});

// JSON metrics API
router.get("/health/metrics", async (req, res) => {
  const mem = process.memoryUsage();
  const db = await getDbMetrics();
  const disk = getDisk();

  res.json({
    server: {
      status: "running",
      processUptime: process.uptime(),
      processUptimeFmt: formatUptime(process.uptime()),
      osUptime: os.uptime(),
      osUptimeFmt: formatUptime(os.uptime()),
      nodeVersion: process.version,
      env: process.env.NODE_ENV ?? "development",
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      ip: getLocalIP(),
    },
    stack: {
      express: pkgVersion("express"),
      mongoose: pkgVersion("mongoose"),
      nodeCron: pkgVersion("node-cron"),
    },
    database: {
      ...db,
      sandboxName: process.env.SANDBOX_DB_NAME || "sandbox_ims",
    },
    traffic: {
      total: state.reqTotal,
      perMinute: getReqPerMinute(),
      errors5xx: state.req5xx,
      websocketEnabled: false,
    },
    performance: {
      eventLoopLag,
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      heapPct: Math.round((mem.heapUsed / mem.heapTotal) * 100),
      rss: mem.rss,
      external: mem.external,
    },
    resources: {
      loadAvg: os.loadavg(),
      cpus: os.cpus().length,
      disk,
    },
  });
});

export default router;
