import mongoUnit from 'mongo-unit';
import mongoose from 'mongoose';

import { setupMongoose, User } from '../../lib/db';
import { deleteUser } from '../user';

describe('User', () => {
  const UserData = {
    users: [
      {
        _id: 1234,
        displayName: 'Test User',
        accessToken: 'access_token',
      },
    ],
  };

  beforeAll(async () => {
    process.env.MONGODB_CONNECTION_STRING = await mongoUnit.start();
    setupMongoose();
    mongoUnit.load(UserData);
  });

  afterAll(async () => {
    mongoUnit.drop();
    mongoUnit.stop();
    mongoose.disconnect();
  });

  test('Delete user', async () => {
    deleteUser({ userId: 1234 });

    const user = await User.findById(1234).exec();

    expect(user).toBeNull();
  });
});
