/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import FragmentMatcher from './Match/FragmentMatcher';
import IntermediateRepresentation from './IntermediateRepresentation';
import Pattern from './Pattern';
import PatternFactory from './PatternFactory';
import PatternFragment from './Match/Fragment/PatternFragment';
import QuantifierMatcher from './Match/QuantifierMatcher';

/**
 * Compiles the Intermediate Representation (IR) of a regular expression to a Pattern instance.
 */
export default class IntermediateToPatternCompiler {
    constructor(
        private patternFactory: PatternFactory,
        private fragmentMatcher: FragmentMatcher,
        private quantifierMatcher: QuantifierMatcher,
        private intermediateToPatternTranspiler: any,
    ) {}

    /**
     * Compiles the given IR to a Pattern.
     *
     * @param {IntermediateRepresentation} intermediateRepresentation
     */
    compile(intermediateRepresentation: IntermediateRepresentation): Pattern {
        const flags = intermediateRepresentation.getFlags();
        const context = {
            flags,
            fragmentMatcher: this.fragmentMatcher,
            quantifierMatcher: this.quantifierMatcher,
        };
        const patternFragment = this.intermediateToPatternTranspiler.transpile(
            intermediateRepresentation.getTranspilerRepresentation(),
            context,
        ) as PatternFragment;

        return this.patternFactory.createPattern(patternFragment, flags);
    }
}
