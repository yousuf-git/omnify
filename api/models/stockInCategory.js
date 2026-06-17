import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const stockInCategorySchema = new mongoose.Schema(
  {
    stockInCategoryId: Number,
    stockInCategoryName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
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

// Add virtual for soft delete status
stockInCategorySchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
})
stockInCategorySchema.plugin(AutoIncrement, { inc_field: "stockInCategoryId" });

stockInCategorySchema.methods.softDelete = function() {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

stockInCategorySchema.query.active = function () {
  return this.where({ isActive: true });
};

stockInCategorySchema.query.inactive = function () {
  return this.where({ isActive: false });
};

export const StockInCategory = mongoose.model(
  "StockInCategory",
  stockInCategorySchema
);
