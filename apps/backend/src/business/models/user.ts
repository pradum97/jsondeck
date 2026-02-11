import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface UserDocument extends Document {
  userId: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, trim: true, maxlength: 200 },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    roles: { type: [String], default: ["free"] },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

const UserModel: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);

export { UserModel };
