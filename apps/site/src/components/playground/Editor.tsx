import React, { useEffect } from 'react';
import { Editor as MonacoEditor, useMonaco } from '@monaco-editor/react';

export default function Editor() {
  const monaco = useMonaco();

  return (
    <MonacoEditor defaultValue="" theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 16, fontFamily: 'monaco, Consolas, "Lucida Console", monospace' }} />
  );
}
