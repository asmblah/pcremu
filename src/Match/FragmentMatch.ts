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
    Capture,
    NamedCaptureIndices,
    NamedCaptures,
    NumberedCaptureIndices,
    NumberedCaptures,
} from '../spec/types/match';
import FragmentMatchInterface from './FragmentMatchInterface';
import FragmentMatchTree from './FragmentMatchTree';

const hasOwn = {}.hasOwnProperty;

/**
 * Represents a match of a pattern fragment against a subject string.
 *
 * This is an internal representation used during matching;
 * once the final result is known it will be returned as a Match instead.
 */
export default class FragmentMatch implements FragmentMatchInterface {
    constructor(
        private position: number,
        private capture: string = '',
        private numberedCaptures: NumberedCaptures = {},
        private namedCaptures: NamedCaptures = {},
        private numberedCaptureIndices: NumberedCaptureIndices = {},
        private namedCaptureIndices: NamedCaptureIndices = {},
        // Default backtracker will always return null (ie. will always fail).
        private backtracker: Backtracker = () => null,
    ) {}

    /**
     * @inheritDoc
     */
    backtrack(): FragmentMatchInterface | null {
        return this.backtracker(this);
    }

    /**
     * @inheritDoc
     */
    getCapture(): string {
        // Note that we cannot fetch the capture with index 0 as it is not defined for FragmentMatches.
        return this.capture;
    }

    /**
     * @inheritDoc
     */
    getEnd(): number {
        return this.position + this.capture.length;
    }

    /**
     * @inheritDoc
     */
    getLength(): number {
        return this.capture.length;
    }

    /**
     * @inheritDoc
     */
    getNamedCaptureIndices(): NamedCaptureIndices {
        return Object.assign({}, this.namedCaptureIndices);
    }

    /**
     * @inheritDoc
     */
    getNamedCaptures(): NamedCaptures {
        return Object.assign({}, this.namedCaptures);
    }

    /**
     * @inheritDoc
     */
    getNumberedCapture(index: number): Capture {
        return this.numberedCaptures[index] ?? null;
    }

    /**
     * @inheritDoc
     */
    getNumberedCaptureIndices(): NumberedCaptureIndices {
        return Object.assign({}, this.numberedCaptureIndices);
    }

    /**
     * @inheritDoc
     */
    getNumberedCaptures(): NumberedCaptures {
        return Object.assign({}, this.numberedCaptures);
    }

    /**
     * @inheritDoc
     */
    getStart(): number {
        return this.position;
    }

    /**
     * @inheritDoc
     */
    withCaptureAs(index: number, name?: string): FragmentMatchInterface {
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
            this.backtracker,
        );
    }

    /**
     * @inheritDoc
     */
    withMissingCapturesBackfilled(
        capturingGroupNames: (number | string)[],
    ): FragmentMatchInterface {
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
            this.backtracker,
        );
    }

    /**
     * @inheritDoc
     */
    withSubsequentMatches(
        subsequentMatchFragments: FragmentMatchInterface[],
    ): FragmentMatchInterface {
        const fragmentMatches = [this, ...subsequentMatchFragments];
        const lastMatch = fragmentMatches[fragmentMatches.length - 1];

        return new FragmentMatchTree(this.position, fragmentMatches, () =>
            lastMatch.backtrack(),
        );
    }

    /**
     * @inheritDoc
     */
    wrapBacktracker(
        backtracker: (
            previousMatch: FragmentMatchInterface,
            previousBacktracker: () => FragmentMatchInterface | null,
        ) => FragmentMatchInterface | null,
    ): FragmentMatchInterface {
        return new FragmentMatch(
            this.position,
            this.capture,
            this.numberedCaptures,
            this.namedCaptures,
            this.numberedCaptureIndices,
            this.namedCaptureIndices,
            () => backtracker(this, () => this.backtrack()),
        );
    }
}
