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
import { Typechecker } from '@repo/typecheck/index';
import { Program } from '@repo/nose/index';
import { generateShareHashParameter, getSharedCode } from './utils/share';

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
};

const PlaygroundContext = createContext<PlaygroundContextType>({
  programInput: '',
  setProgramInput: () => {},
  programOutput: '',
  compilerOutput: [],
  run: () => {},
  share: () => {},
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
      typechecker.typecheck();

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

    setCompilerOutput([{ type: 'success', message: 'Success' }]);

    const program = new Program(ir, programInput);
    const output = program.execute();
    setProgramOutput(output);
  }, [monaco]);

  const share = useCallback(() => {
    if (!monaco) {
      return;
    }

    const editor = monaco.editor.getEditors()[0];

    const hash = generateShareHashParameter(editor.getValue(), programInput);
    location.hash = hash;
  }, [monaco, programInput]);

  const value = useMemo(
    () => ({
      programInput,
      setProgramInput,
      programOutput,
      compilerOutput,
      run,
      share,
    }),
    [programInput, programOutput, compilerOutput, run, share],
  );

  return (
    <PlaygroundContext.Provider value={value}>
      {children}
    </PlaygroundContext.Provider>
  );
};
