import { AssignedTo } from "../../models/assignedTo.js";

export const createAssignedTo = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    // Validate required fields
    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ message: "Name is required and cannot be empty" });
    }

    // Check for case-insensitive duplicate
    const existingAssignedTo = await AssignedTo.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingAssignedTo) {
      return res.status(409).json({
        message: "An entry with this name already exists",
      });
    }

    // Validate isActive field
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ message: "isActive must be a boolean value" });
    }

    const newAssignedTo = new AssignedTo({
      name: name.trim(),
      isActive: isActive !== undefined ? isActive : true,
    });

    await newAssignedTo.save();

    res.status(201).json(newAssignedTo);
  } catch (error) {
    console.log("AssignedTo creation error:", error);

    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validationErrors });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "An entry with this name already exists" });
    }

    res
      .status(500)
      .json({ message: "Error creating assigned to: " + error.message });
  }
};

export const getAssignedToList = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const filter = showInactive ? {} : { isActive: true };
    const assignedToList = await AssignedTo.find(filter).sort({ name: 1 });
    res.status(200).json(assignedToList);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching assigned to list" });
  }
};

export const getAssignedToById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const assignedTo = await AssignedTo.findById(id);

    if (!assignedTo) {
      return res.status(404).json({ message: "Assigned To not found" });
    }

    res.status(200).json(assignedTo);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching assigned to" });
  }
};

export const updateAssignedTo = async (req, res) => {
  try {
    const { id } = req.params;
    // const { name, isActive } = req.body;
    const { isActive } = req.body;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Validate required fields
    // if (!name || name.trim() === "") {
    //   return res
    //     .status(400)
    //     .json({ message: "Name is required and cannot be empty" });
    // }

    // Check for case-insensitive duplicate (excluding current record)
    const existingAssignedTo = await AssignedTo.findOne({
    //   name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      _id: { $ne: id },
    });

    if (existingAssignedTo) {
      return res.status(409).json({
        message: "An entry with this name already exists",
      });
    }

    // Validate isActive field
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ message: "isActive must be a boolean value" });
    }

    const updatedAssignedTo = await AssignedTo.findByIdAndUpdate(
      id,
      {
        // name: name.trim(),
        isActive,
      },
      { new: true }
    );

    if (!updatedAssignedTo) {
      return res.status(404).json({ message: "Assigned To not found" });
    }

    res.status(200).json(updatedAssignedTo);
  } catch (error) {
    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validationErrors });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "An entry with this name already exists" });
    }

    res
      .status(500)
      .json({ message: error.message + " - Error updating assigned to" });
  }
};

export const softDeleteAssignedTo = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const assignedTo = await AssignedTo.findById(id);

    if (!assignedTo) {
      return res.status(404).json({ message: "Assigned To not found" });
    }

    await assignedTo.softDelete();
    res.status(200).json({ message: "Assigned To soft deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error soft deleting assigned to" });
  }
};

export const hardDeleteAssignedTo = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const assignedTo = await AssignedTo.findByIdAndDelete(id);

    if (!assignedTo) {
      return res.status(404).json({ message: "Assigned To not found" });
    }

    res.status(200).json({ message: "Assigned To permanently deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error hard deleting assigned to" });
  }
};
