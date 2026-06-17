// import mongoose from "mongoose";
// import AutoIncrementFactory from "mongoose-sequence";

// const AutoIncrement = AutoIncrementFactory(mongoose);

// const warehouseSchema = new mongoose.Schema(
//   {
//     warehouseId: Number,
//     warehouseName: {
//       type: String,
//       required: true,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     deletedAt: {
//       type: Date,
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // Add virtual for soft delete status
// warehouseSchema.virtual("status").get(function () {
//   return this.isActive ? "Active" : "Inactive";
// });

// warehouseSchema.plugin(AutoIncrement, { inc_field: "warehouseId" });

// // Soft delete method
// warehouseSchema.methods.softDelete = function () {
//   this.isActive = false;
//   this.deletedAt = new Date();
//   return this.save();
// };

// // Restore method
// warehouseSchema.methods.restore = function () {
//   this.isActive = true;
//   this.deletedAt = null;
//   return this.save();
// };

// // Query helpers for filtering
// warehouseSchema.query.active = function () {
//   return this.where({ isActive: true });
// };

// warehouseSchema.query.inactive = function () {
//   return this.where({ isActive: false });
// };

// export const Warehouse = mongoose.model("Warehouse", warehouseSchema);


import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const warehouseSchema = new mongoose.Schema(
  {
    warehouseId: Number,
    warehouseName: {
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

// Add virtual for soft delete status
warehouseSchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
});

warehouseSchema.plugin(AutoIncrement, { inc_field: "warehouseId" });

// Soft delete method
warehouseSchema.methods.softDelete = function () {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

// Hard delete method
warehouseSchema.methods.hardDelete = function () {
  return this.deleteOne();
};

// Restore method
warehouseSchema.methods.restore = function () {
  this.isActive = true;
  this.deletedAt = null;
  return this.save();
};

// Query helpers for filtering
warehouseSchema.query.active = function () {
  return this.where({ isActive: true });
};

warehouseSchema.query.inactive = function () {
  return this.where({ isActive: false });
};

warehouseSchema.query.withDeleted = function () {
  return this;
};

export const Warehouse = mongoose.model("Warehouse", warehouseSchema);