// import mongoose from "mongoose";
// import AutoIncrementFactory from "mongoose-sequence";

// const AutoIncrement = AutoIncrementFactory(mongoose);

// const supportPersonSchema = new mongoose.Schema(
//   {
//     supportPersonId: Number,
//     agencyId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Agency",
//       required: false,
//     },
//     supportPersonName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     supportPersonNumber: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     cityId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "City",
//       required: true,
//     },
//     stateId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "State",
//       required: true,
//     },
//     rating: {
//       type: Number,
//       min: 1,
//       max: 5,
//       required: false,
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

// supportPersonSchema.virtual("status").get(function () {
//   return this.isActive ? "Active" : "Inactive";
// });

// supportPersonSchema.plugin(AutoIncrement, { inc_field: "supportPersonId" });

// supportPersonSchema.methods.softDelete = function () {
//   this.isActive = false;
//   this.deletedAt = new Date();
//   return this.save();
// };

// supportPersonSchema.query.active = function () {
//   return this.where({ isActive: true });
// };

// supportPersonSchema.query.inactive = function () {
//   return this.where({ isActive: false });
// };

// export const SupportPerson = mongoose.model(
//   "SupportPerson",
//   supportPersonSchema
// );


import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const supportPersonSchema = new mongoose.Schema(
  {
    supportPersonId: Number,
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: false,
    },
    supportPersonName: {
      type: String,
      required: true,
      trim: true,
    },
    supportPersonNumber: {
      type: String,
      required: true,
      trim: true,
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
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

supportPersonSchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
});

supportPersonSchema.plugin(AutoIncrement, { inc_field: "supportPersonId" });

// Soft delete method
supportPersonSchema.methods.softDelete = function () {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

// Hard delete method
supportPersonSchema.methods.hardDelete = function () {
  return this.deleteOne();
};

// Query helpers
supportPersonSchema.query.active = function () {
  return this.where({ isActive: true });
};

supportPersonSchema.query.inactive = function () {
  return this.where({ isActive: false });
};

supportPersonSchema.query.withDeleted = function () {
  return this;
};

export const SupportPerson = mongoose.model(
  "SupportPerson",
  supportPersonSchema
);