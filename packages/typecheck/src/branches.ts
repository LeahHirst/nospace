import { Instruction, type Operation } from '@repo/parser';
import type { Branch } from './interfaces';

export function extractBranches(operations: Operation[]): Branch[] {
  let currentBranch: Branch = {
    operations: [],
  };

  const labelledBranches: Branch[] = operations
    .filter((x) => x.instruction === Instruction.Label)
    .map((x) => ({
      label: x.argument as string,
      operations: [],
    }));

  const branches: Branch[] = [];

  for (const operation of operations) {
    switch (operation.instruction) {
      case Instruction.Label: {
        const newBranch = labelledBranches.find(
          (x) => x.label === operation.argument,
        )!;
        currentBranch.nextBranch = newBranch;
        branches.push(currentBranch);
        currentBranch = newBranch;
        break;
      }
      case Instruction.Call: {
        const newBranch = {
          operations: [],
        };
        currentBranch.nextBranch = newBranch;
        currentBranch.controlFlowBranch = labelledBranches.find(
          (branch) => branch.label === operation.argument,
        );
        currentBranch.callsSubroutine = true;
        branches.push(currentBranch);
        currentBranch = newBranch;
        break;
      }
      case Instruction.Return: {
        const newBranch = {
          operations: [],
        };
        currentBranch.returns = true;
        branches.push(currentBranch);
        currentBranch = newBranch;
        break;
      }
      case Instruction.Jump: {
        const labelledBranch = labelledBranches.find(
          (branch) => branch.label === operation.argument,
        );
        currentBranch.nextBranch = labelledBranch;
        branches.push(currentBranch);
        currentBranch = {
          operations: [],
        };
        break;
      }
      case Instruction.JumpZero:
      case Instruction.JumpNegative: {
        const labelledBranch = labelledBranches.find(
          (branch) => branch.label === operation.argument,
        );
        currentBranch.operations.push(operation);
        currentBranch.controlFlowBranch = labelledBranch;
        const newBranch = {
          operations: [],
        };
        currentBranch.nextBranch = newBranch;
        branches.push(currentBranch);
        currentBranch = newBranch;
        break;
      }
      case Instruction.End: {
        branches.push(currentBranch);
        currentBranch = {
          operations: [],
        };
        break;
      }
      default: {
        currentBranch.operations.push(operation);
        break;
      }
    }
  }

  branches.push(currentBranch);

  return branches;
}
