import mongoose, { Document } from 'mongoose';

export interface IAICategory extends Document {
  dataName: string;
  categoryName: string;
}

const aiCategorySchema = new mongoose.Schema({
  dataName: {
    type: String,
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
});

const AICategory = mongoose.models.AICategory
  ? mongoose.model<IAICategory>('AICategory')
  : mongoose.model<IAICategory>('AICategory', aiCategorySchema);

export default AICategory;
