import type { MachineProfile } from 'express-serve-static-core';

export const defaultAutoCompleteProps = {
  autoComplete: true,
  autoHighlight: true,
  blurOnSelect: true,
  fullWidth: true,
  includeInputInList: true,
};

export const defaultMachineProfile: MachineProfile = {
  region: 'us-west1',
  zone: 'us-west1-b',
  machineType: 'f1-micro',
  imageProject: 'ubuntu-os-cloud',
  imageFamily: 'ubuntu-1804-lts',
  diskSizeGb: '10',
};
