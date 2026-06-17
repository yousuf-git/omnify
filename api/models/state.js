import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const stateSchema = new mongoose.Schema(
    {
        stateId: Number,
        stateName: {
            type: String,
            required: true,
            trim: true
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
stateSchema.virtual("status").get(function () {
    return this.isActive ? "Active" : "Inactive";
});

stateSchema.plugin(AutoIncrement, { inc_field: "stateId" });

// Soft delete method
stateSchema.methods.softDelete = function() {
    this.isActive = false;
    this.deletedAt = new Date();
    return this.save();
};

// Restore method
stateSchema.methods.restore = function() {
    this.isActive = true;
    this.deletedAt = null;
    return this.save();
};

// Hard delete method
stateSchema.methods.hardDelete = function() {
    return this.deleteOne();
};

// Query helpers
stateSchema.query.active = function () {
    return this.where({ isActive: true });
};

stateSchema.query.inactive = function () {
    return this.where({ isActive: false });
};

// State name is unique per tenant, not globally.
stateSchema.index({ tenantId: 1, stateName: 1 }, { unique: true });

const State = mongoose.model("State", stateSchema);

export default State;