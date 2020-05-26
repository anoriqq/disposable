export declare module 'gce-images' {
  interface Image {
    creationTimestamp: string;
    deprecated: {
      state: 'ACTIVE' | 'DEPRECATED' | 'OBSOLETE' | 'DELETED';
      replacement: string;
      deprecated: string;
      obsolete: string;
      deleted: string;
    };
    kind: 'compute#image';
    selfLink: string;
    id: string;
    name: string;
    description: string;
    sourceType: string;
    rawDisk: { source: string; containerType: string };
    status: string;
    archiveSizeBytes: number;
    diskSizeGb: number;
    licenses: string[];
    family: string;
    labelFingerprint: string;
    guestOsFeatures: {
      type:
        | 'MULTI_IP_SUBNET'
        | 'UEFI_COMPATIBLE'
        | 'VIRTIO_SCSI_MULTIQUEUE'
        | 'WINDOWS';
    }[];
    licenseCodes: string[];
    storageLocations: string[];
  }
}
