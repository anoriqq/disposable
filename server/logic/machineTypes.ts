import { google } from 'googleapis';

const compute = google.compute('v1');

/**
 * List Machine Types
 */
export const listMachineTypes = async ({
  projectId,
  zone,
  accessToken,
}: {
  projectId: string;
  zone: string;
  accessToken: string;
}): Promise<{ name: string }[] | undefined> => {
  const {
    data: { items: machineTypes },
  } = await compute.machineTypes.list({
    project: projectId,
    zone,
    oauth_token: accessToken,
  });

  const simpleMachineTypes = machineTypes
    ?.map(({ name }) => {
      if (!name) return undefined;
      return { name };
    })
    .filter((x): x is { name: string } => Boolean(x));

  return simpleMachineTypes;
};
