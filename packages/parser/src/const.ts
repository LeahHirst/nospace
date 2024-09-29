import { Instruction } from "./interfaces";

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
