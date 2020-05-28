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
 * Get User Info
 */
userRouter.get('/user', (req, res, next) => {
  (async (): Promise<void> => {
    const userId = req.user?._id;
    const accessToken = req.user?.accessToken;
    const displayName = req.user?.displayName;
    if (!userId || !accessToken || !displayName) {
      res.json({});
      return;
    }
    const projectId = getProjectId({ userId });
    const { data: project } = await getProjectWithRetry({
      projectId,
      accessToken,
      retry: 1,
    });
    if (!project) {
      res.json({
        displayName,
        projectLifecycleState: undefined,
        instanceId: undefined,
      });
      return;
    }
    if (project.lifecycleState === 'DELETE_REQUESTED') {
      res.json({
        displayName,
        projectLifecycleState: project.lifecycleState || undefined,
        instanceId: undefined,
      });
      return;
    }
    const { instances } = await listInstances({ projectId, accessToken });
    if (Object.keys(instances).length) {
      const instanceName = getInstanceName({ projectId });
      const { instance } = findInstance({ instances, instanceName });
      if (!instance?.id) throw new Error('not found instance');
      res.json({
        displayName,
        projectLifecycleState: project.lifecycleState || undefined,
        instanceId: instance?.id,
      });
      return;
    }
    res.json({
      displayName,
      projectLifecycleState: project.lifecycleState || undefined,
      instanceId: undefined,
    });
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
      'https://www.googleapis.com/auth/cloudplatformprojects',
      'https://www.googleapis.com/auth/cloud-billing',
      'https://www.googleapis.com/auth/cloud-platform.read-only',
      'https://www.googleapis.com/auth/service.management',
      'https://www.googleapis.com/auth/compute',
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
