// models/stockItem.js
import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const stockItemSchema = new mongoose.Schema(
  {
    stockItemId: {
      type: Number,
      unique: true
    },
    serialNo: {
      type: String,
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    stockInId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "stockIn",
    },
    stockOutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "stockOut",
    },
    hasTicket: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Apply plugin only if not already applied
if (!stockItemSchema.plugins.some(plugin => 
    plugin.fn.constructor.name === 'SequenceFactory' && 
    plugin.options.inc_field === "stockItemId")) {
  stockItemSchema.plugin(AutoIncrement, { 
    inc_field: "stockItemId",
    start_seq: 1
  });
}

// Check if model already exists before defining it
const StockItem = mongoose.model("StockItem", stockItemSchema);

export { StockItem };