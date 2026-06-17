// import mongoose from "mongoose";
// import AutoIncrementFactory from "mongoose-sequence";

// const AutoIncrement = AutoIncrementFactory(mongoose);

// const logisticsProviderCategorySchema = new mongoose.Schema(
//   {
//     logisticsProviderCategoryId: Number,
//     logisticsProviderCategoryName: {
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

// logisticsProviderCategorySchema.virtual("status").get(function () {
//   return this.isActive ? "Active" : "Inactive";
// });

// logisticsProviderCategorySchema.plugin(AutoIncrement, {
//   inc_field: "logisticsProviderCategoryId",
// });

// logisticsProviderCategorySchema.methods.softDelete = function() {
//   this.isActive = false;
//   this.deletedAt = new Date();
//   return this.save();
// };

// logisticsProviderCategorySchema.query.active = function () {
//   return this.where({ isActive: true });
// }

// logisticsProviderCategorySchema.query.inactive = function () {
//   return this.where({ isActive: false });
// }

// export const LogisticsProviderCategory = mongoose.model(
//   "LogisticsProviderCategory",
//   logisticsProviderCategorySchema
// );

import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const logisticsProviderCategorySchema = new mongoose.Schema(
  {
    logisticsProviderCategoryId: Number,
    logisticsProviderCategoryName: {
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

logisticsProviderCategorySchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
});

logisticsProviderCategorySchema.plugin(AutoIncrement, {
  inc_field: "logisticsProviderCategoryId",
});

// Soft delete method
logisticsProviderCategorySchema.methods.softDelete = function() {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

// Hard delete method
logisticsProviderCategorySchema.methods.hardDelete = function() {
  return this.deleteOne();
};

// Query helpers
logisticsProviderCategorySchema.query.active = function () {
  return this.where({ isActive: true });
}

logisticsProviderCategorySchema.query.inactive = function () {
  return this.where({ isActive: false });
}

logisticsProviderCategorySchema.query.withDeleted = function () {
  return this;
}

export const LogisticsProviderCategory = mongoose.model(
  "LogisticsProviderCategory",
  logisticsProviderCategorySchema
);
