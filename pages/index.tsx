/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-props-no-spreading */

import fetch from 'isomorphic-unfetch';
import type { responseInterface } from 'swr';
import React, { useState } from 'react';
import useSWR from 'swr';
import {
  TextField,
  Button,
  Container,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';

import type { SessionInfo, APIError, InitData } from '../server/index';
import Layout from '../components/layout';
import { fetcher } from '../lib/fetch';

const useSession = (): responseInterface<SessionInfo, APIError> => {
  return useSWR<SessionInfo, APIError>('/user', fetcher);
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    button: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    actionsContainer: {
      marginBottom: theme.spacing(2),
    },
    resetContainer: {
      padding: theme.spacing(3),
    },
    table: {
      // maxWidth: 50,
    },
  }),
);

const options = {
  zone: [
    { region: 'asia-east1', zone: 'asia-east1-a' },
    { region: 'asia-east1', zone: 'asia-east1-b' },
    { region: 'asia-east1', zone: 'asia-east1-c' },
    { region: 'asia-east2', zone: 'asia-east2-a' },
    { region: 'asia-east2', zone: 'asia-east2-b' },
    { region: 'asia-east2', zone: 'asia-east2-c' },
    { region: 'asia-northeast1', zone: 'asia-northeast1-a' },
    { region: 'asia-northeast1', zone: 'asia-northeast1-b' },
    { region: 'asia-northeast1', zone: 'asia-northeast1-c' },
    { region: 'asia-northeast2', zone: 'asia-northeast2-a' },
    { region: 'asia-northeast2', zone: 'asia-northeast2-b' },
    { region: 'asia-northeast2', zone: 'asia-northeast2-c' },
    { region: 'asia-south1', zone: 'asia-south1-a' },
    { region: 'asia-south1', zone: 'asia-south1-b' },
    { region: 'asia-south1', zone: 'asia-south1-c' },
    { region: 'asia-southeast1', zone: 'asia-southeast1-a' },
    { region: 'asia-southeast1', zone: 'asia-southeast1-b' },
    { region: 'asia-southeast1', zone: 'asia-southeast1-c' },
    { region: 'europe-north1', zone: 'europe-north1-a' },
    { region: 'europe-north1', zone: 'europe-north1-b' },
    { region: 'europe-west1', zone: 'europe-west1-b' },
    { region: 'europe-west1', zone: 'europe-west1-c' },
    { region: 'europe-west1', zone: 'europe-west1-d' },
    { region: 'europe-west2', zone: 'europe-west2-a' },
    { region: 'europe-west2', zone: 'europe-west2-b' },
    { region: 'europe-west2', zone: 'europe-west2-c' },
    { region: 'europe-west3', zone: 'europe-west3-a' },
    { region: 'europe-west3', zone: 'europe-west3-b' },
    { region: 'europe-west3', zone: 'europe-west3-c' },
    { region: 'europe-west4', zone: 'europe-west4-a' },
    { region: 'europe-west4', zone: 'europe-west4-b' },
    { region: 'europe-west4', zone: 'europe-west4-c' },
    { region: 'europe-west6', zone: 'europe-west6-a' },
    { region: 'europe-west6', zone: 'europe-west6-b' },
    { region: 'europe-west6', zone: 'europe-west6-c' },
    { region: 'northamerica-northeast1', zone: 'northamerica-northeast1-a' },
    { region: 'northamerica-northeast1', zone: 'northamerica-northeast1-b' },
    { region: 'northamerica-northeast1', zone: 'northamerica-northeast1-c' },
    { region: 'southamerica-east1', zone: 'southamerica-east1-a' },
    { region: 'southamerica-east1', zone: 'southamerica-east1-b' },
    { region: 'southamerica-east1', zone: 'southamerica-east1-c' },
    { region: 'us-central1', zone: 'us-central1-a' },
    { region: 'us-central1', zone: 'us-central1-b' },
    { region: 'us-central1', zone: 'us-central1-c' },
    { region: 'us-central1', zone: 'us-central1-f' },
    { region: 'us-east1', zone: 'us-east1-b' },
    { region: 'us-east1', zone: 'us-east1-c' },
    { region: 'us-east1', zone: 'us-east1-d' },
    { region: 'us-east4', zone: 'us-east4-a' },
    { region: 'us-east4', zone: 'us-east4-b' },
    { region: 'us-east4', zone: 'us-east4-c' },
    { region: 'us-west1', zone: 'us-west1-a' },
    { region: 'us-west1', zone: 'us-west1-b (default)' },
    { region: 'us-west1', zone: 'us-west1-c' },
    { region: 'us-west2', zone: 'us-west2-a' },
    { region: 'us-west2', zone: 'us-west2-b' },
    { region: 'us-west2', zone: 'us-west2-c' },
  ].sort((a, b) => -b.region.localeCompare(a.region)),
  machineType: [
    { machineType: 'N1', machineName: 'n1-standard-1' },
    { machineType: 'N1', machineName: 'n1-standard-2' },
    { machineType: 'N1', machineName: 'n1-standard-4' },
    { machineType: 'N1', machineName: 'n1-standard-8' },
    { machineType: 'N1', machineName: 'n1-standard-16' },
    { machineType: 'N1', machineName: 'n1-standard-32' },
    { machineType: 'N1', machineName: 'n1-standard-64' },
    { machineType: 'N1', machineName: 'n1-standard-96' },
    { machineType: 'N1', machineName: 'n1-highmem-2' },
    { machineType: 'N1', machineName: 'n1-highmem-4' },
    { machineType: 'N1', machineName: 'n1-highmem-8' },
    { machineType: 'N1', machineName: 'n1-highmem-16' },
    { machineType: 'N1', machineName: 'n1-highmem-32' },
    { machineType: 'N1', machineName: 'n1-highmem-64' },
    { machineType: 'N1', machineName: 'n1-highmem-96' },
    { machineType: 'N1', machineName: 'n1-highcpu-2' },
    { machineType: 'N1', machineName: 'n1-highcpu-4' },
    { machineType: 'N1', machineName: 'n1-highcpu-8' },
    { machineType: 'N1', machineName: 'n1-highcpu-16' },
    { machineType: 'N1', machineName: 'n1-highcpu-32' },
    { machineType: 'N1', machineName: 'n1-highcpu-64' },
    { machineType: 'N1', machineName: 'n1-highcpu-96' },
    { machineType: 'N2', machineName: 'n2-standard-2' },
    { machineType: 'N2', machineName: 'n2-standard-4' },
    { machineType: 'N2', machineName: 'n2-standard-8' },
    { machineType: 'N2', machineName: 'n2-standard-16' },
    { machineType: 'N2', machineName: 'n2-standard-32' },
    { machineType: 'N2', machineName: 'n2-standard-48' },
    { machineType: 'N2', machineName: 'n2-standard-64' },
    { machineType: 'N2', machineName: 'n2-standard-80' },
    { machineType: 'shared-core N1', machineName: 'f1-micro (default)' },
    { machineType: 'shared-core N1', machineName: 'g1-small' },
  ].sort((a, b) => -b.machineType.localeCompare(a.machineType)),
  imageFamily: [
    { project: 'centos-cloud', family: 'centos-8' },
    { project: 'centos-cloud', family: 'centos-7' },
    { project: 'centos-cloud', family: 'centos-6' },
    { project: 'ubuntu-os-cloud', family: 'ubuntu-2004-lts' },
    { project: 'ubuntu-os-cloud', family: 'ubuntu-minimal-2004-lts' },
    { project: 'ubuntu-os-cloud', family: 'ubuntu-1910' },
    { project: 'ubuntu-os-cloud', family: 'ubuntu-minimal-1910' },
    { project: 'ubuntu-os-cloud', family: 'ubuntu-1804-lts (default)' },
    { project: 'ubuntu-os-cloud', family: 'ubuntu-minimal-1804-lts' },
    { project: 'ubuntu-os-cloud', family: 'ubuntu-1604-lts' },
    { project: 'ubuntu-os-cloud', family: 'ubuntu-minimal-1604-lts' },
  ].sort((a, b) => -b.project.localeCompare(a.project)),
  diskSizeGb: [
    { capacity: '10 GB (default)' },
    { capacity: '20 GB' },
    { capacity: '30 GB' },
    { capacity: '64000 GB' },
  ].sort((a, b) => -b.capacity.localeCompare(a.capacity)),
};

const defaultInitData = {
  zone: options.zone.find((option) => option.zone.includes('(default)')),
  machineType: options.machineType.find((option) =>
    option.machineName.includes('(default)'),
  ),
  imageFamily: options.imageFamily.find((option) =>
    option.family.includes('(default)'),
  ),
  diskSizeGb: options.diskSizeGb.find((option) =>
    option.capacity.includes('(default)'),
  ),
  sshPublicKey: '',
};

const sshPublicKeyValidator = (key: string): boolean => {
  if (key === '') return true;
  return key.split(/\s/).every((v, index, array) => {
    if (array.length !== 3 || index > 2) return false;
    if (index === 0) return /ssh-rsa/.test(v);
    if (index === 1) return /\w+/.test(v);
    if (index === 2) return /\w+@\w+/.test(v);
    return true;
  });
};

const initDataValidator = (
  initData: Partial<InitData>,
): initData is InitData => {
  return (
    Boolean(initData.zone) &&
    Boolean(initData.machineType) &&
    Boolean(initData.imageFamily) &&
    Boolean(initData.diskSizeGb) &&
    (initData.sshPublicKey
      ? sshPublicKeyValidator(initData.sshPublicKey)
      : true)
  );
};

const defaultAutoCompleteProps = {
  autoComplete: true,
  autoHighlight: true,
  autoSelect: true,
  blurOnSelect: true,
  fullWidth: true,
  includeInputInList: true,
};

const IndexPage: React.FC = () => {
  const classes = useStyles();
  const { data: session, revalidate } = useSession();
  const [initData, setInitData] = useState(defaultInitData);
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = (): void => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = (): void => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = (): void => {
    if (initDataValidator(initData)) {
      handleNext();
      fetch('/instance', {
        method: 'POST',
        body: JSON.stringify(initData),
        headers: { 'Content-Type': 'application/json' },
      })
        .then((r) => r.json())
        .then(console.log);
    }
  };

  return (
    <Layout>
      {session?.user ? (
        <>
          <div>
            {`${session.user.displayName} でログイン中`}
            <Button
              className={classes.button}
              type="button"
              onClick={(e): void => {
                e.preventDefault();
                fetch('/user/logout', { credentials: 'include' }).then(() =>
                  revalidate(),
                );
              }}
            >
              logout
            </Button>
          </div>
          <div>
            <Button
              className={classes.button}
              type="button"
              onClick={(e): void => {
                e.preventDefault();
                fetch('/instance/zones', { credentials: 'include' })
                  .then((r) => r.json())
                  .then(console.log);
              }}
            >
              List Zones
            </Button>
          </div>
          <div className={classes.root}>
            <Stepper activeStep={activeStep} orientation="vertical">
              <Step key="Configure Instance">
                <StepLabel>Configure Instance</StepLabel>
                <StepContent>
                  <Container>
                    <form>
                      <Autocomplete
                        {...defaultAutoCompleteProps}
                        id="zone"
                        options={options.zone}
                        groupBy={(option): string => option.region}
                        getOptionLabel={(option): string => option.zone}
                        renderInput={(params): JSX.Element => (
                          <TextField {...params} label="Zone" />
                        )}
                        value={initData.zone}
                        onChange={(_: any, v: any): void => {
                          setInitData({ ...initData, ...{ zone: v } });
                        }}
                      />
                      <Autocomplete
                        {...defaultAutoCompleteProps}
                        id="machineType"
                        options={options.machineType}
                        groupBy={(option): string => option.machineType}
                        getOptionLabel={(option): string => option.machineName}
                        renderInput={(params): JSX.Element => (
                          <TextField {...params} label="Machine Type" />
                        )}
                        value={initData.machineType}
                        onChange={(_: any, v: any): void => {
                          setInitData({ ...initData, ...{ machineType: v } });
                        }}
                      />
                      <Autocomplete
                        {...defaultAutoCompleteProps}
                        id="imageFamily"
                        options={options.imageFamily}
                        groupBy={(option): string => option.project}
                        getOptionLabel={(option): string => option.family}
                        renderInput={(params): JSX.Element => (
                          <TextField {...params} label="Image Family" />
                        )}
                        value={initData.imageFamily}
                        onChange={(_: any, v: any): void => {
                          setInitData({ ...initData, ...{ imageFamily: v } });
                        }}
                      />
                      <Autocomplete
                        {...defaultAutoCompleteProps}
                        id="diskSizeGb"
                        options={options.diskSizeGb}
                        getOptionLabel={(option): string => option.capacity}
                        renderInput={(params): JSX.Element => (
                          <TextField {...params} label="Disk Size (GB)" />
                        )}
                        value={initData.diskSizeGb}
                        onChange={(_: any, v: any): void => {
                          setInitData({ ...initData, ...{ diskSizeGb: v } });
                        }}
                      />
                      <TextField
                        id="sshPublicKey"
                        label="SSH Public Key (optional)"
                        placeholder="SSH Public Key (optional)"
                        fullWidth
                        multiline
                        rowsMax="5"
                        value={initData.sshPublicKey}
                        onChange={(e): void => {
                          setInitData({
                            ...initData,
                            ...{ sshPublicKey: e.target.value },
                          });
                        }}
                        error={!sshPublicKeyValidator(initData.sshPublicKey)}
                      />
                    </form>
                  </Container>
                  <div className={classes.actionsContainer}>
                    <div>
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('Cancel');
                        }}
                        className={classes.button}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={(e): void => {
                          e.preventDefault();
                          setInitData(defaultInitData);
                        }}
                        className={classes.button}
                      >
                        Default
                      </Button>
                      <Button
                        type="button"
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        className={classes.button}
                        disabled={!initDataValidator(initData)}
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                </StepContent>
              </Step>
              <Step key="Confirm Configuration">
                <StepLabel>Confirm Configuration</StepLabel>
                <StepContent>
                  <Container>
                    <Autocomplete
                      disabled
                      {...defaultAutoCompleteProps}
                      id="zone-confirm"
                      options={options.zone}
                      groupBy={(option): string => option.region}
                      getOptionLabel={(option): string => option.zone}
                      renderInput={(params): JSX.Element => (
                        <TextField {...params} label="Zone" />
                      )}
                      value={initData.zone}
                      onChange={(_: any, v: any): void => {
                        setInitData({ ...initData, ...{ zone: v } });
                      }}
                    />
                    <Autocomplete
                      disabled
                      {...defaultAutoCompleteProps}
                      id="machineType-confirm"
                      options={options.machineType}
                      groupBy={(option): string => option.machineType}
                      getOptionLabel={(option): string => option.machineName}
                      renderInput={(params): JSX.Element => (
                        <TextField {...params} label="Machine Type" />
                      )}
                      value={initData.machineType}
                      onChange={(_: any, v: any): void => {
                        setInitData({ ...initData, ...{ machineType: v } });
                      }}
                    />
                    <Autocomplete
                      disabled
                      {...defaultAutoCompleteProps}
                      id="imageFamily-confirm"
                      options={options.imageFamily}
                      groupBy={(option): string => option.project}
                      getOptionLabel={(option): string => option.family}
                      renderInput={(params): JSX.Element => (
                        <TextField {...params} label="Image Family" />
                      )}
                      value={initData.imageFamily}
                      onChange={(_: any, v: any): void => {
                        setInitData({ ...initData, ...{ imageFamily: v } });
                      }}
                    />
                    <Autocomplete
                      disabled
                      {...defaultAutoCompleteProps}
                      id="diskSizeGb-confirm"
                      options={options.diskSizeGb}
                      getOptionLabel={(option): string => option.capacity}
                      renderInput={(params): JSX.Element => (
                        <TextField {...params} label="Disk Size (GB)" />
                      )}
                      value={initData.diskSizeGb}
                      onChange={(_: any, v: any): void => {
                        setInitData({ ...initData, ...{ diskSizeGb: v } });
                      }}
                    />
                    <TextField
                      disabled
                      id="sshPublicKey-confirm"
                      label="SSH Public Key (optional)"
                      placeholder="SSH Public Key (optional)"
                      fullWidth
                      multiline
                      rowsMax="5"
                      value={initData.sshPublicKey}
                      onChange={(e): void => {
                        setInitData({
                          ...initData,
                          ...{ sshPublicKey: e.target.value },
                        });
                      }}
                      error={!sshPublicKeyValidator(initData.sshPublicKey)}
                    />
                  </Container>
                  <div className={classes.actionsContainer}>
                    <div>
                      <Button
                        type="button"
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        className={classes.button}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        className={classes.button}
                      >
                        Create Instance
                      </Button>
                    </div>
                  </div>
                </StepContent>
              </Step>
            </Stepper>
          </div>
        </>
      ) : (
        <>
          <Button
            onClick={(e): void => {
              e.preventDefault();
              window.location.href = '/user/auth';
            }}
          >
            login
          </Button>
        </>
      )}
    </Layout>
  );
};

export default IndexPage;
