// import { StockOutCategory } from "../../models/stockOutCategory.js";

// // CRUD operations for stockOutCategory

// export const getSocketOutCategories = async (req, res) => {
//   try {
//       const showOutactive = req.query.showOutactive === "true";
//     const filter = showOutactive ? {} : { isActive: true };
//     const socketOutCategories = await StockOutCategory.find(filter);
//     res.status(200).json(socketOutCategories);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getSocketOutCategoryById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const stockOutCategory = await StockOutCategory.findById(id);
//     if (!stockOutCategory) {
//       return res.status(404).json({ message: "Socket Out Category not found" });
//     }
//     res.status(200).json(stockOutCategory);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const createSocketOutCategory = async (req, res) => {
//   const socketOutCategory = new StockOutCategory(req.body);
//   try {
//     const savedSocketOutCategory = await socketOutCategory.save();
//     res.status(201).json(savedSocketOutCategory);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// export const updateSocketOutCategory = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const updatedSocketOutCategory = await StockOutCategory.findByIdAndUpdate(
//       id,
//       req.body,
//       { new: true }
//     );
//     if (!updatedSocketOutCategory) {
//       return res.status(404).json({ message: "Socket Out Category not found" });
//     }
//     res.status(200).json(updatedSocketOutCategory);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// export const deleteSocketOutCategory = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deletedSocketOutCategory = await StockOutCategory.findById(id);
//     if (!deletedSocketOutCategory) {
//       return res.status(404).json({ message: "Socket Out Category not found" });
//     }
//     deletedSocketOutCategory.isActive = false;
//     await deletedSocketOutCategory.save();
//     res
//       .status(200)
//       .json({ message: "Socket Out Category deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


import { StockOutCategory } from "../../models/stockOutCategory.js";

export const getSocketOutCategories = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const deleteType = req.query.deleteType || "soft"; // 'soft' or 'hard'
    
    let socketOutCategories;
    if (deleteType === "hard") {
      // For hard delete, only show non-deleted items
      socketOutCategories = await StockOutCategory.find(showInactive ? {} : { isActive: true });
    } else {
      // For soft delete, use the active/inactive query helpers
      socketOutCategories = showInactive ? await StockOutCategory.find() : await StockOutCategory.find().active();
    }
    res.status(200).json(socketOutCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSocketOutCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const stockOutCategory = await StockOutCategory.findById(id);
    if (!stockOutCategory) {
      return res.status(404).json({ message: "Stock Out Category not found" });
    }
    res.status(200).json(stockOutCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSocketOutCategory = async (req, res) => {
  const socketOutCategory = new StockOutCategory(req.body);
  try {
    const savedSocketOutCategory = await socketOutCategory.save();
    res.status(201).json(savedSocketOutCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSocketOutCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedSocketOutCategory = await StockOutCategory.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedSocketOutCategory) {
      return res.status(404).json({ message: "Stock Out Category not found" });
    }
    res.status(200).json(updatedSocketOutCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Soft Delete (Toggle Active/Inactive)
export const softDeleteSocketOutCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const socketOutCategory = await StockOutCategory.findById(id);
    if (!socketOutCategory) {
      return res.status(404).json({ message: "Stock Out Category not found" });
    }
    
    socketOutCategory.isActive = !socketOutCategory.isActive;
    if (!socketOutCategory.isActive) {
      socketOutCategory.deletedAt = new Date();
    } else {
      socketOutCategory.deletedAt = null;
    }
    
    await socketOutCategory.save();
    
    res.status(200).json({
      message: `Stock Out Category ${socketOutCategory.isActive ? "enabled" : "disabled"} successfully`,
      socketOutCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error soft deleting stock out category" });
  }
};

// Hard Delete (Permanent Delete)
export const hardDeleteSocketOutCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSocketOutCategory = await StockOutCategory.findByIdAndDelete(id);
    if (!deletedSocketOutCategory) {
      return res.status(404).json({ message: "Stock Out Category not found" });
    }
    res.status(200).json({ message: "Stock Out Category permanently deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error hard deleting stock out category" });
  }
};

// Restore Soft Deleted Stock Out Category
export const restoreSocketOutCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const socketOutCategory = await StockOutCategory.findById(id);
    if (!socketOutCategory) {
      return res.status(404).json({ message: "Stock Out Category not found" });
    }
    
    socketOutCategory.isActive = true;
    socketOutCategory.deletedAt = null;
    await socketOutCategory.save();
    
    res.status(200).json({
      message: "Stock Out Category restored successfully",
      socketOutCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error restoring stock out category" });
  }
};