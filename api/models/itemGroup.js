// models/itemGroup.js

import mongoose from "mongoose";
import pkg from "mongoose-sequence";
const AutoIncrement = pkg(mongoose);

// Step 1: Create Schema
const itemGroupSchema = new mongoose.Schema(
  {
    itemGroupId: Number, // Auto-incremented field
    itemGroupName: {
      type: String,
      required: true,
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

itemGroupSchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
});

// Step 2: Apply Plugin AFTER schema creation
itemGroupSchema.plugin(AutoIncrement, { inc_field: "itemGroupId" });

itemGroupSchema.methods.softDelete = function() {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

itemGroupSchema.query.active = function () {
  return this.where({ isActive: true });
}

itemGroupSchema.query.inactive = function () {
  return this.where({ isActive: false });
}
// Step 3: Export Model
export const ItemGroup = mongoose.model("ItemGroup", itemGroupSchema);
