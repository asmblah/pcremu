# PCREmu

[![Build Status](https://github.com/asmblah/pcremu/workflows/CI/badge.svg)](https://github.com/asmblah/pcremu/actions?query=workflow%3ACI)

PCRE emulation for JavaScript.

## Usage

Example usage if consuming from outside an ES module:

```shell
$ npm i pcremu
```

```javascript
const pcremu = require('pcremu').default;

// Create a matcher for your regex.
const matcher = pcremu.compile('^something');

// Match the regex against your input string.
const match = matcher.matchOne('something here');

console.log(match.getCaptureCount()); // Outputs "1".
console.log(match.getLength()); // Outputs "9" (the length of the word "something").
```

See also
--------
- [XRegExp](http://xregexp.com/)
