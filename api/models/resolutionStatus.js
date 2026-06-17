// import mongoose from "mongoose";
// import AutoIncrementFactory from "mongoose-sequence";

// const AutoIncrement = AutoIncrementFactory(mongoose);

// const resolutionStatusSchema = new mongoose.Schema(
//   {
//     resolutionStatusId: Number,
//     resolutionStatusName: {
//       type: String,
//       required: true,
//       trim: true,
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

// resolutionStatusSchema.virtual("status").get(function () {
//   return this.isActive ? "Active" : "Inactive";
// });

// resolutionStatusSchema.plugin(AutoIncrement, { inc_field: "resolutionStatusId" });

// resolutionStatusSchema.methods.softDelete = function() {
//   this.isActive = false;
//   this.deletedAt = new Date();
//   return this.save();
// };

// resolutionStatusSchema.query.active = function () {
//   return this.where({ isActive: true });
// };

// resolutionStatusSchema.query.inactive = function () {
//   return this.where({ isActive: false });
// };

// export const ResolutionStatus = mongoose.model("ResolutionStatus", resolutionStatusSchema);


import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const resolutionStatusSchema = new mongoose.Schema(
  {
    resolutionStatusId: Number,
    resolutionStatusName: {
      type: String,
      required: true,
      trim: true,
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

resolutionStatusSchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
});

resolutionStatusSchema.plugin(AutoIncrement, { inc_field: "resolutionStatusId" });

// Soft delete method
resolutionStatusSchema.methods.softDelete = function() {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

// Hard delete method
resolutionStatusSchema.methods.hardDelete = function() {
  return this.deleteOne();
};

// Query helpers
resolutionStatusSchema.query.active = function () {
  return this.where({ isActive: true });
};

resolutionStatusSchema.query.inactive = function () {
  return this.where({ isActive: false });
};

resolutionStatusSchema.query.withDeleted = function () {
  return this;
};

export const ResolutionStatus = mongoose.model("ResolutionStatus", resolutionStatusSchema);