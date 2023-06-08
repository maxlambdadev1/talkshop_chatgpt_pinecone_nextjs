import mongoose, { Document } from 'mongoose';

export interface IAIPrompt extends Document {
  dataName: string;
  categoryName: string;
  prompt: string;
}

const aiPromptSchema = new mongoose.Schema({
  dataName: {
    type: String,
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
});

const AIPrompt = mongoose.models.AIPrompt
  ? mongoose.model<IAIPrompt>('AIPrompt')
  : mongoose.model<IAIPrompt>('AIPrompt', aiPromptSchema);

export default AIPrompt;
