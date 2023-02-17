/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import FragmentInterface from './FragmentInterface';
import FragmentMatch from '../FragmentMatch';
import FragmentMatchInterface from '../FragmentMatchInterface';
import {
    Flags,
    IndexCapturingRegExpExecArray,
    NativeNamedCaptureIndices,
    NativeNamedCaptures,
} from '../../declarations/types';

import EffectiveRegExp from '../../polyfill/RegExp/EffectiveRegExp';
import {
    NamedCaptureIndices,
    NamedCaptures,
    NumberedCaptureIndices,
} from '../../spec/types/match';

// Convert native results with undefined to our API with null to indicate a missing capture or its indices.
const nativeNamedCapturesToInternal = (
    nativeCaptures: NativeNamedCaptures
): NamedCaptures => {
    const captures: NamedCaptures = {};

    for (const name of Object.keys(nativeCaptures)) {
        captures[name] = nativeCaptures[name] ?? null;
    }

    return captures;
};

const nativeNamedCaptureIndicesToInternal = (
    nativeIndices: NativeNamedCaptureIndices
): NamedCaptureIndices => {
    const indices: NamedCaptureIndices = {};

    for (const name of Object.keys(nativeIndices)) {
        indices[name] = nativeIndices[name] ?? null;
    }

    return indices;
};

/**
 * Matches the subject string against a fragment of native JavaScript regex.
 */
export default class NativeFragment implements FragmentInterface {
    constructor(
        private chars: string,
        private patternToEmulatedNumberedGroupIndex: {
            [key: number]: number;
        } = {},
        private flags: Flags = {}
    ) {}

    /**
     * @inheritDoc
     */
    match(
        subject: string,
        position: number,
        isAnchored: boolean
    ): FragmentMatchInterface | null {
        // Always include the "d" flag for capture indices/offsets and "g" to allow offset to be specified.
        let nativeFlags = 'dg';

        if (isAnchored) {
            nativeFlags += 'y';
        }

        if (this.flags.caseless) {
            nativeFlags += 'i';
        }

        if (this.flags.multiline) {
            /**
             * Note that use of "m" mode means we have no assertions that will only
             * match start- or end-of-string. See notes for the backtracking regex below as an example.
             */
            nativeFlags += 'm';
        }

        if (this.flags.dotAll) {
            nativeFlags += 's';
        }

        // TODO: Create & cache these ahead of time in ctor (2x, one for each isAnchored mode) for performance.
        const normalNativeRegex = new EffectiveRegExp(this.chars, nativeFlags);

        const backtrackingRegex = new EffectiveRegExp(
            /**
             * Note we use a negative lookahead rather than "$" to anchor the backtracking regex
             * to the end of the subject string slice, because in multiline mode "$" would also
             * match the end of a line.
             */
            this.chars + '(?![\\s\\S])',
            nativeFlags
        );

        const match = (
            regex: RegExp,
            subjectSlice: string
        ): FragmentMatchInterface | null => {
            // Note we always use the "g" flag to ensure matches can only start at or after the given start offset.
            regex.lastIndex = position;

            const match = regex.exec(
                subjectSlice
            ) as IndexCapturingRegExpExecArray | null;

            if (!match) {
                return null;
            }

            const numberedCaptures: string[] = [];
            const numberedCaptureIndices: NumberedCaptureIndices = {};

            // Map the numbered match captures from the emulated groups in the native regex to the original pattern.
            for (const patternIndexKey of Object.keys(
                this.patternToEmulatedNumberedGroupIndex
            )) {
                const patternIndex = Number(patternIndexKey);
                const emulatedIndex =
                    this.patternToEmulatedNumberedGroupIndex[patternIndex];

                numberedCaptures[patternIndex] = match[emulatedIndex] ?? null;
                numberedCaptureIndices[patternIndex] =
                    match.indices[emulatedIndex] ?? null;
            }

            const namedCaptures = match.groups
                ? nativeNamedCapturesToInternal(match.groups)
                : {};
            const namedCaptureIndices = match.indices.groups
                ? nativeNamedCaptureIndicesToInternal(match.indices.groups)
                : {};

            const capture = match[0];

            return new FragmentMatch(
                regex.lastIndex - capture.length, // Re-read .lastIndex to get the actual position.
                capture,
                numberedCaptures,
                namedCaptures,
                numberedCaptureIndices,
                namedCaptureIndices,
                backtrack
            );
        };

        /**
         * Backtracking logic:
         *
         * - Append an end-of-string anchor "$" to the native regex.
         * - Attempt to match subject string[0...matchEnd+1].
         * - If this fails, the match was maximising so backtracking needs to go backwards
         *   (towards the start of the subject string).
         * - If this succeeds, the match was minimising so backtracking needs to go forwards
         *   (towards the end of the subject string).
         *
         * Backtracking is performed by slicing the subject up for the current backtrack position.
         */

        const initialBacktrack = (
            previousMatch: FragmentMatchInterface
        ): FragmentMatchInterface | null => {
            const backtrackMatch = forwardBacktrack(previousMatch);

            if (backtrackMatch) {
                // Match was minimising - backtracking needs to go forwards.
                currentBacktrack = forwardBacktrack;

                // Note there is no need to call forwardBacktrack() this time - we've already performed one.
                return backtrackMatch;
            }

            // Match was maximising - backtracking needs to go backwards instead.
            currentBacktrack = backwardBacktrack;

            return backwardBacktrack(previousMatch);
        };

        const forwardBacktrack = (
            previousMatch: FragmentMatchInterface
        ): FragmentMatchInterface | null => {
            if (previousMatch.getEnd() === subject.length) {
                // Match is already at end of string: there are no more characters to go.
                return null;
            }

            let endPosition = previousMatch.getEnd() + 1;

            while (endPosition <= subject.length) {
                const subjectSlice = subject.substring(0, endPosition);

                const backtrackedMatch = match(backtrackingRegex, subjectSlice);

                if (backtrackedMatch) {
                    return backtrackedMatch;
                }

                // Backtracked match failed: move forwards by one character.
                endPosition++;
            }

            return null;
        };

        const backwardBacktrack = (
            previousMatch: FragmentMatchInterface
        ): FragmentMatchInterface | null => {
            if (previousMatch.getEnd() === position) {
                // Match is already back at start: there are no more characters to go.
                return null;
            }

            let endPosition = previousMatch.getEnd() - 1;

            while (endPosition > position) {
                const subjectSlice = subject.substring(0, endPosition);

                const backtrackedMatch = match(backtrackingRegex, subjectSlice);

                if (backtrackedMatch) {
                    return backtrackedMatch;
                }

                // Backtracked match failed: move backwards by one character.
                endPosition--;
            }

            return null;
        };

        let currentBacktrack = initialBacktrack;

        const backtrack = (
            previousMatch: FragmentMatchInterface
        ): FragmentMatchInterface | null => {
            return currentBacktrack(previousMatch);
        };

        return match(normalNativeRegex, subject);
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return this.chars;
    }

    /**
     * @inheritDoc
     */
    toStructure(): object {
        return {
            type: 'native',
            chars: this.chars,
            patternToEmulatedNumberedGroupIndex:
                this.patternToEmulatedNumberedGroupIndex,
        };
    }
}
