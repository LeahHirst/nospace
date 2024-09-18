import { Instruction } from "./interfaces";

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
