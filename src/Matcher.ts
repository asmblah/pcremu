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

/**
 * Performs matching against a subject string as specified by a PCRE regex.
 */
export default class Matcher {
    constructor(private pattern: Pattern) {}

    /**
     * Fetches all numbered and named capturing group names for the pattern,
     * in the order they are defined.
     *
     * Note that named capturing groups also appear by their index.
     */
    getCapturingGroupNames(): Array<number | string> {
        return this.pattern.getCapturingGroupNames();
    }

    /**
     * Attempts to match against the given subject string as many times as possible.
     *
     * @param {string} subject
     * @param {number} start
     */
    matchAll(subject: string, start = 0): Match[] {
        let match: Match | null;
        const matches: Match[] = [];
        let position = start;

        while (
            position <= subject.length &&
            (match = this.pattern.match(subject, position))
        ) {
            matches.push(match);

            // Start the next match just after this one.
            position = match.getNextMatchPosition();
        }

        return matches;
    }

    /**
     * Attempts to match against the given subject string once.
     *
     * @param {string} subject
     * @param {number} start
     */
    matchOne(subject: string, start = 0): Match | null {
        return this.pattern.match(subject, start);
    }

    /**
     * Fetches a string representation of the pattern.
     */
    toString(): string {
        return this.pattern.toString();
    }

    /**
     * Fetches a recursive structure representing the pattern's fragments.
     */
    toStructure(): object {
        return this.pattern.toStructure();
    }
}
