// // party controller  CRUD operations
// import { Party } from "../../models/party.js";

// export const getParties = async (req, res) => {
//   try {
//     const showInactive = req.query.showInactive === "true";
//     const filter = showInactive ? {} : { isActive: true };
//     const parties = await Party.find(filter).populate("resellerId").populate("cityId").populate("stateId").exec();
//     res.status(200).json(parties);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching parties" });
//   }
// };

// export const getPartyById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const party = await Party.findById(id)
//       .populate("cityId")  // Populate city data
//       .populate("stateId");;
//     if (!party) {
//       return res.status(404).json({ message: "Party not found" });
//     }
//     res.status(200).json(party);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching party by ID" });
//   }
// };

// export const createParty = async (req, res) => {
//   const party = new Party(req.body);
//   try {
//     const savedParty = await party.save();
//     res.status(201).json(savedParty);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: error.message + " - Error creating party" });
//   }
// };

// export const updateParty = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const updatedParty = await Party.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });
//     if (!updatedParty) {
//       return res.status(404).json({ message: "Party not found" });
//     }
//     res.status(200).json(updatedParty);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: error.message + " - Error updating party" });
//   }
// };

// export const deleteParty = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deletedParty = await Party.findById(id);
//     if (!deletedParty) {
//       return res.status(404).json({ message: "Party not found" });
//     }
//     deletedParty.isActive = false;
//     await deletedParty.save();
//     res.status(200).json({ message: "Party deleted successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error deleting party" });
//   }
// };


// export const importParties = async (req, res) => {
//   try {
//     const { parties } = req.body;
    
//     if (!Array.isArray(parties)) {
//       return res.status(400).json({ message: 'Parties data must be an array' });
//     }

//     const results = {
//       imported: 0,
//       failed: 0,
//       errors: []
//     };

//     // Process parties sequentially to maintain order and handle errors individually
//     for (let i = 0; i < parties.length; i++) {
//       try {
//         const partyData = parties[i];
        
//         // Validate required fields
//         const requiredFields = ['partyName', 'address', 'gstn', 'cityId', 'stateId'];
//         const missingFields = requiredFields.filter(field => !partyData[field]);
        
//         if (missingFields.length > 0) {
//           throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
//         }

//         // Check for duplicate party name (optional)
//         const existingParty = await Party.findOne({
//           partyName: partyData.partyName
//         });
        
//         if (existingParty) {
//           throw new Error(`Party with name "${partyData.partyName}" already exists`);
//         }

//         const party = new Party(partyData);
//         await party.save();
//         results.imported++;
//       } catch (error) {
//         results.failed++;
//         results.errors.push({
//           index: i,
//           partyName: parties[i]?.partyName,
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


import { Party } from "../../models/party.js";

export const getParties = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const filter = showInactive ? {} : { isActive: true };
    const parties = await Party.find(filter).populate("resellerId").populate("cityId").populate("stateId").exec();
    res.status(200).json(parties);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching parties" });
  }
};

export const getPartyById = async (req, res) => {
  const { id } = req.params;
  try {
    const party = await Party.findById(id)
      .populate("cityId")  // Populate city data
      .populate("stateId");;
    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }
    res.status(200).json(party);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching party by ID" });
  }
};

export const createParty = async (req, res) => {
  const party = new Party(req.body);
  try {
    const savedParty = await party.save();
    res.status(201).json(savedParty);
  } catch (error) {
    res
      .status(400)
      .json({ message: error.message + " - Error creating party" });
  }
};

export const updateParty = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedParty = await Party.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedParty) {
      return res.status(404).json({ message: "Party not found" });
    }
    res.status(200).json(updatedParty);
  } catch (error) {
    res
      .status(400)
      .json({ message: error.message + " - Error updating party" });
  }
};

export const softDeleteParty = async (req, res) => {
  const { id } = req.params;
  // console.log('Soft delete called for party ID:', id);
  
  try {
    const party = await Party.findById(id);
    // console.log('Found party:', party);
    
    if (!party) {
      // console.log('Party not found');
      return res.status(404).json({ message: "Party not found" });
    }
    
    // console.log('Before toggle - isActive:', party.isActive);
    party.isActive = !party.isActive;
    // console.log('After toggle - isActive:', party.isActive);
    
    await party.save();
    // console.log('Party saved successfully');
    
    res.status(200).json({ 
      message: `Party ${party.isActive ? "activated" : "deactivated"} successfully`,
      party 
    });
  } catch (error) {
    console.error('Error in softDeleteParty:', error);
    res.status(500).json({ message: error.message + " - Error soft deleting party" });
  }
};

// Hard Delete (Permanent Delete)
export const hardDeleteParty = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedParty = await Party.findByIdAndDelete(id);
    if (!deletedParty) {
      return res.status(404).json({ message: "Party not found" });
    }
    res.status(200).json({ message: "Party permanently deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error hard deleting party" });
  }
};

// Restore Soft Deleted Party
export const restoreParty = async (req, res) => {
  const { id } = req.params;
  try {
    const party = await Party.findById(id);
    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }
    
    party.isActive = true;
    party.isDeleted = false;
    party.deletedAt = null;
    await party.save();
    
    res.status(200).json({
      message: "Party restored successfully",
      party
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error restoring party" });
  }
};

// Get Deleted Parties
export const getDeletedParties = async (req, res) => {
  try {
    const parties = await Party.find().deleted()
      .populate("resellerId")
      .populate("cityId")
      .populate("stateId")
      .exec();
      
    res.status(200).json(parties);
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error fetching deleted parties" });
  }
};

export const importParties = async (req, res) => {
  try {
    const { parties } = req.body;
    
    if (!Array.isArray(parties)) {
      return res.status(400).json({ message: 'Parties data must be an array' });
    }

    const results = {
      imported: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < parties.length; i++) {
      try {
        const partyData = parties[i];
        
        const requiredFields = ['partyName', 'address', 'gstn', 'cityId', 'stateId'];
        const missingFields = requiredFields.filter(field => !partyData[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Check for duplicate party name (only among non-deleted parties)
        const existingParty = await Party.findOne({
          partyName: partyData.partyName,
          isDeleted: false
        });
        
        if (existingParty) {
          throw new Error(`Party with name "${partyData.partyName}" already exists`);
        }

        const party = new Party(partyData);
        await party.save();
        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          index: i,
          partyName: parties[i]?.partyName,
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