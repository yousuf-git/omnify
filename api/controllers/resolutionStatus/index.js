// import { ResolutionStatus } from "../../models/resolutionStatus.js";

// export const createResolutionStatus = async (req, res) => {
//   try {
//     const { resolutionStatusName, description, isActive } = req.body;

//     // Validate required fields
//     if (!resolutionStatusName || resolutionStatusName.trim() === "") {
//       return res.status(400).json({ message: "Name is required and cannot be empty" });
//     }

//     // Validate name length
//     // if (name.length > 100) {
//     //   return res.status(400).json({ message: "Name cannot exceed 100 characters" });
//     // }

//     // Validate description length if provided
//     // if (description && description.length > 500) {
//     //   return res.status(400).json({ message: "Description cannot exceed 500 characters" });
//     // }

//     // Validate isActive field
//     if (isActive !== undefined && typeof isActive !== "boolean") {
//       return res.status(400).json({ message: "isActive must be a boolean value" });
//     }

//     const newResolutionStatus = new ResolutionStatus({
//       resolutionStatusName,
//       description,
//       isActive,
//     });

//     await newResolutionStatus.save();
//     res.status(201).json(newResolutionStatus);
//   } catch (error) {
//     // Handle MongoDB validation errors
//     if (error.resolutionStatusName === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ message: "Validation failed", errors: validationErrors });
//     }
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       return res.status(400).json({ message: "Resolution status with this name already exists" });
//     }

//     res
//       .status(500)
//       .json({ message: error.message + " - Error creating resolution status" });
//   }
// };

// export const getResolutionStatuses = async (req, res) => {
//   try {
//     const showInactive = req.query.showInactive === "true";
//     const filter = showInactive ? {} : { isActive: true };
//     const resolutionStatuses = await ResolutionStatus.find(filter);
//     res.status(200).json(resolutionStatuses);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching resolution statuses" });
//   }
// };

// export const getResolutionStatusById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate MongoDB ObjectId format
//     if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({ message: "Invalid resolution status ID format" });
//     }

//     const resolutionStatus = await ResolutionStatus.findById(id);

//     if (!resolutionStatus) {
//       return res.status(404).json({ message: "Resolution status not found" });
//     }

//     res.status(200).json(resolutionStatus);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching resolution status" });
//   }
// };

// export const updateResolutionStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { resolutionStatusName, description, isActive } = req.body;

//     // // Validate MongoDB ObjectId format
//     // if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//     //   return res.status(400).json({ message: "Invalid resolution status ID format" });
//     // }

//     // // Validate required fields
//     // if (!resolutionStatusName || resolutionStatusName.trim() === "") {
//     //   return res.status(400).json({ message: "Name is required and cannot be empty" });
//     // }

//     // Validate name length
//     // if (name.length > 100) {
//     //   return res.status(400).json({ message: "Name cannot exceed 100 characters" });
//     // }

//     // Validate description length if provided
//     // if (description && description.length > 500) {
//     //   return res.status(400).json({ message: "Description cannot exceed 500 characters" });
//     // }

//     // Validate isActive field
//     if (isActive !== undefined && typeof isActive !== "boolean") {
//       return res.status(400).json({ message: "isActive must be a boolean value" });
//     }

//     const updatedResolutionStatus = await ResolutionStatus.findByIdAndUpdate(
//       id,
//       { resolutionStatusName, description, isActive },
//       { new: true }
//     );

//     if (!updatedResolutionStatus) {
//       return res.status(404).json({ message: "Resolution status not found" });
//     }

//     res.status(200).json(updatedResolutionStatus);
//   } catch (error) {
//     // Handle MongoDB validation errors
//     if (error.resolutionStatusName === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ message: "Validation failed", errors: validationErrors });
//     }
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       return res.status(400).json({ message: "Resolution status with this name already exists" });
//     }

//     res
//       .status(500)
//       .json({ message: error.message + " - Error updating resolution status" });
//   }
// };

// export const deleteResolutionStatus = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate MongoDB ObjectId format
//     if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({ message: "Invalid resolution status ID format" });
//     }

//     const resolutionStatus = await ResolutionStatus.findById(id);

//     if (!resolutionStatus) {
//       return res.status(404).json({ message: "Resolution status not found" });
//     }
//     resolutionStatus.isActive = false;
//     await resolutionStatus.save();
//     res.status(200).json({ message: "Resolution status deleted successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error deleting resolution status" });
//   }
// };


import { ResolutionStatus } from "../../models/resolutionStatus.js";

export const createResolutionStatus = async (req, res) => {
  try {
    const { resolutionStatusName, description, isActive } = req.body;

    // Validate required fields
    if (!resolutionStatusName || resolutionStatusName.trim() === "") {
      return res.status(400).json({ message: "Name is required and cannot be empty" });
    }

    // Validate isActive field
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean value" });
    }

    const newResolutionStatus = new ResolutionStatus({
      resolutionStatusName,
      description,
      isActive,
    });

    await newResolutionStatus.save();
    res.status(201).json(newResolutionStatus);
  } catch (error) {
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: "Resolution status with this name already exists" });
    }

    res.status(500).json({ message: error.message + " - Error creating resolution status" });
  }
};

export const getResolutionStatuses = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const deleteType = req.query.deleteType || "soft"; // 'soft' or 'hard'
    
    let resolutionStatuses;
    if (deleteType === "hard") {
      // For hard delete, only show non-deleted items
      resolutionStatuses = await ResolutionStatus.find(showInactive ? {} : { isActive: true });
    } else {
      // For soft delete, use the active/inactive query helpers
      resolutionStatuses = showInactive 
        ? await ResolutionStatus.find() 
        : await ResolutionStatus.find().active();
    }
    
    res.status(200).json(resolutionStatuses);
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error fetching resolution statuses" });
  }
};

export const getResolutionStatusById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resolution status ID format" });
    }

    const resolutionStatus = await ResolutionStatus.findById(id);

    if (!resolutionStatus) {
      return res.status(404).json({ message: "Resolution status not found" });
    }

    res.status(200).json(resolutionStatus);
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error fetching resolution status" });
  }
};

export const updateResolutionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionStatusName, description, isActive } = req.body;

    // Validate isActive field
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean value" });
    }

    const updatedResolutionStatus = await ResolutionStatus.findByIdAndUpdate(
      id,
      { resolutionStatusName, description, isActive },
      { new: true }
    );

    if (!updatedResolutionStatus) {
      return res.status(404).json({ message: "Resolution status not found" });
    }

    res.status(200).json(updatedResolutionStatus);
  } catch (error) {
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: "Resolution status with this name already exists" });
    }

    res.status(500).json({ message: error.message + " - Error updating resolution status" });
  }
};

// Soft Delete (Toggle Active/Inactive)
export const softDeleteResolutionStatus = async (req, res) => {
  const { id } = req.params;
  try {
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resolution status ID format" });
    }

    const resolutionStatus = await ResolutionStatus.findById(id);
    if (!resolutionStatus) {
      return res.status(404).json({ message: "Resolution status not found" });
    }
    
    resolutionStatus.isActive = !resolutionStatus.isActive;
    if (!resolutionStatus.isActive) {
      resolutionStatus.deletedAt = new Date();
    } else {
      resolutionStatus.deletedAt = null;
    }
    
    await resolutionStatus.save();
    
    res.status(200).json({
      message: `Resolution Status ${resolutionStatus.isActive ? "enabled" : "disabled"} successfully`,
      resolutionStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error soft deleting resolution status" });
  }
};

// Hard Delete (Permanent Delete)
export const hardDeleteResolutionStatus = async (req, res) => {
  const { id } = req.params;
  try {
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resolution status ID format" });
    }

    const deletedResolutionStatus = await ResolutionStatus.findByIdAndDelete(id);
    if (!deletedResolutionStatus) {
      return res.status(404).json({ message: "Resolution status not found" });
    }
    res.status(200).json({ message: "Resolution status permanently deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error hard deleting resolution status" });
  }
};

// Restore Soft Deleted Resolution Status
export const restoreResolutionStatus = async (req, res) => {
  const { id } = req.params;
  try {
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resolution status ID format" });
    }

    const resolutionStatus = await ResolutionStatus.findById(id);
    if (!resolutionStatus) {
      return res.status(404).json({ message: "Resolution status not found" });
    }
    
    resolutionStatus.isActive = true;
    resolutionStatus.deletedAt = null;
    await resolutionStatus.save();
    
    res.status(200).json({
      message: "Resolution status restored successfully",
      resolutionStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error restoring resolution status" });
  }
};