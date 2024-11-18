---
title: Everyday Types
sidebar:
  order: 12
---

Imagine we have a program which can result in the top item in the stack being one of two types. For example, in this program,

```
Push 1
Cast TypeA

Label A
  Push 1
  Cast TypeB

  # Read a user int and add it to the stack
  Push 1
  ReadInt
  Push 1
  Retrieve

  JumpZero A
  Jump B

Label B
  Pop
  # The top item of the stack is either TypeA or TypeB
```
