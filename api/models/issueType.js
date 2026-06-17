// import mongoose from "mongoose";
// import AutoIncrementFactory from "mongoose-sequence";

// const AutoIncrement = AutoIncrementFactory(mongoose);

// const issueTypeSchema = new mongoose.Schema(
//   {
//     issueTypeId: Number,
//     issueTypeName: {
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

// issueTypeSchema.virtual("status").get(function () {
//   return this.isActive ? "Active" : "Inactive";
// });

// issueTypeSchema.plugin(AutoIncrement, { inc_field: "issueTypeId" });

// issueTypeSchema.methods.softDelete = function() {
//   this.isActive = false;
//   this.deletedAt = new Date();
//   return this.save();
// };

// issueTypeSchema.query.active = function () {
//   return this.where({ isActive: true });
// };

// issueTypeSchema.query.inactive = function () {
//   return this.where({ isActive: false });
// };

// export const IssueType = mongoose.model("IssueType", issueTypeSchema);

import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const issueTypeSchema = new mongoose.Schema(
  {
    issueTypeId: Number,
    issueTypeName: {
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

issueTypeSchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
});

issueTypeSchema.plugin(AutoIncrement, { inc_field: "issueTypeId" });

// Soft delete method
issueTypeSchema.methods.softDelete = function() {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

// Hard delete method
issueTypeSchema.methods.hardDelete = function() {
  return this.deleteOne();
};

// Query helpers
issueTypeSchema.query.active = function () {
  return this.where({ isActive: true });
};

issueTypeSchema.query.inactive = function () {
  return this.where({ isActive: false });
};

issueTypeSchema.query.withDeleted = function () {
  return this;
};

export const IssueType = mongoose.model("IssueType", issueTypeSchema);