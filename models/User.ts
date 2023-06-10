import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  image: string;
  role: string;
}

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    role: {
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

const User = mongoose.models.User
  ? mongoose.model<IUser>('User')
  : mongoose.model<IUser>('User', UserSchema);

export default User;
