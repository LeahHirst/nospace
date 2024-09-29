import React, { useEffect, useMemo, useState } from 'react';
import { Editor as MonacoEditor, useMonaco, type Monaco } from '@monaco-editor/react';
import styled from '@emotion/styled';
import { NospaceIR, Instruction } from '@repo/parser';
import Button from './Button';
import Dropdown, { DropdownAction } from './Dropdown';
import { registerNospace, registerWhitespace, registerNossembly } from '@repo/language-support'
import type { editor } from 'monaco-editor';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #c8b1db;
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  flex: 0;
  background-color: #262626;
  color: #c3c3c3;
  padding: 0 20px;
  border-bottom: solid 5px #1e1e1e;
`;

const Flex = styled.div`
  display: flex;
`;

const DEFAULT_PROGRAM = `
Label Test
  Push 1
  Push 2
  Add
  WriteInt
`;

function getProgram(lang: string, code: string) {
  switch (lang) {
    case 'Nospace': return NospaceIR.fromNospace(code);
    case 'Whitespace': return NospaceIR.fromWhitespace(code);
    case 'Nossembly': return NospaceIR.fromNossembly(code);
    default: throw new Error('Unrecognized language');
  }
}

function serializeProgram(lang: string, prog: NospaceIR) {
  switch (lang) {
    case 'Nospace': return prog.toNospace();
    case 'Whitespace': return prog.toWhitespace();
    case 'Nossembly': return prog.toNossembly();
    default: throw new Error('Unrecognized language');
  }
}

export default function Editor() {
  const monaco = useMonaco();
  const [language, setLanguage] = useState('Nospace');
  const [[lnNumber, colNumber], setCursorPos] = useState([1, 1]);
  
  useEffect(() => {
    if (!monaco) {
      return;
    }

    const editor = monaco.editor.getEditors()[0];
    
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos([e.position.lineNumber, e.position.column]);
    });
    registerNospace(monaco);
    registerWhitespace(monaco);
    registerNossembly(monaco);

    monaco.editor.setModelLanguage(editor.getModel()!, 'nossembly');
  }, [monaco]);

  const changeLanguage = React.useCallback((lang: string) => {
    if (!monaco) {
      return;
    }

    const editor = monaco.editor.getEditors()[0];
    const program = getProgram(language, editor.getValue());
    editor.setValue(serializeProgram(lang, program));
    setLanguage(lang);
  }, [monaco, language]);

  const insert = React.useCallback((text: string) => {
    if (!monaco) {
      return;
    }

    const editor = monaco.editor.getEditors()[0];
    editor.executeEdits('nospace', [{
      range: new monaco.Range(lnNumber, colNumber, lnNumber, colNumber),
      text,
      forceMoveMarkers: true,
    }]);
    monaco.editor.setModelMarkers(editor.getModel()!, 'owner', [
      {
        startLineNumber: lnNumber,
        endLineNumber: lnNumber,
        startColumn: colNumber,
        endColumn: colNumber + 1,
        message: 'TypeError',
        severity: monaco.MarkerSeverity.Error,
      },
    ]);
  }, [monaco, lnNumber, colNumber]);

  const monacoOptions = useMemo(() => ({
    minimap: { enabled: false },
    fontSize: 16,
    fontFamily: 'monaco, Consolas, "Lucida Console", monospace',
    tabSize: 2,
    language,
    autoIndent: 'none',
    renderControlCharacters: false,
    unicodeHighlight: {
      invisibleCharacters: false,
      nonBasicASCII: false,
      ambiguousCharacters: false,
    },
  } as editor.IStandaloneEditorConstructionOptions), []);

  useEffect(() => {
    if (!monaco) {
      return;
    }

    monaco.editor.getEditors()[0].updateOptions({
      autoIndent: language === 'Nossembly' ? 'advanced' : 'none',
    });
  }, [monaco, language]);

  return (
    <Container>
      <Toolbar>
        <Flex>
          {['Nospace', 'Whitespace', 'Nossembly'].map(lang => (
            <Button
              key={lang}
              active={language === lang}
              onClick={() => {
                monaco?.editor.setModelLanguage(monaco.editor.getEditors()[0].getModel()!, lang.toLowerCase());
                changeLanguage(lang);
              }}
            >
              {lang}
            </Button>
          ))}
        </Flex>
        <Flex>
          <Dropdown label="Insert">
            <DropdownAction onClick={() => insert('\u200B')}>ZWSP</DropdownAction>
            <DropdownAction onClick={() => insert('\u200C')}>ZWNJ</DropdownAction>
            <DropdownAction onClick={() => insert('\u200D')}>ZWJ</DropdownAction>
            <DropdownAction onClick={() => insert('\u2060')}>WJ</DropdownAction>
          </Dropdown>
        </Flex>
      </Toolbar>
      <MonacoEditor defaultValue="" theme="vs-dark" options={monacoOptions} />
      <Toolbar>
        <div />
        Ln {lnNumber}, Col {colNumber}
      </Toolbar>
    </Container>
  );
}
