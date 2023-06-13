import mongoose, { Document } from 'mongoose';

export interface IFile extends Document {
  name: string;
  size: string;
  namespace: string;
}

const FileSchema = new mongoose.Schema(
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

const File = mongoose.models.File
  ? mongoose.model<IFile>('File')
  : mongoose.model<IFile>('File', FileSchema);

export default File;
