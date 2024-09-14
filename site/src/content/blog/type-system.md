---
title: Typing without width
---

Whitespace is a stack-based language. Programs written in Whitespace can interact with a stack and a heap.



The key to modelling consistent program states is through the use of graphs. Nospace builds a graph of all changes made to the stack in order to determine whether a . These changes are termed _stack effects_, and can represent actions such as adding and removing specific types from the stack, as well as asserting that the top item in the stack matches a specified type.

## Examples
