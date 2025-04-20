/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import FragmentInterface from './Fragment/FragmentInterface';
import FragmentMatchInterface from './FragmentMatchInterface';
import FragmentMatchTree from './FragmentMatchTree';
import { Backtracker, Processor } from '../spec/types/match';

/**
 * Helper class with methods used during matching.
 */
export default class FragmentMatcher {
    /**
     * Matches the given set of component fragments in order, to a single FragmentMatch
     * (or null if the match fails).
     *
     * @param {string} subject
     * @param {number} position
     * @param {boolean} isAnchored
     * @param {FragmentInterface[]} componentFragments
     * @param {FragmentMatchInterface} existingMatch
     * @param {Processor=} processor Called for the initial match and any backtracked match.
     */
    matchComponents(
        subject: string,
        position: number,
        isAnchored: boolean,
        componentFragments: FragmentInterface[],
        existingMatch: FragmentMatchInterface,
        processor: Processor = (match: FragmentMatchInterface) => match,
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
                    isAnchored || componentMatches.length > 0,
                    existingMatch.withSubsequentMatches(componentMatches),
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

            return new FragmentMatchTree(
                position,
                componentMatches,
                (): FragmentMatchInterface | null => {
                    if (!backtrack()) {
                        return null;
                    }

                    // Continue forward again from the place we've backtracked to.
                    return tryNextComponent();
                },
            );
        };

        const match = tryNextComponent();

        const backtrackResult = (
            previousMatch: FragmentMatchInterface,
            previousBacktracker: Backtracker,
        ): FragmentMatchInterface | null => {
            const backtrackedMatch = previousBacktracker(previousMatch);

            if (!backtrackedMatch) {
                return null;
            }

            return processMatch(backtrackedMatch);
        };

        const processMatch = (
            match: FragmentMatchInterface,
        ): FragmentMatchInterface =>
            processor(match).wrapBacktracker(backtrackResult);

        return match ? processMatch(match) : null;
    }
}
