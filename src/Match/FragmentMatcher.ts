/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import FragmentInterface from './Fragment/FragmentInterface';
import FragmentMatch from './FragmentMatch';
import FragmentMatchInterface from './FragmentMatchInterface';
import {
    Backtracker,
    NamedCaptureIndices,
    NamedCaptures,
    NumberedCaptureIndices,
    NumberedCaptures,
} from '../spec/types/match';

/**
 * Helper class with methods used during matching.
 */
export default class FragmentMatcher {
    /**
     * Joins all the given matches together into a single FragmentMatch.
     *
     * @param {FragmentMatchInterface[]} matches
     * @param {number} position
     * @param {Function} backtracker
     */
    concatenateMatches(
        matches: FragmentMatchInterface[],
        position: number,
        backtracker: Backtracker
    ): FragmentMatchInterface {
        position = matches.length > 0 ? matches[0].getStart() : position;
        let capture = '';
        const namedCaptures: NamedCaptures = {};
        const namedCaptureIndices: NamedCaptureIndices = {};
        const numberedCaptures: NumberedCaptures = {};
        const numberedCaptureIndices: NumberedCaptureIndices = {};

        for (const match of matches) {
            capture += match.getCapture();

            Object.assign(numberedCaptures, match.getNumberedCaptures());
            Object.assign(namedCaptures, match.getNamedCaptures());
            Object.assign(
                numberedCaptureIndices,
                match.getNumberedCaptureIndices()
            );
            Object.assign(namedCaptureIndices, match.getNamedCaptureIndices());
        }

        return new FragmentMatch(
            position,
            capture,
            numberedCaptures,
            namedCaptures,
            numberedCaptureIndices,
            namedCaptureIndices,
            backtracker
        );
    }

    /**
     * Matches the given set of component fragments in order, to a single FragmentMatch
     * (or null if the match fails).
     *
     * @param {string} subject
     * @param {number} position
     * @param {boolean} isAnchored
     * @param {FragmentInterface[]} componentFragments
     */
    matchComponents(
        subject: string,
        position: number,
        isAnchored: boolean,
        componentFragments: FragmentInterface[]
    ): FragmentMatchInterface | null {
        const componentMatches: FragmentMatchInterface[] = [];

        const backtrack = (): boolean => {
            if (componentMatches.length === 0) {
                return false; // We were processing the first component in the list, no backtracking is possible.
            }

            while (componentMatches.length > 0) {
                const previousMatch =
                    componentMatches.pop() as FragmentMatchInterface;

                const backtrackedMatch = previousMatch.backtrack();

                if (backtrackedMatch) {
                    // Replace with the backtracked match in our record.
                    componentMatches.push(backtrackedMatch);

                    // We've succeeded in backtracking, don't attempt to backtrack further.
                    break;
                }
            }

            if (componentMatches.length === 0) {
                // We backtracked all the way to the first component and still failed,
                // no further backtracking is possible.
                return false;
            }

            const backtrackedMatch =
                componentMatches[componentMatches.length - 1];

            // Continue forward again from the place we've backtracked to.
            position = backtrackedMatch.getEnd();

            return true; // We have successfully backtracked.
        };

        const tryNextComponent = (): FragmentMatchInterface | null => {
            while (componentMatches.length < componentFragments.length) {
                const componentFragment =
                    componentFragments[componentMatches.length];

                const match = componentFragment.match(
                    subject,
                    position,
                    isAnchored || componentMatches.length > 0
                );

                if (match) {
                    // Match succeeded: save it and move to the next component.
                    componentMatches.push(match);

                    position = match.getEnd();

                    continue;
                }

                // Otherwise, the match failed, and so we need to try and backtrack...
                if (!backtrack()) {
                    return null;
                }
            }

            return this.concatenateMatches(
                componentMatches,
                position,
                (): FragmentMatchInterface | null => {
                    if (!backtrack()) {
                        return null;
                    }

                    // Continue forward again from the place we've backtracked to.
                    return tryNextComponent();
                }
            );
        };

        return tryNextComponent();
    }
}
