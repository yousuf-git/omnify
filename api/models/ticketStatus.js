// import mongoose from "mongoose";
// import AutoIncrementFactory from "mongoose-sequence";

// const AutoIncrement = AutoIncrementFactory(mongoose);

// const ticketStatusSchema = new mongoose.Schema(
//   {
//     ticketStatusId: Number,
//     name: {
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

// ticketStatusSchema.virtual("status").get(function () {
//   return this.isActive ? "Active" : "Inactive";
// });

// ticketStatusSchema.plugin(AutoIncrement, { inc_field: "ticketStatusId" });

// ticketStatusSchema.methods.softDelete = function() {
//   this.isActive = false;
//   this.deletedAt = new Date();
//   return this.save();
// };

// ticketStatusSchema.query.active = function () {
//   return this.where({ isActive: true });
// };

// ticketStatusSchema.query.inactive = function () {
//   return this.where({ isActive: false });
// };

// export const TicketStatus = mongoose.model("TicketStatus", ticketStatusSchema);


import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const ticketStatusSchema = new mongoose.Schema(
  {
    ticketStatusId: Number,
    name: {
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

ticketStatusSchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
});

ticketStatusSchema.plugin(AutoIncrement, { inc_field: "ticketStatusId" });

// Soft delete method
ticketStatusSchema.methods.softDelete = function() {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

// Restore method
ticketStatusSchema.methods.restore = function() {
  this.isActive = true;
  this.deletedAt = null;
  return this.save();
};

// Hard delete method
ticketStatusSchema.methods.hardDelete = function() {
  return this.deleteOne();
};

ticketStatusSchema.query.active = function () {
  return this.where({ isActive: true });
};

ticketStatusSchema.query.inactive = function () {
  return this.where({ isActive: false });
};

export const TicketStatus = mongoose.model("TicketStatus", ticketStatusSchema);