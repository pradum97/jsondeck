import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface DocumentDocument extends Document {
  projectId: string;
  title: string;
  content?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<DocumentDocument>(
  {
    projectId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, trim: true, maxlength: 20000 },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

documentSchema.index({ projectId: 1, updatedAt: -1 });

const DocumentModel: Model<DocumentDocument> =
  mongoose.models.Document || mongoose.model<DocumentDocument>("Document", documentSchema);

export { DocumentModel };
