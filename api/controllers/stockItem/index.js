import { StockItem } from "../../models/stockItem.js";

export const getStockItems = async (req, res) => {
  try {
    const { itemId, stockOutId, $sort, $limit, $select } = req.query;

    let query = StockItem.find();

    if (itemId) {
      query = query.where("itemId").equals(itemId);
    }

    if (stockOutId) {
      query = query.where("stockOutId").equals(stockOutId);
    }

    if ($sort) {
      query = query.sort($sort);
    }

    if ($limit) {
      query = query.limit(Number($limit));
    }

    if ($select) {
      query = query.select($select.split(","));
    }

    const stockItems = await query.exec();
    res.status(200).json(stockItems);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching stock items" });
  }
};


export const getAvailableStockItems = async (req, res) => {
  try {
    const { itemId } = req.query;

    let query = StockItem.find({
      stockOutId: { $exists: false }, // stockOutId not present
    })
    // .or([{ stockOutId: null }])    // or stockOutId is explicitly null
    .select("serialNo"); // Only select the serialNo field

    if (itemId) {
      query = query.where("itemId").equals(itemId);
    }

    const stockItems = await query.exec();
    res.status(200).json(stockItems);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching stock items" });
  }
};


export const checkStockItemStatusStockItem = async (req, res) => {
  const { stockItemId } = req.params;
  
  try {
    if (!stockItemId) {
      return res.status(400).json({
        isValid: false,
        isStockedOut: false,
        message: "stockItemId is required"
      });
    }

    const stockItem = await StockItem.findById(stockItemId).select("stockOutId itemId serialNo");
    
    if (!stockItem) {
      return res.status(404).json({
        isValid: false,
        isStockedOut: false,
        message: "Stock item not found"
      });
    }

    return res.status(200).json({
      isValid: true,
      isStockedOut: !!stockItem.stockOutId,
      message: stockItem.stockOutId ? "Stock item is stocked out" : "Stock item is available",
      stockItem: {
        _id: stockItem._id,
        serialNo: stockItem.serialNo,
        stockOutId: stockItem.stockOutId,
        itemId: stockItem.itemId
      }
    });
  } catch (error) {
    console.error("Error in checkStockItemStatus:", error);
    res.status(500).json({
      isValid: false,
      isStockedOut: false,
      message: "Internal server error: " + error.message
    });
  }
};



// Backend: stockItemController.js
export const checkStockOutStatus = async (req, res) => {
  // console.log("✅ checkStockOutStatus function called");
  const { serialNo } = req.query;
  // console.log("Received request with query:", req.query);
  
  try {
    // console.log("✅ Entered try block");
    
    if (!serialNo) {
      // console.log("❌ No serialNo provided");
      return res.status(400).json({
        isValid: false,
        isStockedOut: false,
        message: "serialNo is required"
      });
    }

    // console.log("🔍 Looking for serialNo:", serialNo);
    
    // Check if StockItem model is properly imported/defined
    if (!StockItem) {
      // console.log("❌ StockItem model is not defined");
      return res.status(500).json({
        isValid: false,
        isStockedOut: false,
        message: "Database model not available"
      });
    }
    
    const stockItem = await StockItem.findOne({ serialNo }).select("serialNo stockOutId itemName _id");
    // console.log("📦 Stock item query result:", stockItem);

    if (!stockItem) {
      // console.log("❌ Serial number not found:", serialNo);
      return res.status(404).json({
        isValid: false,
        isStockedOut: false,
        message: "Serial number not found"
      });
    }

    // console.log("✅ Found stock item:", stockItem);
    
    if (stockItem.stockOutId) {
      // console.log("✅ Stock item is stocked out");
      return res.status(200).json({
        isValid: true,
        isStockedOut: true,
        message: "Serial number is stocked out ✅",
        stockItem: {
          _id: stockItem._id,
          serialNo: stockItem.serialNo,
          stockOutId: stockItem.stockOutId,
          itemId: stockItem.itemId || "N/A"
        }
      });
    } else {
      // console.log("❌ Stock item is NOT stocked out");
      return res.status(200).json({
        isValid: false,
        isStockedOut: false,
        message: "Serial number is not stocked out ❌"
      });
    }
  } catch (error) {
    console.error("💥 Error in checkStockOutStatus:", error);
    console.error("💥 Error stack:", error.stack);
    res.status(500).json({
      isValid: false,
      isStockedOut: false,
      message: "Internal server error: " + error.message
    });
  }
};


export const getStockItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const stockItem = await StockItem.findById(id);
    if (!stockItem) {
      return res.status(404).json({ message: "Stock Item not found" });
    }
    res.status(200).json(stockItem);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching stock item by ID" });
  }
};

export const createStockItem = async (req, res) => {
  const stockItem = new StockItem(req.body);
  try {
    const savedStockItem = await stockItem.save();
    res.status(201).json(savedStockItem);
  } catch (error) {
    console.error("Error creating Stock Item:", error);
    res
      .status(400)
      .json({ message: error.message + " - Error creating stock item" });
  }
};

export const updateStockItem = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedStockItem = await StockItem.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedStockItem) {
      return res.status(404).json({ message: "Stock Item not found" });
    }
    res.status(200).json(updatedStockItem);
  } catch (error) {
    res
      .status(400)
      .json({ message: error.message + " - Error updating stock item" });
  }
};

export const deleteStockItem = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedStockItem = await StockItem.findByIdAndDelete(id);
    if (!deletedStockItem) {
      return res.status(404).json({ message: "Stock Item not found" });
    }
    res.status(200).json({ message: "Stock Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting Stock Item:", error);
    res
      .status(500)
      .json({ message: error.message + " - Error deleting stock item" });
  }
};
