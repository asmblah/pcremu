/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import {
    NamedCaptureIndices,
    NamedCaptures,
    NumberedCaptureIndices,
    NumberedCaptures,
} from '../spec/types/match';

/**
 * Represents a match of a pattern fragment against a subject string.
 *
 * This is an internal representation used during matching;
 * once the final result is known it will be returned as a Match instead.
 */
export default interface FragmentMatchInterface {
    /**
     * Attempts to backtrack from this fragment match one position.
     */
    backtrack(): FragmentMatchInterface | null;

    /**
     * Fetches the entire match.
     */
    getCapture(): string;

    /**
     * Fetches the zero-based offset of the end of this match into the subject string.
     */
    getEnd(): number;

    /**
     * Fetches the total length of this match.
     */
    getLength(): number;

    /**
     * Fetches a map from named capture name to indices.
     */
    getNamedCaptureIndices(): NamedCaptureIndices;

    /**
     * Fetches a map from named capture name to captured text.
     */
    getNamedCaptures(): NamedCaptures;

    /**
     * Fetches a map from numbered capture name to indices.
     */
    getNumberedCaptureIndices(): NumberedCaptureIndices;

    /**
     * Fetches a map from numbered capture name to captured text.
     */
    getNumberedCaptures(): NumberedCaptures;

    /**
     * Fetches the zero-based offset of the start of this match into the subject string.
     */
    getStart(): number;

    /**
     * Creates a new FragmentMatch with the entire capture stored under the given index,
     * optionally by name too.
     *
     * @param {number} index
     * @param {string=} name
     */
    withCaptureAs(index: number, name?: string): FragmentMatchInterface;

    /**
     * Creates a new FragmentMatch with any of the specified captures backfilled
     * with empty matches if they are missing.
     *
     * @param {Array<number, string>} capturingGroupNames
     */
    withMissingCapturesBackfilled(
        capturingGroupNames: (number | string)[]
    ): FragmentMatchInterface;

    /**
     * Creates a new FragmentMatch with the given backtracker.
     *
     * @param {Function} backtracker
     */
    wrapBacktracker(
        backtracker: (
            previousMatch: FragmentMatchInterface,
            previousBacktracker: () => FragmentMatchInterface | null
        ) => FragmentMatchInterface | null
    ): FragmentMatchInterface;
}
