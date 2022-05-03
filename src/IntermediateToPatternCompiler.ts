/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import Pattern from './Pattern';
import IntermediateRepresentation from './IntermediateRepresentation';

export default class IntermediateToPatternCompiler {
    constructor(private intermediateToPatternTranspiler: any) {}

    compile(intermediateRepresentation: IntermediateRepresentation): Pattern {
        const regexPattern = this.intermediateToPatternTranspiler.transpile(
                intermediateRepresentation.getTranspilerRepresentation()
            ),
            // Always include the "d" flag for capture indices/offsets and "g" to allow offset to be specified.
            regex = new RegExp(regexPattern, 'dg');

        return new Pattern(regex);
    }
}
