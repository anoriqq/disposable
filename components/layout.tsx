import React from 'react';
import PropTypes from 'prop-types';
import { Global, css } from '@emotion/core';
import styled from '@emotion/styled';
import 'typeface-roboto';

const globalStyles = css`
  html,
  body {
    width: 100%;
    margin: 0;
  }
`;

const Container = styled.div({
  margin: '2rem auto',
  maxWidth: '700px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

const Layout: React.FC = ({ children }) => (
  <>
    <Global styles={globalStyles} />
    <Container>{children}</Container>
  </>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
