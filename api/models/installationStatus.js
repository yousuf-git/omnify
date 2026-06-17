// import mongoose from "mongoose";
// import AutoIncrementFactory from "mongoose-sequence";

// const AutoIncrement = AutoIncrementFactory(mongoose);

// const installationStatusSchema = new mongoose.Schema(
//   {
//     installationStatusId: Number,
//     installationStatusName: {
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

// // Add virtual for soft delete status
// installationStatusSchema.virtual("status").get(function () {
//   return this.isActive ? "Active" : "Inactive";
// });

// installationStatusSchema.plugin(AutoIncrement, {
//   inc_field: "installationStatusId",
// });

// installationStatusSchema.methods.softDelete = function() {
//   this.isActive = false;
//   this.deletedAt = new Date();
//   return this.save();
// };

// installationStatusSchema.query.active = function () {
//   return this.where({ isActive: true });
// };

// installationStatusSchema.query.inactive = function () {
//   return this.where({ isActive: false });
// };

// export const InstallationStatus = mongoose.model(
//   "InstallationStatus",
//   installationStatusSchema
// );


import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const installationStatusSchema = new mongoose.Schema(
  {
    installationStatusId: Number,
    installationStatusName: {
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
installationStatusSchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
});

installationStatusSchema.plugin(AutoIncrement, {
  inc_field: "installationStatusId",
});

// Soft delete method
installationStatusSchema.methods.softDelete = function() {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

// Hard delete method
installationStatusSchema.methods.hardDelete = function() {
  return this.deleteOne();
};

// Query helpers
installationStatusSchema.query.active = function () {
  return this.where({ isActive: true });
};

installationStatusSchema.query.inactive = function () {
  return this.where({ isActive: false });
};

installationStatusSchema.query.withDeleted = function () {
  return this;
};

export const InstallationStatus = mongoose.model(
  "InstallationStatus",
  installationStatusSchema
);