/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import Match from './Match';
import Pattern from './Pattern';

export default class Matcher {
    constructor(private pattern: Pattern) {}

    /**
     * Attempts to match against the given input string as many times as possible.
     *
     * @param {string} input
     */
    matchAll(input: string): Match[] {
        let match: Match | null;
        const matches: Match[] = [];
        let position = 0;

        while ((match = this.pattern.match(input, position))) {
            matches.push(match);

            if (match.getLength() === 0) {
                break; // Prevent infinite loop if match is zero-width.
            }

            // Start the next match just after this one.
            position = match.getEnd() + 1;
        }

        return matches;
    }

    /**
     * Attempts to match against the given input string once.
     *
     * @param {string} input
     */
    matchOne(input: string): Match | null {
        return this.pattern.match(input);
    }
}
