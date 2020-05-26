import type { GaxiosPromise } from 'gaxios';
import type {
  cloudresourcemanager_v1,
  serviceusage_v1beta1,
  cloudbilling_v1,
} from 'googleapis';
import { createHash } from 'crypto';
import { google } from 'googleapis';

import type { UserDocument } from '../lib/db';
import { wait } from '../util';

const cloudresourcemanager = google.cloudresourcemanager('v1');
const serviceusage = google.serviceusage('v1beta1');
const cloudbilling = google.cloudbilling('v1');

/**
 * Get project name
 */
export const getProjectName = (): string => {
  const projectName = 'disposable-project';
  return projectName;
};

/**
 * Get project ID
 */
type GetProjectId = (params: { userId: UserDocument['_id'] }) => string;
export const getProjectId: GetProjectId = ({ userId }) => {
  const projectName = getProjectName();
  return `${projectName}-${createHash('sha256')
    .update(userId.toString())
    .digest('hex')
    .slice(0, 8)}`;
};

/**
 * List projects
 */
type ListProjects = (params: {
  accessToken: string;
}) => GaxiosPromise<cloudresourcemanager_v1.Schema$ListProjectsResponse>;
export const listProjects: ListProjects = ({ accessToken }) => {
  const request = {
    oauth_token: accessToken,
  };
  return cloudresourcemanager.projects.list(request);
};

/**
 * Has project
 */
type HasProject = (params: {
  projects?: cloudresourcemanager_v1.Schema$Project[];
  projectId: string;
}) => boolean;
export const hasProject: HasProject = ({ projects, projectId }) => {
  if (!projects) return false;
  return projects.some((p) => {
    return p.projectId === projectId;
  });
};

/**
 * Get project with retry
 */
type GetProjectWithRetry = (params: {
  projectId: string;
  accessToken: string;
  retry: number;
}) => GaxiosPromise<cloudresourcemanager_v1.Schema$Project>;
export const getProjectWithRetry: GetProjectWithRetry = async ({
  projectId,
  accessToken,
  retry = 1,
}) => {
  if (retry < 0) throw new Error('not found project');

  try {
    const request = {
      projectId,
      access_token: accessToken,
    };
    return cloudresourcemanager.projects.get(request);
  } catch (err) {
    await wait(3000);
    return getProjectWithRetry({
      projectId,
      accessToken,
      retry: retry - 1,
    });
  }
};

/**
 * Create project
 */
type CreateProject = (params: {
  projectId: string;
  projectName: string;
  accessToken: string;
}) => GaxiosPromise<cloudresourcemanager_v1.Schema$Operation>;
export const createProject: CreateProject = ({
  projectId,
  projectName,
  accessToken,
}) => {
  const request = {
    requestBody: {
      projectId,
      name: projectName,
    },
    access_token: accessToken,
  };
  return cloudresourcemanager.projects.create(request);
};

interface ProjectInfo {
  createTime?: string;
  labels?: { [key: string]: string };
  lifecycleState?: string;
  name?: string;
  projectId?: string;
  projectNumber?: string;
}

/**
 * Format project info
 */
export const formatProjectInfo = ({
  project,
}: {
  project: cloudresourcemanager_v1.Schema$Project;
}): { projectInfo: ProjectInfo } => {
  const projectInfo: ProjectInfo = {
    ...(project.createTime && { createTime: project.createTime }),
    ...(project.labels && { labels: project.labels }),
    ...(project.lifecycleState && { lifecycleState: project.lifecycleState }),
    ...(project.name && { name: project.name }),
    ...(project.projectId && { projectId: project.projectId }),
    ...(project.projectNumber && { projectNumber: project.projectNumber }),
  };
  return { projectInfo };
};

/**
 * Get project services with retry
 */
type GetProjectServicesWithRetry = (params: {
  projectNumber: string;
  services: string;
  accessToken: string;
  retry: number;
}) => Promise<serviceusage_v1beta1.Schema$Service>;
export const getProjectServicesWithRetry: GetProjectServicesWithRetry = async ({
  projectNumber,
  services,
  accessToken,
  retry = 1,
}) => {
  if (retry < 0) throw new Error('not found project');

  try {
    const request = {
      name: `projects/${projectNumber}/services/${services}`,
      access_token: accessToken,
    };
    const { data: serviceStatus } = await serviceusage.services.get(request);
    if (serviceStatus.state !== 'ENABLED')
      throw new Error(JSON.stringify(serviceStatus, null, 2));
    return serviceStatus;
  } catch (err) {
    console.log(err);
    await wait(3000);
    return getProjectServicesWithRetry({
      projectNumber,
      services,
      accessToken,
      retry: retry - 1,
    });
  }
};

/**
 * Enable project billing API
 */
type EnableProjectBillingAPI = (params: {
  projectNumber: string;
  accessToken: string;
}) => Promise<serviceusage_v1beta1.Schema$Service>;
export const enableProjectBillingAPI: EnableProjectBillingAPI = async ({
  projectNumber,
  accessToken,
}) => {
  const services = 'cloudbilling.googleapis.com';
  const request = {
    name: `projects/${projectNumber}/services/${services}`,
    access_token: accessToken,
  };
  await serviceusage.services.enable(request);
  return getProjectServicesWithRetry({
    projectNumber,
    services,
    accessToken,
    retry: 10,
  });
};

/**
 * Get billing info
 */
type GetBillingInfo = (params: {
  projectId: string;
  accessToken: string;
}) => GaxiosPromise<cloudbilling_v1.Schema$ProjectBillingInfo>;
export const getBillingInfo: GetBillingInfo = ({ projectId, accessToken }) => {
  const request = {
    name: `projects/${projectId}`,
    access_token: accessToken,
  };
  return cloudbilling.projects.getBillingInfo(request);
};

/**
 * Enable project billing info
 */
type EnableProjectBilling = (params: {
  projectId: string;
  accessToken: string;
}) => GaxiosPromise<cloudbilling_v1.Schema$ProjectBillingInfo>;
export const enableProjectBilling: EnableProjectBilling = async ({
  projectId,
  accessToken,
}) => {
  const {
    data: { billingAccounts },
  } = await cloudbilling.billingAccounts.list({
    access_token: accessToken,
  });
  const billingAccountName = billingAccounts && billingAccounts[0].name;
  if (!billingAccountName) throw new Error('need billing account');
  const request = {
    name: `projects/${projectId}`,
    requestBody: {
      billingEnabled: true,
      billingAccountName,
      name: `projects/${projectId}/billingInfo`,
      projectId,
    },
    access_token: accessToken,
  };
  return cloudbilling.projects.updateBillingInfo(request);
};

/**
 * Enable project compute API
 */
type EnableProjectComputeAPI = (params: {
  projectNumber: string;
  accessToken: string;
}) => Promise<serviceusage_v1beta1.Schema$Service>;
export const enableProjectComputeAPI: EnableProjectComputeAPI = async ({
  projectNumber,
  accessToken,
}) => {
  const services = 'compute.googleapis.com';
  const request = {
    name: `projects/${projectNumber}/services/${services}`,
    oauth_token: accessToken,
    access_token: accessToken,
  };
  await serviceusage.services.enable(request);
  return getProjectServicesWithRetry({
    projectNumber,
    services,
    accessToken,
    retry: 10,
  });
};

/**
 * Delete project
 */
type DeleteProject = (params: {
  projectId: string;
  accessToken: string;
}) => Promise<void>;
export const deleteProject: DeleteProject = async ({
  projectId,
  accessToken,
}) => {
  await cloudresourcemanager.projects.delete({
    projectId,
    access_token: accessToken,
  });
};

/**
 * Undelete project
 */
type UndeleteProject = (params: {
  projectId: string;
  accessToken: string;
}) => Promise<void>;
export const undeleteProject: UndeleteProject = async ({
  projectId,
  accessToken,
}) => {
  await cloudresourcemanager.projects.undelete({
    projectId,
    access_token: accessToken,
  });
};
