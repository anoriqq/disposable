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

import { fetcher } from '../lib/fetch';
import { sshPublicKeyValidator } from '../lib/validators';
import {
  useZones,
  useMachineTypes,
  useImages,
  useInstanceInfo,
} from '../lib/hooks';
import {
  defaultAutoCompleteProps,
  defaultMachineProfile,
} from '../lib/constants';

export const InstanceStepper: React.FC<{ userInfo: UserInfo }> = ({
  userInfo,
}) => {
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

export default InstanceStepper;
