// import { DeliveryStatus } from "../../models/deliveryStatus.js";

// export const createDeliveryStatus = async (req, res) => {
//   try {
//     const { deliveryStatusId, deliveryStatusName, description, isActive } = req.body;

//     const newDeliveryStatus = new DeliveryStatus({
//       deliveryStatusId,
//       deliveryStatusName,
//       description,
//       isActive,
//     });

//     await newDeliveryStatus.save();
//     res.status(201).json(newDeliveryStatus);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error creating delivery status" });
//   }
// };

// export const getDeliveryStatuses = async (req, res) => {
//   try {
//     const showInactive = req.query.showInactive === "true";
//     const filter = showInactive ? {} : { isActive: true };
//     const deliveryStatuses = await DeliveryStatus.find(filter);
//     res.status(200).json(deliveryStatuses);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching delivery statuses" });
//   }
// };

// export const getDeliveryStatusById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deliveryStatus = await DeliveryStatus.findById(id);

//     if (!deliveryStatus) {
//       return res.status(404).json({ message: "Delivery status not found" });
//     }

//     res.status(200).json(deliveryStatus);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching delivery status" });
//   }
// };

// export const updateDeliveryStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { deliveryStatusId, deliveryStatusName, description, isActive } = req.body;

//     const updatedDeliveryStatus = await DeliveryStatus.findByIdAndUpdate(
//       id,
//       { deliveryStatusId, deliveryStatusName, description, isActive },
//       { new: true }
//     );

//     if (!updatedDeliveryStatus) {
//       return res.status(404).json({ message: "Delivery status not found" });
//     }

//     res.status(200).json(updatedDeliveryStatus);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error updating delivery status" });
//   }
// };

// export const deleteDeliveryStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedDeliveryStatus = await DeliveryStatus.findById(id);

//     if (!deletedDeliveryStatus) {
//       return res.status(404).json({ message: "Delivery status not found" });
//     }
//     deleteDeliveryStatus.isActive = false;
//     await deleteDeliveryStatus.save();

//     res.status(200).json({ message: "Delivery status deleted successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error deleting delivery status" });
//   }
// };


import { DeliveryStatus } from "../../models/deliveryStatus.js";

export const createDeliveryStatus = async (req, res) => {
  try {
    const { deliveryStatusId, deliveryStatusName, description, isActive } = req.body;

    const newDeliveryStatus = new DeliveryStatus({
      deliveryStatusId,
      deliveryStatusName,
      description,
      isActive,
    });

    await newDeliveryStatus.save();
    res.status(201).json(newDeliveryStatus);
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error creating delivery status" });
  }
};

export const getDeliveryStatuses = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const deleteType = req.query.deleteType || "soft"; // 'soft' or 'hard'
    
    let deliveryStatuses;
    if (deleteType === "hard") {
      // For hard delete, only show non-deleted items
      deliveryStatuses = await DeliveryStatus.find(showInactive ? {} : { isActive: true });
    } else {
      // For soft delete, use the active/inactive query helpers
      deliveryStatuses = showInactive 
        ? await DeliveryStatus.find() 
        : await DeliveryStatus.find().active();
    }
    
    res.status(200).json(deliveryStatuses);
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error fetching delivery statuses" });
  }
};

export const getDeliveryStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryStatus = await DeliveryStatus.findById(id);

    if (!deliveryStatus) {
      return res.status(404).json({ message: "Delivery status not found" });
    }

    res.status(200).json(deliveryStatus);
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error fetching delivery status" });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatusId, deliveryStatusName, description, isActive } = req.body;

    const updatedDeliveryStatus = await DeliveryStatus.findByIdAndUpdate(
      id,
      { deliveryStatusId, deliveryStatusName, description, isActive },
      { new: true }
    );

    if (!updatedDeliveryStatus) {
      return res.status(404).json({ message: "Delivery status not found" });
    }

    res.status(200).json(updatedDeliveryStatus);
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error updating delivery status" });
  }
};

// Soft Delete (Toggle Active/Inactive)
export const softDeleteDeliveryStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const deliveryStatus = await DeliveryStatus.findById(id);
    if (!deliveryStatus) {
      return res.status(404).json({ message: "Delivery status not found" });
    }
    
    deliveryStatus.isActive = !deliveryStatus.isActive;
    if (!deliveryStatus.isActive) {
      deliveryStatus.deletedAt = new Date();
    } else {
      deliveryStatus.deletedAt = null;
    }
    
    await deliveryStatus.save();
    
    res.status(200).json({
      message: `Delivery Status ${deliveryStatus.isActive ? "enabled" : "disabled"} successfully`,
      deliveryStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error soft deleting delivery status" });
  }
};

// Hard Delete (Permanent Delete)
export const hardDeleteDeliveryStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedDeliveryStatus = await DeliveryStatus.findByIdAndDelete(id);
    if (!deletedDeliveryStatus) {
      return res.status(404).json({ message: "Delivery status not found" });
    }
    res.status(200).json({ message: "Delivery status permanently deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error hard deleting delivery status" });
  }
};

// Restore Soft Deleted Delivery Status
export const restoreDeliveryStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const deliveryStatus = await DeliveryStatus.findById(id);
    if (!deliveryStatus) {
      return res.status(404).json({ message: "Delivery status not found" });
    }
    
    deliveryStatus.isActive = true;
    deliveryStatus.deletedAt = null;
    await deliveryStatus.save();
    
    res.status(200).json({
      message: "Delivery status restored successfully",
      deliveryStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error restoring delivery status" });
  }
};