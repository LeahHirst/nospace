export enum Instruction {
  ReadChar = 'tnts',
  ReadInt = 'tntt',
  WriteChar = 'tnss',
  WriteInt = 'tnst',
  Push = 'ss',
  Duplicate = 'sns',
  Swap = 'snt',
  Pop = 'snn',
  Copy = 'sts',
  Slide = 'stn',
  Add = 'tsss',
  Subtract = 'tsst',
  Multiply = 'tssn',
  Divide = 'tsts',
  Mod = 'tstt',
  Label = 'nss',
  Call = 'nst',
  Jump = 'nsn',
  JumpZero = 'nts',
  JumpNegative = 'ntt',
  Return = 'ntn',
  End = 'nnn',
  Store = 'tts',
  Retrieve = 'ttt',
  Cast = 'xs',
  Assert = 'xt',
  Unknown = 'unknown',
};

export const LabelledInstructions = [
  Instruction.Label,
  Instruction.Call,
  Instruction.Jump,
  Instruction.JumpZero,
  Instruction.JumpNegative,
  Instruction.Cast,
  Instruction.Assert,
] as const;

export const NumericInstructions = [
  Instruction.Push,
  Instruction.Copy,
  Instruction.Slide,
] as const;

export type OperationMeta = {
  startLn: number;
  endLn: number;
  startCol: number;
  endCol: number;
};

type OperationBase<I extends Instruction, A = undefined> = {
  instruction: I;
  argument: A;
  meta?: OperationMeta;
};

export type NumericOperation = OperationBase<typeof NumericInstructions[number], number>;

export type LabeledOperation = OperationBase<typeof LabelledInstructions[number], string>;

type ParameterizedInstruction = NumericOperation | LabeledOperation;

export type Operation =
  | ParameterizedInstruction
  | OperationBase<Exclude<Instruction, ParameterizedInstruction['instruction']>>;

type Error = {
  message: string;
  meta: OperationMeta; 
};

export type UnknownInstructionError = Error & {
  type: 'unknown_instruction';

};

export type ArgumentError = Error & {
  type: 'argument'
};

export type PragmaError = Error & {
  type: 'pragma';
};

export type ParseError =
  | UnknownInstructionError
  | ArgumentError
  | PragmaError;

export enum Type {
  Never = 'ttn',
  Any = 'tsn',
  Int = 'ssn',
  Char = 'stn',
};

export type TokenMap = Map<string, string>;

export type IRArgs = {
  operations: Operation[];
  tokens: TokenMap;
  parseErrors: ParseError[];
};

export function isNumericInstruction(instruction: Instruction): instruction is typeof NumericInstructions[number] {
  return NumericInstructions.includes(instruction as any);
};

export function isLabelledInstruction(instruction: Instruction): instruction is typeof LabelledInstructions[number] {
  return LabelledInstructions.includes(instruction as any);
};

export function isNumericOperation(operation: Operation): operation is NumericOperation {
  return isNumericInstruction(operation.instruction);
}

export function isLabeledOperation(operation: Operation): operation is LabeledOperation {
  return isLabelledInstruction(operation.instruction);
}
