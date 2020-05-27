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

export const setupMongoose = async (): Promise<void> => {
  if (!process.env.MONGODB_CONNECTION_STRING) {
    throw new Error('mongodb connection string is not specified');
  }
  await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  // eslint-disable-next-line no-console
  console.log(`> Successfully connected to Mongodb`);
};
