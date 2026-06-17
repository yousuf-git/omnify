// import mongoose from "mongoose";
// import AutoIncrementFactory from "mongoose-sequence";

// const AutoIncrement = AutoIncrementFactory(mongoose);

// const citySchema = new mongoose.Schema(
//     {
//         cityId: Number,
//         cityName: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         stateId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "State",
//             required: true,
//         },
//         isActive: {
//             type: Boolean,
//             default: true,
//         },
//         deletedAt: {
//             type: Date,
//             default: null,
//         },
//     },
//     {
//         timestamps: true,
//         toJSON: { virtuals: true },
//         toObject: { virtuals: true },
//     }
// );

// // Add virtual for soft delete status
// citySchema.virtual("status").get(function () {
//     return this.deletedAt ? "deleted" : "active";
// });
// citySchema.plugin(AutoIncrement, { inc_field: "cityId" });
// const City = mongoose.model("City", citySchema);

// export default City;

import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const citySchema = new mongoose.Schema(
    {
        cityId: Number,
        cityName: {
            type: String,
            required: true,
            trim: true,
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

// Add virtual for soft delete status
citySchema.virtual("status").get(function () {
    return this.isActive ? "Active" : "Inactive";
});

citySchema.plugin(AutoIncrement, { inc_field: "cityId" });

// Soft delete method
citySchema.methods.softDelete = function() {
    this.isActive = false;
    this.deletedAt = new Date();
    return this.save();
};

// Restore method
citySchema.methods.restore = function() {
    this.isActive = true;
    this.deletedAt = null;
    return this.save();
};

// Hard delete method
citySchema.methods.hardDelete = function() {
    return this.deleteOne();
};

// Query helpers
citySchema.query.active = function () {
    return this.where({ isActive: true });
};

citySchema.query.inactive = function () {
    return this.where({ isActive: false });
};

const City = mongoose.model("City", citySchema);

export default City;