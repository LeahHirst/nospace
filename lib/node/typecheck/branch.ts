import { Branch, Instruction, Operation, Type } from "./interfaces";
import { parseNumber } from "./utils/normalization";

export function extractBranches(operations: Operation[]) {
  const branches: Branch[] = [{
    effects: [],
  }];
  let currentBranch = branches[0];
  for (const labelOp of operations.filter(op => op.instruction === Instruction.Label)) {
    branches.push({
      label: labelOp.argument as string,
      effects: [],
    });
  }

  for (const operation of operations) {
    switch(operation.instruction) {
      case Instruction.Label: {
        const newBranch = branches.find(x => x.label === operation.argument)!;
        currentBranch.nextBranch = newBranch;
        branches.push(currentBranch);
        currentBranch = newBranch;
        continue;
      }
      case Instruction.Add:
      case Instruction.Subtract:
      case Instruction.Multiply:
      case Instruction.Divide:
      case Instruction.Mod: {
        currentBranch.effects.push(
          {
            effectType: 'subtract',
            type: Type.Int,
          },
          {
            effectType: 'subtract',
            type: Type.Int,
          },
          {
            effectType: 'subtract',
            type: Type.Int,
          }
        );
        continue;
      }
      case Instruction.Copy: {
        currentBranch.effects.push(
          {
            effectType: 'add',
            type: Type.Any,
          }
        );
        continue;
      }
      case Instruction.Pop: {
        currentBranch.effects.push(
          {
            effectType: 'subtract',
            type: Type.Any,
          }
        );
        continue;
      }
      case Instruction.Push: {
        currentBranch.effects.push(
          {
            effectType: 'add',
            type: Type.Any,
          }
        );
        continue;
      }
      case Instruction.Slide: {
        const number = parseNumber(operation.argument as string);
        currentBranch.effects.push(
          ...new Array(number).fill({
            effectType: 'subtract',
            type: Type.Any,
          })
        );
        continue;
      }
      case Instruction.Duplicate: {
        currentBranch.effects.push(
          {
            effectType: 'add',
            type: Type.Any,
          },
        );
        continue;
      }
      case Instruction.WriteChar: {
        currentBranch.effects.push(
          {
            effectType: 'subtract',
            type: Type.Char,
          }
        );
        continue;
      }
      case Instruction.WriteInt: {
        currentBranch.effects.push(
          {
            effectType: 'subtract',
            type: Type.Int,
          },
        );
        continue;
      }
      case Instruction.Swap: {
        currentBranch.effects.push(
          {
            effectType: 'subtract',
            type: Type.Any,
          },
          {
            effectType: 'subtract',
            type: Type.Any,
          },
          {
            effectType: 'add',
            type: Type.Any,
          },
          {
            effectType: 'add',
            type: Type.Any,
          },
        );
        continue;
      }
      case Instruction.Retrieve: {
        currentBranch.effects.push(
          {
            effectType: 'subtract',
            type: Type.Int,
          },
          {
            effectType: 'add',
            type: Type.Any,
          },
        );
        continue;
      }
      case Instruction.ReadChar: {
        currentBranch.effects.push(
          {
            effectType: 'subtract',
            type: Type.Int,
          },
        );
        continue;
      }
      case Instruction.ReadInt: {
        currentBranch.effects.push(
          {
            effectType: 'subtract',
            type: Type.Int,
          },
        );
        continue;
      }
      case Instruction.Call: {
        const newBranch = {
          effects: [],
        };
        currentBranch.nextBranch = newBranch;
        currentBranch.controlFlowBranch = branches.find(branch => branch.label === operation.argument)!;
        currentBranch.callsSubroutine = true;
        branches.push(currentBranch);
        currentBranch = newBranch;
        continue;
      }
      case Instruction.Jump: {
        const labelledBranch = branches.find(branch => branch.label === operation.argument)!;
        currentBranch.nextBranch = labelledBranch;
        branches.push(currentBranch);
        currentBranch = {
          effects: [],
        };
        continue;
      }
      case Instruction.JumpZero:
      case Instruction.JumpNegative: {
        const labelledBranch = branches.find(branch => branch.label === operation.argument)!;
        currentBranch.controlFlowBranch = labelledBranch;
        currentBranch.effects.push({
          effectType: 'subtract',
          type: Type.Int,
        })
        const newBranch = {
          effects: [],
        };
        currentBranch.nextBranch = newBranch;
        branches.push(currentBranch);
        currentBranch = newBranch;
        continue;
      }
      case Instruction.Return: {
        currentBranch.returns = true;
        branches.push(currentBranch);
        currentBranch = {
          effects: [],
        };
      }
      case Instruction.Store: {
        currentBranch.effects.push(
          {
            effectType: 'subtract',
            type: Type.Any,
          },
          {
            effectType: 'subtract',
            type: Type.Int,
          },
        );
        continue;
      }
      case Instruction.End: {
        branches.push(currentBranch);
        currentBranch = {
          effects: [],
        };
        continue;
      }
      case Instruction.Cast: {
        currentBranch.effects.push(
          {
            effectType: 'subtract',
            type: Type.Any,
          },
          {
            effectType: 'add',
            type: operation.argument as string,
          }
        );
        continue;
      }
      case Instruction.Assert: {
        currentBranch.effects.push(
          {
            effectType: 'assert',
            type: operation.argument as string,
          }
        );
        continue;
      }
    }
  }
  branches.push(currentBranch);
  return branches;
}
