import type { GaxiosPromise } from 'gaxios';
import type {
  serviceusage_v1beta1,
  cloudbilling_v1,
  compute_v1,
} from 'googleapis';

import { google } from 'googleapis';

import { UserDocument } from '../lib/db';
import {
  getProjectName,
  getProjectId,
  listProjects,
  hasProject,
  getProjectWithRetry,
  createProject,
  getProjectServicesWithRetry,
} from './project';

const cloudbilling = google.cloudbilling('v1');
const serviceusage = google.serviceusage('v1beta1');
const compute = google.compute('v1');

interface InstanceInfo {
  cpuPlatform?: string;
  creationTimestamp?: string;
  description?: string;
  disks?: {
    autoDelete?: boolean;
    boot?: boolean;
    deviceName?: string;
    diskSizeGb?: string;
    interface?: string;
    kind?: string;
    mode?: string;
    source?: string;
    type?: string;
  }[];
  hostname?: string;
  id?: string;
  kind?: string;
  labels?: {
    [key: string]: string;
  };
  machineType?: string;
  metadata?: {
    items?: {
      key?: string;
      value?: string;
    }[];
  };
  name?: string;
  networkInterfaces?: {
    name?: string;
    network?: string;
    networkIP?: string;
    subnetwork?: string;
  }[];
  status?: string;
  statusMessage?: string;
  zone?: string;
}

/**
 * Format instance info
 */
export const formatInstanceInfo = ({
  instance,
}: {
  instance: compute_v1.Schema$Instance;
}): { instanceInfo: InstanceInfo } => {
  const instanceInfo: InstanceInfo = {
    ...(instance.cpuPlatform && { cpuPlatform: instance.cpuPlatform }),
    ...(instance.creationTimestamp && {
      creationTimestamp: instance.creationTimestamp,
    }),
    ...(instance.description && { description: instance.description }),
    ...(instance.disks && { disks: instance.disks }),
    ...(instance.hostname && { hostname: instance.hostname }),
    ...(instance.id && { id: instance.id }),
    ...(instance.kind && { kind: instance.kind }),
    ...(instance.labels && { labels: instance.labels }),
    ...(instance.machineType && { machineType: instance.machineType }),
    ...(instance.metadata && { metadata: instance.metadata }),
    ...(instance.name && { name: instance.name }),
    ...(instance.networkInterfaces && {
      networkInterfaces: instance.networkInterfaces,
    }),
    ...(instance.status && { status: instance.status }),
    ...(instance.statusMessage && { statusMessage: instance.statusMessage }),
    ...(instance.zone && { zone: instance.zone }),
  };
  return { instanceInfo };
};

/**
 * Get instance name
 */
export const getInstanceName = ({
  projectId,
}: {
  projectId: string;
}): string => {
  return `${projectId}-instance`;
};

/**
 * Find instance
 */
type FindInstance = (params: {
  instances: {
    [k: string]: compute_v1.Schema$InstancesScopedList;
  };
  instanceName: string;
}) => { instance: compute_v1.Schema$Instance };
export const findInstance: FindInstance = ({ instances, instanceName }) => {
  const instance = Object.keys(instances)
    .map((zone) => {
      return instances[zone].instances;
    })
    .flat()
    .filter((x): x is compute_v1.Schema$Instance => {
      return x?.name === instanceName;
    })[0];
  return { instance };
};

/**
 * Enable project compute API
 */
type EnableProjectComputeAPI = (params: {
  projectNumber: string;
  accessToken: string;
}) => Promise<serviceusage_v1beta1.Schema$Service>;
const enableProjectComputeAPI: EnableProjectComputeAPI = async ({
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
 * List instances
 */
type ListInstances = (params: {
  projectId: string;
  accessToken: string;
}) => Promise<{
  instances: {
    [k: string]: compute_v1.Schema$InstancesScopedList;
  };
}>;
export const listInstances: ListInstances = async ({
  projectId,
  accessToken,
}) => {
  const request = {
    project: projectId,
    oauth_token: accessToken,
  };
  const {
    data: { items },
  } = await compute.instances.aggregatedList(request);
  if (!items) throw new Error();
  const instances = Object.fromEntries<compute_v1.Schema$InstancesScopedList>(
    Object.entries(items)
      .map((z) => {
        if (!z[1].instances) return [];
        return z;
      })
      .filter((v): v is [string, compute_v1.Schema$InstancesScopedList] =>
        Boolean(v.length),
      ),
  );
  return { instances };
};

/**
 * Get address whth retry
 */
type GetAddressWithRetry = (params: {
  projectId: string;
  region: string;
  address: string;
  accessToken: string;
  retry: number;
}) => Promise<compute_v1.Schema$Address>;
const getAddressWithRetry: GetAddressWithRetry = async ({
  projectId,
  region,
  address,
  accessToken,
  retry = 1,
}) => {
  if (retry < 0) throw new Error('not found address');

  const wait = (ms: number): Promise<void> => {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  };

  try {
    const { data: addressInfo } = await compute.addresses.get({
      project: projectId,
      region,
      address,
      oauth_token: accessToken,
    });
    if (addressInfo.status !== 'RESERVED') throw new Error();
    return addressInfo;
  } catch (err) {
    console.log(err);
    await wait(3000);
    return getAddressWithRetry({
      projectId,
      region,
      address,
      accessToken,
      retry: retry - 1,
    });
  }
};

/**
 * Get or create address
 */
type GetOrCreateAddress = (params: {
  projectId: string;
  region: string;
  addressName: string;
  accessToken: string;
}) => Promise<compute_v1.Schema$Address> | compute_v1.Schema$Address;
const getOrCreateAddress: GetOrCreateAddress = async ({
  projectId,
  region,
  addressName,
  accessToken,
}) => {
  const addressInfo = await getAddressWithRetry({
    projectId,
    region,
    address: addressName,
    accessToken,
    retry: 10,
  });
  if (addressInfo.address) return addressInfo;
  await compute.addresses.insert({
    project: projectId,
    region,
    requestBody: {
      name: addressName,
      description: 'created via Disposable app',
      networkTier: 'PREMIUM',
      addressType: 'EXTERNAL',
    },
    oauth_token: accessToken,
  });
  return getAddressWithRetry({
    projectId,
    region,
    address: addressName,
    accessToken,
    retry: 10,
  });
};

/**
 * Create instance
 */
type CreateInstance = (params: {
  projectId: string;
  region: string;
  zone: string; // @see https://cloud.google.com/compute/docs/regions-zones
  machineType: string; // @see https://cloud.google.com/compute/docs/machine-types#predefined_machine_types
  imageProject: string; // @see https://cloud.google.com/compute/docs/images
  imageFamily: string;
  diskSizeGb: string;
  sshPublicKey?: string;
  accessToken: string;
}) => Promise<{ computeOperation: compute_v1.Schema$Operation }>;
export const createInstance: CreateInstance = async ({
  projectId,
  region,
  zone,
  machineType,
  imageProject,
  imageFamily,
  diskSizeGb,
  sshPublicKey,
  accessToken,
}) => {
  const addressName = `${projectId}-external`;

  const addressInfo = await getOrCreateAddress({
    projectId,
    region,
    addressName,
    accessToken,
  });
  console.log({ addressInfo });

  const sshPublicKeyName =
    sshPublicKey?.match(/\s(?<key>\S+)(?=@)/)?.groups?.key ??
    `${projectId}-ssh-public-key`;

  /* @see https://cloud.google.com/compute/docs/reference/rest/v1/instances/insert */
  const { data: computeOperation } = await compute.instances.insert({
    project: projectId,
    zone,
    requestBody: {
      name: `${projectId}-instance`,
      description: 'Created via Disposable app',
      machineType: `zones/${zone}/machineTypes/${machineType}`,
      networkInterfaces: [
        {
          accessConfigs: [
            {
              natIP: addressInfo.address,
              networkTier: 'PREMIUM',
            },
          ],
        },
      ],
      disks: [
        {
          boot: true,
          initializeParams: {
            sourceImage: `projects/${imageProject}/global/images/family/${imageFamily}`,
            diskSizeGb,
          },
          autoDelete: true,
        },
      ],
      ...(sshPublicKey && {
        metadata: {
          items: [
            {
              key: 'ssh-keys',
              value: `${sshPublicKeyName}:${sshPublicKey}`,
            },
          ],
        },
      }),
      shieldedInstanceConfig: {
        enableSecureBoot: true,
        enableVtpm: true,
        enableIntegrityMonitoring: true,
      },
    },
    oauth_token: accessToken,
  });
  return { computeOperation };
};

/**
 * Get instance with retry
 */
type GetInstanceWithRetry = (params: {
  projectId: string;
  zone: string;
  instanceName: string;
  accessToken: string;
  retry: number;
}) => Promise<compute_v1.Schema$Instance>;
export const getInstanceWithRetry: GetInstanceWithRetry = async ({
  projectId,
  zone,
  instanceName,
  accessToken,
  retry = 1,
}) => {
  if (retry < 0) throw new Error('not found address');

  const wait = (ms: number): Promise<void> => {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  };

  try {
    const { data: instance } = await compute.instances.get({
      project: projectId,
      zone,
      instance: instanceName,
      oauth_token: accessToken,
    });
    console.log({ instance });
    if (instance.status !== 'RUNNING') {
      throw new Error(instance.statusMessage || '');
    }
    return instance;
  } catch (err) {
    console.log('retrying');
    await wait(3000);
    return getInstanceWithRetry({
      projectId,
      zone,
      instanceName,
      accessToken,
      retry: retry - 1,
    });
  }
};
