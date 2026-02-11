import mongoose, { Schema, type Document, type Model } from "mongoose";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export interface ApiRequestDocument extends Document {
  collectionId: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
  isJson: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const apiRequestSchema = new Schema<ApiRequestDocument>(
  {
    collectionId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 140 },
    method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
    },
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    headers: { type: Map, of: String, default: {} },
    body: { type: String },
    isJson: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

apiRequestSchema.index({ collectionId: 1, name: 1 });
apiRequestSchema.index({ createdAt: -1, method: 1 });

const ApiRequestModel: Model<ApiRequestDocument> =
  mongoose.models.ApiRequest || mongoose.model<ApiRequestDocument>("ApiRequest", apiRequestSchema);

export { ApiRequestModel };
