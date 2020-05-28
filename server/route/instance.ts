import { Router } from 'express';

import { getProjectId } from '../logic/project';
import {
  listInstances,
  getInstanceName,
  findInstance,
  createInstance,
  getInstanceWithRetry,
  formatInstanceInfo,
  deleteInstance,
} from '../logic/instance';
import { listZones } from '../logic/zones';
import { listMachineTypes } from '../logic/machineTypes';
import { listImages } from '../logic/images';

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
    if (!instance) {
      res.json({});
      return;
    }
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
    if (!instance) {
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
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
        throw err;
      });
      const mewInstance = await getInstanceWithRetry({
        projectId,
        zone,
        instanceName,
        accessToken,
        retry: 10,
      });
      const { instanceInfo } = formatInstanceInfo({ instance: mewInstance });
      res.json(instanceInfo);
      return;
    }
    const { instanceInfo } = formatInstanceInfo({ instance });
    res.json(instanceInfo);
  })().catch(next);
});

/**
 * Delete instance
 */
instanceRouter.delete('/instance', (req, res, next) => {
  (async (): Promise<void> => {
    const userId = req.user?._id;
    const accessToken = req.user?.accessToken;
    if (!userId || !accessToken) throw new Error('no user');
    const projectId = getProjectId({ userId });
    const { instances } = await listInstances({ projectId, accessToken });
    const instanceName = getInstanceName({ projectId });
    const { instance } = findInstance({ instances, instanceName });
    const zone = /(?<=\/)(?<zone>[\w-]+$)/.exec(instance?.zone || '')?.groups
      ?.zone;
    if (!zone) throw new Error('not found instance');
    await deleteInstance({
      projectId,
      zone,
      instanceName,
      accessToken,
    });
    res.json({});
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

/**
 * Get Machine Types by Zone
 */
instanceRouter.get('/instance/machineTypes', (req, res, next) => {
  (async (): Promise<void> => {
    const userId = req.user?._id;
    const accessToken = req.user?.accessToken;
    if (!userId || !accessToken) throw new Error('no user');
    const { zone } = req.query;
    const projectId = getProjectId({ userId });
    const machineTypes = await listMachineTypes({
      projectId,
      zone,
      accessToken,
    });

    if (!machineTypes) res.status(204).end();
    else res.json(machineTypes);
  })().catch(next);
});

/**
 * Get Images
 */
instanceRouter.get('/instance/images', (req, res, next) => {
  (async (): Promise<void> => {
    if (!req.user) throw new Error('no user');
    const images = await listImages();
    res.json(images);
  })().catch(next);
});

export { instanceRouter };
