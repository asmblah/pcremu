/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import {
    Backtracker,
    NamedCaptureIndices,
    NamedCaptures,
    NumberedCaptureIndices,
    NumberedCaptures,
} from '../spec/types/match';

const hasOwn = {}.hasOwnProperty;

/**
 * Represents a match against a subject string.
 *
 * This is an internal representation used during matching;
 * once the final result is known it will be returned as a Match instead.
 */
export default class FragmentMatch {
    constructor(
        private position: number,
        private capture: string = '',
        private numberedCaptures: NumberedCaptures = {},
        private namedCaptures: NamedCaptures = {},
        private numberedCaptureIndices: NumberedCaptureIndices = {},
        private namedCaptureIndices: NamedCaptureIndices = {},
        // Default backtracker will always return null (ie. will always fail).
        private backtracker: Backtracker = () => null
    ) {}

    /**
     * Attempts to backtrack from this fragment match one position.
     */
    backtrack(): FragmentMatch | null {
        return this.backtracker(this);
    }

    /**
     * Fetches the entire match.
     */
    getCapture(): string {
        // Note that we cannot fetch the capture with index 0 as it is not defined for FragmentMatches.
        return this.capture;
    }

    /**
     * Fetches the zero-based offset of the end of this match into the subject string.
     */
    getEnd(): number {
        return this.position + this.capture.length;
    }

    /**
     * Fetches the total length of this match.
     */
    getLength(): number {
        return this.capture.length;
    }

    /**
     * Fetches a map from named capture name to indices.
     */
    getNamedCaptureIndices(): NamedCaptureIndices {
        return Object.assign({}, this.namedCaptureIndices);
    }

    /**
     * Fetches a map from named capture name to captured text.
     */
    getNamedCaptures(): NamedCaptures {
        return Object.assign({}, this.namedCaptures);
    }

    /**
     * Fetches a map from numbered capture name to indices.
     */
    getNumberedCaptureIndices(): NumberedCaptureIndices {
        return Object.assign({}, this.numberedCaptureIndices);
    }

    /**
     * Fetches a map from numbered capture name to captured text.
     */
    getNumberedCaptures(): NumberedCaptures {
        return Object.assign({}, this.numberedCaptures);
    }

    /**
     * Fetches the zero-based offset of the start of this match into the subject string.
     */
    getStart(): number {
        return this.position;
    }

    /**
     * Creates a new FragmentMatch with the entire capture stored under the given index,
     * optionally by name too.
     *
     * @param {number} index
     * @param {string=} name
     */
    withCaptureAs(index: number, name?: string): FragmentMatch {
        const numberedCaptures = this.getNumberedCaptures();
        const namedCaptures = this.getNamedCaptures();
        const numberedCaptureIndices = this.getNumberedCaptureIndices();
        const namedCaptureIndices = this.getNamedCaptureIndices();

        // Add the full match as the specified capturing group. Note this may not be 0 for emulated capturing groups.
        numberedCaptures[index] = this.getCapture();
        numberedCaptureIndices[index] = [this.getStart(), this.getEnd()];

        if (name !== undefined) {
            // As above, but for a named capturing group.
            namedCaptures[name] = this.getCapture();
            namedCaptureIndices[name] = [this.getStart(), this.getEnd()];
        }

        return new FragmentMatch(
            this.position,
            this.capture,
            numberedCaptures,
            namedCaptures,
            numberedCaptureIndices,
            namedCaptureIndices,
            this.backtracker
        );
    }

    /**
     * Creates a new FragmentMatch with any of the specified captures backfilled
     * with empty matches if they are missing.
     *
     * @param {Array<number, string>} capturingGroupNames
     */
    withMissingCapturesBackfilled(
        capturingGroupNames: (number | string)[]
    ): FragmentMatch {
        const numberedCaptures = this.getNumberedCaptures();
        const namedCaptures = this.getNamedCaptures();
        const numberedCaptureIndices = this.getNumberedCaptureIndices();
        const namedCaptureIndices = this.getNamedCaptureIndices();

        for (const name of capturingGroupNames) {
            if (typeof name === 'number') {
                const index = name;

                if (!hasOwn.call(numberedCaptures, index)) {
                    numberedCaptures[index] = null;
                    numberedCaptureIndices[index] = [-1, -1];
                }
            } else {
                // As above, but for a named capturing group.
                if (!hasOwn.call(namedCaptures, name)) {
                    namedCaptures[name] = null;
                    namedCaptureIndices[name] = [-1, -1];
                }
            }
        }

        return new FragmentMatch(
            this.position,
            this.capture,
            numberedCaptures,
            namedCaptures,
            numberedCaptureIndices,
            namedCaptureIndices,
            this.backtracker
        );
    }

    /**
     * Creates a new FragmentMatch with the given backtracker.
     *
     * @param {Function} backtracker
     */
    wrapBacktracker(
        backtracker: (
            previousMatch: FragmentMatch,
            previousBacktracker: () => FragmentMatch | null
        ) => FragmentMatch | null
    ): FragmentMatch {
        return new FragmentMatch(
            this.position,
            this.capture,
            this.numberedCaptures,
            this.namedCaptures,
            this.numberedCaptureIndices,
            this.namedCaptureIndices,
            () => backtracker(this, () => this.backtrack())
        );
    }
}
