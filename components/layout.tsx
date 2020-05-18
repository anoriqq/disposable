import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'reakit';

const Layout: React.FC = ({ children }) => (
  <>
    <Provider>{children}</Provider>
  </>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
