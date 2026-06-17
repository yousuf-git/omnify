import State from "../../models/state.js";

export const getAllStates = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === 'true';
    
    let states;
    if (showInactive) {
      states = await State.find();
    } else {
      states = await State.find().active();
    }
    
    res.status(200).json(states);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching states" });
  }
};

export const getStateById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate MongoDB ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid state ID format" });
        }

        const state = await State.findById(id);
        if (!state) {
            return res.status(404).json({ error: "State not found" });
        }
        res.status(200).json(state);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching state" });
    }
};

export const createState = async (req, res) => {
    try {
        const { stateName, isActive } = req.body;
        
        // Validate required fields
        if (!stateName || stateName.trim() === "") {
            return res.status(400).json({ error: "State name is required and cannot be empty" });
        }

        const state = await State.create({ 
            stateName: stateName.trim(), 
            isActive: isActive !== undefined ? isActive : true 
        });
        
        res.status(201).json(state);
    } catch (error) {
        console.error(error);
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({ error: "State with this name already exists" });
        }
        
        // Handle MongoDB validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: "Validation failed", errors: validationErrors });
        }
        
        res.status(500).json({ error: "Error creating state" });
    }
}

export const updateState = async (req, res) => {
  try {
    const { id } = req.params;
    const { stateName, isActive } = req.body;
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: "Invalid state ID format" });
    }

    // Validate state name if provided
    if (stateName && stateName.trim() === "") {
        return res.status(400).json({ error: "State name cannot be empty" });
    }

    const updateData = {};
    
    if (stateName) updateData.stateName = stateName.trim();
    
    // Only update isActive if provided
    if (typeof isActive !== 'undefined') {
      updateData.isActive = isActive;
      updateData.deletedAt = isActive ? null : new Date();
    }

    const state = await State.findByIdAndUpdate(id, updateData, { 
        new: true,
        runValidators: true 
    });
    
    if (!state) {
      return res.status(404).json({ error: "State not found" });
    }
    res.status(200).json(state);
  } catch (error) {
    console.error(error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
        return res.status(400).json({ error: "State with this name already exists" });
    }
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ error: "Validation failed", errors: validationErrors });
    }
    
    res.status(500).json({ error: "Error updating state" });
  }
}

// Soft Delete (Toggle Active/Inactive)
export const softDeleteState = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: "Invalid state ID format" });
    }

    const state = await State.findById(id);
    if (!state) {
      return res.status(404).json({ error: "State not found" });
    }
    
    await state.softDelete();
    
    res.status(200).json({ 
      message: `State ${state.isActive ? "enabled" : "disabled"} successfully`,
      state 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error soft deleting state" });
  }
}

// Hard Delete (Permanent Delete)
export const hardDeleteState = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: "Invalid state ID format" });
    }

    const deletedState = await State.findByIdAndDelete(id);
    if (!deletedState) {
      return res.status(404).json({ error: "State not found" });
    }
    
    res.status(200).json({ 
      message: "State permanently deleted successfully",
      deletedState: {
        _id: deletedState._id,
        stateName: deletedState.stateName
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error hard deleting state" });
  }
}

// Restore Soft Deleted State
export const restoreState = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: "Invalid state ID format" });
    }

    const state = await State.findById(id);
    if (!state) {
      return res.status(404).json({ error: "State not found" });
    }
    
    await state.restore();
    
    res.status(200).json({
      message: "State restored successfully",
      state
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error restoring state" });
  }
}

// Keep the original delete function for backward compatibility
export const deleteState = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: "Invalid state ID format" });
    }

    const state = await State.findById(id);
    if (!state) {
      return res.status(404).json({ error: "State not found" });
    }
    
    await state.softDelete();
    
    res.status(200).json({ 
      message: `State ${state.isActive ? "enabled" : "disabled"} successfully`,
      state 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting state" });
  }
}


// controllers/state/index.js mein yeh add karein
export const importStates = async (req, res) => {
  try {
    const { states } = req.body;
    
    if (!Array.isArray(states)) {
      return res.status(400).json({ error: 'States data must be an array' });
    }

    const results = {
      imported: 0,
      failed: 0,
      errors: []
    };

    // Process states sequentially
    for (let i = 0; i < states.length; i++) {
      try {
        const stateData = states[i];
        
        // Validate required fields
        const requiredFields = ['stateName'];
        const missingFields = requiredFields.filter(field => !stateData[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Check for duplicate state name
        const existingState = await State.findOne({ 
          stateName: stateData.stateName.trim()
        });
        
        if (existingState) {
          throw new Error(`State with name "${stateData.stateName}" already exists`);
        }

        const state = new State({
          stateName: stateData.stateName.trim(),
          isActive: stateData.isActive !== undefined ? stateData.isActive : true
        });
        
        await state.save();
        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          index: i,
          stateName: states[i]?.stateName,
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
      error: 'Error during import: ' + error.message 
    });
  }
};