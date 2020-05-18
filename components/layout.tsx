import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'reakit';
import * as system from 'reakit-system-bootstrap';

const Layout: React.FC = ({ children }) => (
  <>
    <Provider unstable_system={system}>{children}</Provider>
  </>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
