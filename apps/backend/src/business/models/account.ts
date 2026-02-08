import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ConnectedProvider {
  provider: string;
  providerId: string;
  connectedAt: Date;
}

export interface AccountDocument extends Document {
  userId: string;
  email?: string;
  displayName?: string;
  roles: string[];
  providers: ConnectedProvider[];
  createdAt: Date;
  updatedAt: Date;
}

const providerSchema = new Schema<ConnectedProvider>(
  {
    provider: { type: String, required: true, trim: true, maxlength: 80 },
    providerId: { type: String, required: true, trim: true, maxlength: 160 },
    connectedAt: { type: Date, required: true },
  },
  { _id: false }
);

const accountSchema = new Schema<AccountDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, trim: true, maxlength: 200 },
    displayName: { type: String, trim: true, maxlength: 120 },
    roles: { type: [String], default: ["free"] },
    providers: { type: [providerSchema], default: [] },
  },
  { timestamps: true }
);

accountSchema.index({ email: 1 });
accountSchema.index({ roles: 1 });

const AccountModel: Model<AccountDocument> =
  mongoose.models.Account || mongoose.model<AccountDocument>("Account", accountSchema);

export { AccountModel };
