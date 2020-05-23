import { Router } from 'express';

import { getProjectId } from '../logic/project';
import {
  listInstances,
  getInstanceName,
  findInstance,
  createInstance,
  getInstanceWithRetry,
  formatInstanceInfo,
} from '../logic/instance';
import { listZones } from '../logic/zones';

const instanceRouter = Router();

/**
 * Get Instance
 */
instanceRouter.get('/instance', (req, res, next) => {
  (async (): Promise<void> => {
    const userId = req.user?._id;
    const accessToken = req.user?.accessToken;
    if (!userId || !accessToken) throw new Error('no user');
    const projectId = getProjectId({ userId });
    const { instances } = await listInstances({ projectId, accessToken });
    const instanceName = getInstanceName({ projectId });
    const { instance } = findInstance({ instances, instanceName });
    const { instanceInfo } = formatInstanceInfo({ instance });
    res.json(instanceInfo);
  })().catch(next);
});

/**
 * Create Instance
 */
instanceRouter.post('/instance', (req, res, next) => {
  (async (): Promise<void> => {
    const userId = req.user?._id;
    const accessToken = req.user?.accessToken;
    if (!userId || !accessToken) throw new Error('no user');
    const projectId = getProjectId({ userId });
    const {
      body: {
        region,
        zone,
        machineType,
        imageProject,
        imageFamily,
        diskSizeGb,
        sshPublicKey,
      },
    } = req;
    const { instances } = await listInstances({ projectId, accessToken });
    const instanceName = getInstanceName({ projectId });
    const { instance } = findInstance({ instances, instanceName });
    if (instance) {
      await createInstance({
        projectId,
        region,
        zone,
        machineType,
        imageProject,
        imageFamily,
        diskSizeGb,
        sshPublicKey,
        accessToken,
      });
      const instance = await getInstanceWithRetry({
        projectId,
        zone,
        instanceName,
        accessToken,
        retry: 10,
      });
      const { instanceInfo } = formatInstanceInfo({ instance });
      res.json(instanceInfo);
      return;
    }
    const { instanceInfo } = formatInstanceInfo({ instance });
    res.json(instanceInfo);
  })().catch(next);
});

/**
 * Get Available Instance Zone
 */
instanceRouter.get('/instance/zones', (req, res, next) => {
  (async (): Promise<void> => {
    const { user } = req;
    if (!user) throw new Error('no user');

    const zones = await listZones({
      userId: user._id,
      accessToken: user.accessToken,
    });

    if (!zones) res.status(204).end();
    else res.json(zones);
  })().catch(next);
});

export { instanceRouter };
