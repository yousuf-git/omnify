// import { Reseller } from "../../models/reseller.js";

// export const createReseller = async (req, res) => {
//   const reseller = new Reseller(req.body);
//   try {
//     const savedReseller = await reseller.save();
//     res.status(201).json(savedReseller);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: error.message + " - Error creating reseller" });
//   }
// };

// export const getResellers = async (req, res) => {
//   try {
//     const showInactive = req.query.showInactive === "true";
//     const filter = showInactive ? {} : { isActive: true };
//     const resellers = await Reseller.find(filter).populate("cityId").populate("stateId").exec();
//     res.status(200).json(resellers);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching resellers" });
//   }
// };

// export const getResellerById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const reseller = await Reseller.findById(id)
//       .populate("cityId")  // Populate city data
//       .populate("stateId");;
//     if (!reseller) {
//       return res.status(404).json({ message: "Reseller not found" });
//     }
//     res.status(200).json(reseller);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching reseller by ID" });
//   }
// };

// export const updateReseller = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const updatedReseller = await Reseller.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });
//     if (!updatedReseller) {
//       return res.status(404).json({ message: "Reseller not found" });
//     }
//     res.status(200).json(updatedReseller);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: error.message + " - Error updating reseller" });
//   }
// };

// export const deleteReseller = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deletedReseller = await Reseller.findById(id);
//     if (!deletedReseller) {
//       return res.status(404).json({ message: "Reseller not found" });
//     }
//     deletedReseller.isActive = false;
//     await deletedReseller.save();
//     res.status(200).json({ message: "Reseller deleted successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error deleting reseller" });
//   }
// };


import { Reseller } from "../../models/reseller.js";

export const createReseller = async (req, res) => {
  const reseller = new Reseller(req.body);
  try {
    const savedReseller = await reseller.save();
    res.status(201).json(savedReseller);
  } catch (error) {
    res
      .status(400)
      .json({ message: error.message + " - Error creating reseller" });
  }
};

export const getResellers = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const deleteType = req.query.deleteType || "soft"; // 'soft' or 'hard'
    
    let resellers;
    if (deleteType === "hard") {
      // For hard delete, only show non-deleted items
      resellers = await Reseller.find(showInactive ? {} : { isActive: true })
        .populate("cityId")
        .populate("stateId")
        .exec();
    } else {
      // For soft delete, use the active/inactive query helpers
      resellers = showInactive 
        ? await Reseller.find().populate("cityId").populate("stateId").exec()
        : await Reseller.find().active().populate("cityId").populate("stateId").exec();
    }
    
    res.status(200).json(resellers);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching resellers" });
  }
};

export const getResellerById = async (req, res) => {
  const { id } = req.params;
  try {
    const reseller = await Reseller.findById(id)
      .populate("cityId")
      .populate("stateId");
    if (!reseller) {
      return res.status(404).json({ message: "Reseller not found" });
    }
    res.status(200).json(reseller);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching reseller by ID" });
  }
};

export const updateReseller = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedReseller = await Reseller.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedReseller) {
      return res.status(404).json({ message: "Reseller not found" });
    }
    res.status(200).json(updatedReseller);
  } catch (error) {
    res
      .status(400)
      .json({ message: error.message + " - Error updating reseller" });
  }
};

// Soft Delete (Toggle Active/Inactive)
export const softDeleteReseller = async (req, res) => {
  const { id } = req.params;
  try {
    const reseller = await Reseller.findById(id);
    if (!reseller) {
      return res.status(404).json({ message: "Reseller not found" });
    }
    
    reseller.isActive = !reseller.isActive;
    if (!reseller.isActive) {
      reseller.deletedAt = new Date();
    } else {
      reseller.deletedAt = null;
    }
    
    await reseller.save();
    
    res.status(200).json({
      message: `Reseller ${reseller.isActive ? "enabled" : "disabled"} successfully`,
      reseller
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error soft deleting reseller" });
  }
};

// Hard Delete (Permanent Delete)
export const hardDeleteReseller = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedReseller = await Reseller.findByIdAndDelete(id);
    if (!deletedReseller) {
      return res.status(404).json({ message: "Reseller not found" });
    }
    res.status(200).json({ message: "Reseller permanently deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error hard deleting reseller" });
  }
};

// Restore Soft Deleted Reseller
export const restoreReseller = async (req, res) => {
  const { id } = req.params;
  try {
    const reseller = await Reseller.findById(id);
    if (!reseller) {
      return res.status(404).json({ message: "Reseller not found" });
    }
    
    reseller.isActive = true;
    reseller.deletedAt = null;
    await reseller.save();
    
    res.status(200).json({
      message: "Reseller restored successfully",
      reseller
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error restoring reseller" });
  }
};