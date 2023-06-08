import mongoose, { Document } from 'mongoose';

export interface IAIData extends Document {
  dataName: string;
}

const aiDataSchema = new mongoose.Schema({
  dataName: {
    type: String,
    required: true,
  },
});

const AIData = mongoose.models.AIData
  ? mongoose.model<IAIData>('AIData')
  : mongoose.model<IAIData>('AIData', aiDataSchema);

export default AIData;
