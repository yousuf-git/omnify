// import { StockInCategory } from "../../models/stockInCategory.js";

// // CRUD operations for StockInCategory

// export const getSocketInCategories = async (req, res) => {
//   try {
//       const showInactive = req.query.showInactive === "true";
//     const filter = showInactive ? {} : { isActive: true };
//     const socketInCategories = await StockInCategory.find(filter);
//     res.status(200).json(socketInCategories);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getSocketInCategoryById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const socketInCategory = await StockInCategory.findById(id);
//     if (!socketInCategory) {
//       return res.status(404).json({ message: "Socket In Category not found" });
//     }
//     res.status(200).json(socketInCategory);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const createSocketInCategory = async (req, res) => {
//   const socketInCategory = new StockInCategory(req.body);
//   try {
//     const savedSocketInCategory = await socketInCategory.save();
//     res.status(201).json(savedSocketInCategory);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// export const updateSocketInCategory = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const updatedSocketInCategory = await StockInCategory.findByIdAndUpdate(
//       id,
//       req.body,
//       { new: true }
//     );
//     if (!updatedSocketInCategory) {
//       return res.status(404).json({ message: "Socket In Category not found" });
//     }
//     res.status(200).json(updatedSocketInCategory);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// export const deleteSocketInCategory = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deletedSocketInCategory = await StockInCategory.findById(id);
//     if (!deletedSocketInCategory) {
//       return res.status(404).json({ message: "Socket In Category not found" });
//     }
//     deletedSocketInCategory.isActive = false;
//     await deletedSocketInCategory.save();
//     res
//       .status(200)
//       .json({ message: "Socket In Category deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


import { StockInCategory } from "../../models/stockInCategory.js";

export const getSocketInCategories = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const deleteType = req.query.deleteType || "soft"; // 'soft' or 'hard'
    
    let socketInCategories;
    if (deleteType === "hard") {
      // For hard delete, only show non-deleted items
      socketInCategories = await StockInCategory.find(showInactive ? {} : { isActive: true });
    } else {
      // For soft delete, use the active/inactive query helpers
      socketInCategories = showInactive ? await StockInCategory.find() : await StockInCategory.find().active();
    }
    res.status(200).json(socketInCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSocketInCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const socketInCategory = await StockInCategory.findById(id);
    if (!socketInCategory) {
      return res.status(404).json({ message: "Stock In Category not found" });
    }
    res.status(200).json(socketInCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSocketInCategory = async (req, res) => {
  const socketInCategory = new StockInCategory(req.body);
  try {
    const savedSocketInCategory = await socketInCategory.save();
    res.status(201).json(savedSocketInCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSocketInCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedSocketInCategory = await StockInCategory.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedSocketInCategory) {
      return res.status(404).json({ message: "Stock In Category not found" });
    }
    res.status(200).json(updatedSocketInCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Soft Delete (Toggle Active/Inactive)
export const softDeleteSocketInCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const socketInCategory = await StockInCategory.findById(id);
    if (!socketInCategory) {
      return res.status(404).json({ message: "Stock In Category not found" });
    }
    
    socketInCategory.isActive = !socketInCategory.isActive;
    if (!socketInCategory.isActive) {
      socketInCategory.deletedAt = new Date();
    } else {
      socketInCategory.deletedAt = null;
    }
    
    await socketInCategory.save();
    
    res.status(200).json({
      message: `Stock In Category ${socketInCategory.isActive ? "enabled" : "disabled"} successfully`,
      socketInCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error soft deleting stock in category" });
  }
};

// Hard Delete (Permanent Delete)
export const hardDeleteSocketInCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSocketInCategory = await StockInCategory.findByIdAndDelete(id);
    if (!deletedSocketInCategory) {
      return res.status(404).json({ message: "Stock In Category not found" });
    }
    res.status(200).json({ message: "Stock In Category permanently deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error hard deleting stock in category" });
  }
};

// Restore Soft Deleted Stock In Category
export const restoreSocketInCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const socketInCategory = await StockInCategory.findById(id);
    if (!socketInCategory) {
      return res.status(404).json({ message: "Stock In Category not found" });
    }
    
    socketInCategory.isActive = true;
    socketInCategory.deletedAt = null;
    await socketInCategory.save();
    
    res.status(200).json({
      message: "Stock In Category restored successfully",
      socketInCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error restoring stock in category" });
  }
};