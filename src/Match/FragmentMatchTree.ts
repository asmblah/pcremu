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
import FragmentMatchInterface from './FragmentMatchInterface';
import FragmentMatch from './FragmentMatch';

const hasOwn = {}.hasOwnProperty;

/**
 * Represents all matches so far of pattern fragments against a subject string.
 *
 * This is an internal representation used during matching;
 * once the final result is known it will be returned as a Match instead.
 */
export default class FragmentMatchTree implements FragmentMatchInterface {
    private position: number;

    constructor(
        position: number,
        private fragmentMatches: FragmentMatchInterface[] = [],
        // Default backtracker will always return null (ie. will always fail).
        private backtracker: Backtracker = () => null,
    ) {
        this.position =
            fragmentMatches.length > 0
                ? fragmentMatches[0].getStart()
                : position;
    }

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
        // Recursively concatenate the capture of all matches together to produce the full capture so far.
        return this.fragmentMatches
            .map((fragmentMatch) => fragmentMatch.getCapture())
            .join('');
    }

    /**
     * @inheritDoc
     */
    getEnd(): number {
        return this.fragmentMatches.length > 0
            ? // For a non-empty match tree, use the end position of the final branch, otherwise:
              this.fragmentMatches[this.fragmentMatches.length - 1].getEnd()
            : // For an empty match tree, use its position as it is zero-length anyway.
              this.position;
    }

    /**
     * @inheritDoc
     */
    getLength(): number {
        return this.getEnd() - this.getStart();
    }

    /**
     * @inheritDoc
     */
    getNamedCaptureIndices(): NamedCaptureIndices {
        return this.fragmentMatches.reduce(
            (indices, fragmentMatch) =>
                // Later fragment matches override the captures of previous ones.
                Object.assign(indices, fragmentMatch.getNamedCaptureIndices()),
            {},
        );
    }

    /**
     * @inheritDoc
     */
    getNamedCaptures(): NamedCaptures {
        return this.fragmentMatches.reduce(
            (captures, fragmentMatch) =>
                // Later fragment matches override the captures of previous ones.
                Object.assign(captures, fragmentMatch.getNamedCaptures()),
            {},
        );
    }

    /**
     * @inheritDoc
     */
    getNumberedCaptureIndices(): NumberedCaptureIndices {
        return this.fragmentMatches.reduce(
            (indices, fragmentMatch) =>
                // Later fragment matches override the captures of previous ones.
                Object.assign(
                    indices,
                    fragmentMatch.getNumberedCaptureIndices(),
                ),
            {},
        );
    }

    /**
     * @inheritDoc
     */
    getNumberedCapture(index: number): string | null {
        for (const fragmentMatch of this.fragmentMatches) {
            const capture = fragmentMatch.getNumberedCapture(index);

            if (capture !== null) {
                return capture;
            }
        }

        return null; // No fragment match has captured for the given group index.
    }

    /**
     * @inheritDoc
     */
    getNumberedCaptures(): NumberedCaptures {
        return this.fragmentMatches.reduce(
            (captures, fragmentMatch) =>
                // Later fragment matches override the captures of previous ones.
                Object.assign(captures, fragmentMatch.getNumberedCaptures()),
            {},
        );
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
            this.getCapture(),
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
            this.getCapture(),
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
        const fragmentMatches = [
            ...this.fragmentMatches,
            ...subsequentMatchFragments,
        ];
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
        return new FragmentMatchTree(this.position, this.fragmentMatches, () =>
            backtracker(this, () => this.backtrack()),
        );
    }
}
