/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import Pattern from './Pattern';

/**
 * Creates Pattern-related objects.
 */
export default class PatternFactory {
    /**
     * Creates a new Pattern.
     *
     * @param {RegExp} regex
     * @param {Array<number | string>} capturingGroupNames
     * @param {number[]} patternToEmulatedNumberedGroupIndex
     */
    createPattern(
        regex: RegExp,
        capturingGroupNames: Array<number | string>,
        patternToEmulatedNumberedGroupIndex: number[]
    ): Pattern {
        return new Pattern(
            regex,
            capturingGroupNames,
            patternToEmulatedNumberedGroupIndex
        );
    }
}
