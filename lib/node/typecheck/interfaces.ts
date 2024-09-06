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
}

export const ParameterizedInstructions: Instruction[] = [
  Instruction.Push,
  Instruction.Copy,
  Instruction.Slide,
  Instruction.Label,
  Instruction.Call,
  Instruction.Jump,
  Instruction.JumpZero,
  Instruction.JumpNegative,
  Instruction.Cast,
  Instruction.Assert,
];

export const NumericParameterizedInstructions: Instruction[] = [
  Instruction.Push,
  Instruction.Copy,
  Instruction.Slide,
];

export type Operation = {
  instruction: Instruction;
  argument?: number | string;
};

export enum Type {
  Never = 'ttn',
  Any = 'tsn',
  Int = 'ssn',
  Char = 'stn',
}

export type AddEffect = {
  effectType: 'add';
  type: Type | string;
};

export type SubtractEffect = {
  effectType: 'subtract';
  type: Type | string;
};

export type AssertEffect = {
  effectType: 'assert';
  type: Type | string;
};

export type StackEffect = 
 | AddEffect
 | SubtractEffect
 | AssertEffect;

export type Branch = {
  label?: string;
  effects: StackEffect[];
  nextBranch?: Branch;
  controlFlowBranch?: Branch;
  callsSubroutine?: boolean;
  returns?: boolean;
}
