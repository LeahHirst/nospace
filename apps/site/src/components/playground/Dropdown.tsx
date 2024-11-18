import React, { useState } from 'react';
import Button from './Button';
import styled from '@emotion/styled';
import { Chevron } from './icons/Chevron';

const DropdownContent = styled.div`
  position: absolute;
  background-color: #767676;
  display: flex;
  flex-direction: column;
  min-width: 100px;
  z-index: 10000;
  font-size: 1rem;
`;

export const DropdownAction = styled.button`
  border: none;
  width: 100%;
  text-align: left;
  color: white;
  background-color: #262626;
  padding: 8px;
  cursor: pointer;

  &:hover {
    background-color: #767676;
  }
`;

export type DropdownProps = {
  label: string;
  children: React.ReactNode;
  open?: boolean;
  onTriggerClick?: () => void;
};

export default function Dropdown({
  label,
  children,
  open,
  onTriggerClick,
}: DropdownProps) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <Button
        onClick={() => {
          if (open === undefined) {
            setShow(!show);
          } else {
            onTriggerClick?.();
          }
        }}
      >
        {label}
        <Chevron direction={show ? 'up' : 'down'} />
      </Button>
      {show && <DropdownContent>{children}</DropdownContent>}
    </div>
  );
}
