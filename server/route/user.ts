import { Router } from 'express';
import passport from 'passport';

import { deleteUser } from '../logic/user';
import { getProjectId, getProjectWithRetry } from '../logic/project';
import {
  listInstances,
  findInstance,
  getInstanceName,
} from '../logic/instance';

const userRouter = Router();

/**
 * [WIP] Get User Info
 * ここでProjectとInstanceの情報も返すようにする
 */
userRouter.get('/user', (req, res, next) => {
  (async (): Promise<void> => {
    const userId = req.user?._id;
    const accessToken = req.user?.accessToken;
    const displayName = req.user?.displayName;
    if (!userId || !accessToken || !displayName) {
      res.json();
      return;
    }
    const projectId = getProjectId({ userId });
    const hasProject = Boolean(
      (
        await getProjectWithRetry({
          projectId,
          accessToken,
          retry: 1,
        })
      ).data.projectId,
    );
    if (!hasProject) {
      res.json({ displayName, hasProject, hasInstance: false });
      return;
    }
    const { instances } = await listInstances({ projectId, accessToken });
    const instanceName = getInstanceName({ projectId });
    const { instance } = findInstance({ instances, instanceName });
    const hasInstance = Boolean(instance.id);
    res.json({ displayName, hasProject, hasInstance });
  })().catch(next);
});

/**
 * Delete User from Database
 */
userRouter.delete('/user', (req, res, next) => {
  (async (): Promise<void> => {
    if (!req.user) throw new Error('no user');
    const userId = req.user._id;
    if (!req.session) return res.end();
    return req.session.destroy((err) => {
      if (err) throw err;
      deleteUser({ userId });
      return res.end();
    });
  })().catch(next);
});

/**
 * Logout User
 */
userRouter.get('/user/logout', (req, res, next) => {
  (async (): Promise<void> => {
    if (!req.session) return res.end();
    return req.session.destroy((err) => {
      if (err) throw err;
      return res.end();
    });
  })().catch(next);
});

/**
 * Authenticate User with Google OAuth2.0
 */
userRouter.get(
  '/user/auth',
  (req, res, next) => {
    (async (): Promise<void> => {
      if (!req.session) return next();
      return req.session.regenerate((err) => {
        if (err) throw err;
        return next();
      });
    })().catch(next);
  },
  passport.authenticate('google', {
    scope: [
      'profile',
      'https://www.googleapis.com/auth/cloud-platform',
      // 'https://www.googleapis.com/auth/cloudplatformprojects',
      // 'https://www.googleapis.com/auth/cloud-billing',
      // 'https://www.googleapis.com/auth/cloud-platform.read-only',
      // 'https://www.googleapis.com/auth/service.management',
      // 'https://www.googleapis.com/auth/compute',
      // 'https://www.googleapis.com/auth/devstorage.full_control',
    ],
  }),
);

/**
 * Callback from Google OAuth2.0
 */
userRouter.get(
  '/user/auth/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/',
  }),
);

export { userRouter };
