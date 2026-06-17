import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { runWithTenant } from "../src/context/tenantContext.js";

export const authenticateToken = async (req, res, next) => {
  try {
    // Check for token in cookies first, then authorization header as fallback
    const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    req.user = user;

    // Enter the tenant context for the rest of the request so the Mongoose
    // tenant plugin automatically scopes every query/write to this user's tenant.
    // Super-admin (tenantId null) runs unscoped on purpose.
    return runWithTenant(
      { tenantId: user.tenantId, isSuperAdmin: user.role === "superadmin" },
      () => next()
    );
  } catch (error) {
    console.error("Authentication error:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    
    res.status(401).json({ message: "Invalid token" });
  }
};

export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    next();
  };
};