import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import ItemStockRecord from "../../models/itemStockRecord.js";
import { StockIn } from "../../models/stock_In.js";
import { StockItem } from "../../models/stockItem.js";
import { Item } from "../../models/item.js";
const AutoIncrement = AutoIncrementFactory(mongoose);
export const getStockIns = async (req, res) => {
  try {
    if (req.query.checkInvoice) {
      const invoiceNo = req.query.invoiceNo;
      if (!invoiceNo) {
        return res.status(400).json({
          success: false,
          message: "Invoice number is required",
          exists: false,
        });
      }

      const existing = await StockIn.findOne({
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
    const stockIns = await StockIn.find(filter);
    res.status(200).json(stockIns);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching stock ins" });
  }
};

export const getStockInById = async (req, res) => {
  const { id } = req.params;
  try {
    const stockIn = await StockIn.findById(id);
    if (!stockIn) {
      return res.status(404).json({ message: "Stock In not found" });
    }
    res.status(200).json(stockIn);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message + " - Error fetching stock in by ID" });
  }
};

export const createStockIn = async (req, res) => {
  try {
    const data = req.body;
    // console.log("Incoming Payload:", req.body);
    const stockIn = new StockIn(data);
    const savedStockIn = await stockIn.save();

    // 2️⃣ Agar barcodes diye gaye hain → StockItem create karo
    if (data.serialNo && data.serialNo.length > 0) {
      const stockItemsPayload = [];
      data.serialNo.forEach((serials, index) => {
        serials.forEach((serial) => {
          stockItemsPayload.push({
            serialNo: serial,
            stockInId: stockIn._id,
            itemId: data.itemId[index],
          });
        });
      });
      // if (stockItemsPayload.length > 0) {
      //   await StockItem.insertMany(stockItemsPayload);
      // }
      // In createStockIn function - replace the insertMany section:
      if (stockItemsPayload.length > 0) {
        // Use individual saves instead of insertMany for auto-increment
        for (const itemPayload of stockItemsPayload) {
          const stockItem = new StockItem(itemPayload);
          await stockItem.save();
        }
      }
    }

    // 3️⃣ Yahan Stock Update karo with transaction tracking
    for (let i = 0; i < data.itemId.length; i++) {
      let quantityToAdd = data.stockAdded[i];

      // Agar serial numbers diye gaye hain → override with count of serial numbers
      if (data.serialNo && data.serialNo[i] && data.serialNo[i].length > 0) {
        quantityToAdd = data.serialNo[i].length;
      }

      await ItemStockRecord.updateStock(
        data.itemId[i],
        quantityToAdd, // Positive quantity for stock-in
        "Stock-In", // Transaction type
        `${stockIn._id}` // Reference
      );
    }

    res.status(201).json(stockIn);
  } catch (error) {
    console.error("Error creating Stock In:", error);
    res
      .status(400)
      .json({
        message: error.message + " - Error creating stock in",
        errors: error.errors,
      });
  }
};

// async function handleStockAndSerials(stockInDoc, stockInId, itemId, stockAdded, serialNo , action) {
//   // const session = await mongoose.startSession();
//   // session.startTransaction();

//   try {
//     const index = stockInDoc.itemId.findIndex(
//       itm => itm.toString() === itemId.toString()
//     );

//     // Validation
//     if (stockAdded <= 0 && action !== 'remove') {
//       throw new Error('Quantity must be positive for add/update operations');
//     }

//     if (action === 'add' || action === 'update') {
//       if (index === -1) {
//         // 🔹 New item
//         await ItemStockRecord.findOneAndUpdate(
//           { itemId },
//           { $inc: { stock: Number(stockAdded) } },
//           // { upsert: true, session }
//         );

//         if (serialNo?.length > 0) {
//           // Validate barcode uniqueness
//           const existingSerials = await StockItem.find({
//             serialNo: { $in: serialNo },
//             itemId
//           })
//           // .session(session);

//           if (existingSerials.length > 0) {
//             throw new Error(`Duplicate serial numbers found: ${existingSerials.map(s => s.serialNo).join(', ')}`);
//           }

//           await StockItem.insertMany(
//             serialNo.map(serial => ({
//               itemId,
//               serialNo: serial,
//               stockInId,
//             })),
//             // { session }
//           );
//         }

//         stockInDoc.itemId.push(itemId);
//         stockInDoc.stockAdded.push(Number(stockAdded));
//         stockInDoc.serialNo.push(serialNo || []);
//       } else {
//         // 🔹 Existing item
//         const oldQty = stockInDoc.stockAdded[index] || 0;
//         const diff = Number(stockAdded) - Number(oldQty);

//         if (diff !== 0) {
//           await ItemStockRecord.updateOne(
//             { itemId },
//             { $inc: { stock: diff } },
//             // { session }
//           );

//           if (diff > 0) {
//             // Stock increase → add new barcodes
//             if (serialNo?.length > 0) {
//               // Get existing serials to avoid duplicates
//               const existingSerials = await StockItem.find({
//                 serialNo: { $in: serialNo },
//                 itemId
//               })
//               // .session(session);

//               if (existingSerials.length > 0) {
//                 throw new Error(`Duplicate serial numbers found: ${existingSerials.map(s => s.serialNo).join(', ')}`);
//               }

//               const newSerials = serialNo.slice(-diff);
//               await StockItem.insertMany(
//                 newSerials.map(serial => ({
//                   itemId,
//                   serialNo: serial,
//                   stockInId,
//                 })),
//                 // { session }
//               );
//             }
//           } else {
//             // Stock decrease → remove serials (HARD DELETE)
//             const removeCount = Math.abs(diff);
//             const serialsToRemove = stockInDoc.serialNo[index].slice(-removeCount);

//             if (serialsToRemove.length > 0) {
//               await StockItem.deleteMany({
//                 itemId,
//                 serialNo: { $in: serialsToRemove },
//                 stockInId
//               })
//               // , { session });

//               // Remove from array
//               stockInDoc.serialNo[index] = stockInDoc.serialNo[index].slice(
//                 0,
//                 stockInDoc.serialNo[index].length - removeCount
//               );
//             }
//           }
//         }

//         // Update arrays
//         stockInDoc.stockAdded[index] = Number(stockAdded);
//         if (serialNo?.length > 0) {
//           stockInDoc.serialNo[index] = serialNo;
//         }
//       }
//     }
//     else if (action === 'remove') {
//       if (index === -1) {
//         throw new Error('Cannot remove stock from an item that does not exist');
//       }

//       const currentQty = stockInDoc.stockAdded[index];
//       const removeQty = Math.min(Number(stockAdded), currentQty);

//       if (removeQty <= 0) {
//         throw new Error('Invalid remove quantity');
//       }

//       await ItemStockRecord.updateOne(
//         { itemId },
//         { $inc: { stock: -removeQty } },
//         // { session }
//       );

//       // Remove specific barcodes or last ones (HARD DELETE)
//       let serialsToRemove = [];
//       if (serialNo?.length > 0) {
//         // Verify all barcodes exist
//         const existingSerials = await StockItem.find({
//           itemId,
//           serialNo: { $in: serialNo },
//           stockInId
//         })
//         // .session(session);

//         if (existingSerials.length !== serialNo.length) {
//           const foundSerials = existingSerials.map(s => s.serialNo);
//           const missingSerials = serialNo.filter(s => !foundSerials.includes(s));
//           throw new Error(`Some serial numbers not found: ${missingSerials.join(', ')}`);
//         }

//         serialsToRemove = serialNo;
//       } else {
//         serialsToRemove = stockInDoc.serialNo[index].slice(-removeQty);
//       }

//       if (serialsToRemove.length > 0) {
//         await StockItem.deleteMany({
//           itemId,
//           serialNo: { $in: serialsToRemove },
//           stockInId
//         })
//         // , { session });

//         // Remove from array
//         stockInDoc.serialNo[index] = stockInDoc.serialNo[index].filter(
//           s => !serialsToRemove.includes(s)
//         );
//       }

//       // Update quantity
//       stockInDoc.stockAdded[index] -= removeQty;

//       // Remove item if quantity reaches zero
//       if (stockInDoc.stockAdded[index] <= 0) {
//         stockInDoc.itemId.splice(index, 1);
//         stockInDoc.stockAdded.splice(index, 1);
//         stockInDoc.serialNo.splice(index, 1);
//       }
//     }
//   await stockInDoc.save();
//     // await stockInDoc.save({ session });
//     // await session.commitTransaction();

//   } catch (error) {
//     // await session.abortTransaction();
//     throw error;
//   }
//   // finally {
//   //   session.endSession();
//   // }
// }

// export const updateStockIn = async (req, res) => {
//   const { id } = req.params;
//   const { itemId, serialNo, stockAdded, action, ...rest } = req.body;
//   console.log("barcodes:", serialNo);
//   console.log("quantity:", stockAdded);
//   console.log("Update Payload:", req.body);
//   try {
//     const stockInDoc = await StockIn.findById(id);
//     if (!stockInDoc) {
//       return res.status(404).json({ message: "Stock In not found" });
//     }

//     // ---------------------------
//     // Case 1: ADD or UPDATE (merged)
//     // ---------------------------
//   if ((action === "add" || action === "update") && itemId && stockAdded) {
//     // await handleStockAndSerials(stockInDoc, id, itemId, stockAdded, serialNo || []);
//     if ((action === "add" || action === "update") && itemId && stockAdded) {
//   for (let i = 0; i < itemId.length; i++) {
//     await handleStockAndSerials(
//       stockInDoc,
//       id,
//       itemId[i],
//       stockAdded[i],
//       serialNo[i] || [],
//       action
//     );
//   }
// }

//   }

//     // ---------------------------
//     // Case 2: REMOVE
//     // // ---------------------------
//     // else if (action === "remove" && itemId && quantity) {
//     //   const index = stockInDoc.itemId.findIndex(
//     //     (itm) => itm.toString() === itemId.toString()
//     //   );

//     //   if (index === -1) {
//     //     throw new Error("Cannot remove stock from an item that doesn't exist in this StockIn.");
//     //   }

//     //   // 🔹 Decrease stock
//     //   await ItemStockRecord.updateOne(
//     //     { itemId },
//     //     { $inc: { stock: -Number(quantity) } }
//     //   );

//     //   // 🔹 Serial numbers delete
//     //   if (barcodes?.length > 0) {
//     //     await StockItem.deleteMany({
//     //       itemId,
//     //       stockInId: id,
//     //       serialNo: { $in: barcodes },
//     //     });
//     //     stockInDoc.serialNo[index] = stockInDoc.serialNo[index].filter(
//     //       (s) => !barcodes.includes(s)
//     //     );
//     //   }

//     //   // 🔹 Stock quantity update
//     //   stockInDoc.stockAdded[index] -= Number(quantity);

//     //   if (stockInDoc.stockAdded[index] <= 0) {
//     //     // Agar stock 0 ya negative → pura item hi hata do
//     //     stockInDoc.itemId.splice(index, 1);
//     //     stockInDoc.stockAdded.splice(index, 1);
//     //     stockInDoc.serialNo.splice(index, 1);
//     //   }

//     //   await stockInDoc.save();
//     // }

//      if (action === "remove" && itemId && stockAdded) {
//       // Serial numbers delete
//       if (serialNo?.length > 0) {
//         await StockItem.deleteMany({ serialNo: { $in: serialNo } });
//       }

//       // Item stock decrease
//       await ItemStockRecord.updateOne(
//         { itemId },
//         { $inc: { stock: -Number(stockAdded) } }
//       );

//       // StockIn document se item remove
//       await StockIn.findByIdAndUpdate(id, {
//         $pull: {
//           itemId,
//           stockAdded: stockAdded,
//           serialNo: serialNo || []
//         }
//       });
//     }

//     // ---------------------------
//     // Case 3: Update other fields
//     // ---------------------------
//     const updatedStockIn = await StockIn.findByIdAndUpdate(
//       id,
//       { $set: rest },
//       { new: true }
//     ).populate("itemId");

//     res.status(200).json(updatedStockIn);
//   } catch (error) {
//     console.error("Error updating Stock In:", error);
//     res.status(400).json({ message: error.message + " - Error updating stock in" });
//   }
// };

async function handleStockAndSerials(
  stockInDoc,
  stockInId,
  itemId,
  stockAdded,
  serialNo,
  action
) {
  try {
    // Ensure all arrays exist
    if (!stockInDoc.itemId) stockInDoc.itemId = [];
    if (!stockInDoc.stockAdded) stockInDoc.stockAdded = [];
    if (!stockInDoc.serialNo) stockInDoc.serialNo = [];

    const index = stockInDoc.itemId.findIndex(
      (itm) => itm.toString() === itemId.toString()
    );

    // Check if this item requires serial number management
    const item = await Item.findById(itemId);
    const requiresSerialManagement =
      item?.requiresSerialNumberManagement || false;

    // Validation
    if (stockAdded <= 0 && action !== "remove") {
      throw new Error("Quantity must be positive for add/update operations");
    }

    if (action === "add" || action === "update") {
      if (index === -1) {
        // 🔹 NEW ITEM - Add completely new item to stock in

        // Update ItemStockRecord with proper field name (remainingStock instead of stock)
        await ItemStockRecord.findOneAndUpdate(
          { itemId },
          {
            $inc: { remainingStock: Number(stockAdded) },
            $push: {
              transactions: {
                date: new Date(),
                quantity: Number(stockAdded),
                type: "Stock-In",
                reference: `${stockInId}`,
              },
            },
          },
          { upsert: true }
        );

        // Only validate serial numbers if required AND provided
        if (requiresSerialManagement && serialNo?.length > 0) {
          // Validate barcode uniqueness - check across ALL stock records, not just current
          const existingSerials = await StockItem.find({
            serialNo: { $in: serialNo },
            itemId,
          });

          if (existingSerials.length > 0) {
            throw new Error(
              `Duplicate serial numbers found: ${existingSerials
                .map((s) => s.serialNo)
                .join(", ")}`
            );
          }

          for (const serial of serialNo) {
          const stockItem = new StockItem({
            itemId,
            serialNo: serial,
            stockInId,
          });
          await stockItem.save();
        }
        }

        // Add to arrays
        stockInDoc.itemId.push(itemId);
        stockInDoc.stockAdded.push(Number(stockAdded));
        stockInDoc.serialNo.push(serialNo || []);
} else {
  // 🔹 EXISTING ITEM - Update existing item in stock in
  const oldQty = stockInDoc.stockAdded[index] || 0;
  const oldSerials = stockInDoc.serialNo[index] || [];
  const newQty = Number(stockAdded);
  const diff = newQty - oldQty;

  // console.log(`StockIn Quantity Update - Item: ${itemId}, Old: ${oldQty}, New: ${newQty}, Diff: ${diff}`);

  // Update stock record if quantity changed
  if (diff !== 0) {
    // Find the existing stock record
    const stockRecord = await ItemStockRecord.findOne({ itemId });
    if (!stockRecord) {
      throw new Error(`Stock record not found for item ${itemId}`);
    }

    // Update remaining stock directly
    stockRecord.remainingStock += diff;

    // Find and update the existing transaction for this stockIn
    const existingTransactionIndex = stockRecord.transactions.findIndex(
      t => t.reference === `${stockInId}` && t.type === "Stock-In"
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
        type: "Stock-In",
        reference: `${stockInId}`,
      });
    }

    // Save the updated stock record
    await stockRecord.save();

    // console.log(`StockIn updated successfully for item ${itemId}. Remaining Stock: ${stockRecord.remainingStock}`);
  }


        // Handle serial numbers - only if item requires serial management
        if (requiresSerialManagement) {
          if (serialNo?.length > 0) {
            // CASE 1: Serial numbers provided in update

            // FIX: Get only NEW serial numbers that don't already exist in ANY stock record
            const allExistingSerials = await StockItem.find({ itemId });
            const allExistingSerialNumbers = allExistingSerials.map(
              (s) => s.serialNo
            );

            const newSerials = serialNo.filter(
              (s) => !allExistingSerialNumbers.includes(s)
            );

            if (newSerials.length > 0) {
              // Add only NEW serial numbers to database (that don't exist anywhere)
              for (const serial of serialNo) {
                const stockItem = new StockItem({
                  itemId,
                  serialNo: serial,
                  stockInId,
                });
                await stockItem.save();
              }
            }

            // FIX: Update with the complete list of serial numbers (should only include valid ones)
            stockInDoc.serialNo[index] = serialNo;
          } else if (diff < 0) {
            // CASE 2: No serial numbers provided but quantity decreased
            // Remove the last abs(diff) serial numbers
            const removeCount = Math.abs(diff);
            const serialsToRemove = oldSerials.slice(-removeCount);

            if (serialsToRemove.length > 0) {
              await StockItem.deleteMany({
                itemId,
                serialNo: { $in: serialsToRemove },
                stockInId,
              });

              // Update the serial numbers array
              stockInDoc.serialNo[index] = oldSerials.slice(
                0,
                oldSerials.length - removeCount
              );
            }
          } else if (diff > 0) {
            // CASE 3: No serial numbers provided but quantity increased
            // This is an error - can't increase quantity without providing serial numbers
            // for items that require serial number management
            throw new Error(
              "Serial numbers required when increasing quantity for this item"
            );
          }
          // CASE 4: No quantity change and no serial numbers provided - nothing to do
        } else {
          // Item doesn't require serial management, just update quantity
          if (serialNo?.length > 0) {
            // If serial numbers are provided but not required, just store them
            stockInDoc.serialNo[index] = serialNo;
          }
        }

        // Update quantity
        stockInDoc.stockAdded[index] = Number(stockAdded);
      }
    }
    // else if (action === 'remove') {
    //   if (index === -1) {
    //     throw new Error('Cannot remove stock from an item that does not exist');
    //   }

    //   const currentQty = stockInDoc.stockAdded[index];
    //   const removeQty = Math.min(Number(stockAdded), currentQty);

    //   if (removeQty <= 0) {
    //     throw new Error('Invalid remove quantity');
    //   }

    //   await ItemStockRecord.updateOne(
    //     { itemId },
    //     { $inc: { stock: -removeQty } }
    //   );

    //   // Remove specific barcodes or last ones (HARD DELETE)
    //   let serialsToRemove = [];
    //   if (serialNo?.length > 0) {
    //     // Verify all barcodes exist
    //     const existingSerials = await StockItem.find({
    //       itemId,
    //       serialNo: { $in: serialNo },
    //       stockInId
    //     });

    //     if (existingSerials.length !== serialNo.length) {
    //       const foundSerials = existingSerials.map(s => s.serialNo);
    //       const missingSerials = serialNo.filter(s => !foundSerials.includes(s));
    //       throw new Error(`Some serial numbers not found: ${missingSerials.join(', ')}`);
    //     }

    //     serialsToRemove = serialNo;
    //   } else {
    //     serialsToRemove = stockInDoc.serialNo[index].slice(-removeQty);
    //   }

    //   if (serialsToRemove.length > 0) {
    //     await StockItem.deleteMany({
    //       itemId,
    //       serialNo: { $in: serialsToRemove },
    //       stockInId
    //     });

    //     // Remove from array
    //     stockInDoc.serialNo[index] = stockInDoc.serialNo[index].filter(
    //       s => !serialsToRemove.includes(s)
    //     );
    //   }

    //   // Update quantity
    //   stockInDoc.stockAdded[index] -= removeQty;

    //   // Remove item if quantity reaches zero
    //   if (stockInDoc.stockAdded[index] <= 0) {
    //     stockInDoc.itemId.splice(index, 1);
    //     stockInDoc.stockAdded.splice(index, 1);
    //     stockInDoc.serialNo.splice(index, 1);
    //   }
    // }

    await stockInDoc.save();
  } catch (error) {
    throw error;
  }
}

export const updateStockIn = async (req, res) => {
  const { id } = req.params;
  const { itemId, serialNo, stockAdded, action, ...rest } = req.body;

  try {
    const stockInDoc = await StockIn.findById(id);
    if (!stockInDoc) {
      return res.status(404).json({ message: "Stock In not found" });
    }

    // Handle multiple items
    if ((action === "add" || action === "update") && itemId && stockAdded) {
      // Ensure we're working with arrays
      const itemIds = Array.isArray(itemId) ? itemId : [itemId];
      const stockAddeds = Array.isArray(stockAdded) ? stockAdded : [stockAdded];
      const serialNos = Array.isArray(serialNo) ? serialNo : [serialNo || []];

      for (let i = 0; i < itemIds.length; i++) {
        await handleStockAndSerials(
          stockInDoc,
          id,
          itemIds[i],
          stockAddeds[i],
          serialNos[i] || [],
          action
        );
      }
    }
    if (action === "remove" && itemId && stockAdded) {
      // Serial numbers delete
      if (serialNo?.length > 0) {
        await StockItem.deleteMany({ serialNo: { $in: serialNo } });
      }

      // Item stock decrease
      await ItemStockRecord.updateOne(
        { itemId },
        { $inc: { remainingStock: -Number(stockAdded) } }
      );

      // StockIn document se item remove
      await StockIn.findByIdAndUpdate(id, {
        $pull: {
          itemId,
          stockAdded: stockAdded,
          serialNo: serialNo || [],
        },
      });
    }

    // Update other fields
    const updatedStockIn = await StockIn.findByIdAndUpdate(
      id,
      { $set: rest },
      { new: true }
    ).populate("itemId");

    res.status(200).json(updatedStockIn);
  } catch (error) {
    console.error("Error updating Stock In:", error);
    res
      .status(400)
      .json({ message: error.message + " - Error updating stock in" });
  }
};

export const deleteStockIn = async (req, res) => {
  const { id } = req.params;

  try {
    const stockIn = await StockIn.findById(id);
    if (!stockIn) {
      return res.status(404).json({ message: "Stock In not found" });
    }

    // 1. Delete all stock items associated with this stock in
    await StockItem.deleteMany({ stockInId: id });

    // 2. Reverse stock for each item and remove transactions
    for (let i = 0; i < stockIn.itemId.length; i++) {
      const itemId = stockIn.itemId[i];
      const stockAdded = stockIn.stockAdded[i] || 0;

      if (stockAdded > 0) {
        // Find and update the item stock record
        const itemStockRecord = await ItemStockRecord.findOne({ itemId });

        if (itemStockRecord) {
          // Remove the stock
          itemStockRecord.remainingStock -= stockAdded;

          // Remove transactions related to this stock in
          itemStockRecord.transactions = itemStockRecord.transactions.filter(
            (transaction) => !transaction.reference.includes(`${id}`)
          );

          await itemStockRecord.save();
        }
      }
    }

    // 3. Permanently delete the stock in record
    await StockIn.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Stock In permanently deleted successfully" });
  } catch (error) {
    console.error("Error deleting Stock In:", error);
    res.status(500).json({
      message: error.message + " - Error deleting stock in",
      error: error.message,
    });
  }
};
