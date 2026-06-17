import mongoose from "mongoose";
import { StockOut } from "../../models/stock_Out.js";
import ItemStockRecord from "../../models/itemStockRecord.js";
import { StockItem } from "../../models/stockItem.js";
import { Item } from "../../models/item.js";
import { InstallationStatus } from "../../models/installationStatus.js";

export const getStockOuts = async (req, res) => {
  try {
    // Handle invoice number check
    if (req.query.checkInvoice) {
      const invoiceNo = req.query.invoiceNo;
      if (!invoiceNo) {
        return res.status(400).json({
          success: false,
          message: "Invoice number is required",
          exists: false,
        });
      }

      const existing = await StockOut.findOne({
        invoiceNo,
        isActive: true,
      });

      return res.status(200).json({
        success: true,
        exists: !!existing,
      });
    }

    const showInactive = req.query.showInactive === "true";
    const filter = showInactive ? {} : { isActive: true };
    const stockOuts = await StockOut.find(filter)
      .populate("itemId")
      .populate("deliveryStatusId")
      .populate("installationStatusId")
      .populate("partyId")
      .populate("stockOutCategoryId")
      .populate("storeId")
      .populate("warehouseId")
      .populate("logisticsProviderCategoryId");

    res.status(200).json(stockOuts);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching stock outs" });
  }
};

export const getStockOutById = async (req, res) => {
  const { id } = req.params;
  try {
    const stockOut = await StockOut.findById(id)
      .populate("itemId")
      .populate("deliveryStatusId")
      .populate("installationStatusId")
      .populate("partyId")
      .populate("stockOutCategoryId")
      .populate("storeId")
      .populate("warehouseId")
      .populate("logisticsProviderCategoryId");

    if (!stockOut) {
      return res.status(404).json({ message: "Stock Out not found" });
    }
    res.status(200).json(stockOut);
  } catch (error) {
    console.error("Error fetching stock out by ID:", error);
    res
      .status(500)
      .json({ message: error.message + " - Error fetching stock out by ID" });
  }
};

export const createStockOut = async (req, res) => {
  try {
    let data = { ...req.body };
    //  console.log("Creating Stock Out with data:", data.stockOutDate);

    if (data.storeId === "") {
      data.storeId = null;
    }

    // FIX: Handle installationStatusId before creating the StockOut document
    if (
      data.installationStatusId &&
      Array.isArray(data.installationStatusId) &&
      data.installationStatusId.length === 0
    ) {
      // If empty array is provided, remove it completely
      delete data.installationStatusId;
    }

    // If installationStatusId is not provided at all, get a default one
    if (!data.installationStatusId) {
      const defaultInstallationStatus = await InstallationStatus.findOne({
        isActive: true,
      });
      if (defaultInstallationStatus) {
        data.installationStatusId = [defaultInstallationStatus._id];
      } else {
        // If no default status found, create one to avoid validation errors
        const newInstallationStatus = new InstallationStatus({
          installationStatusName: "Not Installed",
          description: "Default installation status",
        });
        await newInstallationStatus.save();
        data.installationStatusId = [newInstallationStatus._id];
      }
    }

    for (let i = 0; i < data.itemId.length; i++) {
      const item = await Item.findById(data.itemId[i]);
      const requiresSerialManagement =
        item?.requiresSerialNumberManagement || false;

      // Only validate stock for items that require serial number management
      if (requiresSerialManagement) {
        const stockRecord = await ItemStockRecord.findOne({
          itemId: data.itemId[i],
        });

        if (!stockRecord || stockRecord.remainingStock < data.quantity[i]) {
          return res.status(400).json({
            message: `Insufficient stock for serialized item ${
              item.itemName
            }. Available: ${stockRecord?.remainingStock || 0}, Requested: ${
              data.quantity[i]
            }`,
          });
        }
      }
    }

    // Create stock out record
    const stockOut = new StockOut(data);
    const savedStockOut = await stockOut.save();

    // After creating stockOut doc - handle serial numbers
    if (data.serialNo && data.serialNo.length > 0) {
      for (let i = 0; i < data.serialNo.length; i++) {
        const serials = data.serialNo[i];
        const itemId = data.itemId[i];

        if (!serials || serials.length === 0) continue;

        // Get the item to check if it requires serial number management
        const item = await Item.findById(itemId);
        const requiresSerialManagement = item?.requiresSerialNumberManagement || false;

        if (requiresSerialManagement) {
          // For items that require serial management, update existing StockItems
          await StockItem.updateMany(
            { serialNo: { $in: serials }, itemId, isOut: { $ne: true } },
            {
              $set: {
                stockOutId: stockOut._id,
                isOut: true,
              },
            }
          );
        } else {
          // For items that don't require serial management but barcodes are provided,
          // create new StockItems with only stockOutId
          for (const serial of serials) {
            const newStockItem = new StockItem({
              serialNo: serial,
              stockOutId: stockOut._id,
              itemId: itemId,
              isOut: true,
            });
            await newStockItem.save();
          }
        }
      }
    }

    // Stock Update with transaction tracking
    for (let i = 0; i < data.itemId.length; i++) {
      let quantityToRemove = data.quantity[i];

      // If item requires serial number management, adjust quantity based on serials provided
      if (data.itemId[i].requiresSerialNumberManagement) {
        if (data.serialNo && data.serialNo[i] && data.serialNo[i].length > 0) {
          quantityToRemove = data.serialNo[i].length;
        }
      }

      await ItemStockRecord.updateStock(
        data.itemId[i],
        -quantityToRemove, // Negative quantity for stock-out
        "Stock-Out",
        `${savedStockOut._id}`
      );
    }

    // Populate the saved stock out before returning
    const populatedStockOut = await StockOut.findById(savedStockOut._id)
      .populate("itemId")
      .populate("deliveryStatusId")
      .populate("installationStatusId")
      .populate("partyId")
      .populate("stockOutCategoryId")
      .populate("storeId")
      .populate("warehouseId")
      .populate("logisticsProviderCategoryId");

    res.status(201).json(populatedStockOut);
  } catch (error) {
    console.error("Error creating Stock Out:", error);
    res.status(400).json({
      message: error.message + " - Error creating stock out",
      errors: error.errors,
    });
  }
};

async function handleStockOutUpdate(
  stockOutDoc,
  stockOutId,
  itemId,
  quantity,
  serialNo,
  action
) {
  try {
    // Ensure arrays exist
    if (!stockOutDoc.itemId) stockOutDoc.itemId = [];
    if (!stockOutDoc.quantity) stockOutDoc.quantity = [];
    if (!stockOutDoc.deliveryStatusId) stockOutDoc.deliveryStatusId = [];
    if (!stockOutDoc.installationStatusId)
      stockOutDoc.installationStatusId = [];

    const index = stockOutDoc.itemId.findIndex(
      (itm) => itm.toString() === itemId.toString()
    );
    // Check item requirements
    const item = await Item.findById(itemId);
    if (!item) {
      throw new Error(`Item with ID ${itemId} not found`);
    }
    const requiresSerial = item?.requiresSerialNumberManagement || false;
    const requiresInstall = item?.requiresInstallation || false;

    // ===============================
    // 1. ADD NEW ITEM
    // ===============================
    if ((action === "add" || action === "update") && index === -1) {
      const item = await Item.findById(itemId);
      const requiresSerialManagement =
        item?.requiresSerialNumberManagement || false;

      // Only validate stock for serialized items
      if (requiresSerialManagement) {
        const stockRecord = await ItemStockRecord.findOne({ itemId });
        if (!stockRecord || stockRecord.remainingStock < quantity) {
          throw new Error(
            `Insufficient stock for serialized item ${
              item.itemName
            }. Available: ${
              stockRecord?.remainingStock || 0
            }, Requested: ${quantity}`
          );
        }
      }

      // Reduce stock (this will allow negative values for non-serialized items)
      await ItemStockRecord.findOneAndUpdate(
        { itemId },
        {
          $inc: { remainingStock: -Number(quantity) },
          $push: {
            transactions: {
              date: new Date(),
              quantity: Number(quantity),
              type: "Stock-Out",
              reference: `${stockOutId}`,
            },
          },
        }
      );

      // Handle serials
      if (requiresSerial && serialNo?.length > 0) {
        const availableSerials = await StockItem.find({
          serialNo: { $in: serialNo },
          itemId,
        });
        if (availableSerials.length !== serialNo.length) {
          throw new Error(
            `Some serial numbers are not available or don't exist`
          );
        }
        await StockItem.updateMany(
          { itemId, serialNo: { $in: serialNo } },
          { $set: { stockOutId, stockOutDate: new Date() } }
        );
      }
      // // Handle installation status
      if (requiresInstall) {
        stockOutDoc.installationStatusId.push(
          stockOutDoc.installationStatusId[0] || null
        );
      }
      // Handle delivery status
      stockOutDoc.deliveryStatusId.push(
        stockOutDoc.deliveryStatusId[0] || null
      );

      // Push arrays
      stockOutDoc.itemId.push(itemId);
      stockOutDoc.quantity.push(Number(quantity));
      if (requiresInstall) {
        stockOutDoc.installationStatusId.push(
          stockOutDoc.installationStatusId[0] || null
        );
      }
    }

    // ===============================
    // 2. UPDATE EXISTING ITEM
    // ===============================
    else if ((action === "add" || action === "update") && index > -1) {
  const oldQty = stockOutDoc.quantity[index] || 0;
  const newQty = Number(quantity);
  const diff = newQty - oldQty;

  // console.log(`Quantity Update - Item: ${itemId}, Old: ${oldQty}, New: ${newQty}, Diff: ${diff}`);

  if (diff !== 0) {
    // Check stock availability only for increasing quantity
    if (diff > 0) {
      const stockRecord = await ItemStockRecord.findOne({ itemId });
      const availableStock = stockRecord?.remainingStock || 0;
      
      // For serialized items, validate strictly
      if (requiresSerial) {
        if (availableStock < diff) {
          throw new Error(
            `Insufficient stock for serialized item ${item.itemName}. Available: ${availableStock}, Needed: ${diff}`
          );
        }
      }
      // For non-serialized items, allow negative but show warning
      else if (availableStock < diff) {
        console.warn(`Warning: Low stock for ${item.itemName}. Available: ${availableStock}, Needed: ${diff}`);
      }
    }

    // Find the existing stock record
    const stockRecord = await ItemStockRecord.findOne({ itemId });
    if (!stockRecord) {
      throw new Error(`Stock record not found for item ${itemId}`);
    }

    // Update remaining stock directly
    stockRecord.remainingStock -= diff;

    // Find and update the existing transaction for this stockOut
    const existingTransactionIndex = stockRecord.transactions.findIndex(
      t => t.reference === `${stockOutId}` && t.type === "Stock-Out"
    );

    if (existingTransactionIndex !== -1) {
      // Update existing transaction
      stockRecord.transactions[existingTransactionIndex].quantity = newQty;
      stockRecord.transactions[existingTransactionIndex].date = new Date();
    } else {
      // If no existing transaction found, add a new one (shouldn't happen normally)
      stockRecord.transactions.push({
        date: new Date(),
        quantity: newQty,
        type: "Stock-Out",
        reference: `${stockOutId}`,
      });
    }

    // Save the updated stock record
    await stockRecord.save();

    // console.log(`Stock updated successfully for item ${itemId}. Remaining Stock: ${stockRecord.remainingStock}`);
  }


      if (requiresSerial) {
        const currentSerials = await StockItem.find({
          itemId,
          stockOutId,
        });
        const currentSerialNos = currentSerials.map((s) => s.serialNo);

        const newSerials = serialNo.filter(
          (s) => !currentSerialNos.includes(s)
        );
        const serialsToRelease = currentSerialNos.filter(
          (s) => !serialNo.includes(s)
        );

        if (newSerials.length > 0) {
          const available = await StockItem.find({
            serialNo: { $in: newSerials },
            itemId,
          });
          if (available.length !== newSerials.length) {
            throw new Error(`Some new serial numbers are not available`);
          }
          await StockItem.updateMany(
            { itemId, serialNo: { $in: newSerials } },
            {
              $set: {
                stockOutId,
                stockOutDate: new Date(),
              },
            }
          );
        }

        if (serialsToRelease.length > 0) {
          await StockItem.updateMany(
            { itemId, serialNo: { $in: serialsToRelease }, stockOutId },
            {
              $unset: { stockOutId: 1, stockOutDate: 1 },
            }
          );
        }
      }

      stockOutDoc.quantity[index] = Number(quantity);
    }

    await stockOutDoc.save();
  } catch (error) {
    throw error;
  }
}

// Update the updateStockOut function to use the new handler
export const updateStockOut = async (req, res) => {
  const { id } = req.params;
  const {
    storeId,
    itemId,
    serialNo,
    quantity,
    action,
    deliveryStatusId,
    installationStatusId,
    ...rest
  } = req.body;
  // console.log("Update Stock Out called with:", req.body);
  try {
    const stockOutId = req.params.id;
    const stockOutData = req.body;

    // Handle optional storeId
    if (storeId === "") {
      rest.storeId = null;
    } else if (storeId) {
      rest.storeId = storeId;
    }
    // ===============================
    // 1. Barcode remover action
    // ===============================
    if (action === "barcoderemover" && itemId && serialNo) {
      try {
        const currentItemId = itemId[0];
        const removedBarcodes = serialNo[0]; // This is now an array of barcodes
        const qtyToRestore = Number(quantity[0]) || removedBarcodes.length;

        // console.log("Removing barcodes:", removedBarcodes, "Quantity to restore:", qtyToRestore);

        // Unlink the StockItems (clear stockOutId for those barcodes)
        await StockItem.updateMany(
          {
            itemId: currentItemId,
            serialNo: { $in: removedBarcodes },
            stockOutId: id,
          },
          {
            $unset: { stockOutId: 1, stockOutDate: 1 },
          }
        );

        // Increment remaining stock for this item
        await ItemStockRecord.updateOne(
          { itemId: currentItemId },
          { $inc: { remainingStock: qtyToRestore } }
        );

        // Find the StockOut doc
        const stockOut = await StockOut.findById(id);
        if (!stockOut) throw new Error("StockOut not found");

        // console.log("Current stockOut:", stockOut);

        // Find index of item in StockOut
        const itemIndex = stockOut.itemId.findIndex(
          (x) => x.toString() === currentItemId.toString()
        );

        // console.log("Item index found:", itemIndex);

        if (itemIndex !== -1) {
          // Update quantity - ensure it doesn't go below 0
          const newQuantity = Math.max(
            0,
            stockOut.quantity[itemIndex] - qtyToRestore
          );
          stockOut.quantity[itemIndex] = newQuantity;

          // console.log("Old quantity:", stockOut.quantity[itemIndex], "New quantity:", newQuantity);

          // Ensure serialNo array exists for this item
          if (!stockOut.serialNo) {
            stockOut.serialNo = [];
          }
          if (!stockOut.serialNo[itemIndex]) {
            stockOut.serialNo[itemIndex] = [];
          }

          // Remove the barcodes from serialNo array
          stockOut.serialNo[itemIndex] = stockOut.serialNo[itemIndex].filter(
            (bc) => !removedBarcodes.includes(bc)
          );

          // console.log("Updated serialNo:", stockOut.serialNo[itemIndex]);

          // If quantity becomes 0, remove the entire item entry
          if (newQuantity === 0) {
            stockOut.itemId.splice(itemIndex, 1);
            stockOut.quantity.splice(itemIndex, 1);
            stockOut.serialNo.splice(itemIndex, 1);
            // console.log("Item removed completely as quantity reached 0");
          }

          await stockOut.save();
          // console.log("StockOut saved successfully");
        }
        // else {
        //   console.log("Item not found in StockOut");
        // }

        return res.status(200).json(stockOut);
      } catch (error) {
        console.error("Error during barcode removal:", error);
        return res.status(400).json({
          message: error.message,
          stack: error.stack,
          details: "Check if stockOut document structure is correct",
        });
      }
    }

    // ===============================
    // 2. Full item removal
    // ===============================
    else if (action === "remove" && itemId && quantity) {
      try {
        // Handle item removal
        if (serialNo && serialNo.length > 0 && serialNo[0].length > 0) {
          // Release serial numbers
          await StockItem.updateMany(
            {
              itemId: itemId[0], // Access first element since it's an array
              serialNo: { $in: serialNo[0] }, // Access first element
              stockOutId: id,
            },
            {
              $unset: { stockOutId: 1, stockOutDate: 1 },
            }
          );
        }

        // Return stock
        await ItemStockRecord.updateOne(
          { itemId: itemId[0] }, // Access first element
          {
            $inc: { remainingStock: Number(quantity[0]) },
            $unset: {
              transactions: {
                date: new Date(),
                quantity: Number(quantity[0]),
                type: "Stock-Out",
                reference: `${stockOutId}`,
              },
            },
          } // Access first element
        );

        // Find the stockOut document
        const stockOut = await StockOut.findById(id);

        // Find the index of the item to remove
        const itemIndex = stockOut.itemId.findIndex(
          (id) => id.toString() === itemId[0].toString()
        );

        if (itemIndex !== -1) {
          // Remove the item from all parallel arrays
          stockOut.itemId.splice(itemIndex, 1);
          stockOut.quantity.splice(itemIndex, 1);
          stockOut.deliveryStatusId.splice(itemIndex, 1);
          stockOut.installationStatusId.splice(itemIndex, 1);

          // Save the updated document
          await stockOut.save();
        }

        res.status(200).json(stockOut);
      } catch (error) {
        console.error("Error during item removal:", error);
        throw error;
      }
    } else {
      // ===============================
      // STEP 1: Validate request data
      // ===============================
      for (let i = 0; i < stockOutData.itemId.length; i++) {
        const currentItemId = stockOutData.itemId[i];
        const quantity = stockOutData.quantity[i];
        const serials = stockOutData.serialNo[i] || [];

        // Get item definition
        const item = await Item.findById(currentItemId);
        if (!item) {
          throw new Error(`Item with ID ${currentItemId} not found`);
        }
        // console.log("Item:", item);
        // Only validate serial numbers if the item requires them
        if (item.requiresSerialNumberManagement) {
          if (!serials.length || serials.length !== quantity) {
            throw new Error(
              `Serial numbers required for item: ${item.itemName}`
            );
          }

          const available = await StockItem.find({
            itemId: currentItemId,
            serialNo: { $in: serials },
          });

          if (available.length !== serials.length) {
            throw new Error(
              `Some serial numbers are not available for item: ${item.ItemName}`
            );
          }
        } else {
          // Clear any serial numbers for non-serialized items
          stockOutData.serialNo[i] = [];
        }
      }
      // ===============================
      // STEP 2: Apply stock-out update
      // ===============================
      const stockOutDoc = await StockOut.findById(stockOutId);
      if (!stockOutDoc) throw new Error("StockOut document not found");

      for (let i = 0; i < stockOutData.itemId.length; i++) {
        await handleStockOutUpdate(
          stockOutDoc,
          stockOutId,
          stockOutData.itemId[i],
          stockOutData.quantity[i],
          stockOutData.serialNo[i],
          "update"
        );
      }

      // Update other fields
      const updatedStockOut = await StockOut.findByIdAndUpdate(
        id,
        {
          $set: rest,
          itemId: stockOutData.itemId,
          quantity: stockOutData.quantity,
          serialNo: stockOutData.serialNo,
          deliveryStatusId: stockOutData.deliveryStatusId,
          installationStatusId: stockOutData.installationStatusId,
        },
        { new: true, runValidators: true }
      )
        .populate("itemId")
        .populate("deliveryStatusId")
        .populate("installationStatusId")
        .populate("stockOutCategoryId")
        .populate("partyId")
        .populate("storeId")
        .populate("warehouseId")
        .populate("logisticsProviderCategoryId");

      res.status(200).json(updatedStockOut);
    }
  } catch (error) {
    console.error("Error updating Stock Out:", error);
    res
      .status(400)
      .json({ message: error.message + " - Error updating stock out" });
  }
};

export const deleteStockOut = async (req, res) => {
  const { id } = req.params;

  try {
    const stockOut = await StockOut.findById(id);
    if (!stockOut) {
      return res.status(404).json({ message: "Stock Out not found" });
    }

    // 1. Remove stockOutId from all stock items associated with this stock out
    await StockItem.updateMany(
      { stockOutId: id },
      {
        $unset: {
          stockOutId: 1,
          stockOutDate: 1,
        },
      }
    );

    // 2. Reverse stock for each item and remove transactions
    for (let i = 0; i < stockOut.itemId.length; i++) {
      const itemId = stockOut.itemId[i];
      const quantity = stockOut.quantity[i] || 0;

      if (quantity > 0) {
        // Find and update the item stock record
        const itemStockRecord = await ItemStockRecord.findOne({ itemId });

        if (itemStockRecord) {
          // Add back the stock that was removed during stock out
          itemStockRecord.remainingStock += quantity;

          // Remove transactions related to this stock out
          itemStockRecord.transactions = itemStockRecord.transactions.filter(
            (transaction) => !transaction.reference.includes(`${id}`)
          );

          await itemStockRecord.save();
        }
      }
    }

    // 3. Permanently delete the stock out record
    await StockOut.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Stock Out permanently deleted successfully" });
  } catch (error) {
    console.error("Error deleting Stock Out:", error);
    res.status(500).json({
      message: error.message + " - Error deleting stock out",
      error: error.message,
    });
  }
};
