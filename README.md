# nospace
Nospace is an [esoteric programming language](https://en.wikipedia.org/wiki/Esoteric_programming_language) which compiles to [Whitespace](https://esolangs.org/wiki/Whitespace). Unlike Whitespace, Nospace programs are zero-width and single-lined, replacing spaces with zero-width spaces (`​`), tabs with zero-width non-joiners (`‌`), and feed lines with zero-width joiners (`‍`).

A Nospace compiler written in Whitespace is [provided within this repository](https://github.com/LeahHirst/nospace/blob/main/lib/compiler/nsc.ws), however note that in order to use the compiler the Whitespace interpreter must support reading of UTF-8 string inputs. It is possible to use other Nospace compilers, such as this one written with sed:

```
sed -e 's/\xe2\x80\x8b/ /g' -e 's/\xe2\x80\x8c/\t/g' -e 's/\xe2\x80\x8d/\n/g' hello_world.ns > hello_world.ws
```

## Hello world
The following is a simple hello world program in Nospace:

```
​​​‌​​‌​​​‍‌‍​​​​​‌‌​​‌​‌‍‌‍​​​​​‌‌​‌‌​​‍‌‍​​​​​‌‌​‌‌​​‍‌‍​​​​​‌‌​‌‌‌‌‍‌‍​​​​​‌​‌‌​​‍‌‍​​​​​‌​​​​​‍‌‍​​​​​‌‌‌​‌‌‌‍‌‍​​​​​‌‌​‌‌‌‌‍‌‍​​​​​‌‌‌​​‌​‍‌‍​​​​​‌‌​‌‌​​‍‌‍​​​​​‌‌​​‌​​‍‌‍​​‍‍‍
```

outputs: `Hello, world`

More examples can be found in the [examples directory](https://github.com/LeahHirst/nospace/tree/main/examples).

## Commands

### IMP

There are different types of commands in Nospace, and they all have different Instruction Modification Parameters (IMP), which can be thought of as the category a command falls in. Every command starts with an IMP, followed by the remainder of the command, and followed by parameters, if necessary.

| IMP | Command |
| --- | ------- |
| `‌‍`  | I/O     |
| `​`  | Stack manipulation |
| `‌​`  | Arithmetic |
| `‍`  | Flow control |
| `‌‌`  | Heap access |

### Numbers

Numbers start with a sign (`​` for positive or `‌` for negative), then have a sequence of `​` (0) and `‌` (1) representing the number in binary, and end with `‍`. For example, the number 2,482,491,305 can be represented as `​‍‌‍​‍​‍‌‍​‍​‍‌‍‌‍‌‍‌‍‌‍‌‍​‍‌‍‌‍‌‍‌‍‌‍​‍​‍‌‍‌‍‌‍‌‍‌‍​‍‌‍​‍‌‍​‍​‍‌‍`.


### I/O

| Commands | Parameters | Meaning |
| - | - | - |
| `‌​` | - | Pop a heap address from the stack, read a character as ASCII, and store that character to that heap address | 
| `‌‌` | - | Pop a heap address from the stack, read a number, and store that number to that heap address |
| `​​` | - | Pop a number from the stack and output it as an ASCII character |
| `​‌` | - | Pop a number from the stack and output it |

The general pattern for the IO instructions is that the first character is `‌` when an instruction is for input, and `​` when it's for output. The second character is then `​` for a character, and `‌` for a number.

### Stack manipulation

| Commands‍ | Parameters‍ | Meaning |
| - | - | - |
| `​` | Number‍ | Push a number to the stack |
| `‍​‍` | -‍ | Duplicate the top item on the stack |
| `‍‌‍` | -‍ | Swap the top two items on the stack |
| `‍‍‍` | -‍ | Discard the top item on the stack |
| `‌​‍` | Number‍ | Copy the nth item on the stack (given by the argument) onto the top of the stack (v0.3) |
| `‌‍‍` | Number‍ | Slide n items off the stack, keeping the top item (v0.3) |

### Arithmetic

Arithmetic commands operate on the top two items on the stack, and replace them with the result of the operation. The first element pushed is considered to be left of the operator.

| Command | Parameters | Meaning |
| - | - | - |
| `​​` | - | Addition |
| `​‌` | - | Subtraction |
| `​‍` | - | Multiplication |
| `‌​` | - | Integer Division |
| `‌‌` | - | Modulo |

### Flow Control

| Commands | Parameters | Meaning |
| - | - | - |
| `​​` | Label | Mark a location in the program |
| `​‌` | Label | Call a subroutine |
| `​‍` | Label | Jump unconditionally to a label |
| `‌​` | Label | Jump to a label if the top of the stack is zero |
| `‌‌` | Label | Jump to a label if the top of the stack is negative |
| `‌‍` | - | End a subroutine and transfer control back to the caller |
| `‍‍` | - | Ends the program |

Labels are a sequence of `​` and `‌`, ended by `‍`.

### Heap Access

| Command | Parameters | Meaning |
| - | - | - |
| `​` | - | Store |
| `‌` | - | Retrieve |

Heap access commands look at the stack to find the address of the items to be stored or retrieved. To store a number, the address and value must be pushed in that order, then the store command must be run. To retrieve a number, the address must be pushed and the retrieve command must be run after; this will push the value at the given address to the stack.
