import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const stockInSchema = new mongoose.Schema(
  {
    stockInId: Number,
    itemId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    }],
    stockAdded: {
      type: [Number],
      required: true,
    },
      stockInDate: {
          type: Date,
          required: true,
          // default: Date.now,
        },
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    stockInCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockInCategory",
      required: true,
    },
    invoiceNo: { 
      type: String,
      sparse: true, // Allows multiple documents with null/undefined values
      default: null, // Use null instead of empty string
      required: false,
    },
    date: { type: Date, required: true },
    notes: String,
    isActive: { type: Boolean, default: true },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

stockInSchema.query.active = function () {
  return this.where({ isActive: true });
};

stockInSchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
});

stockInSchema.plugin(AutoIncrement, { inc_field: "stockInId" });

stockInSchema.methods.softDelete = function () {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

stockInSchema.query.active = function () {
  return this.where({ isActive: true });
};

stockInSchema.query.inactive = function () {
  return this.where({ isActive: false });
};

export const StockIn = mongoose.model("StockIn", stockInSchema);
