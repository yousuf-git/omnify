// import { TicketStatus } from "../../models/ticketStatus.js";

// export const createTicketStatus = async (req, res) => {
//   try {
//     const { name, description, isActive } = req.body;

//     // Validate required fields
//     if (!name || name.trim() === "") {
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

//     const newTicketStatus = new TicketStatus({
//       name,
//       description,
//       isActive,
//     });

//     await newTicketStatus.save();
//     res.status(201).json(newTicketStatus);
//   } catch (error) {
//     // Handle MongoDB validation errors
//     if (error.name === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ message: "Validation failed", errors: validationErrors });
//     }
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       return res.status(400).json({ message: "Ticket status with this name already exists" });
//     }

//     res
//       .status(500)
//       .json({ message: error.message + " - Error creating ticket status" });
//   }
// };

// export const getTicketStatuses = async (req, res) => {
//   try {
//     const showInactive = req.query.showInactive === "true";
//     const filter = showInactive ? {} : { isActive: true };
//     const ticketStatuses = await TicketStatus.find(filter);
//     res.status(200).json(ticketStatuses);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching ticket statuses" });
//   }
// };

// export const getTicketStatusById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate MongoDB ObjectId format
//     if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({ message: "Invalid ticket status ID format" });
//     }

//     const ticketStatus = await TicketStatus.findById(id);

//     if (!ticketStatus) {
//       return res.status(404).json({ message: "Ticket status not found" });
//     }

//     res.status(200).json(ticketStatus);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching ticket status" });
//   }
// };

// export const updateTicketStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, description, isActive } = req.body;

//     // Validate MongoDB ObjectId format
//     if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({ message: "Invalid ticket status ID format" });
//     }

//     // Validate required fields
//     if (!name || name.trim() === "") {
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

//     const updatedTicketStatus = await TicketStatus.findByIdAndUpdate(
//       id,
//       { name, description, isActive },
//       { new: true }
//     );

//     if (!updatedTicketStatus) {
//       return res.status(404).json({ message: "Ticket status not found" });
//     }

//     res.status(200).json(updatedTicketStatus);
//   } catch (error) {
//     // Handle MongoDB validation errors
//     if (error.name === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ message: "Validation failed", errors: validationErrors });
//     }
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       return res.status(400).json({ message: "Ticket status with this name already exists" });
//     }

//     res
//       .status(500)
//       .json({ message: error.message + " - Error updating ticket status" });
//   }
// };

// export const deleteTicketStatus = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate MongoDB ObjectId format
//     if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({ message: "Invalid ticket status ID format" });
//     }

//     const ticketStatus = await TicketStatus.findById(id);

//     if (!ticketStatus) {
//       return res.status(404).json({ message: "Ticket status not found" });
//     }
    
//     await ticketStatus.softDelete();
//     res.status(200).json({ message: "Ticket status deleted successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error deleting ticket status" });
//   }
// };


import { TicketStatus } from "../../models/ticketStatus.js";

export const createTicketStatus = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    // Validate required fields
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required and cannot be empty" });
    }

    // Validate isActive field
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean value" });
    }

    const newTicketStatus = new TicketStatus({
      name,
      description,
      isActive,
    });

    await newTicketStatus.save();
    res.status(201).json(newTicketStatus);
  } catch (error) {
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: "Ticket status with this name already exists" });
    }

    res.status(500).json({ message: error.message + " - Error creating ticket status" });
  }
};

export const getTicketStatuses = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const ticketStatuses = await TicketStatus.find(showInactive ? {} : { isActive: true });
    res.status(200).json(ticketStatuses);
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error fetching ticket statuses" });
  }
};

export const getTicketStatusById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ticket status ID format" });
    }

    const ticketStatus = await TicketStatus.findById(id);

    if (!ticketStatus) {
      return res.status(404).json({ message: "Ticket status not found" });
    }

    res.status(200).json(ticketStatus);
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error fetching ticket status" });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ticket status ID format" });
    }

    // Validate required fields
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required and cannot be empty" });
    }

    // Validate isActive field
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean value" });
    }

    const updatedTicketStatus = await TicketStatus.findByIdAndUpdate(
      id,
      { name, description, isActive },
      { new: true }
    );

    if (!updatedTicketStatus) {
      return res.status(404).json({ message: "Ticket status not found" });
    }

    res.status(200).json(updatedTicketStatus);
  } catch (error) {
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: "Ticket status with this name already exists" });
    }

    res.status(500).json({ message: error.message + " - Error updating ticket status" });
  }
};

// Soft Delete (Toggle Active/Inactive)
export const softDeleteTicketStatus = async (req, res) => {
  const { id } = req.params;
  try {
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ticket status ID format" });
    }

    const ticketStatus = await TicketStatus.findById(id);
    if (!ticketStatus) {
      return res.status(404).json({ message: "Ticket status not found" });
    }
    
    await ticketStatus.softDelete();
    
    res.status(200).json({
      message: `Ticket Status ${ticketStatus.isActive ? "enabled" : "disabled"} successfully`,
      ticketStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error soft deleting ticket status" });
  }
};

// Hard Delete (Permanent Delete)
export const hardDeleteTicketStatus = async (req, res) => {
  const { id } = req.params;
  try {
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ticket status ID format" });
    }

    const deletedTicketStatus = await TicketStatus.findByIdAndDelete(id);
    if (!deletedTicketStatus) {
      return res.status(404).json({ message: "Ticket status not found" });
    }
    res.status(200).json({ message: "Ticket status permanently deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error hard deleting ticket status" });
  }
};

// Restore Soft Deleted Ticket Status
export const restoreTicketStatus = async (req, res) => {
  const { id } = req.params;
  try {
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ticket status ID format" });
    }

    const ticketStatus = await TicketStatus.findById(id);
    if (!ticketStatus) {
      return res.status(404).json({ message: "Ticket status not found" });
    }
    
    await ticketStatus.restore();
    
    res.status(200).json({
      message: "Ticket status restored successfully",
      ticketStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error restoring ticket status" });
  }
};

export const deleteTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ticket status ID format" });
    }

    const ticketStatus = await TicketStatus.findById(id);

    if (!ticketStatus) {
      return res.status(404).json({ message: "Ticket status not found" });
    }
    
    await ticketStatus.softDelete();
    res.status(200).json({ message: "Ticket status deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error deleting ticket status" });
  }
};