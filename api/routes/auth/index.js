import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator"; // Add this import
import { User } from "../../models/User.js";
import { Tenant } from "../../models/tenant.js";
import rateLimit from 'express-rate-limit';
import { authenticateToken, requireRole } from "../../middleware/auth.js";
import cookieParser from "cookie-parser";

const router = express.Router();
router.use(cookieParser());

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "24h",
  });
};

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later'
});

// GET /api/auth/users - Get all users (admin only)
router.get("/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /api/auth/users/:id - Update user (admin only)
router.put("/users/:id", 
  authenticateToken, 
  [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Must be a valid email'),
    body('role').optional().isIn(['admin', 'manager', 'staff', 'viewer']).withMessage('Invalid role')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array()
        });
      }

      const { name, email, role, isActive } = req.body;
      const updateData = {};
      
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (typeof isActive !== 'undefined') updateData.isActive = isActive;
      
      const user = await User.findByIdAndUpdate(
        req.params.id, 
        updateData, 
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        message: "User updated successfully",
        user
      });
    } catch (error) {
      console.error("Update user error:", error);
      
      if (error.code === 11000) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// PATCH /api/auth/users/:id/toggle-status - Toggle user status (admin only)
router.patch("/users/:id/toggle-status", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot deactivate your own account" });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: userResponse
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login route
router.post("/api/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Block login when the user's company has been disabled by the super-admin.
    if (user.role !== "superadmin" && user.tenantId) {
      const tenant = await Tenant.findById(user.tenantId);
      if (!tenant || !tenant.isActive) {
        return res.status(403).json({ message: "Your company account is inactive. Contact your administrator." });
      }
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all users (admin only)
router.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout route
router.post("/api/logout", (req, res) => {
  res.clearCookie('token');
  res.json({ message: "Logged out successfully" });
});

// Refresh token route
router.post("/api/refresh", async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found" });
    }

    const newToken = generateToken(user._id);
    setTokenCookie(res, newToken);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      }
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.clearCookie('token');
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    
    res.status(401).json({ message: "Invalid token" });
  }
});

// Verify token route
router.get("/api/verify", authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        tenantId: req.user.tenantId
      }
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;