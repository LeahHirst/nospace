import React from 'react';
import styled from '@emotion/styled';
import Dropdown, { DropdownAction } from './Dropdown';
import Button from './Button';

const Base = styled.nav`
  background-color: #2e2e2e;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #767676;
`;

const Flex = styled.nav`
  display: flex;
  align-items: center;
`;

const H1 = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 300;
  padding: 10px 20px 10px 30px;
`;

const RightActions = styled.div`
  display: flex;
  flex: 0 1;
  padding-right: 16px;
`;

export default function Header() {
  return (
    <Base>
      <Flex>
        <H1>Playground</H1>
        <Dropdown label="Examples">
          <DropdownAction>Hello world</DropdownAction>
          <DropdownAction>Hello types</DropdownAction>
        </Dropdown>
      </Flex>
      <RightActions>
        <Button>Run</Button>
        <Button>Share</Button>
      </RightActions>
    </Base>
  );
}
