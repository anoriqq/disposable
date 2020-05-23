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
    const { data: project } = await getProjectWithRetry({
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

    const projectId = getProjectId({ userId });
    const {
      data: { projects },
    } = await listProjects({ accessToken });
    if (hasProject({ projects, projectId })) {
      await createProject({
        projectId,
        projectName,
        accessToken,
      });
    }
    const { data: project } = await getProjectWithRetry({
      projectId,
      accessToken,
      retry: 10,
    });
    if (!project.projectNumber) throw new Error('failed to creat project');
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

    const projectName = getProjectName();
    const { data: project } = await createProject({
      projectId,
      projectName,
      accessToken,
    });
    const { projectInfo } = formatProjectInfo({ project });
    res.json(projectInfo);
  })().catch(next);
});

/**
 * [WIP] Delete Project
 */
projectRouter.delete('/project', (req, res, next) => {
  (async (): Promise<void> => {
    const userId = req.user?._id;
    const accessToken = req.user?.accessToken;
    if (!userId || !accessToken) throw new Error('no user');
    res.json();
  })().catch(next);
});

export { projectRouter };
