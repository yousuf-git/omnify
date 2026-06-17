// import { SupportPerson } from "../../models/supportPerson.js";

// export const createSupportPerson = async (req, res) => {
//   try {
//     const { agencyId, supportPersonName, supportPersonNumber, cityId, stateId, rating, isActive } = req.body;

//     // Validate required fields
//     if (!agencyId || agencyId.trim() === "") {
//       return res.status(400).json({ message: "Agency ID is required and cannot be empty" });
//     }

//     if (!supportPersonName || supportPersonName.trim() === "") {
//       return res.status(400).json({ message: "Support Person Name is required and cannot be empty" });
//     }

//     if (!supportPersonNumber || supportPersonNumber.trim() === "") {
//       return res.status(400).json({ message: "Support Person Number is required and cannot be empty" });
//     }

//     if (!cityId || cityId.trim() === "") {
//       return res.status(400).json({ message: "City is required and cannot be empty" });
//     }

//     if (!stateId || stateId.trim() === "") {
//       return res.status(400).json({ message: "State is required and cannot be empty" });
//     }

//     const newSupportPerson = new SupportPerson({
//       agencyId,
//       supportPersonName,
//       supportPersonNumber,
//       cityId,
//       stateId,
//       rating,
//       isActive,
//     });

//     await newSupportPerson.save();
//     res.status(201).json(newSupportPerson);
//   } catch (error) {
//     console.log(error);
//     // Handle MongoDB validation errors
//     if (error.name === 'ValidationError') { // Fix: error.supportPersonName -> error.name
//       const validationErrors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ message: "Validation failed", errors: validationErrors });
//     }
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       return res.status(400).json({ message: "Support person with this number already exists" });
//     }

//     // Handle reference errors (invalid agencyId, cityId, stateId)
//     if (error.name === 'CastError') { // Fix: error.supportPersonName -> error.name
//       if (error.path === 'agencyId') {
//         return res.status(400).json({ message: "Invalid agency ID provided" });
//       }
//       if (error.path === 'cityId') {
//         return res.status(400).json({ message: "Invalid city ID provided" });
//       }
//       if (error.path === 'stateId') {
//         return res.status(400).json({ message: "Invalid state ID provided" });
//       }
//     }

//     res
//       .status(500)
//       .json({ message: error.message + " - Error creating support person" });
//   }
// };

// export const getSupportPersons = async (req, res) => {
//   try {
//     const showInactive = req.query.showInactive === "true";
//     const filter = showInactive ? {} : { isActive: true };
//     const supportPersons = await SupportPerson.find(filter).populate('agencyId').populate('cityId').populate('stateId').exec();
//     res.status(200).json(supportPersons);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching support persons" });
//   }
// };

// export const getSupportPersonById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate MongoDB ObjectId format
//     if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({ message: "Invalid support person ID format" });
//     }

//     const supportPerson = await SupportPerson.findById(id).populate('agencyId');

//     if (!supportPerson) {
//       return res.status(404).json({ message: "Support person not found" });
//     }

//     res.status(200).json(supportPerson);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching support person" });
//   }
// };

// export const updateSupportPerson = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { agencyId, supportPersonName, supportPersonNumber, cityId, stateId, rating, isActive } = req.body;

//     // Validate MongoDB ObjectId format
//     if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({ message: "Invalid support person ID format" });
//     }

//     // Validate required fields
//     if (!agencyId || agencyId.trim() === "") {
//       return res.status(400).json({ message: "Agency ID is required and cannot be empty" });
//     }

//     if (!supportPersonName || supportPersonName.trim() === "") {
//       return res.status(400).json({ message: "Name is required and cannot be empty" });
//     }

//     if (!supportPersonNumber || supportPersonNumber.trim() === "") {
//       return res.status(400).json({ message: "Number is required and cannot be empty" });
//     }

//     // Fix: Use cityId instead of city
//     if (!cityId || cityId.trim() === "") {
//       return res.status(400).json({ message: "City is required and cannot be empty" });
//     }

//     // Validate agencyId format
//     if (!agencyId.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({ message: "Invalid agency ID format" });
//     }

//     // Validate number format
//     if (!/^[\d\+\-\(\)\s]+$/.test(supportPersonNumber)) {
//       return res.status(400).json({ message: "Number must contain only digits, spaces, and phone number characters" });
//     }

//     // Validate rating if provided
//     if (rating !== undefined) {
//       if (typeof rating !== "number" || rating < 0 || rating > 5) {
//         return res.status(400).json({ message: "Rating must be a number between 0 and 5" });
//       }
//     }

//     // Validate isActive field
//     if (isActive !== undefined && typeof isActive !== "boolean") {
//       return res.status(400).json({ message: "isActive must be a boolean value" });
//     }

//     const updatedSupportPerson = await SupportPerson.findByIdAndUpdate(
//       id,
//       { agencyId, supportPersonName, supportPersonNumber, cityId, stateId, rating, isActive },
//       { new: true }
//     ).populate('agencyId');

//     if (!updatedSupportPerson) {
//       return res.status(404).json({ message: "Support person not found" });
//     }

//     res.status(200).json(updatedSupportPerson);
//   } catch (error) {
//     // Handle MongoDB validation errors
//     if (error.name === 'ValidationError') { // Fix: error.supportPersonName -> error.name
//       const validationErrors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ message: "Validation failed", errors: validationErrors });
//     }
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       return res.status(400).json({ message: "Support person with this number already exists" });
//     }

//     // Handle reference errors (invalid agencyId)
//     if (error.name === 'CastError' && error.path === 'agencyId') { // Fix: error.supportPersonName -> error.name
//       return res.status(400).json({ message: "Invalid agency ID provided" });
//     }

//     res
//       .status(500)
//       .json({ message: error.message + " - Error updating support person" });
//   }
// };

// export const deleteSupportPerson = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate MongoDB ObjectId format
//     if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({ message: "Invalid support person ID format" });
//     }

//     const supportPerson = await SupportPerson.findById(id);

//     if (!supportPerson) {
//       return res.status(404).json({ message: "Support person not found" });
//     }
    
//     await supportPerson.softDelete();
//     res.status(200).json({ message: "Support person deleted successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error deleting support person" });
//   }
// };


// export const importSupportPersons = async (req, res) => {
//   try {
//     const { supportPersons } = req.body;
    
//     if (!Array.isArray(supportPersons)) {
//       return res.status(400).json({ message: 'Support persons data must be an array' });
//     }

//     const results = {
//       imported: 0,
//       failed: 0,
//       errors: []
//     };

//     // Process support persons sequentially to maintain order and handle errors individually
//     for (let i = 0; i < supportPersons.length; i++) {
//       try {
//         const supportPersonData = supportPersons[i];
        
//         // Validate required fields
//         const requiredFields = ['supportPersonName', 'supportPersonNumber', 'agencyId', 'cityId', 'stateId'];
//         const missingFields = requiredFields.filter(field => !supportPersonData[field]);
        
//         if (missingFields.length > 0) {
//           throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
//         }

//         // Check for duplicate support person number (optional)
//         const existingSupportPerson = await SupportPerson.findOne({
//           supportPersonNumber: supportPersonData.supportPersonNumber
//         });
        
//         if (existingSupportPerson) {
//           throw new Error(`Support person with number "${supportPersonData.supportPersonNumber}" already exists`);
//         }

//         const supportPerson = new SupportPerson(supportPersonData);
//         await supportPerson.save();
//         results.imported++;
//       } catch (error) {
//         results.failed++;
//         results.errors.push({
//           index: i,
//           supportPersonName: supportPersons[i]?.supportPersonName,
//           error: error.message
//         });
//       }
//     }

//     res.status(200).json({
//       message: `Import completed: ${results.imported} successful, ${results.failed} failed`,
//       ...results
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       message: 'Error during import: ' + error.message 
//     });
//   }
// };

import { SupportPerson } from "../../models/supportPerson.js";

export const createSupportPerson = async (req, res) => {
  try {
    const { agencyId, supportPersonName, supportPersonNumber, cityId, stateId,  isActive } = req.body;

    // Validate required fields
    if (!supportPersonName || supportPersonName.trim() === "") {
      return res.status(400).json({ message: "Support Person Name is required and cannot be empty" });
    }

    if (!supportPersonNumber || supportPersonNumber.trim() === "") {
      return res.status(400).json({ message: "Support Person Number is required and cannot be empty" });
    }

    if (!cityId || cityId.trim() === "") {
      return res.status(400).json({ message: "City is required and cannot be empty" });
    }

    if (!stateId || stateId.trim() === "") {
      return res.status(400).json({ message: "State is required and cannot be empty" });
    }

    const newSupportPerson = new SupportPerson({
      agencyId,
      supportPersonName,
      supportPersonNumber,
      cityId,
      stateId,
      isActive,
    });

    await newSupportPerson.save();
    res.status(201).json(newSupportPerson);
  } catch (error) {
    console.log(error);
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: "Support person with this number already exists" });
    }

    // Handle reference errors (invalid agencyId, cityId, stateId)
    if (error.name === 'CastError') {
      if (error.path === 'agencyId') {
        return res.status(400).json({ message: "Invalid agency ID provided" });
      }
      if (error.path === 'cityId') {
        return res.status(400).json({ message: "Invalid city ID provided" });
      }
      if (error.path === 'stateId') {
        return res.status(400).json({ message: "Invalid state ID provided" });
      }
    }

    res
      .status(500)
      .json({ message: error.message + " - Error creating support person" });
  }
};

export const getSupportPersons = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const deleteType = req.query.deleteType || "soft"; // 'soft' or 'hard'
    
    let supportPersons;
    if (deleteType === "hard") {
      // For hard delete, only show non-deleted items
      supportPersons = await SupportPerson.find(showInactive ? {} : { isActive: true })
        .populate('agencyId')
        .populate('cityId')
        .populate('stateId')
        .exec();
    } else {
      // For soft delete, use the active/inactive query helpers
      supportPersons = showInactive 
        ? await SupportPerson.find().populate('agencyId').populate('cityId').populate('stateId').exec()
        : await SupportPerson.find().active().populate('agencyId').populate('cityId').populate('stateId').exec();
    }
    
    res.status(200).json(supportPersons);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching support persons" });
  }
};

export const getSupportPersonById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid support person ID format" });
    }

    const supportPerson = await SupportPerson.findById(id)
      .populate('agencyId')
      .populate('cityId')
      .populate('stateId');

    if (!supportPerson) {
      return res.status(404).json({ message: "Support person not found" });
    }

    res.status(200).json(supportPerson);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching support person" });
  }
};

export const updateSupportPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { agencyId, supportPersonName, supportPersonNumber, cityId, stateId,  isActive } = req.body;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid support person ID format" });
    }

    // Validate required fields
    if (!supportPersonName || supportPersonName.trim() === "") {
      return res.status(400).json({ message: "Name is required and cannot be empty" });
    }

    if (!supportPersonNumber || supportPersonNumber.trim() === "") {
      return res.status(400).json({ message: "Number is required and cannot be empty" });
    }

 

    // Validate isActive field
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean value" });
    }

    const updatedSupportPerson = await SupportPerson.findByIdAndUpdate(
      id,
      { agencyId, supportPersonName, supportPersonNumber, cityId, stateId,  isActive },
      { new: true }
    )
    .populate('agencyId')
    .populate('cityId')
    .populate('stateId');

    if (!updatedSupportPerson) {
      return res.status(404).json({ message: "Support person not found" });
    }

    res.status(200).json(updatedSupportPerson);
  } catch (error) {
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: "Support person with this number already exists" });
    }

    // Handle reference errors (invalid agencyId)
    if (error.name === 'CastError' && error.path === 'agencyId') {
      return res.status(400).json({ message: "Invalid agency ID provided" });
    }

    res
      .status(500)
      .json({ message: error.message + " - Error updating support person" });
  }
};

// Soft Delete (Toggle Active/Inactive)
export const softDeleteSupportPerson = async (req, res) => {
  const { id } = req.params;
  try {
    const supportPerson = await SupportPerson.findById(id);
    if (!supportPerson) {
      return res.status(404).json({ message: "Support person not found" });
    }
    
    supportPerson.isActive = !supportPerson.isActive;
    if (!supportPerson.isActive) {
      supportPerson.deletedAt = new Date();
    } else {
      supportPerson.deletedAt = null;
    }
    
    await supportPerson.save();
    
    res.status(200).json({
      message: `Support Person ${supportPerson.isActive ? "enabled" : "disabled"} successfully`,
      supportPerson
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error soft deleting support person" });
  }
};

// Hard Delete (Permanent Delete)
export const hardDeleteSupportPerson = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSupportPerson = await SupportPerson.findByIdAndDelete(id);
    if (!deletedSupportPerson) {
      return res.status(404).json({ message: "Support person not found" });
    }
    res.status(200).json({ message: "Support person permanently deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error hard deleting support person" });
  }
};

// Restore Soft Deleted Support Person
export const restoreSupportPerson = async (req, res) => {
  const { id } = req.params;
  try {
    const supportPerson = await SupportPerson.findById(id);
    if (!supportPerson) {
      return res.status(404).json({ message: "Support person not found" });
    }
    
    supportPerson.isActive = true;
    supportPerson.deletedAt = null;
    await supportPerson.save();
    
    res.status(200).json({
      message: "Support person restored successfully",
      supportPerson
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error restoring support person" });
  }
};

export const importSupportPersons = async (req, res) => {
  try {
    const { supportPersons } = req.body;
    
    if (!Array.isArray(supportPersons)) {
      return res.status(400).json({ message: 'Support persons data must be an array' });
    }

    const results = {
      imported: 0,
      failed: 0,
      errors: []
    };

    // Process support persons sequentially to maintain order and handle errors individually
    for (let i = 0; i < supportPersons.length; i++) {
      try {
        const supportPersonData = supportPersons[i];
        
        // Validate required fields
        const requiredFields = ['supportPersonName', 'supportPersonNumber', 'cityId', 'stateId'];
        const missingFields = requiredFields.filter(field => !supportPersonData[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Check for duplicate support person number (optional)
        const existingSupportPerson = await SupportPerson.findOne({
          supportPersonNumber: supportPersonData.supportPersonNumber
        });
        
        if (existingSupportPerson) {
          throw new Error(`Support person with number "${supportPersonData.supportPersonNumber}" already exists`);
        }

        const supportPerson = new SupportPerson(supportPersonData);
        await supportPerson.save();
        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          index: i,
          supportPersonName: supportPersons[i]?.supportPersonName,
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