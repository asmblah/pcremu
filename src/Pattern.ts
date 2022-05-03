/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { IndexCapturingRegExpMatchArray } from './declarations/types';
import Match from './Match';

export default class Pattern {
    constructor(private regex: RegExp) {}

    match(input: string, start = 0): Match | null {
        // Note we use the "g" flag to ensure matches can only start at or after the given start offset.
        this.regex.lastIndex = start;

        const match = this.regex.exec(input) as IndexCapturingRegExpMatchArray;

        if (!match) {
            return null;
        }

        const numberedCaptures = [...match];
        const namedCaptures = match.groups || {};
        const indices = match.indices || [];

        return new Match(numberedCaptures, namedCaptures, indices);
    }

    /**
     * Fetches a string representation of this pattern.
     *
     * Note that in future versions there may not be one single native regex,
     * so this string representation is not guaranteed to also be a valid JavaScript regex.
     */
    toString(): string {
        return String(this.regex);
    }
}
