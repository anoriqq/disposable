import { Router } from 'express';

import {
  getProjectName,
  getProjectId,
  getProjectWithRetry,
  createProject,
  formatProjectInfo,
  listProjects,
  getProjectServicesWithRetry,
  enableProjectBillingAPI,
  getBillingInfo,
  enableProjectBilling,
  hasProject,
  enableProjectComputeAPI,
  deleteProject,
  undeleteProject,
} from '../logic/project';

const projectRouter = Router();

/**
 * Get Project
 */
projectRouter.get('/project', (req, res, next) => {
  (async (): Promise<void> => {
    const userId = req.user?._id;
    const accessToken = req.user?.accessToken;
    if (!userId || !accessToken) throw new Error('no user');
    const projectId = getProjectId({ userId });
    const project = await getProjectWithRetry({
      projectId,
      accessToken,
      retry: 10,
    });
    const { projectInfo } = formatProjectInfo({ project });
    res.json(projectInfo);
  })().catch(next);
});

/**
 * Create Project
 */
projectRouter.post('/project', (req, res, next) => {
  (async (): Promise<void> => {
    const userId = req.user?._id;
    const accessToken = req.user?.accessToken;
    if (!userId || !accessToken) throw new Error('no user');

    const projectName = getProjectName();
    const projectId = getProjectId({ userId });
    const {
      data: { projects },
    } = await listProjects({ accessToken });
    /* Create project if not exists */
    if (!hasProject({ projects, projectId })) {
      await createProject({
        projectId,
        projectName,
        accessToken,
      });
    }
    const project = await getProjectWithRetry({
      projectId,
      accessToken,
      retry: 10,
    });
    if (!project.projectNumber) throw new Error('failed to creat project');
    /* Undelete project if pending deletion */
    if (project.lifecycleState === 'DELETE_REQUESTED') {
      await undeleteProject({
        projectId,
        accessToken,
      });
    }
    /* Enable to billing API if disable */
    const projectBillingAPIStatus = await getProjectServicesWithRetry({
      projectNumber: project.projectNumber,
      services: 'cloudbilling.googleapis.com',
      accessToken,
      retry: 10,
    });
    if (projectBillingAPIStatus.state !== 'ENABLED') {
      await enableProjectBillingAPI({
        projectNumber: project.projectNumber,
        accessToken,
      });
    }
    /* Enable to billing if disable */
    const { data: billingInfo } = await getBillingInfo({
      projectId,
      accessToken,
    });
    if (!billingInfo.billingEnabled) {
      await enableProjectBilling({
        projectId,
        accessToken,
      });
    }
    /* Enable to compute API if disable */
    const projectComputeAPIStatus = await getProjectServicesWithRetry({
      projectNumber: project.projectNumber,
      services: 'compute.googleapis.com',
      accessToken,
      retry: 10,
    });
    if (projectComputeAPIStatus.state !== 'ENABLED') {
      await enableProjectComputeAPI({
        projectNumber: project.projectNumber,
        accessToken,
      });
    }
    /* Reacquisition project */
    const setCompletedProject = await getProjectWithRetry({
      projectId,
      accessToken,
      retry: 10,
    });
    const { projectInfo } = formatProjectInfo({
      project: setCompletedProject,
    });
    res.json(projectInfo);
  })().catch(next);
});

/**
 * Delete Project
 */
projectRouter.delete('/project', (req, res, next) => {
  (async (): Promise<void> => {
    const userId = req.user?._id;
    const accessToken = req.user?.accessToken;
    if (!userId || !accessToken) throw new Error('no user');
    const projectId = getProjectId({ userId });
    await deleteProject({ projectId, accessToken });
    res.json({});
  })().catch(next);
});

export { projectRouter };
