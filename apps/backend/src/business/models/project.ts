import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ProjectDocument extends Document {
  workspaceId: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<ProjectDocument>(
  {
    workspaceId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500 },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

projectSchema.index({ workspaceId: 1, name: 1 });

const ProjectModel: Model<ProjectDocument> =
  mongoose.models.Project || mongoose.model<ProjectDocument>("Project", projectSchema);

export { ProjectModel };
