import mongoose, { Document } from 'mongoose';

export interface IPrompt extends Document {
  name : string;
  description : string;
  prompt : string;
  userEmail: string;
}

const PromptSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    prompt: {
      type: String,
    },
    userEmail: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const PromptModel = mongoose.models.Prompt
  ? mongoose.model('Prompt')
  : mongoose.model<IPrompt>('Prompt', PromptSchema);
