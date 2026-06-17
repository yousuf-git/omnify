import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const itemSchema = new mongoose.Schema(
  {
    itemId: Number,
    itemGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemGroup",
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    modelNoSKU: {
      type: String,
      required: true,
    },
    requiresInstallation: {
      type: Boolean,
      default: false,
    },
    requiresSerialNumberManagement: {
      type: Boolean,
      default: false,
    },
    unit: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
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
itemSchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
});
itemSchema.plugin(AutoIncrement, { inc_field: "itemId" });

// Soft delete method
itemSchema.methods.softDelete = function() {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

// Hard delete method
itemSchema.methods.hardDelete = function() {
  return this.deleteOne();
};

// Query helpers
itemSchema.query.active = function () {
  return this.where({ isActive: true });
}

itemSchema.query.inactive = function () {
  return this.where({ isActive: false });
}

itemSchema.query.withDeleted = function () {
  return this;
}

// SKU is unique per tenant, not globally.
itemSchema.index({ tenantId: 1, modelNoSKU: 1 }, { unique: true });

export const Item = mongoose.model("Item", itemSchema);