// import mongoose from "mongoose";
// import AutoIncrementFactory from "mongoose-sequence";

// const AutoIncrement = AutoIncrementFactory(mongoose);

// const resellerSchema = new mongoose.Schema(
//   {
//     resellerId: Number,
//     resellerName: {
//       type: String,
//       required: true,
//     },
//     address: {
//       type: String,
//       required: false,
//       trim: true,
//     },
//     gstn: {
//       type: String,
//       required: false,
//       trim: true,
//     },
//     shippingAddress: {
//       type: String,
//       required: false,
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

// resellerSchema.virtual("status").get(function () {
//   return this.isActive ? "Active" : "Inactive";
// })

// resellerSchema.plugin(AutoIncrement, { inc_field: "resellerId" });

// resellerSchema.methods.softDelete = function() {
//   this.isActive = false;
//   this.deletedAt = new Date();
//   return this.save();
// };

// resellerSchema.query.active = function () {
//   return this.where({ isActive: true });
// }

// resellerSchema.query.inactive = function () {
//   return this.where({ isActive: false });
// }

// export const Reseller = mongoose.model("Reseller", resellerSchema);


import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const resellerSchema = new mongoose.Schema(
  {
    resellerId: Number,
    resellerName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
    },
    gstn: {
      type: String,
      required: false,
      trim: true,
    },
    shippingAddress: {
      type: String,
      required: false,
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

resellerSchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
})

resellerSchema.plugin(AutoIncrement, { inc_field: "resellerId" });

// Soft delete method
resellerSchema.methods.softDelete = function() {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

// Hard delete method
resellerSchema.methods.hardDelete = function() {
  return this.deleteOne();
};

// Query helpers
resellerSchema.query.active = function () {
  return this.where({ isActive: true });
}

resellerSchema.query.inactive = function () {
  return this.where({ isActive: false });
}

resellerSchema.query.withDeleted = function () {
  return this;
}

export const Reseller = mongoose.model("Reseller", resellerSchema);