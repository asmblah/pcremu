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
import {
    Flags,
    IndexCapturingRegExpExecArray,
    RegExpMatchArrayIndices,
} from '../../declarations/types';

/**
 * Matches the subject string against a fragment of native JavaScript regex.
 */
export default class NativeFragment implements FragmentInterface {
    constructor(
        private chars: string,
        private patternToEmulatedNumberedGroupIndex: {
            [key: number]: number;
        },
        private flags: Flags
    ) {}

    /**
     * @inheritDoc
     */
    match(
        subject: string,
        position: number,
        isAnchored: boolean
    ): FragmentMatch | null {
        // Always include the "d" flag for capture indices/offsets and "g" to allow offset to be specified.
        let nativeFlags = 'dg';

        if (isAnchored) {
            nativeFlags += 'y';
        }

        if (this.flags.caseless) {
            nativeFlags += 'i';
        }

        if (this.flags.multiline) {
            nativeFlags += 'm'; // FIXME: See note below re. multiline and "$".
        }

        if (this.flags.dotAll) {
            nativeFlags += 's';
        }

        const normalNativeRegex = new RegExp(this.chars, nativeFlags);

        // Ensure we never use native multiline mode, as $ must always match end-of-string only
        // in order for backtracking logic to work.
        // FIXME: Use a lookahead instead or in conjunction with "$" to allow native multiline
        //        mode to be used while still supporting end-of-string here.
        const backtrackingRegex = new RegExp(this.chars + '$', nativeFlags);

        const match = (
            regex: RegExp,
            subjectSlice: string
        ): FragmentMatch | null => {
            // Note we always use the "g" flag to ensure matches can only start at or after the given start offset.
            regex.lastIndex = position;

            const match = regex.exec(
                subjectSlice
            ) as IndexCapturingRegExpExecArray | null;

            if (!match) {
                return null;
            }

            const numberedCaptures: string[] = [];
            const numberedCaptureIndices: RegExpMatchArrayIndices =
                [] as unknown as RegExpMatchArrayIndices;

            // Map the numbered match captures from the emulated groups in the native regex to the original pattern.
            for (const patternIndexKey of Object.keys(
                this.patternToEmulatedNumberedGroupIndex
            )) {
                const patternIndex = Number(patternIndexKey);
                const emulatedIndex =
                    this.patternToEmulatedNumberedGroupIndex[patternIndex];

                numberedCaptures[patternIndex] = match[emulatedIndex];
                numberedCaptureIndices[patternIndex] =
                    match.indices[emulatedIndex];
            }

            const namedCaptures = match.groups || {};
            const namedCaptureIndices = match.indices.groups;

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
            previousMatch: FragmentMatch
        ): FragmentMatch | null => {
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
            previousMatch: FragmentMatch
        ): FragmentMatch | null => {
            if (previousMatch.getEnd() === subject.length) {
                // Match is already at end of string: there are no more characters to go.
                return null;
            }

            const subjectSlice = subject.substring(
                0,
                previousMatch.getLength() + 1
            );

            return match(backtrackingRegex, subjectSlice);
        };

        const backwardBacktrack = (
            previousMatch: FragmentMatch
        ): FragmentMatch | null => {
            if (previousMatch.getEnd() === position) {
                // Match is already back at start: there are no more characters to go.
                return null;
            }

            const subjectSlice = subject.substring(
                0,
                previousMatch.getLength() - 1
            );

            return match(backtrackingRegex, subjectSlice);
        };

        let currentBacktrack = initialBacktrack;

        const backtrack = (
            previousMatch: FragmentMatch
        ): FragmentMatch | null => {
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
