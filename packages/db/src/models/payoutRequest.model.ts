import mongoose, { model, Schema, Types, Document } from "mongoose";

export enum PayoutRequestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  COMPLETED = "completed",
}

export interface IPayoutRequest extends Document {
  sellerId: Types.ObjectId;
  sellerName: string;
  sellerEmail: string;
  
  // Payout details
  requestedAmount: number;
  availableEarnings: number; // Earnings at the time of request
  
  // Status tracking
  status: PayoutRequestStatus;
  
  // Admin actions
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  
  // Completion tracking
  completedAt?: Date;
  completedBy?: Types.ObjectId;
  notes?: string; // Admin notes about the payout
  
  // Metadata
  requestNumber: string; // Unique request identifier
  
  createdAt: Date;
  updatedAt: Date;
}

const payoutRequestSchema = new Schema<IPayoutRequest>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerName: {
      type: String,
      required: true,
    },
    sellerEmail: {
      type: String,
      required: true,
    },
    requestedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    availableEarnings: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(PayoutRequestStatus),
      default: PayoutRequestStatus.PENDING,
      index: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
    },
    requestNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
payoutRequestSchema.index({ sellerId: 1, createdAt: -1 });
payoutRequestSchema.index({ status: 1, createdAt: -1 });
payoutRequestSchema.index({ requestNumber: 1 });

if (mongoose.models.PayoutRequest) {
  delete mongoose.models.PayoutRequest;
}

export const PayoutRequest = model<IPayoutRequest>("PayoutRequest", payoutRequestSchema);

