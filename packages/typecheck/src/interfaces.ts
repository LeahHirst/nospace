import type { Operation, CodeRange } from '@repo/parser';

export enum Type {
  Never = 'ttn',
  Any = 'tsn',
  Int = 'ssn',
  Char = 'stn',
}

export type PushEffect = {
  effectType: 'push';
  type: Type | string;
};

export type PopEffect = {
  effectType: 'pop';
  type: Type | string;
};

export type AssertEffect = {
  effectType: 'assert';
  type: Type | string;
};

export type CopyEffect = {
  effectType: 'copy';
  index: number;
};

export type SwapEffect = {
  effectType: 'swap';
};

export type StackEffect =
  | PushEffect
  | PopEffect
  | AssertEffect
  | CopyEffect
  | SwapEffect;

export type Branch = {
  label?: string;
  operations: Operation[];
  controlFlowBranch?: Branch;
  nextBranch?: Branch;
  callsSubroutine?: boolean;
  returns?: boolean;
};

export type StackEffectNode = {
  effect: StackEffect;
  parents: Set<StackEffectNode>;
  children: Set<StackEffectNode>;
};

type Info = {
  message: string;
  meta: CodeRange;
};

export type AssertionError = Info & {
  type: 'assertion';
};

export type TypeMismatchError = Info & {
  type: 'mismatch';
};

export type TypeError = AssertionError | TypeMismatchError;

export type UnreachableWarning = Info & {
  type: 'unreachable';
};

export type TypeWarning = UnreachableWarning;
