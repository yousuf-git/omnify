// import { Store } from "../../models/store.js";

// export const getStores = async (req, res) => {
//   try {
//     const showInactive = req.query.showInactive === "true";
//     const filter = showInactive ? {} : { isActive: true };
//     const stores = await Store.find(filter).populate("partyId").populate("cityId").populate("stateId").exec();
//     res.status(200).json(stores);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching stores" });
//   }
// };

// export const getStoreById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const store = await Store.findById(id)
//       .populate("partyId")
//       .populate("cityId")
//       .populate("stateId");
//     if (!store) {
//       return res.status(404).json({ message: "Store not found" });
//     }
//     res.status(200).json(store);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching store by ID" });
//   }
// };

// // get Stores search by partyId
// export const getStoresByPartyId = async (req, res) => {
//   const { id } = req.params;
//   try{
//     const storesByPartyId = await Store.find({ partyId: id }).populate("cityId").populate("stateId");
//     res.status(201).json(storesByPartyId);
//   } catch (error) {
//     console.log(error);
//     res
//       .status(400)
//       .json({ message: error.message + " - Error get store By Party Id" });
//   }
// }

// export const createStore = async (req, res) => {
//   const store = new Store(req.body);
//   try {
//     const savedStore = await store.save();
//     res.status(201).json(savedStore);
//   } catch (error) {
//     console.log(error);
//     res
//       .status(400)
//       .json({ message: error.message + " - Error creating store" });
//   }
// };

// export const updateStore = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const updatedStore = await Store.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });
//     if (!updatedStore) {
//       return res.status(404).json({ message: "Store not found" });
//     }
//     res.status(200).json(updatedStore);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: error.message + " - Error updating store" });
//   }
// };

// export const deleteStore = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deletedStore = await Store.findById(id);
//     if (!deletedStore) {
//       return res.status(404).json({ message: "Store not found" });
//     }
//     deletedStore.isActive = false;
//     await deletedStore.save();
//     res.status(200).json({ message: "Store deleted successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error deleting store" });
//   }
// };

// export const importStores = async (req, res) => {
//   try {
//     const { stores } = req.body;

//     if (!Array.isArray(stores)) {
//       return res.status(400).json({ message: 'Stores data must be an array' });
//     }

//     const results = {
//       imported: 0,
//       failed: 0,
//       errors: []
//     };

//     // Process stores sequentially to maintain order and handle errors individually
//     for (let i = 0; i < stores.length; i++) {
//       try {
//         const storeData = stores[i];

//         // Validate required fields
//         const requiredFields = ['storeId', 'storeName', 'storeAddress', 'storePinCode', 'smName', 'smContactNo', 'cityId', 'stateId', 'partyId'];
//         const missingFields = requiredFields.filter(field => !storeData[field]);

//         if (missingFields.length > 0) {
//           throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
//         }

//         // Check for duplicate storeId
//         const existingStore = await Store.findOne({ storeId: storeData.storeId });
//         if (existingStore) {
//           throw new Error(`Store with ID ${storeData.storeId} already exists`);
//         }

//         const store = new Store(storeData);
//         await store.save();
//         results.imported++;
//       } catch (error) {
//         results.failed++;
//         results.errors.push({
//           index: i,
//           storeId: stores[i]?.storeId,
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

import { Store } from "../../models/store.js";

export const getStores = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const deleteType = req.query.deleteType || "soft"; // 'soft' or 'hard'

    let stores;
    if (deleteType === "hard") {
      // For hard delete, only show non-deleted items
      stores = await Store.find(showInactive ? {} : { isActive: true })
        .populate("partyId")
        .populate("cityId")
        .populate("stateId")
        .exec();
    } else {
      // For soft delete, use the active/inactive query helpers
      stores = showInactive
        ? await Store.find()
            .populate("partyId")
            .populate("cityId")
            .populate("stateId")
            .exec()
        : await Store.find()
            .active()
            .populate("partyId")
            .populate("cityId")
            .populate("stateId")
            .exec();
    }

    res.status(200).json(stores);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching stores" });
  }
};

export const getStoreById = async (req, res) => {
  const { id } = req.params;
  try {
    const store = await Store.findById(id)
      .populate("partyId")
      .populate("cityId")
      .populate("stateId");
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.status(200).json(store);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching store by ID" });
  }
};

// get Stores search by partyId
export const getStoresByPartyId = async (req, res) => {
  const { id } = req.params;
  try {
    const storesByPartyId = await Store.find({ partyId: id })
      .populate("cityId")
      .populate("stateId");
    res.status(201).json(storesByPartyId);
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: error.message + " - Error get store By Party Id" });
  }
};

export const createStore = async (req, res) => {
  const store = new Store(req.body);
  try {
    const savedStore = await store.save();
    res.status(201).json(savedStore);
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: error.message + " - Error creating store" });
  }
};

export const updateStore = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedStore = await Store.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedStore) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.status(200).json(updatedStore);
  } catch (error) {
    res
      .status(400)
      .json({ message: error.message + " - Error updating store" });
  }
};

// Soft Delete (Toggle Active/Inactive)
export const softDeleteStore = async (req, res) => {
  const { id } = req.params;
  try {
    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    store.isActive = !store.isActive;
    if (!store.isActive) {
      store.deletedAt = new Date();
    } else {
      store.deletedAt = null;
    }

    await store.save();

    res.status(200).json({
      message: `Store ${store.isActive ? "enabled" : "disabled"} successfully`,
      store,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error soft deleting store" });
  }
};

// Hard Delete (Permanent Delete)
export const hardDeleteStore = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedStore = await Store.findByIdAndDelete(id);
    if (!deletedStore) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.status(200).json({ message: "Store permanently deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error hard deleting store" });
  }
};

// Restore Soft Deleted Store
export const restoreStore = async (req, res) => {
  const { id } = req.params;
  try {
    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    store.isActive = true;
    store.deletedAt = null;
    await store.save();

    res.status(200).json({
      message: "Store restored successfully",
      store,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error restoring store" });
  }
};

// export const importStores = async (req, res) => {
//   try {
//     const { stores } = req.body;

//     if (!Array.isArray(stores)) {
//       return res.status(400).json({ message: 'Stores data must be an array' });
//     }

//     const results = {
//       imported: 0,
//       failed: 0,
//       errors: []
//     };

//     // Process stores sequentially to maintain order and handle errors individually
//     for (let i = 0; i < stores.length; i++) {
//       try {
//         const storeData = stores[i];

//         // Validate required fields
//         const requiredFields = ['storeId', 'storeName', 'partyId'];
//         const missingFields = requiredFields.filter(field => !storeData[field]);

//         if (missingFields.length > 0) {
//           throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
//         }

//         // Check for duplicate storeId
//         const existingStore = await Store.findOne({ storeId: storeData.storeId });
//         if (existingStore) {
//           throw new Error(`Store with ID ${storeData.storeId} already exists`);
//         }

//         const store = new Store(storeData);
//         await store.save();
//         results.imported++;
//       } catch (error) {
//         results.failed++;
//         results.errors.push({
//           index: i,
//           storeId: stores[i]?.storeId,
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
export const importStores = async (req, res) => {
  try {
    const { stores } = req.body;

    // console.log('Received import request with stores:', stores);

    if (!Array.isArray(stores)) {
      return res.status(400).json({ message: "Stores data must be an array" });
    }

    const results = {
      imported: 0,
      failed: 0,
      errors: [],
    };

    // Process stores sequentially to maintain order and handle errors individually
    for (let i = 0; i < stores.length; i++) {
      try {
        const storeData = stores[i];
        // console.log(`Processing store ${i}:`, storeData);

        // Validate required fields
        const requiredFields = ["storeId", "storeName", "partyId"];
        const missingFields = requiredFields.filter(
          (field) => !storeData[field]
        );

        if (missingFields.length > 0) {
          throw new Error(
            `Missing required fields: ${missingFields.join(", ")}`
          );
        }

        // Check for duplicate storeId
        const existingStore = await Store.findOne({
          storeId: storeData.storeId,
        });
        if (existingStore) {
          throw new Error(`Store with ID ${storeData.storeId} already exists`);
        }

        // Clean up the data - remove empty strings for optional fields
        const cleanStoreData = {
          storeId: storeData.storeId,
          storeName: storeData.storeName,
          partyId: storeData.partyId,
          cityId: storeData.cityId || null,
          stateId: storeData.stateId || null,
          storeAddress: storeData.storeAddress || "",
          storePinCode: storeData.storePinCode || "",
          smName: storeData.smName || "",
          smContactNo: storeData.smContactNo || "",
          isActive:
            storeData.isActive !== undefined ? storeData.isActive : true,
        };

        // console.log('Clean store data:', cleanStoreData);

        const store = new Store(cleanStoreData);
        await store.save();
        results.imported++;
        // console.log(`Store ${storeData.storeId} saved successfully`);
      } catch (error) {
        console.error(`Error processing store ${i}:`, error);
        results.failed++;
        results.errors.push({
          index: i,
          storeId: stores[i]?.storeId,
          error: error.message,
        });
      }
    }

    // console.log('Import completed:', results);

    res.status(200).json({
      message: `Import completed: ${results.imported} successful, ${results.failed} failed`,
      ...results,
    });
  } catch (error) {
    console.error("Error during import:", error);
    res.status(500).json({
      message: "Error during import: " + error.message,
    });
  }
};
