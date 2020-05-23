import { google } from 'googleapis';

import type { UserDocument } from '../lib/db';
import { getProjectId } from './project';

const compute = google.compute('v1');

export const listZones = async ({
  userId,
  accessToken,
}: {
  userId: UserDocument['_id'];
  accessToken: string;
}): Promise<{ name: string; region: string }[] | undefined> => {
  const projectId = getProjectId({ userId });
  const {
    data: { items: zones },
  } = await compute.zones.list({
    project: projectId,
    oauth_token: accessToken,
  });
  const simpleZones = zones
    ?.map(({ name, region: regionUrl }) => {
      if (!name || !regionUrl) return undefined;
      const region = /(?<=\/)(?<region>[\w-]+$)/.exec(regionUrl)?.groups
        ?.region;
      if (!region) return undefined;
      return { name, region };
    })
    .filter((x): x is { name: string; region: string } => Boolean(x));

  return simpleZones;
};
