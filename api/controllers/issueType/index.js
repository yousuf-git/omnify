// import { IssueType } from "../../models/issueType.js";

// export const createIssueType = async (req, res) => {
//   try {
//     const { issueTypeName, description, isActive } = req.body;

//     // Validate required fields
//     if (!issueTypeName || issueTypeName.trim() === "") {
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

//     const newIssueType = new IssueType({
//       issueTypeName,
//       description,
//       isActive,
//     });

//     await newIssueType.save();
//     res.status(201).json(newIssueType);
//   } catch (error) {
//     // Handle MongoDB validation errors
//     if (error.issueTypeName === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ message: "Validation failed", errors: validationErrors });
//     }
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       return res.status(400).json({ message: "Issue type with this name already exists" });
//     }

//     res
//       .status(500)
//       .json({ message: error.message + " - Error creating issue type" });
//   }
// };

// export const getIssueTypes = async (req, res) => {
//   try {
//     const showInactive = req.query.showInactive === "true";
//     const filter = showInactive ? {} : { isActive: true };
//     const issueTypes = await IssueType.find(filter);
//     res.status(200).json(issueTypes);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching issue types" });
//   }
// };

// export const getIssueTypeById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate MongoDB ObjectId format
//     if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({ message: "Invalid issue type ID format" });
//     }

//     const issueType = await IssueType.findById(id);

//     if (!issueType) {
//       return res.status(404).json({ message: "Issue type not found" });
//     }

//     res.status(200).json(issueType);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching issue type" });
//   }
// };

// export const updateIssueType = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { issueTypeName, description, isActive } = req.body;

//     // // Validate MongoDB ObjectId format
//     // if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//     //   return res.status(400).json({ message: "Invalid issue type ID format" });
//     // }

//     // // Validate required fields
//     // if (!issueTypeName || issueTypeName.trim() === "") {
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

//     const updatedIssueType = await IssueType.findByIdAndUpdate(
//       id,
//       { issueTypeName, description, isActive },
//       { new: true }
//     );

//     if (!updatedIssueType) {
//       return res.status(404).json({ message: "Issue type not found" });
//     }

//     res.status(200).json(updatedIssueType);
//   } catch (error) {
//     // Handle MongoDB validation errors
//     if (error.issueTypeName === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ message: "Validation failed", errors: validationErrors });
//     }
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       return res.status(400).json({ message: "Issue type with this name already exists" });
//     }

//     res
//       .status(500)
//       .json({ message: error.message + " - Error updating issue type" });
//   }
// };

// export const deleteIssueType = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate MongoDB ObjectId format
//     if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({ message: "Invalid issue type ID format" });
//     }

//     const issueType = await IssueType.findById(id);

//     if (!issueType) {
//       return res.status(404).json({ message: "Issue type not found" });
//     }
//     issueType.isActive = false;
//     await issueType.save();
//     res.status(200).json({ message: "Issue type deleted successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error deleting issue type" });
//   }
// };


import { IssueType } from "../../models/issueType.js";

export const createIssueType = async (req, res) => {
  try {
    const { issueTypeName, description, isActive } = req.body;

    // Validate required fields
    if (!issueTypeName || issueTypeName.trim() === "") {
      return res.status(400).json({ message: "Name is required and cannot be empty" });
    }

    // Validate isActive field
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean value" });
    }

    const newIssueType = new IssueType({
      issueTypeName,
      description,
      isActive,
    });

    await newIssueType.save();
    res.status(201).json(newIssueType);
  } catch (error) {
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: "Issue type with this name already exists" });
    }

    res.status(500).json({ message: error.message + " - Error creating issue type" });
  }
};

export const getIssueTypes = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const deleteType = req.query.deleteType || "soft"; // 'soft' or 'hard'
    
    let issueTypes;
    if (deleteType === "hard") {
      // For hard delete, only show non-deleted items
      issueTypes = await IssueType.find(showInactive ? {} : { isActive: true });
    } else {
      // For soft delete, use the active/inactive query helpers
      issueTypes = showInactive 
        ? await IssueType.find() 
        : await IssueType.find().active();
    }
    
    res.status(200).json(issueTypes);
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error fetching issue types" });
  }
};

export const getIssueTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid issue type ID format" });
    }

    const issueType = await IssueType.findById(id);

    if (!issueType) {
      return res.status(404).json({ message: "Issue type not found" });
    }

    res.status(200).json(issueType);
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error fetching issue type" });
  }
};

export const updateIssueType = async (req, res) => {
  try {
    const { id } = req.params;
    const { issueTypeName, description, isActive } = req.body;

    // Validate isActive field
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean value" });
    }

    const updatedIssueType = await IssueType.findByIdAndUpdate(
      id,
      { issueTypeName, description, isActive },
      { new: true }
    );

    if (!updatedIssueType) {
      return res.status(404).json({ message: "Issue type not found" });
    }

    res.status(200).json(updatedIssueType);
  } catch (error) {
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: "Issue type with this name already exists" });
    }

    res.status(500).json({ message: error.message + " - Error updating issue type" });
  }
};

// Soft Delete (Toggle Active/Inactive)
export const softDeleteIssueType = async (req, res) => {
  const { id } = req.params;
  try {
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid issue type ID format" });
    }

    const issueType = await IssueType.findById(id);
    if (!issueType) {
      return res.status(404).json({ message: "Issue type not found" });
    }
    
    issueType.isActive = !issueType.isActive;
    if (!issueType.isActive) {
      issueType.deletedAt = new Date();
    } else {
      issueType.deletedAt = null;
    }
    
    await issueType.save();
    
    res.status(200).json({
      message: `Issue Type ${issueType.isActive ? "enabled" : "disabled"} successfully`,
      issueType
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error soft deleting issue type" });
  }
};

// Hard Delete (Permanent Delete)
export const hardDeleteIssueType = async (req, res) => {
  const { id } = req.params;
  try {
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid issue type ID format" });
    }

    const deletedIssueType = await IssueType.findByIdAndDelete(id);
    if (!deletedIssueType) {
      return res.status(404).json({ message: "Issue type not found" });
    }
    res.status(200).json({ message: "Issue type permanently deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error hard deleting issue type" });
  }
};

// Restore Soft Deleted Issue Type
export const restoreIssueType = async (req, res) => {
  const { id } = req.params;
  try {
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid issue type ID format" });
    }

    const issueType = await IssueType.findById(id);
    if (!issueType) {
      return res.status(404).json({ message: "Issue type not found" });
    }
    
    issueType.isActive = true;
    issueType.deletedAt = null;
    await issueType.save();
    
    res.status(200).json({
      message: "Issue type restored successfully",
      issueType
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error restoring issue type" });
  }
};