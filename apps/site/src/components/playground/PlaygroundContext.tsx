import { useMonaco } from '@monaco-editor/react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getProgram } from './utils/program';
import { Typechecker, diagram } from '@repo/typecheck/index';
import { Program } from '@repo/nose/index';
import { generateShareHashParameter, getSharedCode } from './utils/share';
import { deflate } from 'pako';
import { fromUint8Array } from 'js-base64';
import type { EffectGraphNode } from '../../../../../packages/typecheck/src/effectGraph';

export type CompilerMessage = {
  message: string;
  type: 'success' | 'error' | 'warning';
};

export type PlaygroundContextType = {
  programInput: string;
  setProgramInput: (input: string) => void;
  programOutput: string;
  compilerOutput: CompilerMessage[];
  run: () => void;
  share: () => void;
  getTypegraphUrl: () => string | undefined;
  strict: boolean;
  setStrict: (v: boolean) => void;
};

const PlaygroundContext = createContext<PlaygroundContextType>({
  programInput: '',
  setProgramInput: () => {},
  programOutput: '',
  compilerOutput: [],
  run: () => {},
  share: () => {},
  getTypegraphUrl: () => undefined,
  strict: false,
  setStrict: () => {},
});

export const usePlaygroundContext = () => useContext(PlaygroundContext);

export const PlaygroundContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { input } = useMemo(() => getSharedCode(), []);
  const [programInput, setProgramInput] = useState(input);
  const [programOutput, setProgramOutput] = useState('');
  const [compilerOutput, setCompilerOutput] = useState<CompilerMessage[]>([]);
  const [strict, setStrict] = useState(false);

  const monaco = useMonaco();

  const run = useCallback(() => {
    if (!monaco) {
      return;
    }

    const editor = monaco.editor.getEditors()[0];

    const ir = getProgram(
      editor.getModel()?.getLanguageId() ?? 'nospace',
      editor.getValue(),
    );

    if (ir.parseErrors.length > 0) {
      setCompilerOutput(
        ir.parseErrors.map(({ message }) => ({ message, type: 'error' })),
      );
      setProgramOutput('');
      return;
    }

    const typechecker = new Typechecker(ir);
    const [success, { errors: typeErrors, warnings: typeWarnings }] =
      typechecker.typecheck(strict);

    if (!success) {
      setCompilerOutput([
        ...typeErrors.map(({ message }) => ({
          message,
          type: 'error' as 'error',
        })),
        ...typeWarnings.map(({ message }) => ({
          message,
          type: 'warning' as 'warning',
        })),
      ]);
      setProgramOutput('');
      return;
    }

    try {
      const program = new Program(ir, programInput);
      const output = program.execute();
      setProgramOutput(output);
      setCompilerOutput([{ type: 'success', message: 'Success' }]);
    } catch (e: unknown) {
      console.log(e);
      setCompilerOutput([{ type: 'error', message: (e as Error).message }]);
    }
  }, [monaco, strict]);

  const share = useCallback(() => {
    if (!monaco) {
      return;
    }

    const editor = monaco.editor.getEditors()[0];

    const ir = getProgram(
      editor.getModel()?.getLanguageId() ?? 'nospace',
      editor.getValue(),
    );

    const hash = generateShareHashParameter(ir.toNossembly(), programInput);
    location.hash = hash;
    navigator.clipboard.writeText(location.href);
  }, [monaco, programInput]);

  const getTypegraphUrl = useCallback(() => {
    if (!monaco) {
      return;
    }

    const editor = monaco.editor.getEditors()[0];

    const ir = getProgram(
      editor.getModel()?.getLanguageId() ?? 'nospace',
      editor.getValue(),
    );

    const typechecker = new Typechecker(ir);
    const errors = typechecker.typecheck(strict);

    if (!typechecker.rootNode) {
      return;
    }

    const code = diagram(
      typechecker.rootNode,
      errors[1]?.errors.map((x) => x.node).filter(Boolean) as EffectGraphNode[],
      errors[1]?.warnings
        .map((x) => x.node)
        .filter(Boolean) as EffectGraphNode[],
    );
    const json = {
      code,
      mermaid: { theme: 'dark' },
      autoSync: true,
      rough: false,
      updateDiagram: true,
      panZoom: true,
    };

    const encoded = new TextEncoder().encode(JSON.stringify(json));
    const compressed = deflate(encoded, { level: 9 });
    const url = `https://mermaid.live/view#pako:${fromUint8Array(compressed, true)}`;
    return url;
  }, [monaco, strict]);

  const value = useMemo(
    () => ({
      programInput,
      setProgramInput,
      programOutput,
      compilerOutput,
      run,
      share,
      getTypegraphUrl,
      strict,
      setStrict,
    }),
    [
      programInput,
      programOutput,
      compilerOutput,
      run,
      share,
      getTypegraphUrl,
      strict,
      setStrict,
    ],
  );

  return (
    <PlaygroundContext.Provider value={value}>
      {children}
    </PlaygroundContext.Provider>
  );
};
