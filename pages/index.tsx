import type { responseInterface } from 'swr';
import type {
  APIError,
  UserInfo,
  Zones,
  MachineProfile,
  MachineTypes,
  Images,
  Instance,
} from 'express-serve-static-core';
import React, { useState, useEffect, ChangeEvent } from 'react';
import useSWR from 'swr';
import fetch from 'isomorphic-unfetch';
import qs from 'qs';
import {
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Container,
  TextField,
  CircularProgress,
  Input,
  InputLabel,
  InputAdornment,
  Backdrop,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import Link from 'next/link';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import ReactMarkdown from 'react-markdown/with-html';
import matter from 'gray-matter';

import { fetcher } from '../lib/fetch';
import Layout from '../components/layout';

const useUser = (
  refreshInterval?: number,
): responseInterface<UserInfo, APIError> => {
  return useSWR<UserInfo, APIError>('/user', fetcher, { refreshInterval });
};

const useZones = ({
  projectLifecycleState,
}: {
  projectLifecycleState?: string;
}): { zones: Zones; loading: boolean } => {
  const [result, setResult] = useState<Zones>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchZones = async (): Promise<void> => {
      setLoading(true);
      const zones: Zones = await (await fetch('/instance/zones')).json();
      if (!zones.length) return;
      setResult(zones.sort((a, b) => -b.name.localeCompare(a.name)));
      setLoading(false);
    };
    if (!result.length && projectLifecycleState === 'ACTIVE') {
      fetchZones();
    }
  }, [projectLifecycleState]);

  return { zones: result, loading };
};

const useMachineTypes = ({
  projectLifecycleState,
  zone,
}: {
  projectLifecycleState?: string;
  zone?: string;
}): { machineTypes: MachineTypes; loading: boolean } => {
  const [result, setResult] = useState<MachineTypes>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchZones = async (): Promise<void> => {
      setLoading(true);
      setResult([]);
      const machineTypes: MachineTypes = await (
        await fetch(`/instance/machineTypes?${qs.stringify({ zone })}`)
      ).json();
      if (!machineTypes.length) return;
      setResult(machineTypes.sort((a, b) => -b.name.localeCompare(a.name)));
      setLoading(false);
    };
    if (zone && projectLifecycleState === 'ACTIVE') {
      fetchZones();
    }
  }, [projectLifecycleState, zone]);

  return { machineTypes: result, loading };
};

const useImages = ({
  projectLifecycleState,
}: {
  projectLifecycleState?: string;
}): { images: Images; loading: boolean } => {
  const [result, setResult] = useState<Images>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchZones = async (): Promise<void> => {
      setLoading(true);
      const images: Images = await (await fetch('/instance/images')).json();
      if (!images.length) return;
      setResult(images.sort((a, b) => -b.family.localeCompare(a.family)));
      setLoading(false);
    };
    if (!result.length && projectLifecycleState === 'ACTIVE') {
      fetchZones();
    }
  }, [projectLifecycleState]);

  return { images: result, loading };
};

const useInstanceInfo = ({
  instanceId,
}: {
  instanceId?: string;
}): {
  instanceInfo?: Instance;
  loading: boolean;
  setInstanceInfo: (i: Instance) => void;
} => {
  const [result, setResult] = useState<Instance>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchZones = async (): Promise<void> => {
      setLoading(true);
      const instance: Instance = await (await fetch('/instance')).json();
      setResult(instance);
      setLoading(false);
    };
    if (instanceId && !result) {
      fetchZones();
    }
  }, [instanceId]);

  const setInstanceInfo = (instanceInfo: Instance): void => {
    setResult(instanceInfo);
  };

  return { instanceInfo: result, loading, setInstanceInfo };
};

const sshPublicKeyValidator = (key?: string): boolean => {
  if (key === undefined || key === '') return true;
  return key.split(/\s/).every((v, index, array) => {
    if (array.length !== 3 || index > 2) return false;
    if (index === 0) return /ssh-rsa/.test(v);
    if (index === 1) return /\w+/.test(v);
    if (index === 2) return /\w+@\w+/.test(v);
    return true;
  });
};

const defaultAutoCompleteProps = {
  autoComplete: true,
  autoHighlight: true,
  blurOnSelect: true,
  fullWidth: true,
  includeInputInList: true,
};

const defaultMachineProfile: MachineProfile = {
  region: 'us-west1',
  zone: 'us-west1-b',
  machineType: 'f1-micro',
  imageProject: 'ubuntu-os-cloud',
  imageFamily: 'ubuntu-1804-lts',
  diskSizeGb: '10',
};

const InstanceStepper: React.FC<{ userInfo: UserInfo }> = ({ userInfo }) => {
  const getStep = ({ projectLifecycleState, instanceId }: UserInfo): number => {
    if (instanceId) return 2;
    if (projectLifecycleState === 'ACTIVE') return 1;
    return 0;
  };
  const [activeStep, setActiveStep] = React.useState(getStep(userInfo));
  const { zones, loading: loadingZones } = useZones({
    projectLifecycleState: userInfo.projectLifecycleState,
  });
  const [machineProfile, setMachineProfile] = useState<MachineProfile>(
    defaultMachineProfile,
  );
  const { machineTypes, loading: loadingMachineTypes } = useMachineTypes({
    projectLifecycleState: userInfo.projectLifecycleState,
    zone: machineProfile.zone,
  });
  const { images, loading: loadingImages } = useImages({
    projectLifecycleState: userInfo.projectLifecycleState,
  });
  const {
    instanceInfo,
    loading: loadingInstanceInfo,
    setInstanceInfo,
  } = useInstanceInfo({
    instanceId: userInfo.instanceId,
  });
  const [isPolling, setPolling] = useState(false);
  useSWR<UserInfo, APIError>(isPolling ? '/user' : null, fetcher, {
    refreshInterval: 1000,
  });
  const [openBackdrop, setOpenBackdrop] = React.useState(false);

  const handleStep = (): void => {
    setActiveStep(getStep(userInfo));
  };

  const validateInstanceInfo = (
    dangerMachineProfile: MachineProfile,
  ): boolean => {
    return !(
      zones.some(({ name, region }) => {
        return (
          name === dangerMachineProfile.zone &&
          region === dangerMachineProfile.region
        );
      }) &&
      machineTypes.some(({ name }) => {
        return name === dangerMachineProfile.machineType;
      }) &&
      images.some(({ project, family }) => {
        return (
          project === dangerMachineProfile.imageProject &&
          family === dangerMachineProfile.imageFamily
        );
      }) &&
      Number(dangerMachineProfile.diskSizeGb) >= 10 &&
      Number(dangerMachineProfile.diskSizeGb) <= 6400 &&
      sshPublicKeyValidator(dangerMachineProfile.sshPublicKey)
    );
  };

  useEffect(() => {
    handleStep();
    setPolling(false);
    setOpenBackdrop(false);
  }, [userInfo]);

  const steps = [
    <Step key="Create project">
      <StepLabel>Create project</StepLabel>
      <StepContent>
        <Container>
          <Button
            type="button"
            onClick={(e): void => {
              e.preventDefault();
              setOpenBackdrop(true);
              fetch('/project', {
                credentials: 'include',
                method: 'POST',
              })
                .then((r) => r.json())
                .then(() => {
                  // TODO: userInfoのポーリング
                  setPolling(true);
                })
                .catch(() => setOpenBackdrop(false));
            }}
            color="primary"
          >
            {userInfo.projectLifecycleState === 'DELETE_REQUESTED'
              ? 'Undelete project'
              : 'Create Project'}
          </Button>
        </Container>
      </StepContent>
    </Step>,
    <Step key="Create instance">
      <StepLabel>Create instance or delete project</StepLabel>
      <StepContent>
        <Container>
          <Autocomplete
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...defaultAutoCompleteProps}
            id="zone"
            value={
              {
                region: machineProfile.region,
                name: machineProfile.zone,
              } as Zones[0]
            }
            options={zones}
            groupBy={(option: Zones[0]): string => option.region}
            getOptionLabel={(option: Zones[0]): string => option.name}
            getOptionSelected={(option, value): boolean => {
              return (
                option.name === value.name && option.region === value.region
              );
            }}
            renderInput={(params): JSX.Element => (
              <TextField
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...params}
                label="Zone"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingZones ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            loading={loadingZones}
            onChange={(
              e: ChangeEvent<Record<string, unknown>>,
              zone: Zones[0] | null,
            ): void => {
              e.preventDefault();
              if (!zone) return;
              setMachineProfile({
                ...machineProfile,
                ...{ zone: zone.name, region: zone.region },
              });
            }}
          />
          <Autocomplete
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...defaultAutoCompleteProps}
            id="machine-type"
            value={
              {
                name: machineProfile.machineType,
              } as MachineTypes[0]
            }
            options={machineTypes}
            groupBy={(option: MachineTypes[0]): string => {
              return (
                /(?<type>^\w+)(?=-)/
                  .exec(option.name)
                  ?.groups?.type?.toUpperCase() || ''
              );
            }}
            getOptionLabel={(option: MachineTypes[0]): string => option.name}
            getOptionSelected={(option, value): boolean => {
              return option.name === value.name;
            }}
            renderInput={(params): JSX.Element => (
              <TextField
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...params}
                label="Machine Type"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingMachineTypes ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            loading={loadingMachineTypes}
            onChange={(
              e: ChangeEvent<Record<string, unknown>>,
              v: MachineTypes[0] | null,
            ): void => {
              e.preventDefault();
              if (!v) return;
              setMachineProfile({
                ...machineProfile,
                ...{ machineType: v.name },
              });
            }}
          />
          <Autocomplete
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...defaultAutoCompleteProps}
            id="image"
            value={
              {
                project: machineProfile.imageProject,
                family: machineProfile.imageFamily,
              } as Images[0]
            }
            options={images}
            groupBy={(option: Images[0]): string => option.project}
            getOptionLabel={(option: Images[0]): string => option.family}
            getOptionSelected={(option, value): boolean => {
              return (
                option.project === value.project &&
                option.family === value.family
              );
            }}
            renderInput={(params): JSX.Element => (
              <TextField
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...params}
                label="Image family"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingImages ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            loading={loadingImages}
            onChange={(
              e: ChangeEvent<Record<string, unknown>>,
              image: Images[0] | null,
            ): void => {
              e.preventDefault();
              if (!image) return;
              setMachineProfile({
                ...machineProfile,
                ...{ imageProject: image.project, imageFamily: image.family },
              });
            }}
          />
          <InputLabel
            htmlFor="disk-size-gb"
            style={{ transform: 'translate(0, 1.5px) scale(0.75)' }}
          >
            Boot disk size
          </InputLabel>
          <Input
            fullWidth
            id="disk-size-gb"
            value={machineProfile.diskSizeGb}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              const value =
                e.target.value === ''
                  ? Number(defaultMachineProfile.diskSizeGb)
                  : Number(e.target.value);
              const diskSizeGb = Math.max(
                Math.min(value, 64000),
                10,
              ).toString();
              setMachineProfile({
                ...machineProfile,
                ...{ diskSizeGb },
              });
            }}
            inputProps={{
              step: 10,
              min: 10,
              max: 64000,
              type: 'number',
              // 'aria-labelledby': 'input-slider',
            }}
            endAdornment={<InputAdornment position="end">GB</InputAdornment>}
          />
          <TextField
            id="sshPublicKey-confirm"
            label="SSH Public Key (optional)"
            placeholder="SSH Public Key (optional)"
            fullWidth
            multiline
            rowsMax="5"
            value={machineProfile.sshPublicKey}
            onChange={(e): void => {
              setMachineProfile({
                ...machineProfile,
                ...{ sshPublicKey: e.target.value },
              });
            }}
            error={!sshPublicKeyValidator(machineProfile.sshPublicKey)}
          />
          <Button
            type="button"
            onClick={(e): void => {
              e.preventDefault();
              setOpenBackdrop(true);
              fetch('/instance', {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(machineProfile),
              })
                .then((r) => r.json())
                .then((i: Instance) => {
                  setInstanceInfo(i);
                  setPolling(true);
                })
                .catch(() => setOpenBackdrop(false));
            }}
            disabled={validateInstanceInfo(machineProfile)}
            color="primary"
          >
            Create instance
          </Button>
          <Button
            type="button"
            onClick={(e): void => {
              e.preventDefault();
              setOpenBackdrop(true);
              fetch('/project', {
                credentials: 'include',
                method: 'DELETE',
              })
                .then((r) => r.json())
                .then(() => {
                  setPolling(true);
                })
                .catch(() => setOpenBackdrop(false));
            }}
            color="secondary"
          >
            Delete project
          </Button>
        </Container>
      </StepContent>
    </Step>,
    <Step key="Delete project">
      <StepLabel>Happy Developing!</StepLabel>
      <StepContent>
        <Container>
          {loadingInstanceInfo ? (
            <div>loading</div>
          ) : (
            <div>
              <div>{`Name: ${instanceInfo?.name}`}</div>
              <div>
                {instanceInfo?.metadata?.items
                  ? `SSH Command: ssh -i <path/to/key-file> ${
                      instanceInfo.metadata.items[0].value
                        ?.split(/\s/)[2]
                        .match(/(?<user>.+)(?=@)/)?.groups?.user
                    }@${
                      instanceInfo?.networkInterfaces &&
                      instanceInfo.networkInterfaces[0].accessConfigs &&
                      instanceInfo.networkInterfaces[0].accessConfigs[0]?.natIP
                    }`
                  : null}
              </div>
            </div>
          )}
          <Button
            type="button"
            onClick={(e): void => {
              e.preventDefault();
              setOpenBackdrop(true);
              fetch('/instance', {
                credentials: 'include',
                method: 'DELETE',
              })
                .then((r) => r.json())
                .then(() => {
                  setPolling(true);
                })
                .catch(() => setOpenBackdrop(false));
            }}
            color="primary"
          >
            Delete instance and return to previous
          </Button>
          <Button
            type="button"
            onClick={(e): void => {
              e.preventDefault();
              setOpenBackdrop(true);
              fetch('/project', {
                credentials: 'include',
                method: 'DELETE',
              })
                .then((r) => r.json())
                .then(() => {
                  setPolling(true);
                })
                .catch(() => setOpenBackdrop(false));
            }}
            color="primary"
          >
            Delete project
          </Button>
        </Container>
      </StepContent>
    </Step>,
  ];

  return (
    <div style={{ width: '100%' }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step) => step)}
      </Stepper>
      <Backdrop open={openBackdrop} style={{ zIndex: 9999, color: '#fff' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

const IndexView: React.FC<{ markdownBody: string }> = ({ markdownBody }) => (
  <>
    <a href="/user/auth">
      <img src="/btn_google_signin_light_normal_web.png" alt="login" />
    </a>
    <div style={{ margin: '0 10px' }}>
      <span>
        {'By clicking “Sign in", you agree to our '}
        <Link href="/terms">
          <a>Terms of Service</a>
        </Link>
        {' and '}
        <Link href="/privacy">
          <a>Privacy Policy</a>
        </Link>
        .
      </span>
    </div>
    <div>
      <ReactMarkdown source={markdownBody} escapeHtml={false} />
    </div>
  </>
);

const UserView: React.FC = () => {
  const { data: userInfo, revalidate } = useUser();

  const handleLogout = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    e.preventDefault();
    fetch('/user/logout', { credentials: 'include' }).then(() => revalidate());
  };

  return (
    <>
      <div>
        <span>{`ACCOUNT: ${userInfo?.displayName || 'Guest'}`}</span>
        <Button onClick={handleLogout} color="secondary">
          LOGOUT
        </Button>
      </div>
      {userInfo && <InstanceStepper userInfo={userInfo} />}
    </>
  );
};

export const getStaticProps: GetStaticProps<{
  markdownBody: string;
}> = async () => {
  const { content } = matter((await import('../README.md')).default);
  return {
    props: {
      markdownBody: content,
    },
  };
};

const DashBoard: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({
  markdownBody,
}) => {
  const { data: userInfo } = useUser();

  return (
    <Layout>
      {userInfo?.displayName ? (
        <UserView />
      ) : (
        <IndexView markdownBody={markdownBody} />
      )}
    </Layout>
  );
};

export default DashBoard;
