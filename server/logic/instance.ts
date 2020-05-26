import type { compute_v1 } from 'googleapis';
import { google } from 'googleapis';

import { wait } from '../util';

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
  const disks = instance.disks?.map((disk) => {
    return {
      autoDelete: disk.autoDelete || undefined,
      boot: disk.boot || undefined,
      deviceName: disk.deviceName || undefined,
      diskSizeGb: disk.diskSizeGb || undefined,
      interface: disk.interface || undefined,
      kind: disk.kind || undefined,
      mode: disk.mode || undefined,
      source: disk.source || undefined,
      type: disk.type || undefined,
    };
  });
  const metadataItems = instance.metadata?.items?.map((item) => {
    return {
      key: item.key || undefined,
      value: item.value || undefined,
    };
  });
  const networkInterfaces = instance.networkInterfaces?.map(
    (networkInterface) => {
      const networkAccessConfigs = networkInterface.accessConfigs?.map(
        (accessConfig) => {
          return {
            name: accessConfig.name || undefined,
            natIP: accessConfig.natIP || undefined,
            publicPtrDomainName: accessConfig.publicPtrDomainName || undefined,
          };
        },
      );
      return {
        name: networkInterface.name || undefined,
        network: networkInterface.network || undefined,
        networkIP: networkInterface.networkIP || undefined,
        subnetwork: networkInterface.subnetwork || undefined,
        accessConfigs: networkAccessConfigs,
      };
    },
  );
  const instanceInfo: InstanceInfo = {
    cpuPlatform: instance.cpuPlatform || undefined,
    creationTimestamp: instance.creationTimestamp || undefined,
    description: instance.description || undefined,
    disks,
    hostname: instance.hostname || undefined,
    id: instance.id || undefined,
    kind: instance.kind || undefined,
    labels: instance.labels || undefined,
    machineType: instance.machineType || undefined,
    metadata: { items: metadataItems },
    name: instance.name || undefined,
    networkInterfaces,
    status: instance.status || undefined,
    statusMessage: instance.statusMessage || undefined,
    zone: instance.zone || undefined,
  };
  return { instanceInfo };
};

/**
 * Get address with retry
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

  try {
    const { data: addressInfo } = await compute.addresses.get({
      project: projectId,
      region,
      address,
      oauth_token: accessToken,
    });
    if (addressInfo.status !== 'RESERVED') {
      throw new Error(JSON.stringify(addressInfo, null, 2));
    }
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
}) => { instance: compute_v1.Schema$Instance | undefined };
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
 * List instances
 */
type ListInstances = (params: {
  projectId: string;
  accessToken: string;
}) => Promise<{
  instances:
    | {
        [k: string]: compute_v1.Schema$InstancesScopedList;
      }
    | {};
}>;
export const listInstances: ListInstances = async ({
  projectId,
  accessToken,
}) => {
  const {
    data: { items },
  } = await compute.instances.aggregatedList({
    project: projectId,
    oauth_token: accessToken,
  });
  if (!items) return { instances: {} };
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
 * Create instance
 */
type CreateInstance = (params: {
  projectId: string;
  region: string;
  zone: string;
  machineType: string;
  imageProject: string;
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
  const sshPublicKeyName =
    sshPublicKey?.match(/\s(?<key>\S+)(?=@)/)?.groups?.key ??
    `${projectId}-ssh-public-key`;

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

  try {
    const { data: instance } = await compute.instances.get({
      project: projectId,
      zone,
      instance: instanceName,
      oauth_token: accessToken,
    });
    if (instance.status !== 'RUNNING') {
      throw new Error(JSON.stringify(instance, null, 2));
    }
    return instance;
  } catch (err) {
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

/**
 * Delete instance
 */
type DeleteInstance = (params: {
  projectId: string;
  zone: string;
  instanceName: string;
  accessToken: string;
}) => Promise<void>;
export const deleteInstance: DeleteInstance = async ({
  projectId,
  zone,
  instanceName,
  accessToken,
}) => {
  await compute.instances.delete({
    project: projectId,
    zone,
    instance: instanceName,
    oauth_token: accessToken,
  });
};
