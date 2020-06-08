import type { cloudresourcemanager_v1 } from 'googleapis';

import {
  getProjectName,
  getProjectId,
  listProjects,
  hasProject,
  getProjectWithRetry,
} from '../project';

jest.mock('googleapis', () => ({
  __esModule: true,
  google: {
    cloudresourcemanager: jest.fn().mockReturnValue({
      projects: {
        list: jest.fn().mockReturnValue(
          Promise.resolve({
            data: {
              projects: [{ name: 'project-name', projectId: 'project-id' }],
            },
          }),
        ),
        get: jest
          .fn()
          .mockReturnValueOnce(
            Promise.resolve({
              data: { name: 'project-name', projectId: 'project-id' },
            }),
          )
          .mockReturnValueOnce(
            Promise.resolve({
              data: {},
            }),
          )
          .mockReturnValueOnce(
            Promise.resolve({
              data: {},
            }),
          )
          .mockReturnValueOnce(
            Promise.resolve({
              data: {},
            }),
          )
          .mockReturnValue(
            Promise.resolve({
              data: { name: 'project-name', projectId: 'project-id' },
            }),
          ),
      },
    }),
    serviceusage: jest.fn().mockReturnValue({}),
    cloudbilling: jest.fn().mockReturnValue({}),
  },
}));

describe('Project logic', () => {
  describe('Get project name', () => {
    it('Return project name', () => {
      const projectName = getProjectName();

      expect(projectName).toEqual('disposable-project');
    });
  });

  describe('Get project ID', () => {
    it('Return project ID', () => {
      const projectId = getProjectId({ userId: 1234 });

      expect(projectId).toEqual('disposable-project-03ac6742');
    });
  });

  describe('List projects', () => {
    it('return projects', async () => {
      const projects = (await listProjects({ accessToken: 'access_token' }))
        ?.data?.projects;

      expect(projects?.length).toEqual(1);

      const project = projects?.length && projects[0];

      expect(project?.name).toEqual('project-name');
      expect(project?.projectId).toEqual('project-id');
    });
  });

  describe('HasProject', () => {
    const projectId = 'project-id';

    it('Return true if it contains a project', () => {
      const projects = [{ projectId: 'project-id' }];
      const result = hasProject({ projects, projectId });

      expect(result).toBe(true);
    });

    it('Return true if it does not include a project', () => {
      const projects = [{ projectId: 'other-project-id' }];
      const result = hasProject({ projects, projectId });

      expect(result).toBe(false);
    });

    it('Return false if empty projects', () => {
      const emptyProjects: cloudresourcemanager_v1.Schema$Project[] = [];
      const result = hasProject({ projects: emptyProjects, projectId });

      expect(result).toBe(false);
    });

    it('Return false if was not pass over projects', () => {
      const result = hasProject({ projectId });

      expect(result).toBe(false);
    });
  });

  describe('Get project with retry', () => {
    it('Return project', async () => {
      const project = await getProjectWithRetry({
        projectId: 'project-id',
        accessToken: 'access_token',
        retry: 0,
      });

      expect(project.projectId).toEqual('project-id');
    });

    it('Return empty project', async () => {
      const getProjectWithRetryPromise = getProjectWithRetry({
        projectId: 'project-id',
        accessToken: 'access_token',
        retry: 0,
      });

      await expect(getProjectWithRetryPromise).rejects.toThrow(
        'not found project',
      );
    });

    it(
      'Retry',
      async () => {
        const project = await getProjectWithRetry({
          projectId: 'project-id',
          accessToken: 'access_token',
          retry: 2,
        });

        expect(project.projectId).toEqual('project-id');
      },
      3000 * 2 + 1000,
    );
  });

  describe('Create project', () => {
    it.todo('Return operation');
  });

  describe('Format project info', () => {
    it.todo('Return formatted project info');
  });

  describe('Get project services with retry', () => {
    it.todo('Return service');
  });

  describe('Enable project billing API', () => {
    it.todo('Return service');
  });

  describe('Get billing info', () => {
    it.todo('Return billing info');
  });

  describe('Enable project billing info', () => {
    it.todo('Return billing info');
  });

  describe('Enable project compute API', () => {
    it.todo('Return service');
  });

  describe('Delete project', () => {
    it.todo('Not throw error');
  });

  describe('Undelete project', () => {
    it.todo('Not throw error');
  });
});
