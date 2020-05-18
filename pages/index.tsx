import React, { useState } from 'react';
import useSWR from 'swr';

import type { SessionInfo, APIError } from '../server/index';

import Layout from '../components/layout';
import { fetcher } from '../lib/fetch';

const useUser = () => {
  return useSWR<SessionInfo, APIError>('/session', fetcher);
};

/*
 * Createに必要な情報
 * - zone
 * - machineType
 * - imageFamily
 * - diskSizeGb
 * - sshPublicKey
 */

const IndexPage: React.FC = () => {
  const { data: session, revalidate } = useUser();
  const [project, updateProject] = useState<string>('');

  const createProject: React.MouseEventHandler = (e) => {
    e.preventDefault();
    updateProject('creating');
    fetch('/api/create')
      .then((r) => {
        return r.json();
      })
      .then((v) => {
        updateProject(JSON.stringify(v));
      });
  };

  return (
    <Layout>
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
          <div>{project}</div>
        </>
      ) : (
        <a href="/auth">login</a>
      )}
    </Layout>
  );
};

export default IndexPage;
