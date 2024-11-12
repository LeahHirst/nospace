import React, { useEffect, useMemo, useState } from 'react';
import { Editor as MonacoEditor, useMonaco } from '@monaco-editor/react';
import styled from '@emotion/styled';
import Button from './Button';
import Dropdown, { DropdownAction } from './Dropdown';
import {
  registerNospace,
  registerWhitespace,
  registerNossembly,
} from '@repo/language-support';
import type { editor } from 'monaco-editor';
import { Typechecker } from '@repo/typecheck/index';
import { getProgram, serializeProgram } from './utils/program';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #c8b1db;
  flex: 1;
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  flex: 0;
  background-color: #262626;
  color: #c3c3c3;
  padding: 0 20px;
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

export default function Editor() {
  const monaco = useMonaco();
  const [language, setLanguage] = useState('Nospace');
  const [[lnNumber, colNumber], setCursorPos] = useState([1, 1]);

  useEffect(() => {
    if (!monaco) {
      return;
    }

    const editor = monaco.editor.getEditors()[0];

    registerNospace(monaco);
    registerWhitespace(monaco);
    registerNossembly(monaco);

    monaco.editor.setModelLanguage(editor.getModel()!, 'nospace');
  }, [monaco]);

  const highlightErrors = React.useCallback(() => {
    if (!monaco) {
      return;
    }

    const editor = monaco.editor.getEditors()[0];

    // Todo: debounce
    const parsed = getProgram(
      editor.getModel()?.getLanguageId() ?? 'nospace',
      editor.getValue(),
    );
    const markers: editor.IMarkerData[] = parsed.parseErrors.map((error) => ({
      startLineNumber: error.meta.startLn + 1,
      endLineNumber: error.meta.endLn + 1,
      startColumn: error.meta.startCol + 1,
      endColumn: error.meta.endCol + 1,
      message: `ParseError: ${error.message}`,
      severity: monaco.MarkerSeverity.Error,
    }));

    const [typechecked, typeErrors] = new Typechecker(parsed).typecheck();
    if (!typechecked) {
      for (const error of typeErrors.errors) {
        markers.push({
          startLineNumber: error.meta.startLn + 1,
          endLineNumber: error.meta.endLn + 1,
          startColumn: error.meta.startCol + 1,
          endColumn: error.meta.endCol + 1,
          message: `TypeError: ${error.message}`,
          severity: monaco.MarkerSeverity.Error,
        });
      }
    }

    monaco.editor.setModelMarkers(editor.getModel()!, 'owner', markers);
  }, [monaco]);

  React.useEffect(() => {
    if (!monaco) {
      return () => {};
    }

    const editor = monaco.editor.getEditors()[0];

    const cleanup = editor.onDidChangeCursorPosition((e) => {
      setCursorPos([e.position.lineNumber, e.position.column]);
      highlightErrors();
    });
    return () => {
      cleanup.dispose();
    };
  }, [monaco, language, highlightErrors]);

  const changeLanguage = React.useCallback(
    (lang: string) => {
      if (!monaco) {
        return;
      }

      const editor = monaco.editor.getEditors()[0];

      monaco?.editor.setModelLanguage(editor?.getModel()!, lang.toLowerCase());
      editor?.updateOptions({
        autoIndent: lang === 'Nossembly' ? 'advanced' : 'none',
        fontSize: lang === 'Nossembly' ? 16.0001 : 16, // horrible hack to force Monaco to update options immediately
      });

      const program = getProgram(language, editor.getValue());
      editor.setValue(serializeProgram(lang, program));
      setLanguage(lang);
      highlightErrors();
    },
    [monaco, language],
  );

  const insert = React.useCallback(
    (text: string) => {
      if (!monaco) {
        return;
      }

      const editor = monaco.editor.getEditors()[0];
      editor.executeEdits('nospace', [
        {
          range: new monaco.Range(lnNumber, colNumber, lnNumber, colNumber),
          text,
          forceMoveMarkers: true,
        },
      ]);
    },
    [monaco, lnNumber, colNumber],
  );

  const monacoOptions = useMemo(
    () =>
      ({
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
        insertSpaces: false,
      }) as editor.IStandaloneEditorConstructionOptions,
    [],
  );

  return (
    <Container>
      <Toolbar>
        <Flex>
          {['Nospace', 'Whitespace', 'Nossembly'].map((lang) => (
            <Button
              key={lang}
              active={language === lang}
              onClick={() => {
                changeLanguage(lang);
              }}
            >
              {lang}
            </Button>
          ))}
        </Flex>
        <Flex>
          <Dropdown label="Insert">
            <DropdownAction onClick={() => insert('\u200B')}>
              ZWSP
            </DropdownAction>
            <DropdownAction onClick={() => insert('\u200C')}>
              ZWNJ
            </DropdownAction>
            <DropdownAction onClick={() => insert('\u200D')}>
              ZWJ
            </DropdownAction>
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
