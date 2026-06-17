import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import { type } from "os";

const AutoIncrement = AutoIncrementFactory(mongoose);

const stockOutSchema = new mongoose.Schema(
  {
    stockOutId: Number,
    itemId: {
         type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
         }],
          required: true,
          validate: {
           validator: function(v) {
            return v.length > 0;
        },
        message: 'At least one item ID is required'
     }
    },
    logisticsProviderCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LogisticsProviderCategory",
      default: null,
    },
    logisticsProviderCategoryName: {
      type: String,
      required: false,
      trim: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },
    deliveryStatusId: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryStatus",
    }],
      required: true,
      validate: {
        validator: function(v) {
          return v.length > 0;
        },
        message: 'At least one delivery status ID is required'
    },
    },
    installationStatusId: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstallationStatus",
    }],
    //   validate: {
    //     validator: function(v) {
    //       return v.length > 0;
    //     },
    //     message: 'At least one installation status ID is required'
    // },
    },
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: true,
    },
    stockOutCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "stockOutCategory",
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    quantity: {
      type: [Number],
      default: [0],
      validate: {
        validator: function(v) {
          return v.length > 0;
        },
        message: 'At least one quantity is required'
    },
    },
    trackingNo: {
      type: String,
      // required: true,
      trim: true,
    },
    stockOutDate: {
      type: Date,
      required: true,
      // default: Date.now,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    invoiceNo: { 
      type: String,
      sparse: true, // Allows multiple documents with null/undefined values
      default: null, // Use null instead of empty string
      required: false,
    },
    notes: {
      type: String,
      trim: true,
      required: false,
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

stockOutSchema.virtual("status").get(function() {
  return this.isActive ? "Active" : "Inactive";
});


stockOutSchema.plugin(AutoIncrement, { inc_field: "stockOutId" });

stockOutSchema.methods.softDelete = function() {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

// Add virtual for soft delete status
stockOutSchema.query.active = function () {
  return this.where({ isActive: true });
}

stockOutSchema.query.inactive = function () {
  return this.where({ isActive: false });
}

export const StockOut = mongoose.model("StockOut", stockOutSchema);
