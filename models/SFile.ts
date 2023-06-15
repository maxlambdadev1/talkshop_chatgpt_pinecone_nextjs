import mongoose, { Document } from 'mongoose';

export interface ISFile extends Document {
  name: string;
  size: string;
  namespace: string;
}

const SFileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    namespace: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const SFile = mongoose.models.SFile
  ? mongoose.model<ISFile>('SFile')
  : mongoose.model<ISFile>('SFile', SFileSchema);

export default SFile;
