// import City from "../../models/city.js";
// import State from "../../models/state.js";

// export const createCity = async (req, res) => {
//   try {
//     const { cityName, stateId, isActive } = req.body;

//     // Ensure state exists before creating city
//     const state = await State.findById(stateId);
//     if (!state) {
//       return res.status(400).json({ message: "Invalid stateId provided" });
//     }

//     const city = await City.create({ cityName, stateId, isActive });
//     res.status(201).json({ message: "City created successfully", city });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const getAllCities = async (req, res) => {
//   try {
//     const cities = await City.find().populate("stateId").exec();
//     // console.log("Raw cities with populate:", cities);
//     res.status(200).json(cities);
//   } catch (error) {
//     console.error("Simple test error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const getCityById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const city = await City.findById(id).populate("stateId", "stateName");
//     if (!city) {
//       return res.status(404).json({ message: "City not found" });
//     }
//     res.status(200).json(city);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const updateCity = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { cityName, isActive, stateId } = req.body;

//     if (stateId) {
//       const state = await State.findById(stateId);
//       if (!state) {
//         return res.status(400).json({ message: "Invalid stateId provided" });
//       }
//     }

//     const updateData = { cityName, stateId };
    
//     // Only update isActive if it's provided in the request
//     if (typeof isActive !== 'undefined') {
//       updateData.isActive = isActive;
//       updateData.deletedAt = isActive ? null : new Date();
//     }

//     const city = await City.findByIdAndUpdate(id, updateData, { new: true });
    
//     if (!city) {
//       return res.status(404).json({ message: "City not found" });
//     }
//     res.status(200).json({ message: "City updated successfully", city });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const deleteCity = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const city = await City.findById(id);
//     if (!city) {
//       return res.status(404).json({ message: "City not found" });
//     }
    
//     // Toggle isActive instead of always setting to false
//     city.isActive = false;
//     city.deletedAt = city.isActive ? null : new Date();
//     await city.save();
    
//     res.status(200).json({ 
//       message: `City ${city.isActive ? "enabled" : "disabled"} successfully`,
//       city 
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


import City from "../../models/city.js";
import State from "../../models/state.js";

export const createCity = async (req, res) => {
  try {
    const { cityName, stateId, isActive } = req.body;

    // Validate required fields
    if (!cityName || cityName.trim() === "") {
      return res.status(400).json({ message: "City name is required and cannot be empty" });
    }

    if (!stateId) {
      return res.status(400).json({ message: "State ID is required" });
    }

    // Ensure state exists before creating city
    const state = await State.findById(stateId);
    if (!state) {
      return res.status(400).json({ message: "Invalid stateId provided" });
    }

    // Check for duplicate city name in the same state
    const existingCity = await City.findOne({ 
      cityName: cityName.trim(),
      stateId 
    });
    
    if (existingCity) {
      return res.status(400).json({ message: "City with this name already exists in the selected state" });
    }

    const city = await City.create({ 
      cityName: cityName.trim(), 
      stateId, 
      isActive: isActive !== undefined ? isActive : true 
    });
    
    // Populate the state data in response
    await city.populate('stateId');
    
    res.status(201).json({ message: "City created successfully", city });
  } catch (error) {
    console.error(error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: "City with this name already exists in the selected state" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllCities = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const populateState = req.query.populate === "true";
    
    let query = showInactive ? {} : { isActive: true };
    
    let citiesQuery = City.find(query);
    
    if (populateState) {
      citiesQuery = citiesQuery.populate("stateId");
    }
    
    const cities = await citiesQuery.exec();
    
    res.status(200).json(cities);
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCityById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid city ID format" });
    }

    const city = await City.findById(id).populate("stateId", "stateName isActive");
    
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }
    
    res.status(200).json(city);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { cityName, isActive, stateId } = req.body;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid city ID format" });
    }

    if (cityName && cityName.trim() === "") {
      return res.status(400).json({ message: "City name cannot be empty" });
    }

    if (stateId) {
      const state = await State.findById(stateId);
      if (!state) {
        return res.status(400).json({ message: "Invalid stateId provided" });
      }
    }

    // Check for duplicate city name in the same state (excluding current city)
    if (cityName && stateId) {
      const existingCity = await City.findOne({ 
        cityName: cityName.trim(),
        stateId,
        _id: { $ne: id }
      });
      
      if (existingCity) {
        return res.status(400).json({ message: "City with this name already exists in the selected state" });
      }
    }

    const updateData = {};
    
    if (cityName) updateData.cityName = cityName.trim();
    if (stateId) updateData.stateId = stateId;
    
    // Only update isActive if it's provided in the request
    if (typeof isActive !== 'undefined') {
      updateData.isActive = isActive;
      updateData.deletedAt = isActive ? null : new Date();
    }

    const city = await City.findByIdAndUpdate(id, updateData, { 
      new: true,
      runValidators: true 
    }).populate('stateId');
    
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }
    
    res.status(200).json({ message: "City updated successfully", city });
  } catch (error) {
    console.error(error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: "City with this name already exists in the selected state" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

// Soft Delete (Toggle Active/Inactive)
export const softDeleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid city ID format" });
    }

    const city = await City.findById(id);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }
    
    await city.softDelete();
    await city.populate('stateId');
    
    res.status(200).json({
      message: `City ${city.isActive ? "enabled" : "disabled"} successfully`,
      city
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Hard Delete (Permanent Delete)
export const hardDeleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid city ID format" });
    }

    const deletedCity = await City.findByIdAndDelete(id);
    if (!deletedCity) {
      return res.status(404).json({ message: "City not found" });
    }
    
    res.status(200).json({ 
      message: "City permanently deleted successfully",
      deletedCity: {
        _id: deletedCity._id,
        cityName: deletedCity.cityName
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Restore Soft Deleted City
export const restoreCity = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid city ID format" });
    }

    const city = await City.findById(id);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }
    
    await city.restore();
    await city.populate('stateId');
    
    res.status(200).json({
      message: "City restored successfully",
      city
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Keep the original delete function for backward compatibility
export const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid city ID format" });
    }

    const city = await City.findById(id);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }
    
    await city.softDelete();
    await city.populate('stateId');
    
    res.status(200).json({ 
      message: `City ${city.isActive ? "enabled" : "disabled"} successfully`,
      city 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// controllers/city/index.js mein yeh add karein
export const importCities = async (req, res) => {
  try {
    const { cities } = req.body;
    
    if (!Array.isArray(cities)) {
      return res.status(400).json({ message: 'Cities data must be an array' });
    }

    const results = {
      imported: 0,
      failed: 0,
      errors: []
    };

    // Process cities sequentially
    for (let i = 0; i < cities.length; i++) {
      try {
        const cityData = cities[i];
        
        // Validate required fields
        const requiredFields = ['cityName', 'stateId'];
        const missingFields = requiredFields.filter(field => !cityData[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Check for duplicate city name in the same state
        const existingCity = await City.findOne({ 
          cityName: cityData.cityName.trim(),
          stateId: cityData.stateId
        });
        
        if (existingCity) {
          throw new Error(`City with name "${cityData.cityName}" already exists in the selected state`);
        }

        const city = new City(cityData);
        await city.save();
        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          index: i,
          cityName: cities[i]?.cityName,
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