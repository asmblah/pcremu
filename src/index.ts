/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import Emulator from './Emulator';
import astToIntermediateTranspilerSpec from './spec/astToIntermediate';
import intermediateToPatternTranspilerSpec from './spec/intermediateToPattern';
import parserGrammarSpec from './spec/parserGrammar';
import parsing = require('parsing');
import transpiler = require('transpiler');

const emulator = new Emulator(
    parsing,
    transpiler,
    parserGrammarSpec,
    astToIntermediateTranspilerSpec,
    intermediateToPatternTranspilerSpec
);

export default emulator;
