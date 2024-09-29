import React from 'react';
import styled from '@emotion/styled';

/**
 * 
    display: flex;
    gap: 8px;
    border-top: solid 2px transparent;
    border-bottom: solid 2px transparent;
    flex: 0 1;
    padding: 16px 10px;
    font-weight: 500;
    align-items: center;
 */
const Base = styled.button<{
  active?: boolean;
}>`
  display: flex;
  gap: 8px;
  border: none;
  border-top: solid 2px transparent;
  border-bottom: solid 2px transparent;
  flex: 0 1;
  padding: 16px 10px;
  font-weight: 500;
  font-size: 1rem;
  align-items: center;
  color: ${({ active }) => active ? '#d096ff' : 'white'};
  background-color: transparent;
  ${({ active }) => active ? 'border-bottom: solid 2px #d096ff;' : ''}

  &:hover {
    background-color: #262626;
    ${({ active }) => !active ? 'border-bottom: solid 2px white;' : ''}
    cursor: pointer;
  }
`;

export type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
};

export default function Button({ children, onClick, active }: ButtonProps) {
  return (
    <Base onClick={onClick} active={active}>
      {children}
    </Base>
  );
}
