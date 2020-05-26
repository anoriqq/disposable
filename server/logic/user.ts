import { User, UserDocument } from '../lib/db';

export const deleteUser: ({
  userId,
}: {
  userId: number;
}) => Promise<UserDocument | null> = async ({ userId }) => {
  return User.findByIdAndDelete(userId).exec();
};
