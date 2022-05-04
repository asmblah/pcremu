/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { Context } from './spec/intermediateToPattern';
import IntermediateRepresentation from './IntermediateRepresentation';
import Pattern from './Pattern';

/**
 * Compiles the Intermediate Representation (IR) of a regular expression to a Pattern instance.
 */
export default class IntermediateToPatternCompiler {
    constructor(private intermediateToPatternTranspiler: any) {}

    /**
     * Compiles the given IR to a Pattern.
     *
     * @param {IntermediateRepresentation} intermediateRepresentation
     */
    compile(intermediateRepresentation: IntermediateRepresentation): Pattern {
        // Note we include "0" as the entire match is always captured as group 0.
        const capturingGroupNames: Array<number | string> = [0];
        let capturingGroupCount = 1;

        const context: Context = {
            /**
             * @inheritDoc
             */
            addNamedCapturingGroup(name: number | string) {
                capturingGroupNames.push(name);
                // Named capturing groups are also stored by their index.
                capturingGroupNames.push(capturingGroupCount++);
            },
            /**
             * @inheritDoc
             */
            addNumberedCapturingGroup() {
                capturingGroupNames.push(capturingGroupCount++);
            },
        };
        const regexPattern = this.intermediateToPatternTranspiler.transpile(
            intermediateRepresentation.getTranspilerRepresentation(),
            context
        );
        const flags = intermediateRepresentation.getFlags();
        // Always include the "d" flag for capture indices/offsets and "g" to allow offset to be specified.
        let nativeFlags = 'dg';

        if (flags.anchored) {
            nativeFlags += 'y'; // Use ES6 "sticky" modifier "y".
        }

        if (flags.multiline) {
            nativeFlags += 'm';
        }

        const regex = new RegExp(regexPattern, nativeFlags);

        return new Pattern(regex, capturingGroupNames);
    }
}
