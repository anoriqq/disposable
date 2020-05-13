import mongoose from 'mongoose';

export interface UserDocument extends mongoose.Document {
  _id: number;
  displayName: string;
  accessToken: string;
}
const userSchema = new mongoose.Schema<UserDocument>({
  _id: Number,
  displayName: String,
  accessToken: String,
});
export const User = mongoose.model<UserDocument>('User', userSchema);
