import { Agency } from "../../models/agency.js";

export const createAgency = async (req, res) => {
  try {
    const { agencyName, agencyNumber, cityId, stateId, isActive } = req.body;

    // Validate required fields
    if (!agencyName || agencyName.trim() === "") {
      return res.status(400).json({ message: "Name is required and cannot be empty" });
    }

    if (!agencyNumber || agencyNumber.trim() === "") {
      return res.status(400).json({ message: "Number is required and cannot be empty" });
    }

    // Validate isActive field
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean value" });
    }

    const newAgency = new Agency({
      agencyName,
      agencyNumber,
      cityId,
      stateId,
      isActive,
    });

    await newAgency.save();
    res.status(201).json(newAgency);
  } catch (error) {
    // Handle MongoDB validation errors
    if (error.agencyName === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: "Agency with this name or number already exists" });
    }
    console.log(error)
    res
      .status(500)
      .json({ message: error.message + " - Error creating agency" });
  }
};

export const getAgencies = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const deleteType = req.query.deleteType || "soft"; // 'soft' or 'hard'
    
    let agencies;
    if (deleteType === "hard") {
      // For hard delete, only show non-deleted items
      agencies = await Agency.find(showInactive ? {} : { isActive: true })
        .populate('cityId')
        .populate('stateId')
        .exec();
    } else {
      // For soft delete, use the active/inactive query helpers
      agencies = showInactive 
        ? await Agency.find().populate('cityId').populate('stateId').exec()
        : await Agency.find().active().populate('cityId').populate('stateId').exec();
    }
    
    res.status(200).json(agencies);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching agencies" });
  }
};

export const getAgencyById = async (req, res) => {
  try {
    const { id } = req.params;
    const agency = await Agency.findById(id)
      .populate("cityId")  
      .populate("stateId");

    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    res.status(200).json(agency);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching agency" });
  }
};

export const updateAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const { agencyName, agencyNumber, cityId, stateId, isActive } = req.body;

    // Validate isActive field
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean value" });
    }

    const updatedAgency = await Agency.findByIdAndUpdate(
      id,
      { agencyName, agencyNumber, cityId, stateId, isActive },
      { new: true }
    );

    if (!updatedAgency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    res.status(200).json(updatedAgency);
  } catch (error) {
    // Handle MongoDB validation errors
    if (error.agencyName === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: "Agency with this name or number already exists" });
    }

    res
      .status(500)
      .json({ message: error.message + " - Error updating agency" });
  }
};

// Soft Delete (Toggle Active/Inactive)
export const softDeleteAgency = async (req, res) => {
  const { id } = req.params;
  try {
    const agency = await Agency.findById(id);
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }
    
    agency.isActive = !agency.isActive;
    if (!agency.isActive) {
      agency.deletedAt = new Date();
    } else {
      agency.deletedAt = null;
    }
    
    await agency.save();
    
    res.status(200).json({
      message: `Agency ${agency.isActive ? "enabled" : "disabled"} successfully`,
      agency
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error soft deleting agency" });
  }
};

// Hard Delete (Permanent Delete)
export const hardDeleteAgency = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedAgency = await Agency.findByIdAndDelete(id);
    if (!deletedAgency) {
      return res.status(404).json({ message: "Agency not found" });
    }
    res.status(200).json({ message: "Agency permanently deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error hard deleting agency" });
  }
};

// Restore Soft Deleted Agency
export const restoreAgency = async (req, res) => {
  const { id } = req.params;
  try {
    const agency = await Agency.findById(id);
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }
    
    agency.isActive = true;
    agency.deletedAt = null;
    await agency.save();
    
    res.status(200).json({
      message: "Agency restored successfully",
      agency
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error restoring agency" });
  }
};

export const importAgencies = async (req, res) => {
  try {
    const { agencies } = req.body;
    
    if (!Array.isArray(agencies)) {
      return res.status(400).json({ message: 'Agencies data must be an array' });
    }

    const results = {
      imported: 0,
      failed: 0,
      errors: []
    };

    // Process agencies sequentially to maintain order and handle errors individually
    for (let i = 0; i < agencies.length; i++) {
      try {
        const agencyData = agencies[i];
        
        // Validate required fields
        const requiredFields = ['agencyName', 'agencyNumber', 'cityId', 'stateId'];
        const missingFields = requiredFields.filter(field => !agencyData[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Check for duplicate agency name/number (optional)
        const existingAgency = await Agency.findOne({
          $or: [
            { agencyName: agencyData.agencyName },
            { agencyNumber: agencyData.agencyNumber }
          ]
        });
        
        if (existingAgency) {
          throw new Error(`Agency with name "${agencyData.agencyName}" or number "${agencyData.agencyNumber}" already exists`);
        }

        const agency = new Agency(agencyData);
        await agency.save();
        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          index: i,
          agencyName: agencies[i]?.agencyName,
          error: error.message
        });
      }
    }

    res.status(200).json({
      message: `Import completed: ${results.imported} successful, ${results.failed} failed`,
      ...results
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error during import: ' + error.message 
    });
  }
};