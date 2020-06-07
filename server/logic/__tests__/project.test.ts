import { getProjectName, getProjectId } from '../project';

describe('Get project name', () => {
  test('Return project name', () => {
    const projectName = getProjectName();

    expect(projectName).toEqual('disposable-project');
  });
});

describe('Get project ID', () => {
  test('Return project ID', () => {
    const projectId = getProjectId({ userId: 1234 });

    expect(projectId).toEqual('disposable-project-03ac6742');
  });
});
