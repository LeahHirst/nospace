import React, { useCallback, useRef, useState } from 'react';
import styled from '@emotion/styled';
import Dropdown, { DropdownAction } from './Dropdown';
import Button from './Button';
import { usePlaygroundContext } from './PlaygroundContext';

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

const ShareToast = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 35px;
  padding: 20px 40px;
  margin-left: -142px;
  margin-top: -31px;
  font-size: 1.2rem;
  z-index: 100000;
`;

export default function Header() {
  const { run, share } = usePlaygroundContext();
  const [showToast, setShowToast] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const shareCode = useCallback(() => {
    setShowToast(true);
    timeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 2000);
    share();
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [share]);

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
        <Button onClick={run}>Run</Button>
        <Button onClick={shareCode}>Share</Button>
      </RightActions>
      {showToast && <ShareToast>URL copied to clipboard</ShareToast>}
    </Base>
  );
}
