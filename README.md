<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/LeahHirst/nospace/refs/heads/main/.github/assets/logo-dark.svg">
    <img alt="Nospace" src="https://raw.githubusercontent.com/LeahHirst/nospace/refs/heads/main/.github/assets/logo-light.svg" width="230">
  </picture>
</p>

[![GitHub Actions CI](https://github.com/LeahHirst/nospace/workflows/CI/badge.svg)](https://github.com/LeahHirst/nospace/actions?query=workflow%3ACI)
[![npm version](https://badge.fury.io/js/nospace.svg)](https://www.npmjs.com/package/nospace)
[![Downloads](https://img.shields.io/npm/dm/nospace.svg)](https://www.npmjs.com/package/nospace)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/LeahHirst/nospace/badge)](https://securityscorecards.dev/viewer/?uri=github.com/LeahHirst/nospace)

Nospace is an [esoteric programming language](https://en.wikipedia.org/wiki/Esoteric_programming_language) for application-scale [Whitespace](https://esolangs.org/wiki/Whitespace). Nospace adds optional types to Whitespace that support tools for large-scale Whitespace applications. Nospace compiles to readable, standards-based Whitespace.

In addition to types, Nospace provides lexical aliasing of spaces with zero-width spaces (`​`), tabs with zero-width non-joiners (`‌`), and feed lines with zero-width joiners (`‍`). These changes allow for the creation of zero-width, single lined programs for worsened readability.

View the [getting started guide](https://nospacelang.org/getting-started/intro-for-new-programmers/), or try Nospace out in your browser at [the playground](https://nospacelang.org/play)!

## Hello world

The following is a simple hello world program in Nospace:

```
​​​‌​​‌​​​‍‌‍​​​​​‌‌​​‌​‌‍‌‍​​​​​‌‌​‌‌​​‍‌‍​​​​​‌‌​‌‌​​‍‌‍​​​​​‌‌​‌‌‌‌‍‌‍​​​​​‌​‌‌​​‍‌‍​​​​​‌​​​​​‍‌‍​​​​​‌‌‌​‌‌‌‍‌‍​​​​​‌‌​‌‌‌‌‍‌‍​​​​​‌‌‌​​‌​‍‌‍​​​​​‌‌​‌‌​​‍‌‍​​​​​‌‌​​‌​​‍‌‍​​‍‍‍
```

outputs: `Hello, world`

More examples can be found in the [examples directory](https://github.com/LeahHirst/nospace/tree/main/examples).

## Features

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/LeahHirst/nospace/blob/main/.github/assets/feature-dark-main-typecheck.svg">
    <img alt="Static type checking: Nospace understands Whitespace and provides compile-time type checking enabling you to ship with confidence." src="https://github.com/LeahHirst/nospace/blob/main/.github/assets/feature-light-main-typecheck.svg" width="830">
  </picture>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/LeahHirst/nospace/blob/main/.github/assets/feature-dark-main-tooling.svg">
    <img alt="Developer tooling: Nospace provides powerful developer tooling such as invisible autocompletion, the Nossembly assembly language, and Nose, the official runtime of Nospace which works seemlessly across Nospace, Whitespace, and Nossembly." src="https://github.com/LeahHirst/nospace/blob/main/.github/assets/feature-light-main-tooling.svg" width="830">
  </picture>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/LeahHirst/nospace/blob/main/.github/assets/feature-dark-main-underflow.svg">
    <img alt="Underflow? I don't think so!: Identifying the source of stack underflows can be tough. Through the use of non-artificial intelligence, Nospace can identify some situations where underflows are inevitable." src="https://github.com/LeahHirst/nospace/blob/main/.github/assets/feature-light-main-underflow.svg" width="830">
  </picture>
</p>
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/LeahHirst/nospace/blob/main/.github/assets/feature-dark-main-compile.svg">
    <img alt="Clean Whitespace output: Nospace compiles to Whitespace, enabling you to write apps that runs everywhere Whitespace runs: in a browser, on a WiFi-enabled toaster, on a smart home connected bidet, and in your apps." src="https://github.com/LeahHirst/nospace/blob/main/.github/assets/feature-light-main-compile.svg" width="830">
  </picture>
</p>

