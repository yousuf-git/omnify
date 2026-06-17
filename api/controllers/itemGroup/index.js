// import { ItemGroup } from "../../models/itemGroup.js";

// export const getItemGroups = async (req, res) => {
//   try {
//     const showInactive = req.query.showInactive === "true";
//     const filter = showInactive ? {} : { isActive: true };
//     const itemGroups = await ItemGroup.find(filter);
//     res.status(200).json(itemGroups);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching item groups" });
//   }
// };

// export const getItemGroupById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const itemGroup = await ItemGroup.findById(id);
//     if (!itemGroup) {
//       return res.status(404).json({ message: "Item Group not found" });
//     }
//     res.status(200).json(itemGroup);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching item group by ID" });
//   }
// };

// export const createItemGroup = async (req, res) => {
//   // console.log("Incoming Body =>", req.body);
//   const itemGroup = new ItemGroup(req.body);
//   try {
//     const savedItemGroup = await itemGroup.save();
//     res.status(201).json(savedItemGroup);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: error.message + " - Error creating item group" });
//   }
// };

// export const updateItemGroup = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const updatedItemGroup = await ItemGroup.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });
//     if (!updatedItemGroup) {
//       return res.status(404).json({ message: "Item Group not found" });
//     }
//     res.status(200).json(updatedItemGroup);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: error.message + " - Error updating item group" });
//   }
// };

// export const deleteItemGroup = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deletedItemGroup = await ItemGroup.findById(id);
//     if (!deletedItemGroup) {
//       return res.status(404).json({ message: "Item Group not found" });
//     }
//     deletedItemGroup.isActive = false;
//     await deletedItemGroup.save();
//     res.status(200).json({ message: "Item Group deleted successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error deleting item group" });
//   }
// };


import { ItemGroup } from "../../models/itemGroup.js";

export const getItemGroups = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const deleteType = req.query.deleteType || "soft"; // 'soft' or 'hard'
    
    let itemGroups;
    if (deleteType === "hard") {
      // For hard delete, only show non-deleted items
      itemGroups = await ItemGroup.find(showInactive ? {} : { isActive: true });
    } else {
      // For soft delete, use the active/inactive query helpers
      itemGroups = showInactive ? await ItemGroup.find() : await ItemGroup.find().active();
    }
    res.status(200).json(itemGroups);
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error fetching item groups" });
  }
};

export const getItemGroupById = async (req, res) => {
  const { id } = req.params;
  try {
    const itemGroup = await ItemGroup.findById(id);
    if (!itemGroup) {
      return res.status(404).json({ message: "Item Group not found" });
    }
    res.status(200).json(itemGroup);
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error fetching item group by ID" });
  }
};

export const createItemGroup = async (req, res) => {
  const itemGroup = new ItemGroup(req.body);
  try {
    const savedItemGroup = await itemGroup.save();
    res.status(201).json(savedItemGroup);
  } catch (error) {
    res.status(400).json({ message: error.message + " - Error creating item group" });
  }
};

export const updateItemGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedItemGroup = await ItemGroup.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedItemGroup) {
      return res.status(404).json({ message: "Item Group not found" });
    }
    res.status(200).json(updatedItemGroup);
  } catch (error) {
    res.status(400).json({ message: error.message + " - Error updating item group" });
  }
};

// Soft Delete (Toggle Active/Inactive)
export const softDeleteItemGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const itemGroup = await ItemGroup.findById(id);
    if (!itemGroup) {
      return res.status(404).json({ message: "Item Group not found" });
    }
    
    itemGroup.isActive = !itemGroup.isActive;
    if (!itemGroup.isActive) {
      itemGroup.deletedAt = new Date();
    } else {
      itemGroup.deletedAt = null;
    }
    
    await itemGroup.save();
    
    res.status(200).json({
      message: `Item Group ${itemGroup.isActive ? "enabled" : "disabled"} successfully`,
      itemGroup
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error soft deleting item group" });
  }
};

// Hard Delete (Permanent Delete)
export const hardDeleteItemGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedItemGroup = await ItemGroup.findByIdAndDelete(id);
    if (!deletedItemGroup) {
      return res.status(404).json({ message: "Item Group not found" });
    }
    res.status(200).json({ message: "Item Group permanently deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error hard deleting item group" });
  }
};

// Restore Soft Deleted Item Group
export const restoreItemGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const itemGroup = await ItemGroup.findById(id);
    if (!itemGroup) {
      return res.status(404).json({ message: "Item Group not found" });
    }
    
    itemGroup.isActive = true;
    itemGroup.deletedAt = null;
    await itemGroup.save();
    
    res.status(200).json({
      message: "Item Group restored successfully",
      itemGroup
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error restoring item group" });
  }
};