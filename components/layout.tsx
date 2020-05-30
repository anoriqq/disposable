import React from 'react';
import { Global, css } from '@emotion/core';
import styled from '@emotion/styled';
import 'typeface-roboto';
import CssBaseline from '@material-ui/core/CssBaseline';

const globalStyles = css`
  html,
  body {
    width: 100%;
    margin: 0;
  }
`;

const Container = styled.div({
  margin: '2rem auto',
  maxWidth: '680px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

const Layout: React.FC = ({ children }) => (
  <>
    <Global styles={globalStyles} />
    <CssBaseline />
    <Container>{children}</Container>
  </>
);

export default Layout;
