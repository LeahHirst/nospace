import { NospaceIR } from '@repo/parser';
import { Instruction, Operation } from '@repo/parser';
import { parseNumber } from './utils';

export class Program {
  private ir: NospaceIR;
  
  private inputBuffer: string;
  
  public output: string = '';
  
  private stack: number[] = [];

  private heap: number[] = [];

  private labelIndices: { [label: string]: number } = {};

  constructor(public code: string, public input: string) {
    this.inputBuffer = input;
    this.ir = NospaceIR.fromNospace(code);
    for (let i = 0; i < this.ir.operations.length; i++) {
      const op = this.ir.operations[i];
      if (op.instruction === Instruction.Label && op.argument) {
        this.labelIndices[op.argument] = i;
      }
    }
  }

  public execute() {
    this.output = '';
    this.inputBuffer = this.input;
    this.stack = [];
    this.heap = [];
    try {
      this.run();
    } catch (e) {
      console.error(e);
    }
    return this.output;
  }

  private run(fromLabel?: string) {
    let instr = fromLabel ? this.labelIndices[fromLabel] : 0;

    let i = 0;
    let op: Operation;
    while ((op = this.ir.operations[instr])) {
      if ([Instruction.Return, Instruction.End].includes(op.instruction)) {
        return;
      }

      instr = this.processOperation(op) ?? instr + 1;
    }
  }

  private processOperation(operation: Operation): void | number {
    switch (operation.instruction) {
      case Instruction.ReadChar: {
        const char = this.inputBuffer[0]?.charCodeAt(0) ?? 0;
        this.inputBuffer = this.inputBuffer.slice(1);
        const addr = this.stack.pop();
        if (!addr) {
          return;
        }
        this.heap[addr] = char;
        return;
      }
      case Instruction.ReadInt: {
        const char = this.inputBuffer[0] === undefined ? 0 : this.inputBuffer[0].charCodeAt(0);
        this.inputBuffer = this.inputBuffer.slice(1);
        const addr = this.stack.pop();
        if (!addr) {
          return;
        }
        this.heap[addr] = char;
        return;
      }
      case Instruction.WriteChar: {
        this.output += String.fromCharCode(this.stack.pop()!);
        return;
      }
      case Instruction.WriteInt: {
        this.output += this.stack.pop();
        return;
      }
      case Instruction.Push: {
        this.stack.push(operation.argument);
        return;
      }
      case Instruction.Duplicate: {
        this.stack.push(this.stack.at(-1)!);
        return;
      }
      case Instruction.Swap: {
        this.stack.splice(this.stack.length - 2, 0, this.stack.pop()!);
        return;
      }
      case Instruction.Pop: {
        this.stack.pop();
        return;
      }
      case Instruction.Copy: {
        this.stack.push(this.stack.at(-1)!);
        return;
      }
      case Instruction.Slide: {
        const number = operation.argument;
        this.stack.splice(this.stack.length - number - 1, number);
        return;
      }
      case Instruction.Add: {
        const a = this.stack.pop()!;
        const b = this.stack.pop()!;
        this.stack.push(a + b);
        return;
      }
      case Instruction.Subtract: {
        const a = this.stack.pop()!;
        const b = this.stack.pop()!;
        this.stack.push(b - a);
        return;
      }
      case Instruction.Multiply: {
        const a = this.stack.pop()!;
        const b = this.stack.pop()!;
        this.stack.push(a * b);
        return;
      }
      case Instruction.Divide: {
        const a = this.stack.pop()!;
        const b = this.stack.pop()!;
        this.stack.push(b / a);
        return;
      }
      case Instruction.Mod: {
        const a = this.stack.pop()!;
        const b = this.stack.pop()!;
        this.stack.push(b % a);
      }
      case Instruction.Call: {
        this.run(operation.argument!);
        return;
      }
      case Instruction.Jump: {
        return this.labelIndices[operation.argument!];
      }
      case Instruction.JumpZero: {
        if (this.stack.pop() === 0) {
          return this.labelIndices[operation.argument!];
        }
        return;
      }
      case Instruction.JumpNegative: {
        if (this.stack.pop()! < 0) {
          return this.labelIndices[operation.argument!];
        }
        return;
      }
      case Instruction.Store: {
        const val = this.stack.pop();
        const addr = this.stack.pop();
        this.heap[addr!] = val!;
        return;
      }
      case Instruction.Retrieve: {
        const addr = this.stack.pop();
        this.stack.push(this.heap[addr!]);
        return;
      }
    }
  }
}
