import React from 'react';
import styled from '@emotion/styled';
import Header from './Header';

const Container = styled.div`
  display: flex;
  height: calc(100vh - 53px);
  flex-direction: column;
  overflow-y: hidden;
  background-color: #1e1e1e;
`

export function Playground() {


  return (
    <Container>
      <Header />

    </Container>
  )
}