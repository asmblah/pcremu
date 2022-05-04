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

/**
 * Inner pattern matching logic for a Matcher.
 *
 * Allows the logic for matching a pattern once to be in one place,
 * with multiple matching handled by the wrapper Matcher.
 */
export default class Pattern {
    constructor(
        private regex: RegExp,
        private capturingGroupNames: Array<number | string>
    ) {}

    /**
     * Fetches all numbered and named capturing group names for the pattern,
     * in the order they are defined.
     *
     * Note that named capturing groups also appear by their index.
     */
    getCapturingGroupNames(): Array<number | string> {
        return this.capturingGroupNames;
    }

    /**
     * Attempts to match against the given subject string.
     *
     * @param {string} subject
     * @param {number=} start
     */
    match(subject: string, start = 0): Match | null {
        // Note we use the "g" flag to ensure matches can only start at or after the given start offset.
        this.regex.lastIndex = start;

        const match = this.regex.exec(
            subject
        ) as IndexCapturingRegExpMatchArray;

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
