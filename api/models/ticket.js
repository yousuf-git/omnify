import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: false,
    },
    ticketType: {
      type: String,
      enum: ["INSTALLATION", "SUPPORT"],
      required: true,
    },
    ticketStatusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketStatus",
      required: true,
    },
    resolutionStatusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResolutionStatus",
      required: false,
    },
    supportPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportPerson",
      required: false,
    },
    issueTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IssueType",
    },
    stockItemId: {
      type: mongoose.Schema.Types.Mixed,
      ref: "StockItem",
      // required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    assignedToId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssignedTo",
      required: false,
    },
    openingDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    resolutionDate: {
      type: Date,
      required: false,
    },
    callId: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      required: false,
    },
    callIdDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    pictures: [
      {
        type: String,
        trim: true,
      },
    ],
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

ticketSchema.virtual("status").get(function () {
  return this.isActive ? "Active" : "Inactive";
});

// Helper function: 6-char alphanumeric ID
function generateTicketId(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

ticketSchema.pre("save", async function (next) {
  if (!this.ticketId) {
    let isUnique = false;
    while (!isUnique) {
      const randomId = generateTicketId(6); // 6-char alphanumeric
      const existing = await mongoose.models.Ticket.findOne({ ticketId: randomId });
      if (!existing) {
        this.ticketId = randomId;
        isUnique = true;
      }
    }
  }
  next();
});

ticketSchema.methods.softDelete = function () {
  this.isActive = false;
  this.deletedAt = new Date();
  return this.save();
};

ticketSchema.query.active = function () {
  return this.where({ isActive: true });
};

ticketSchema.query.inactive = function () {
  return this.where({ isActive: false });
};

ticketSchema.methods.updateResolution = function (resolutionStatusId, resolutionDate) {
  this.resolutionStatusId = resolutionStatusId;
  this.resolutionDate = resolutionDate || new Date();
  return this.save();
};

// ticketId and callId are unique per tenant, not globally.
ticketSchema.index({ tenantId: 1, ticketId: 1 }, { unique: true, sparse: true });
ticketSchema.index({ tenantId: 1, callId: 1 }, { unique: true });

export const Ticket = mongoose.model("Ticket", ticketSchema);
