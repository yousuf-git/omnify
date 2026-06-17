// import { Warehouse } from "../../models/warehouse.js";

// export const createWarehouse = async (req, res) => {
//   const warehouse = new Warehouse(req.body);
//   try {
//     const savedWarehouse = await warehouse.save();
//     res.status(201).json(savedWarehouse);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: error.message + " - Error creating warehouse" });
//   }
// };

// export const getWarehouses = async (req, res) => {
//   try {
//     const showInactive = req.query.showInactive === "true";
//     const filter = showInactive ? {} : { isActive: true };
//     const warehouses = await Warehouse.find(filter);

//     res.status(200).json(warehouses);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching warehouses" });
//   }
// };

// export const getWarehouseById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const warehouse = await Warehouse.findById(id);
//     if (!warehouse) {
//       return res.status(404).json({ message: "Warehouse not found" });
//     }
//     res.status(200).json(warehouse);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching warehouse by ID" });
//   }
// };

// export const updateWarehouse = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const updatedWarehouse = await Warehouse.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });
//     if (!updatedWarehouse) {
//       return res.status(404).json({ message: "Warehouse not found" });
//     }
//     res.status(200).json(updatedWarehouse);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: error.message + " - Error updating warehouse" });
//   }
// };

// export const deleteWarehouse = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const warehouse = await Warehouse.findById(id);
//     if (!warehouse) {
//       return res.status(404).json({ message: "Warehouse not found" });
//     }

//     // Soft delete by setting isActive to false
//     warehouse.isActive = false;
//     await warehouse.save();

//     res.status(200).json({ message: "Warehouse disabled successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error disabling warehouse" });
//   }
// };


import { Warehouse } from "../../models/warehouse.js";

export const createWarehouse = async (req, res) => {
  const warehouse = new Warehouse(req.body);
  try {
    const savedWarehouse = await warehouse.save();
    res.status(201).json(savedWarehouse);
  } catch (error) {
    res
      .status(400)
      .json({ message: error.message + " - Error creating warehouse" });
  }
};

export const getWarehouses = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const deleteType = req.query.deleteType || "soft"; // 'soft' or 'hard'
    
    let warehouses;
    if (deleteType === "hard") {
      // For hard delete, only show non-deleted items
      warehouses = await Warehouse.find(showInactive ? {} : { isActive: true });
    } else {
      // For soft delete, use the active/inactive query helpers
      warehouses = showInactive 
        ? await Warehouse.find() 
        : await Warehouse.find().active();
    }

    res.status(200).json(warehouses);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching warehouses" });
  }
};

export const getWarehouseById = async (req, res) => {
  const { id } = req.params;
  try {
    const warehouse = await Warehouse.findById(id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }
    res.status(200).json(warehouse);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching warehouse by ID" });
  }
};

export const updateWarehouse = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedWarehouse = await Warehouse.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedWarehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }
    res.status(200).json(updatedWarehouse);
  } catch (error) {
    res
      .status(400)
      .json({ message: error.message + " - Error updating warehouse" });
  }
};

// Soft Delete (Toggle Active/Inactive)
export const softDeleteWarehouse = async (req, res) => {
  const { id } = req.params;
  try {
    const warehouse = await Warehouse.findById(id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }
    
    warehouse.isActive = !warehouse.isActive;
    if (!warehouse.isActive) {
      warehouse.deletedAt = new Date();
    } else {
      warehouse.deletedAt = null;
    }
    
    await warehouse.save();
    
    res.status(200).json({
      message: `Warehouse ${warehouse.isActive ? "enabled" : "disabled"} successfully`,
      warehouse
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error soft deleting warehouse" });
  }
};

// Hard Delete (Permanent Delete)
export const hardDeleteWarehouse = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedWarehouse = await Warehouse.findByIdAndDelete(id);
    if (!deletedWarehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }
    res.status(200).json({ message: "Warehouse permanently deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error hard deleting warehouse" });
  }
};

// Restore Soft Deleted Warehouse
export const restoreWarehouse = async (req, res) => {
  const { id } = req.params;
  try {
    const warehouse = await Warehouse.findById(id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }
    
    warehouse.isActive = true;
    warehouse.deletedAt = null;
    await warehouse.save();
    
    res.status(200).json({
      message: "Warehouse restored successfully",
      warehouse
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error restoring warehouse" });
  }
};