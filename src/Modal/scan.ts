
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IScan extends Document {
  userId: mongoose.Types.ObjectId;
  label: string;
  confidence: number;
  imageUrl?: string;
  pointsEarned: number;
  metadata: any; // Store specific AI raw output here
  createdAt: Date;
}

const scanSchema = new Schema<IScan>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      index: true // CRITICAL: Index for fetching history fast
    },
    label: { type: String, required: true },
    confidence: { type: Number, required: true },
    imageUrl: { type: String },
    pointsEarned: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } } // We only need createdAt for history
);

const Scan: Model<IScan> =
  mongoose.models.Scan || mongoose.model<IScan>("Scan", scanSchema);

export default Scan;