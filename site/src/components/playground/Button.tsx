import React from 'react';
import styled from '@emotion/styled';

const Base = styled.button`
  display: flex;
  gap: 8px;
  border: none;
  border-top: solid 2px transparent;
  border-bottom: solid 2px transparent;
  flex: 0 1;
  padding: 16px 10px;
  font-weight: 500;
  align-items: center;

  &:hover {
    background-color: #262626;
    border-bottom: solid 2px white;
    pointer: cursor;
  }
`;

export type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
};

export default function Button({ children, onClick }: ButtonProps) {
  return (
    <Base onClick={onClick}>
      {children}
    </Base>
  );
}
