import ItemStockRecord from "../../models/itemStockRecord.js";

export const createItemStockRecord = async (req, res) => {
  try {
    // console.log("Incoming create request body:", req.body);
    const itemStockRecord = await ItemStockRecord.create(req.body);
    // console.log("Created record:", itemStockRecord);
    res.status(201).json(itemStockRecord);
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const getItemStockRecords = async (req, res) => {
  try {
    const { itemId, $sort, $limit, $select } = req.query;

    let query = ItemStockRecord.find();

    if (itemId) {
      query = query.where("itemId").equals(itemId);
    }

    if ($sort) {
      query = query.sort(JSON.parse($sort));
    }

    if ($limit) {
      query = query.limit(Number($limit));
    }

    if ($select) {
      query = query.select($select.split(","));
    }

    const itemStockRecords = await query.exec();
    res.status(200).json(itemStockRecords);
  } catch (error) {
    console.error("Error getting item stock records:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getItemStockRecordById = async (req, res) => {
  const { id } = req.params;
  try {
    const itemStockRecord = await ItemStockRecord.findById(id);
    if (!itemStockRecord) {
      return res.status(404).json({ error: "Item Stock Record not found" });
    }
    res.status(200).json(itemStockRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateItemStockRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const itemStockRecord = await ItemStockRecord.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!itemStockRecord) {
      return res.status(404).json({ error: "Item Stock Record not found" });
    }
    res.status(200).json(itemStockRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteItemStockRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const itemStockRecord = await ItemStockRecord.findByIdAndDelete(id);
    if (!itemStockRecord) {
      return res.status(404).json({ error: "Item Stock Record not found" });
    }
    res.status(200).json({ message: "Item Stock Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
