/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import IntermediateRepresentation from './IntermediateRepresentation';

/**
 * Optimises the Intermediate Representations (IR) of a regular expression,
 * applying a series of passes to produce a new IR if possible.
 */
export default class IntermediateOptimiser {
    constructor(private intermediatePassTranspilers: any[]) {}

    /**
     * Optimises the given IR to a new IR if possible.
     *
     * @param {IntermediateRepresentation} intermediateRepresentation
     */
    optimise(
        intermediateRepresentation: IntermediateRepresentation,
    ): IntermediateRepresentation {
        let optimisedTranspilerRepresentation =
            intermediateRepresentation.getTranspilerRepresentation();

        for (const passTranspiler of this.intermediatePassTranspilers) {
            optimisedTranspilerRepresentation = passTranspiler.transpile(
                optimisedTranspilerRepresentation,
            );
        }

        return new IntermediateRepresentation(
            optimisedTranspilerRepresentation,
            intermediateRepresentation.getPattern(),
            intermediateRepresentation.getFlags(),
        );
    }
}
