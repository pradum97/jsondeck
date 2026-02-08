import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface RefreshTokenDocument extends Document {
  userId: string;
  token: string;
  expiresAt: Date;
  revokedAt?: Date;
  replacedByToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    userId: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    replacedByToken: { type: String },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshTokenModel: Model<RefreshTokenDocument> =
  mongoose.models.RefreshToken || mongoose.model<RefreshTokenDocument>("RefreshToken", refreshTokenSchema);

export { RefreshTokenModel };
