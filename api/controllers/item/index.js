// import { Item } from "../../models/item.js";

// export const getItem = async (req, res) => {
//   try {
//     const showInactive = req.query.showInactive === "true";
//     const filter = showInactive ? {} : { isActive: true };
//     const items = await Item.find(filter);
//     res.status(200).json(items);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching items" });
//   }
// };

// export const getItemById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const item = await Item.findById(id);
//     if (!item) {
//       return res.status(404).json({ message: "Item not found" });
//     }
//     res.status(200).json(item);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: error.message + " - Error fetching item by ID" });
//   }
// };

// export const createItem = async (req, res) => {
//   const item = new Item(req.body);
//   try {
//     // console.log(item);
//     const savedItem = await item.save();
//     res.status(201).json(savedItem);
//   } catch (error) {
//     res.status(400).json({ message: error.message + " - Error creating item" });
//   }
// };

// export const updateItem = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const updatedItem = await Item.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });
//     if (!updatedItem) {
//       return res.status(404).json({ message: "Item not found" });
//     }
//     res.status(200).json(updatedItem);
//   } catch (error) {
//     res.status(400).json({ message: error.message + " - Error updating item" });
//   }
// };

// export const deleteItem = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deletedItem = await Item.findById(id);
//     if (!deletedItem) {
//       return res.status(404).json({ message: "Item not found" });
//     }
//     deletedItem.isActive = false;
//     await deletedItem.save();
//     res.status(200).json({ message: "Item deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message + " - Error deleting item" });
//   }
// };



import { Item } from "../../models/item.js";
import ItemStockRecord from "../../models/itemStockRecord.js";
import { StockIn } from "../../models/stock_In.js";
import { StockOut } from "../../models/stock_Out.js";
import { StockItem } from "../../models/stockItem.js";
import { Ticket } from "../../models/ticket.js";

export const getItem = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";
    const deleteType = req.query.deleteType || "soft"; // 'soft' or 'hard'

    let items;
    if (deleteType === "hard") {
      // For hard delete, only show non-deleted items
      items = await Item.find(showInactive ? {} : { isActive: true });
    } else {
      // For soft delete, use the active/inactive query helpers
      items = showInactive ? await Item.find() : await Item.find().active();
    }

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error fetching items" });
  }
};

export const getItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error fetching item by ID" });
  }
};

export const createItem = async (req, res) => {
  const item = new Item(req.body);
  try {
    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message + " - Error creating item" });
  }
};

export const updateItem = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedItem = await Item.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message + " - Error updating item" });
  }
};

// Soft Delete (Toggle Active/Inactive)
export const softDeleteItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.isActive = !item.isActive;
    if (!item.isActive) {
      item.deletedAt = new Date();
    } else {
      item.deletedAt = null;
    }

    await item.save();

    res.status(200).json({
      message: `Item ${item.isActive ? "enabled" : "disabled"} successfully`,
      item
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error soft deleting item" });
  }
};

// Hard Delete (Permanent Delete)
// export const hardDeleteItem = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deletedItem = await Item.findByIdAndDelete(id);
//     if (!deletedItem) {
//       return res.status(404).json({ message: "Item not found" });
//     }
//     res.status(200).json({ message: "Item permanently deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message + " - Error hard deleting item" });
//   }
// };

export const hardDeleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Pehle sab related data delete karo
    const stockItems = await StockItem.find({ itemId: id });
    const stockItemIds = stockItems.map(si => si._id);

    // 1. Delete tickets
    if (stockItemIds.length > 0) {
      await Ticket.deleteMany({ stockItemId: { $in: stockItemIds } });
    }

    // 2. Delete stock items
    await StockItem.deleteMany({ itemId: id });

    // 3. Delete item stock records
    await ItemStockRecord.deleteMany({ itemId: id });

    // 4. Delete stock in records
    await StockIn.deleteMany({ itemId: id });

    // 5. Delete stock out records
    await StockOut.deleteMany({ itemId: id });

    // 6. Finally delete item
    await Item.findByIdAndDelete(id);

    res.status(200).json({
      message: "✅ Item and ALL linked data COMPLETELY DELETED!",
      deleted: {
        item: item.itemName,
        stockItems: stockItems.length,
        allRelatedData: "PERMANENTLY REMOVED"
      }
    });

  } catch (error) {
    console.error("❌ Delete failed:", error);
    res.status(500).json({
      message: "DELETE FAILED: " + error.message
    });
  }
};


// Restore Soft Deleted Item
export const restoreItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.isActive = true;
    item.deletedAt = null;
    await item.save();

    res.status(200).json({
      message: "Item restored successfully",
      item
    });
  } catch (error) {
    res.status(500).json({ message: error.message + " - Error restoring item" });
  }
};
