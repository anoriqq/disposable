/* eslint-disable @typescript-eslint/camelcase */

import type { GaxiosPromise } from 'gaxios';
import type {
  cloudresourcemanager_v1,
  serviceusage_v1beta1,
  cloudbilling_v1,
  compute_v1,
} from 'googleapis';

import { google } from 'googleapis';
import { createHash } from 'crypto';

import { UserDocument } from '../lib/db';

const cloudresourcemanager = google.cloudresourcemanager('v1');
const cloudbilling = google.cloudbilling('v1');
const serviceusage = google.serviceusage('v1beta1');
const compute = google.compute('v1');

type GetProjectId = (params: { userId: UserDocument['_id'] }) => string;
const getProjectId: GetProjectId = ({ userId }) => {
  return `disposable-project-${createHash('sha256')
    .update(userId.toString())
    .digest('hex')
    .slice(0, 8)}`;
};

type GetProjects = (params: {
  accessToken: string;
}) => GaxiosPromise<cloudresourcemanager_v1.Schema$ListProjectsResponse>;
const getProjects: GetProjects = ({ accessToken }) => {
  const request = {
    oauth_token: accessToken,
  };
  return cloudresourcemanager.projects.list(request);
};

type IsExistsProject = (params: {
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

type CreateProject = (params: {
  projectId: string;
  projectName: string;
  accessToken: string;
}) => GaxiosPromise<cloudresourcemanager_v1.Schema$Operation>;
const createProject: CreateProject = ({
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

type GetProjectWithRetry = (params: {
  projectId: string;
  accessToken: string;
  retry: number;
}) => GaxiosPromise<cloudresourcemanager_v1.Schema$Project>;
const getProjectWithRetry: GetProjectWithRetry = async ({
  projectId,
  accessToken,
  retry = 1,
}) => {
  if (retry < 0) throw new Error('not found project');

  const wait = (ms: number): Promise<void> => {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  };

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

type GetProjectServicesWithRetry = (params: {
  projectNumber: string;
  services: string;
  accessToken: string;
  retry: number;
}) => Promise<serviceusage_v1beta1.Schema$Service>;
const getProjectServicesWithRetry: GetProjectServicesWithRetry = async ({
  projectNumber,
  services,
  accessToken,
  retry = 1,
}) => {
  if (retry < 0) throw new Error('not found project');

  const wait = (ms: number): Promise<void> => {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  };

  try {
    const request = {
      name: `projects/${projectNumber}/services/${services}`,
      access_token: accessToken,
    };
    const { data: serviceStatus } = await serviceusage.services.get(request);
    if (serviceStatus.state !== 'ENABLED') throw new Error();
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

type EnableProjectBillingAPI = (params: {
  projectNumber: string;
  accessToken: string;
}) => Promise<serviceusage_v1beta1.Schema$Service>;
const enableProjectBillingAPI: EnableProjectBillingAPI = async ({
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

type GetBillingInfo = (params: {
  projectId: string;
  accessToken: string;
}) => GaxiosPromise<cloudbilling_v1.Schema$ProjectBillingInfo>;
const getBillingInfo: GetBillingInfo = ({ projectId, accessToken }) => {
  const request = {
    name: `projects/${projectId}`,
    access_token: accessToken,
  };
  return cloudbilling.projects.getBillingInfo(request);
};

type EnableProjectBilling = (params: {
  projectId: string;
  accessToken: string;
}) => GaxiosPromise<cloudbilling_v1.Schema$ProjectBillingInfo>;
const enableProjectBilling: EnableProjectBilling = async ({
  projectId,
  accessToken,
}) => {
  const { billingAccounts } = (
    await cloudbilling.billingAccounts.list({
      access_token: accessToken,
    })
  ).data;
  console.log({ billingAccounts });
  const billingAccountName = billingAccounts && billingAccounts[0].name;
  if (!billingAccountName) throw new Error('請求アカウントを作成してください');
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

type ListInstances = (params: {
  projectId: string;
  accessToken: string;
}) => GaxiosPromise<compute_v1.Schema$InstanceAggregatedList>;
const listInstances: ListInstances = async ({ projectId, accessToken }) => {
  const request = {
    project: projectId,
    oauth_token: accessToken,
  };
  return compute.instances.aggregatedList(request);
};

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
    console.log({ addressInfo });
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

type CreateInstance = (params: {
  projectId: string;
  region: string;
  zone: string; // @see https://cloud.google.com/compute/docs/regions-zones
  machineType: string; // @see https://cloud.google.com/compute/docs/machine-types#predefined_machine_types
  imageProject: string; // @see https://cloud.google.com/compute/docs/images
  imageFamily: string;
  diskSizeGb: string;
  accessToken: string;
}) => GaxiosPromise<compute_v1.Schema$Operation>;
const createInstance: CreateInstance = async ({
  projectId,
  region,
  zone,
  machineType,
  imageProject,
  imageFamily,
  diskSizeGb,
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

  /* @see https://cloud.google.com/compute/docs/reference/rest/v1/instances/insert */
  return compute.instances.insert({
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
      shieldedInstanceConfig: {
        enableSecureBoot: true,
        enableVtpm: true,
        enableIntegrityMonitoring: true,
      },
    },
    oauth_token: accessToken,
  });
};

type GetInstanceWithRetry = (params: {
  projectId: string;
  zone: string;
  instanceName: string;
  accessToken: string;
  retry: number;
}) => Promise<compute_v1.Schema$Instance>;
const getInstanceWithRetry: GetInstanceWithRetry = async ({
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
    if (instance.status !== 'RUNNING') {
      throw new Error(instance.statusMessage || '');
    }
    return instance;
  } catch (err) {
    console.log(err);
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

type Create = (params: {
  user: UserDocument;
}) => Promise<{
  project: cloudresourcemanager_v1.Schema$Project;
  instance: compute_v1.Schema$Instance;
}>;
/**
 * プロジェクトの作成からインスタンスの作成まで行う
 */
export const create: Create = async ({ user }) => {
  console.log({ user });
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

  // 作成したプロジェクトの情報を取得する (作成が完了するまで待つ)
  const project = (
    await getProjectWithRetry({
      projectId,
      accessToken: user.accessToken,
      retry: 10,
    })
  ).data;
  console.log({ project });
  if (!project.projectNumber) throw new Error('not found project number');

  /* Billing APIの状態を取得する */
  const projectBillingAPIStatus = await getProjectServicesWithRetry({
    projectNumber: project.projectNumber,
    services: 'cloudbilling.googleapis.com',
    accessToken: user.accessToken,
    retry: 1,
  });
  console.log({ projectBillingAPIStatus });

  /* Billing APIが無効なら有効にする */
  if (projectBillingAPIStatus.state !== 'ENABLED') {
    await enableProjectBillingAPI({
      projectNumber: project.projectNumber,
      accessToken: user.accessToken,
    });
  }

  /* get billing info */
  const billingInfo = (
    await getBillingInfo({
      projectId,
      accessToken: user.accessToken,
    })
  ).data;
  console.log({ billingInfo });

  /* プロジェクトの課金が無効なら有効にする */
  if (!billingInfo.billingEnabled) {
    const { data: enabledBillingInfo } = await enableProjectBilling({
      projectId,
      accessToken: user.accessToken,
    });
    console.log({ enabledBillingInfo });
  }

  /* Billing APIの状態を取得する（有効になるまで待つ） */
  const projectComputeAPIStatus = await getProjectServicesWithRetry({
    projectNumber: project.projectNumber,
    services: 'compute.googleapis.com',
    accessToken: user.accessToken,
    retry: 10,
  });
  console.log({ projectComputeAPIStatus });

  // /* プロジェクトのCompute APIを有効にする */
  if (projectComputeAPIStatus.state !== 'ENABLED') {
    const computeService = await enableProjectComputeAPI({
      projectNumber: project.projectNumber,
      accessToken: user.accessToken,
    });
    console.log({ computeService });
  }

  // /* インスタンスを取得する */
  const { data } = await listInstances({
    projectId,
    accessToken: user.accessToken,
  });
  if (!data.items) throw new Error();
  // const instances = Object.keys(data.items)
  //   .map((zone) => {
  //     if (!data.items || !data.items[zone].instances) return;
  //     // eslint-disable-next-line consistent-return
  //     return { [zone]: data.items[zone] };
  //   })
  //   .filter((x): x is Required<{
  //     [x: string]: compute_v1.Schema$InstancesScopedList;
  //   }> => Boolean(x));
  const instances = Object.fromEntries<compute_v1.Schema$InstancesScopedList>(
    Object.entries(data.items)
      .map((zone) => {
        if (!zone[1].instances) return [];
        return zone;
      })
      .filter((v): v is [string, compute_v1.Schema$InstancesScopedList] =>
        Boolean(v.length),
      ),
  );
  console.log({ instances });

  /* インスタンスがなければ作成する */
  if (!Object.keys(instances).length) {
    createInstance({
      projectId,
      region: 'us-west1',
      zone: 'us-west1-b',
      machineType: 'f1-micro',
      imageProject: 'ubuntu-os-cloud',
      imageFamily: 'ubuntu-1804-lts',
      diskSizeGb: '10',
      accessToken: user.accessToken,
    });
  }

  /* インスタンスを取得する */
  const instance = await getInstanceWithRetry({
    projectId,
    zone: 'us-west1-b',
    instanceName: `${projectId}-instance`,
    accessToken: user.accessToken,
    retry: 10,
  });
  console.log({ instance });

  return { project, instance };
};
