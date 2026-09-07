import mongoose from "mongoose";

const securityEventModelSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      enum: ["medium", "high"],
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    ip_address: {
      type: String,
      required: true,
    },

    attempt_count: {
      type: Number,
      required: true,
      min: 1,
    },

    timestamp: {
      type: Date,
      required: true,
    },

    should_alert: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const SecurityEvent = mongoose.model(
  "SecurityEvent",
  securityEventModelSchema,
);
