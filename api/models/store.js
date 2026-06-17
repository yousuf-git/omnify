// import mongoose from "mongoose";

// const storeSchema = new mongoose.Schema(
//   {
//     storeId: {
//       type: Number,
//       required: true,
//     },
//     partyId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Party",
//       required: true,
//     },
//     storeName: {
//       type: String,
//       required: true,
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
//     storeAddress: {
//       type: String,
//       required: true,
//     },
//     storePinCode: {
//       type: String,
//       required: true,
//     },
//     smName: {
//       type: String,
//       required: true,
//     },
//     smContactNo: {
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
// storeSchema.methods.softDelete = function () {
//   this.isActive = false;
//   this.deletedAt = new Date();
//   return this.save();
// };

// storeSchema.virtual("status").get(function () {
//   return this.isActive ? "Active" : "Inactive";
// });

// // Query helpers for filtering
// storeSchema.query.active = function () {
//   return this.where({ isActive: true });
// };

// storeSchema.query.inactive = function () {
//   return this.where({ isActive: false });
// };

// export const Store = mongoose.model("Store", storeSchema);



import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    storeId: {
      type: Number,
      required: true,
    },
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",

    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",

    },
    storeAddress: {
      type: String,

    },
    storePinCode: {
      type: String,

    },
    smName: {
      type: String,

    },
    smContactNo: {
      type: String,

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

// Soft delete method
storeSchema.methods.softDelete = function () {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

// Hard delete method
storeSchema.methods.hardDelete = function () {
  return this.deleteOne();
};

// Query helpers
storeSchema.query.active = function () {
  return this.where({ isActive: true });
};

storeSchema.query.inactive = function () {
  return this.where({ isActive: false });
};

storeSchema.query.withDeleted = function () {
  return this;
};

storeSchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
});

export const Store = mongoose.model("Store", storeSchema);
