import React from 'react';
import styled from '@emotion/styled';
import Header from './Header';
import Editor from './Editor';
import { EditorSidebar } from './EditorSidebar';
import { PlaygroundContextProvider } from './PlaygroundContext';

const Container = styled.div`
  display: flex;
  height: calc(100vh - 53px);
  flex-direction: column;
  overflow-y: hidden;
  background-color: #1e1e1e;
`;

const SplitView = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

export default function Playground() {
  return (
    <PlaygroundContextProvider>
      <Container>
        <Header />
        <SplitView>
          <Editor />
          <EditorSidebar />
        </SplitView>
      </Container>
    </PlaygroundContextProvider>
  );
}
