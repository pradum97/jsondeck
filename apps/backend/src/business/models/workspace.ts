import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface WorkspaceDocument extends Document {
  name: string;
  description?: string;
  ownerId: string;
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<WorkspaceDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500 },
    ownerId: { type: String, required: true, index: true },
    memberIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

workspaceSchema.index({ ownerId: 1, name: 1 });
workspaceSchema.index({ memberIds: 1 });

const WorkspaceModel: Model<WorkspaceDocument> =
  mongoose.models.Workspace || mongoose.model<WorkspaceDocument>("Workspace", workspaceSchema);

export { WorkspaceModel };
