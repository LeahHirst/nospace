import { Instruction, type Operation } from '@repo/parser';
import { type StackEffect, Type } from './interfaces';

export function produceStackEffects(
  operation: Operation,
  strictMode = false,
): StackEffect[] {
  const unknownType = strictMode ? Type.Unknown : Type.Any;
  switch (operation.instruction) {
    case Instruction.ReadChar:
    case Instruction.ReadInt: {
      return [
        {
          effectType: 'pop',
          type: Type.Int,
        },
      ];
    }
    case Instruction.WriteChar: {
      return [
        {
          effectType: 'pop',
          type: Type.Char,
        },
      ];
    }
    case Instruction.WriteInt: {
      return [
        {
          effectType: 'pop',
          type: Type.Int,
        },
      ];
    }
    case Instruction.Push: {
      return [
        {
          effectType: 'push',
          type: unknownType,
        },
      ];
    }
    case Instruction.Duplicate: {
      return [
        // Todo:
        // {
        //   effectType: 'copy',
        //   index: 0,
        // },
        {
          effectType: 'push',
          type: unknownType,
        },
      ];
    }
    case Instruction.Swap: {
      return [
        // Todo:
        // {
        //   effectType: 'swap',
        // },
        {
          effectType: 'pop',
          type: Type.Any,
        },
        {
          effectType: 'pop',
          type: Type.Any,
        },
        {
          effectType: 'push',
          type: Type.Any,
        },
        {
          effectType: 'push',
          type: Type.Any,
        },
      ];
    }
    case Instruction.Pop: {
      return [
        {
          effectType: 'pop',
          type: Type.Any,
        },
      ];
    }
    case Instruction.Copy: {
      return [
        // Todo:
        // {
        //   effectType: 'copy',
        //   index: operation.argument as number,
        // },
        {
          effectType: 'push',
          type: Type.Any,
        },
      ];
    }
    case Instruction.Slide: {
      return [
        ...new Array(operation.argument + 1).fill({
          effectType: 'pop',
          type: Type.Any,
        }),
        // Todo:
        // {
        //   effectType: 'copy',
        //   index: operation.argument + 1,
        // },
        {
          effectType: 'push',
          type: Type.Any,
        },
      ];
    }
    case Instruction.Add:
    case Instruction.Subtract:
    case Instruction.Multiply:
    case Instruction.Divide:
    case Instruction.Mod: {
      return [
        {
          effectType: 'pop',
          type: Type.Int,
        },
        {
          effectType: 'pop',
          type: Type.Int,
        },
        {
          effectType: 'push',
          type: Type.Int,
        },
      ];
    }
    case Instruction.JumpZero:
    case Instruction.JumpNegative: {
      return [
        {
          effectType: 'pop',
          type: Type.Int,
        },
      ];
    }
    case Instruction.Store: {
      return [
        {
          effectType: 'pop',
          type: Type.Any,
        },
        {
          effectType: 'pop',
          type: Type.Int,
        },
      ];
    }
    case Instruction.Retrieve: {
      return [
        {
          effectType: 'pop',
          type: Type.Int,
        },
        {
          effectType: 'push',
          type: unknownType,
        },
      ];
    }
    case Instruction.Cast: {
      return [
        {
          effectType: 'pop',
          type: operation.argument as Type,
        },
        {
          effectType: 'push',
          type: operation.argument as Type,
        },
      ];
    }
    case Instruction.Assert: {
      return [
        {
          effectType: 'assert',
          type: operation.argument as Type,
        },
      ];
    }
    default:
      return [];
  }
}
