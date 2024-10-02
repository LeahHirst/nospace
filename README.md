# nospace

[![GitHub Actions CI](https://github.com/LeahHirst/nospace/workflows/CI/badge.svg)](https://github.com/LeahHirst/nospace/actions?query=workflow%3ACI)
[![npm version](https://badge.fury.io/js/nospace.svg)](https://www.npmjs.com/package/nospace)
[![Downloads](https://img.shields.io/npm/dm/nospace.svg)](https://www.npmjs.com/package/nospace)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/LeahHirst/nospace/badge)](https://securityscorecards.dev/viewer/?uri=github.com/LeahHirst/nospace)

Nospace is an [esoteric programming language](https://en.wikipedia.org/wiki/Esoteric_programming_language) for application-scale [Whitespace](https://esolangs.org/wiki/Whitespace). Nospace adds optional types to Whitespace that support tools for large-scale Whitespace applications. Nospace compiles to readable, standards-based Whitespace.

In addition to types, Nospace provides lexical aliasing of spaces with zero-width spaces (`​`), tabs with zero-width non-joiners (`‌`), and feed lines with zero-width joiners (`‍`). These changes allow for the creation of zero-width, single lined programs for worsened readability.

Try out Nospace in your browser at [the playground](https://nospacelang.org/play)!

## Hello world

The following is a simple hello world program in Nospace:

```
​​​‌​​‌​​​‍‌‍​​​​​‌‌​​‌​‌‍‌‍​​​​​‌‌​‌‌​​‍‌‍​​​​​‌‌​‌‌​​‍‌‍​​​​​‌‌​‌‌‌‌‍‌‍​​​​​‌​‌‌​​‍‌‍​​​​​‌​​​​​‍‌‍​​​​​‌‌‌​‌‌‌‍‌‍​​​​​‌‌​‌‌‌‌‍‌‍​​​​​‌‌‌​​‌​‍‌‍​​​​​‌‌​‌‌​​‍‌‍​​​​​‌‌​​‌​​‍‌‍​​‍‍‍
```

outputs: `Hello, world`

More examples can be found in the [examples directory](https://github.com/LeahHirst/nospace/tree/main/examples).

## Why nospace?

- Compile time static type checking
- Stack underflow protection
- Enhanced readability through the use of zero-width characters

## Type system

Nospace provides a static-type checker which helps to ensure your programs are free of bugs. Nospace adds two new commands on top of Whitespace: Cast and Assert. Cast translates the top item of the stack to the specified type, and Assert asserts that the top item of the stack is of a given type.

There are 4 primitive types provided by nospace, however you may also specify your own. The primative types are:

- `Any` (`‌​‍`),
- `Never` (`‌‌‍`),
- `Int` (`​​‍`),
- `Char` (`​‌‍`)

`Any` is compatible with all types. When an item is pushed to the stack, it defaults to the Any type. Assertions will always succeed when the top item of the stack has an `Any` type.

As Whitespace is a stack based language, there may be situations where there are an indeterminate number of items of certain types on the stack (for example, a program which reads an input string of unknown length). In these scenarios, type checking will succeed so long as one branch would result in the types being consistent for the whole program.

To achieve type checking, nospace uses a graph representation of effects performed on the stack to find effects which are not possible (subtracting an incompatible type from the stack). This allows for states produced from complex control flows to be typed consistently.

Items stored and retrieved in the heap are untyped (i.e. have an `Any` type). Types can be assigned to them when retrieving them from the heap by using the Cast command.

## Roadmap

- [ ] Nospace typechecker/compiler built in Nospace

## Commands

### IMP

There are different types of commands in Nospace, and they all have different Instruction Modification Parameters (IMP), which can be thought of as the category a command falls in. Every command starts with an IMP, followed by the remainder of the command, and followed by parameters, if necessary.

| IMP  | Command            |
| ---- | ------------------ |
| `⁠`  | Types              |
| `‌‍` | I/O                |
| `​`  | Stack manipulation |
| `‌​` | Arithmetic         |
| `‍`  | Flow control       |
| `‌‌` | Heap access        |

### Types

| Commands | Parameters | Meaning                                                                      |
| -------- | ---------- | ---------------------------------------------------------------------------- |
| `⁠​`     | Type       | Casts the top item in the stack to the specified type                        |
| `⁠`      | Type       | Asserts that the top item in the stack is compatible with the specified type |

### Numbers

Numbers start with a sign (`​` for positive or `‌` for negative), then have a sequence of `​` (0) and `‌` (1) representing the number in binary, and end with `‍`. For example, the number 2,482,491,305 can be represented as `​‍‌‍​‍​‍‌‍​‍​‍‌‍‌‍‌‍‌‍‌‍‌‍​‍‌‍‌‍‌‍‌‍‌‍​‍​‍‌‍‌‍‌‍‌‍‌‍​‍‌‍​‍‌‍​‍​‍‌‍`.

### I/O

| Commands | Parameters | Meaning                                                                                                     |
| -------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| `‌​`     | -          | Pop a heap address from the stack, read a character as ASCII, and store that character to that heap address |
| `‌‌`     | -          | Pop a heap address from the stack, read a number, and store that number to that heap address                |
| `​​`     | -          | Pop a number from the stack and output it as an ASCII character                                             |
| `​‌`     | -          | Pop a number from the stack and output it                                                                   |

The general pattern for the IO instructions is that the first character is `‌` when an instruction is for input, and `​` when it's for output. The second character is then `​` for a character, and `‌` for a number.

### Stack manipulation

| Commands‍ | Parameters‍ | Meaning                                                                                 |
| --------- | ----------- | --------------------------------------------------------------------------------------- |
| `​`       | Int         | Push a value to the stack                                                               |
| `‍​‍`     | -‍          | Duplicate the top item on the stack                                                     |
| `‍‌‍`     | -‍          | Swap the top two items on the stack                                                     |
| `‍‍‍`     | -‍          | Discard the top item on the stack                                                       |
| `‌​‍`     | Int         | Copy the nth item on the stack (given by the argument) onto the top of the stack (v0.3) |
| `‌‍‍`     | Int         | Slide n items off the stack, keeping the top item (v0.3)                                |

Note that the copy and slide commands do not persist the type of the copied or retained item. They are instead represented as an Any type.

### Arithmetic

Arithmetic commands operate on the top two items on the stack, and replace them with the result of the operation. The first element pushed is considered to be left of the operator.

| Command | Parameters | Meaning          |
| ------- | ---------- | ---------------- |
| `​​`    | -          | Addition         |
| `​‌`    | -          | Subtraction      |
| `​‍`    | -          | Multiplication   |
| `‌​`    | -          | Integer Division |
| `‌‌`    | -          | Modulo           |

### Flow Control

| Commands | Parameters | Meaning                                                  |
| -------- | ---------- | -------------------------------------------------------- |
| `​​`     | Label      | Mark a location in the program                           |
| `​‌`     | Label      | Call a subroutine                                        |
| `​‍`     | Label      | Jump unconditionally to a label                          |
| `‌​`     | Label      | Jump to a label if the top of the stack is zero          |
| `‌‌`     | Label      | Jump to a label if the top of the stack is negative      |
| `‌‍`     | -          | End a subroutine and transfer control back to the caller |
| `‍‍`     | -          | Ends the program                                         |

Labels are a sequence of `​` and `‌`, ended by `‍`.

### Heap Access

| Command | Parameters | Meaning  |
| ------- | ---------- | -------- |
| `​`     | -          | Store    |
| `‌`     | -          | Retrieve |

Heap access commands look at the stack to find the address of the items to be stored or retrieved. To store a number, the address and value must be pushed in that order, then the store command must be run. To retrieve a number, the address must be pushed and the retrieve command must be run after; this will push the value at the given address to the stack.
