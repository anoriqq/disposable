import React from 'react';
import useSWR, { SWRConfig } from 'swr';
import fetch from 'isomorphic-unfetch';

const fetcher = <T extends unknown>(key: any): Promise<T> => {
  return fetch(key, { credentials: 'include' }).then((r) => r.json());
};

const useUser = () => {
  return useSWR('/session');
};

const Dashboard: React.FC = () => {
  const { data: session, revalidate } = useUser();
  return (
    <>
      <a href="/auth">login</a>
      <button
        type="button"
        onClick={(e): void => {
          e.preventDefault();
          fetch('/logout', { credentials: 'include' }).then(() => revalidate());
        }}
      >
        logout
      </button>
      <div>
        <span>
          {session?.user?.displayName ? session.user.displayName : 'guest'}
        </span>
      </div>
    </>
  );
};

const IndexPage: React.FC = () => (
  <>
    <SWRConfig value={{ fetcher }}>
      <Dashboard />
    </SWRConfig>
  </>
);

export default IndexPage;
