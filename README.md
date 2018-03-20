# d

> Dynamic scope (emulation) in JavaScript

[![Build Status](https://travis-ci.org/futpib/d.svg?branch=master)](https://travis-ci.org/futpib/d) [![Coverage Status](https://coveralls.io/repos/github/futpib/d/badge.svg?branch=master)](https://coveralls.io/github/futpib/d?branch=master) [![Dependency Status](https://dependencyci.com/github/futpib/d/badge)](https://dependencyci.com/github/futpib/d)

## What

Chances are, you never heard of [dynamic scoping](https://en.wikipedia.org/wiki/Scope_(computer_science)#Dynamic_scoping).

But it is similar to other familliar concepts:
* *nix environment variables (ones you get from `process.env`)
* JavaScript's `this` (barely, but still)
* Global constants, except you can override them at call site

## Usage

```js
const d = require('futpib/d');

function log(s) {
    const { output } = d.scope;
    output.write(s);
}

d.const({ output: process.stdin }, () => {
    log('hello');
    // Writes "hello" to standard input
});

d.const({ output: process.stderr }, () => {
    log('world');
    // Writes "world" to standard error
});

const logToFile = s.bind({ output: fs.createWriteStream('log.txt') }, log);

logToFile('fluff');
// Writes "fluff" to 'log.txt' in current directory
```

## Install

```
yarn add @futpib/d
```

or

```
npm install @futpib/d
```
