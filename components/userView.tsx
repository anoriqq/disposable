import React from 'react';
import fetch from 'isomorphic-unfetch';
import { Button } from '@material-ui/core';

import InstanceStepper from './instanceStepper';
import { useUser } from '../lib/hooks';

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

export default UserView;
