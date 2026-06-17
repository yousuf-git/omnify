import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const agencySchema = new mongoose.Schema(
  {
    agencyId: Number,
    agencyName: {
      type: String,
      required: true,
      trim: true,
    },
    agencyNumber: {
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

agencySchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
});

agencySchema.plugin(AutoIncrement, { inc_field: "agencyId" });

// Soft delete method
agencySchema.methods.softDelete = function() {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

// Hard delete method
agencySchema.methods.hardDelete = function() {
  return this.deleteOne();
};

// Query helpers
agencySchema.query.active = function () {
  return this.where({ isActive: true });
};

agencySchema.query.inactive = function () {
  return this.where({ isActive: false });
};

agencySchema.query.withDeleted = function () {
  return this;
};

export const Agency = mongoose.model("Agency", agencySchema);