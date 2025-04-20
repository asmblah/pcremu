/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="declarations/modules.d.ts" />

import Emulator from './Emulator';
import accelerateRawPassSpec from './spec/intermediateOptimiser/accelerateRawPass';
import astToIntermediateTranspilerSpec from './spec/astToIntermediate';
import compileRawPassSpec from './spec/intermediateOptimiser/compileRawPass';
import intermediateToPatternTranspilerSpec from './spec/intermediateToPattern';
import parserGrammarSpec from './spec/parserGrammar';
import parsing = require('parsing');
import transpiler = require('transpiler');

const emulator = new Emulator(
    parsing,
    transpiler,
    parserGrammarSpec,
    astToIntermediateTranspilerSpec,
    [accelerateRawPassSpec, compileRawPassSpec],
    intermediateToPatternTranspilerSpec
);

// Library entrypoint.
export default emulator;
