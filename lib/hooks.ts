import type { responseInterface } from 'swr';
import type {
  APIError,
  UserInfo,
  Zones,
  MachineTypes,
  Images,
  Instance,
} from 'express-serve-static-core';
import useSWR from 'swr';
import { useState, useEffect } from 'react';
import qs from 'qs';

import { fetcher } from './fetch';

export const useUser = (
  refreshInterval?: number,
): responseInterface<UserInfo, APIError> => {
  return useSWR<UserInfo, APIError>('/user', fetcher, { refreshInterval });
};

export const useZones = ({
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

export const useMachineTypes = ({
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

export const useImages = ({
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

export const useInstanceInfo = ({
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
