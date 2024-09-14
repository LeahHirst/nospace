import React from 'react';
import MonacoEditor from '@monaco-editor/react';

export default function Editor() {
  return (
    <MonacoEditor defaultValue="" theme="vs-dark" />
  );
}