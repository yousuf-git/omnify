// import { LogisticsProviderCategory } from "../../models/logisticsProviderCategory.js";

// export const getLogisticsProviderCategories = async (req, res) => {
//   try {
//     const showInactive = req.query.showInactive === "true";
//     const filter = showInactive ? {} : { isActive: true };
//     const categories = await LogisticsProviderCategory.find(filter);
//     res.status(200).json(categories);
//   } catch (error) {
//     res
//       .status(500)
//       .json({
//         message:
//           error.message + " - Error fetching logistics provider categories",
//       });
//   }
// };

// export const getLogisticsProviderCategoryById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const category = await LogisticsProviderCategory.findById(id);
//     if (!category) {
//       return res
//         .status(404)
//         .json({ message: "Logistics Provider Category not found" });
//     }
//     res.status(200).json(category);
//   } catch (error) {
//     res
//       .status(500)
//       .json({
//         message:
//           error.message + " - Error fetching logistics provider category by ID",
//       });
//   }
// };

// export const createLogisticsProviderCategory = async (req, res) => {
//   const category = new LogisticsProviderCategory(req.body);
//   try {
//     const savedCategory = await category.save();
//     res.status(201).json(savedCategory);
//   } catch (error) {
//     res
//       .status(400)
//       .json({
//         message:
//           error.message + " - Error creating logistics provider category",
//       });
//   }
// };

// export const updateLogisticsProviderCategory = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const updatedCategory = await LogisticsProviderCategory.findByIdAndUpdate(
//       id,
//       req.body,
//       { new: true }
//     );
//     if (!updatedCategory) {
//       return res
//         .status(404)
//         .json({ message: "Logistics Provider Category not found" });
//     }
//     res.status(200).json(updatedCategory);
//   } catch (error) {
//     res
//       .status(400)
//       .json({
//         message:
//           error.message + " - Error updating logistics provider category",
//       });
//   }
// };

// export const deleteLogisticsProviderCategory = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deletedCategory = await LogisticsProviderCategory.findById(
//       id
//     );
//     if (!deletedCategory) {
//       return res
//         .status(404)
//         .json({ message: "Logistics Provider Category not found" });
//     }
//     deletedCategory.isActive = false;
//     await deletedCategory.save();
//     res
//       .status(200)
//       .json({ message: "Logistics Provider Category deleted successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({
//         message:
//           error.message + " - Error deleting logistics provider category",
//       });
//   }
// };


import { LogisticsProviderCategory } from "../../models/logisticsProviderCategory.js";

export const getLogisticsProviderCategories = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const deleteType = req.query.deleteType || "soft"; // 'soft' or 'hard'
    
    let categories;
    if (deleteType === "hard") {
      // For hard delete, only show non-deleted items
      categories = await LogisticsProviderCategory.find(showInactive ? {} : { isActive: true });
    } else {
      // For soft delete, use the active/inactive query helpers
      categories = showInactive 
        ? await LogisticsProviderCategory.find() 
        : await LogisticsProviderCategory.find().active();
    }
    
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: error.message + " - Error fetching logistics provider categories",
    });
  }
};

export const getLogisticsProviderCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await LogisticsProviderCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Logistics Provider Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({
      message: error.message + " - Error fetching logistics provider category by ID",
    });
  }
};

export const createLogisticsProviderCategory = async (req, res) => {
  const category = new LogisticsProviderCategory(req.body);
  try {
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({
      message: error.message + " - Error creating logistics provider category",
    });
  }
};

export const updateLogisticsProviderCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCategory = await LogisticsProviderCategory.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: "Logistics Provider Category not found" });
    }
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(400).json({
      message: error.message + " - Error updating logistics provider category",
    });
  }
};

// Soft Delete (Toggle Active/Inactive)
export const softDeleteLogisticsProviderCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await LogisticsProviderCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Logistics Provider Category not found" });
    }
    
    category.isActive = !category.isActive;
    if (!category.isActive) {
      category.deletedAt = new Date();
    } else {
      category.deletedAt = null;
    }
    
    await category.save();
    
    res.status(200).json({
      message: `Logistics Provider Category ${category.isActive ? "enabled" : "disabled"} successfully`,
      category
    });
  } catch (error) {
    res.status(500).json({
      message: error.message + " - Error soft deleting logistics provider category",
    });
  }
};

// Hard Delete (Permanent Delete)
export const hardDeleteLogisticsProviderCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCategory = await LogisticsProviderCategory.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Logistics Provider Category not found" });
    }
    res.status(200).json({ message: "Logistics Provider Category permanently deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message + " - Error hard deleting logistics provider category",
    });
  }
};

// Restore Soft Deleted Category
export const restoreLogisticsProviderCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await LogisticsProviderCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Logistics Provider Category not found" });
    }
    
    category.isActive = true;
    category.deletedAt = null;
    await category.save();
    
    res.status(200).json({
      message: "Logistics Provider Category restored successfully",
      category
    });
  } catch (error) {
    res.status(500).json({
      message: error.message + " - Error restoring logistics provider category",
    });
  }
};