import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const stockOutCategorySchema = new mongoose.Schema(
  {
    stockOutCategoryId: Number,
    stockOutCategoryName: {
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
stockOutCategorySchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
})
stockOutCategorySchema.plugin(AutoIncrement, { inc_field: "stockOutCategoryId" });

stockOutCategorySchema.methods.softDelete = function() {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

stockOutCategorySchema.query.active = function () {
  return this.where({ isActive: true });
};

stockOutCategorySchema.query.inactive = function () {
  return this.where({ isActive: false });
};

export const StockOutCategory = mongoose.model(
  "stockOutCategory",
  stockOutCategorySchema
);
