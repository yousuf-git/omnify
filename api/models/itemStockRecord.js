import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const TransactionSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  quantity: { type: Number, required: true },
  type: { type: String, enum: ["Stock-In", "Stock-Out", "Opening"], required: true },
  reference: { type: String, required: true },
});

const itemStockRecordSchema = new mongoose.Schema(
  {
    itemStockRecordId: Number,
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    stockInId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockIn",
    },
    stockOutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockOut",
    },
    openingStock: {
      type: Number,
      default: 0,
    },
    closingStock: {
      type: Number,
      default: 0,
    },
    remainingStock: {
      type: Number,
      required: true,
    },
    transactions: [TransactionSchema],
  },
  {
    timestamps: true,
    versionKey: "version",
  }
);

// Indexes
itemStockRecordSchema.index({ itemId: 1 });
itemStockRecordSchema.index({ stockInId: 1 });
itemStockRecordSchema.index({ stockOutId: 1 });

// Auto-increment plugin
itemStockRecordSchema.plugin(AutoIncrement, { inc_field: "itemStockRecordId" });

// Validation - prevent negative stock
itemStockRecordSchema.pre("save", function (next) {
  if (this.remainingStock < -10000) {
    const error = new Error("Stock level too low");
    return next(error);
  }
  next();
});

// Static method for updating stock
// Static method for updating stock with transaction tracking
itemStockRecordSchema.statics.updateStock = async function (
  itemId,
  quantity,
  type,
  reference
) {
  let record = await this.findOne({ itemId });

  if (!record) {
    record = new this({
      itemId,
      openingStock: 0,
      remainingStock: quantity,
      transactions: [
        {
          date: new Date(),
          quantity: Math.abs(quantity),
          type,
          reference,
        },
      ],
    });
  } else {
    record.remainingStock += quantity;

    // Add transaction
    record.transactions.push({
      date: new Date(),
      quantity: Math.abs(quantity),
      type,
      reference,
    });
  }

  await record.save();
  return record;
};

// Instance method to get current stock
itemStockRecordSchema.methods.getCurrentStock = function () {
  return this.remainingStock;
};

const ItemStockRecord = mongoose.model(
  "ItemStockRecord",
  itemStockRecordSchema
);

export default ItemStockRecord;
