import mongoose from "mongoose";

const assignedToSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
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

// Case-insensitive unique index for name
// assignedToSchema.index(
//   { name: 1 },
//   {
//     unique: true,
//     collation: { locale: "en", strength: 2 },
//   }
// );

assignedToSchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
});

// Soft delete method
assignedToSchema.methods.softDelete = async function () {
  this.isActive = false;
  this.deletedAt = new Date();
  await this.save();
};

// Name is unique per tenant, not globally.
assignedToSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const AssignedTo = mongoose.model("AssignedTo", assignedToSchema);
