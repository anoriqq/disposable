import React from 'react';
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
  maxWidth: '900px',
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

export default Layout;
