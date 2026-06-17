import jwt from "jsonwebtoken";
import { sbSessionModel } from "../src/sandbox/sandboxDb.js";
import { runWithSandbox } from "../src/sandbox/sandboxContext.js";

// Separate secret so sandbox tokens are isolated from the real auth secret.
export const SANDBOX_SECRET =
  process.env.SANDBOX_JWT_SECRET || "sandbox-dev-secret-change-me";

export const signSandboxToken = (sessionId) =>
  jwt.sign({ sessionId, sandbox: true }, SANDBOX_SECRET, { expiresIn: "6h" });

// Gate for all sandbox CRUD. Verifies the signed token (payload cannot be
// altered without breaking the HMAC) AND re-checks expiry against the DB session
// record — so even a forged/edited token cannot extend access.
export async function requireSandbox(req, res, next) {
  try {
    const token =
      req.headers["x-sandbox-token"] ||
      req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Sandbox token required" });

    let decoded;
    try {
      decoded = jwt.verify(token, SANDBOX_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired sandbox token" });
    }

    const session = await sbSessionModel().findOne({ sessionId: decoded.sessionId });
    if (!session) return res.status(401).json({ message: "Sandbox session not found" });
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      return res.status(401).json({ message: "Sandbox session expired" });
    }

    req.sandboxSession = session;
    return runWithSandbox({ sessionId: session.sessionId }, () => next());
  } catch (err) {
    console.error("Sandbox auth error:", err);
    res.status(500).json({ message: "Sandbox auth error" });
  }
}
