/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { Flags } from './declarations/types';
import Match from './Match';
import PatternFragment from './Match/Fragment/PatternFragment';
import FragmentMatchTree from './Match/FragmentMatchTree';

/**
 * Inner pattern matching logic for a Matcher.
 *
 * Allows the logic for matching a pattern once to be in one place,
 * with multiple matching handled by the wrapper Matcher.
 */
export default class Pattern {
    constructor(
        private patternFragment: PatternFragment,
        private flags: Flags,
    ) {}

    /**
     * Fetches all numbered and named capturing group names for the pattern,
     * in the order they are defined.
     *
     * Note that named capturing groups also appear by their index.
     */
    getCapturingGroupNames(): Array<number | string> {
        return this.patternFragment.getCapturingGroupNames();
    }

    /**
     * Attempts to match against the given subject string.
     *
     * @param {string} subject
     * @param {number=} start
     */
    match(subject: string, start = 0): Match | null {
        const fragmentMatch = this.patternFragment.match(
            subject,
            start,
            Boolean(this.flags.anchored),
            new FragmentMatchTree(start),
        );

        if (!fragmentMatch) {
            return null;
        }

        // TODO: Use fragmentMatch.withCaptureAs(...)?
        const numberedCaptures = fragmentMatch.getNumberedCaptures();
        const namedCaptures = fragmentMatch.getNamedCaptures();
        const numberedCaptureIndices =
            fragmentMatch.getNumberedCaptureIndices();
        const namedCaptureIndices = fragmentMatch.getNamedCaptureIndices();

        // Add the full match as the special "0" capturing group.
        numberedCaptures[0] = fragmentMatch.getCapture();
        numberedCaptureIndices[0] = [
            fragmentMatch.getStart(),
            fragmentMatch.getEnd(),
        ];

        return new Match(
            numberedCaptures,
            namedCaptures,
            numberedCaptureIndices,
            namedCaptureIndices,
        );
    }

    /**
     * Fetches a string representation of this pattern.
     */
    toString(): string {
        return this.patternFragment.toString();
    }

    /**
     * Fetches a recursive structure representing the pattern's fragments.
     */
    toStructure(): object {
        return this.patternFragment.toStructure();
    }
}
