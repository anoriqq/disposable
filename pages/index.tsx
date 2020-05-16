import React, { useState } from 'react';
import useSWR, { SWRConfig } from 'swr';
import fetch from 'isomorphic-unfetch';

const fetcher = <T extends unknown>(key: any): Promise<T> => {
  return fetch(key, { credentials: 'include' }).then((r) => r.json());
};

const useUser = () => {
  return useSWR('/session');
};

const useProject = () => {
  return fetch('/api/create').then((r) => r.json());
};

const Dashboard: React.FC = () => {
  const { data: session, revalidate } = useUser();
  const [project, updateProject] = useState<any>({});

  const createProject: React.MouseEventHandler = (e) => {
    e.preventDefault();
    fetch('/api/create')
      .then((r) => {
        return r.json();
      })
      .then(updateProject);
  };

  return (
    <>
      {session?.user ? (
        <>
          {' '}
          <button
            type="button"
            onClick={(e): void => {
              e.preventDefault();
              fetch('/user/logout', { credentials: 'include' }).then(() =>
                revalidate(),
              );
            }}
          >
            logout
          </button>
          <button
            type="button"
            onClick={(e): void => {
              e.preventDefault();
              fetch('/user/delete', { credentials: 'include' }).then(() =>
                revalidate(),
              );
            }}
          >
            delete
          </button>
          <span>
            {session?.user?.displayName ? session.user.displayName : 'guest'}
          </span>
          <button type="button" onClick={createProject}>
            create
          </button>
          <div>{JSON.stringify(project)}</div>
        </>
      ) : (
        <a href="/auth">login</a>
      )}
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
