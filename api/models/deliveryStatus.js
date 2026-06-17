// import mongoose from "mongoose";
// import AutoIncrementFactory from "mongoose-sequence";

// const AutoIncrement = AutoIncrementFactory(mongoose);

// const deliveryStatusSchema = new mongoose.Schema(
//   {
//     deliveryStatusId: Number,
//     deliveryStatusName: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//       required: false,
//       trim: true,
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

// deliveryStatusSchema.virtual("status").get(function () {
//   return this.isActive ? "Active" : "Inactive";
// });

// deliveryStatusSchema.plugin(AutoIncrement, { inc_field: "deliveryStatusId" });
// deliveryStatusSchema.methods.softDelete = function() {
//   this.isActive = false;
//   this.deletedAt = new Date();
//   return this.save();
// };

// deliveryStatusSchema.query.active = function () {
//   return this.where({ isActive: true });
// };

// deliveryStatusSchema.query.inactive = function () {
//   return this.where({ isActive: false });
// };

// export const DeliveryStatus = mongoose.model(
//   "DeliveryStatus",
//   deliveryStatusSchema
// );


import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const deliveryStatusSchema = new mongoose.Schema(
  {
    deliveryStatusId: Number,
    deliveryStatusName: {
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

deliveryStatusSchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
});

deliveryStatusSchema.plugin(AutoIncrement, { inc_field: "deliveryStatusId" });

// Soft delete method
deliveryStatusSchema.methods.softDelete = function() {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

// Hard delete method
deliveryStatusSchema.methods.hardDelete = function() {
  return this.deleteOne();
};

// Query helpers
deliveryStatusSchema.query.active = function () {
  return this.where({ isActive: true });
};

deliveryStatusSchema.query.inactive = function () {
  return this.where({ isActive: false });
};

deliveryStatusSchema.query.withDeleted = function () {
  return this;
};

export const DeliveryStatus = mongoose.model(
  "DeliveryStatus",
  deliveryStatusSchema
);