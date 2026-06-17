import express from "express";
import { User } from "../../models/User.js";
import { authenticateToken, requireRole } from "../../middleware/auth.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// GET /api/users - Get all users (admin only)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { showInactive = "false", search = "" } = req.query;
    const showInactiveBool = showInactive === "true";
    
    // Build query
    let query = {};
    
    if (!showInactiveBool) {
      query.isActive = true;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query, { password: 0 }).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/users/:id - Get single user (admin only)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/users - Create new user (admin only)
router.post("/", 
  authenticateToken, 
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'manager', 'staff', 'viewer']).withMessage('Invalid role')
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
      
      const { name, email, password, role } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Create new user
      const user = new User({ name, email, password, role });
      await user.save();
      
      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.status(201).json({
        message: "User created successfully",
        user: userResponse
      });
    } catch (error) {
      console.error("Create user error:", error);

      if (error.code === 11000) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// user.js - PUT route ko update karo
// PUT /api/users/:id - Update user (admin only)
router.put("/:id", 
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
      
      const { name, email, role, isActive, password } = req.body;
      
      // Pehle user ko find karo
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Fields update karo
      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (typeof isActive !== 'undefined') user.isActive = isActive;
      
      // Agar password diya gaya hai to set karo (pre-save hook automatically hash karega)
      if (password) {
        user.password = password;
      }
      
      // User ko save karo (pre-save hook trigger hoga)
      await user.save();
      
      // Password ko response se hatao
      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.json({
        message: "User updated successfully",
        user: userResponse
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

// PATCH /api/users/:id/toggle-status - Toggle user status (admin only)
router.patch("/:id/toggle-status", authenticateToken, async (req, res) => {
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

// DELETE /api/users/:id - Delete user (admin only)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;