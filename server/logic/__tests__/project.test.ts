import { getProjectName, getProjectId, listProjects } from '../project';

jest.mock('googleapis', () => {
  return {
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
        },
      }),
      serviceusage: jest.fn().mockReturnValue({}),
      cloudbilling: jest.fn().mockReturnValue({}),
    },
  };
});

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
      const projects = await listProjects({ accessToken: 'access_token' });

      expect(projects.data.projects.length).toEqual(1);
      expect(projects.data.projects[0].name).toEqual('project-name');
      expect(projects.data.projects[0].projectId).toEqual('project-id');
    });
  });

  describe('HasProject', () => {
    it.todo('Return true');
    it.todo('Return false');
  });

  describe('Get project with retry', () => {
    it.todo('Return project');
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
