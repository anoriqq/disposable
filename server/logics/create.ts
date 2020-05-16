/* eslint-disable @typescript-eslint/camelcase */
import { google, cloudresourcemanager_v1 } from 'googleapis';
import { createHash } from 'crypto';
// eslint-disable-next-line import/no-extraneous-dependencies
import { GaxiosResponse, GaxiosPromise } from 'gaxios';

import { UserDocument } from '../lib/db';

const cloudresourcemanager = google.cloudresourcemanager('v1');

type GetProjectId = (args: { userId: UserDocument['_id'] }) => string;
const getProjectId: GetProjectId = ({ userId }) => {
  return `disposable-project-${createHash('sha256')
    .update(userId.toString())
    .digest('hex')
    .slice(0, 8)}`;
};

type GetProjects = (args: {
  accessToken: string;
}) => GaxiosPromise<cloudresourcemanager_v1.Schema$ListProjectsResponse>;
const getProjects: GetProjects = ({ accessToken }) => {
  return cloudresourcemanager.projects.list({
    oauth_token: accessToken,
  });
};

type IsExistsProject = (args: {
  projects?: cloudresourcemanager_v1.Schema$Project[];
  projectId: string;
}) => boolean;
const isExistsProject: IsExistsProject = ({ projects, projectId }) => {
  return (
    !projects ||
    (projects &&
      !projects.some((p) => {
        return p.projectId === projectId;
      }))
  );
};

type CreateProject = (args: {
  projectId: string;
  projectName: string;
  accessToken: string;
}) => GaxiosPromise<cloudresourcemanager_v1.Schema$Operation>;
const createProject: CreateProject = ({
  projectId,
  projectName,
  accessToken,
}) => {
  return cloudresourcemanager.projects.create({
    requestBody: {
      projectId,
      name: projectName,
    },
    access_token: accessToken,
  });
};

type GetProjectWithRetries = (args: {
  projectId: string;
  accessToken: string;
  retry: number;
}) => GaxiosPromise<cloudresourcemanager_v1.Schema$Project>;
const getProjectWithRetries: GetProjectWithRetries = async ({
  projectId,
  accessToken,
  retry,
}) => {
  if (retry < 0) throw new Error();

  const wait = (ms: number): Promise<void> => {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  };

  try {
    return cloudresourcemanager.projects.get({
      projectId,
      access_token: accessToken,
    });
  } catch (err) {
    await wait(3000);
    return getProjectWithRetries({
      projectId,
      accessToken,
      retry: retry - 1,
    });
  }
};

type Create = (args: {
  user: UserDocument;
}) => Promise<{
  project: GaxiosResponse<cloudresourcemanager_v1.Schema$Project>['data'];
}>;
export const create: Create = async ({ user }) => {
  const projectId = getProjectId({ userId: user._id });
  const projectName = 'disposable-project';

  // プロジェクトリストを取得
  const { projects } = (
    await getProjects({ accessToken: user.accessToken })
  ).data;

  // プロジェクトが無い場合は作成する
  if (isExistsProject({ projects, projectId })) {
    await createProject({
      projectId,
      projectName,
      accessToken: user.accessToken,
    });
  }

  // 作成したプロジェクトの情報を取得する
  const project = await getProjectWithRetries({
    projectId,
    accessToken: user.accessToken,
    retry: 10,
  });

  return { project: project.data };
};
