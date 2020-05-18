import fetch from 'isomorphic-unfetch';

export const fetcher = async <T extends unknown>(
  key: RequestInfo,
): Promise<T> => {
  const r = await fetch(key, { credentials: 'include' });
  return r.json();
};
