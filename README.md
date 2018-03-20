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
const d = require('@futpib/d');

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

const fs = require('fs');

const logToFile = d.bind({ output: fs.createWriteStream('log.txt') }, log);

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

## Performance

Keeping `d.const` and `d.bind`-created function calls outside tight loops seems like a good idea.

Suprisingly, most optimal usage scenario outperforms `this` in this [basic benchmark](https://github.com/futpib/d/blob/master/index.benchmark.js) while the expressivity gain is huge.

```js
// d-style
const sma3 = i => (value(i - 1) + value(i)) / 3;

// this-style
function sma3(i) {
  return (value.call(this, i - 1) + value.call(this, i)) / 3;
}
```

| Test | Speed |
|-|-|
| inner d.bind     | 20,257,621 ops/sec ±0.85%     |
| outer d.const     | 511,502,729 ops/sec ±0.63%      |
| this | 484,485,335 ops/sec ±0.47% |
| factories | 3,611,223 ops/sec ±0.22% |
| no abstraction | 524,651,480 ops/sec ±0.41% |


Check out [index.benchmark.js](https://github.com/futpib/d/blob/master/index.benchmark.js).

Run via `yarn benchmark`.


## Inspirations

* Common Lisp's [defparameter and defvar](http://clhs.lisp.se/Body/m_defpar.htm)
