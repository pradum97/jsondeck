import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface CollectionDocument extends Document {
  projectId: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const collectionSchema = new Schema<CollectionDocument>(
  {
    projectId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500 },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

collectionSchema.index({ projectId: 1, name: 1 });

const CollectionModel: Model<CollectionDocument> =
  mongoose.models.Collection || mongoose.model<CollectionDocument>("Collection", collectionSchema);

export { CollectionModel };
