// import mongoose from "mongoose";
// import AutoIncrementFactory from "mongoose-sequence";

// const AutoIncrement = AutoIncrementFactory(mongoose);

// const partySchema = new mongoose.Schema(
//   {
//     partyId: Number,
//     partyName: {
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
//     resellerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Reseller",
//       required: false,
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

// partySchema.virtual("status").get(function () {
//   return this.isActive ? "Active" : "Inactive";
// });

// partySchema.plugin(AutoIncrement, { inc_field: "partyId" });


// partySchema.methods.softDelete = function() {
//   this.isActive = false;
//   this.deletedAt = new Date();
//   return this.save();
// };
// partySchema.query.active = function () {
//   return this.where({ isActive: true });
// }

// partySchema.query.inactive = function () {
//   return this.where({ isActive: false });
// }

// export const Party = mongoose.model("Party", partySchema);


import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const partySchema = new mongoose.Schema(
  {
    partyId: Number,
    partyName: {
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
    resellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reseller",
      required: false,
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

partySchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
});

partySchema.plugin(AutoIncrement, { inc_field: "partyId" });

// Soft delete method
partySchema.methods.softDelete = function() {
  this.isActive = false;
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Hard delete method
partySchema.methods.hardDelete = function() {
  return this.deleteOne();
};

// Query helpers
partySchema.query.active = function () {
  return this.where({ isActive: true, isDeleted: false });
};

partySchema.query.inactive = function () {
  return this.where({ isActive: false, isDeleted: false });
};

partySchema.query.notDeleted = function () {
  return this.where({ isDeleted: false });
};

partySchema.query.deleted = function () {
  return this.where({ isDeleted: true });
};

partySchema.query.withDeleted = function () {
  return this;
};

export const Party = mongoose.model("Party", partySchema);