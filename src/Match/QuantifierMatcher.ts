/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import Exception from '../Exception/Exception';
import FragmentInterface from './Fragment/FragmentInterface';
import FragmentMatchInterface from './FragmentMatchInterface';
import FragmentMatchTree from './FragmentMatchTree';

/**
 * Helper class with methods used specifically by quantifier matchers.
 */
export default class QuantifierMatcher {
    /**
     * Matches the given component with maximising (greedy) match logic.
     *
     * @param {string} subject
     * @param {number} position
     * @param {boolean} isAnchored
     * @param {FragmentInterface} componentFragment
     * @param {number} minimumMatches
     * @param {number|null} maximumMatches
     * @param {FragmentMatchInterface} existingMatch
     * @param {Function} backtracker
     */
    matchMaximising(
        subject: string,
        position: number,
        isAnchored: boolean,
        componentFragment: FragmentInterface,
        minimumMatches: number,
        maximumMatches: number | null,
        existingMatch: FragmentMatchInterface,
        backtracker: (
            matches: FragmentMatchInterface[]
        ) => FragmentMatchInterface | null
    ): FragmentMatchInterface | null {
        let match: FragmentMatchInterface | null;
        const matches: FragmentMatchInterface[] = [];

        while (
            (match = componentFragment.match(
                subject,
                position,
                isAnchored,
                existingMatch.withSubsequentMatches(matches)
            ))
        ) {
            if (maximumMatches !== null && matches.length >= maximumMatches) {
                /*
                 * Maximum reached, don't try to match any more.
                 * Note that it would actually be valid for there to be more matches,
                 * the rest of the pattern is then free to match against them.
                 */
                break;
            }

            matches.push(match);

            // Move past this match.
            position = match.getEnd();
        }

        if (matches.length < minimumMatches) {
            // We didn't meet the minimum required number of matches,
            // so the entire match is a failure.
            return null;
        }

        return new FragmentMatchTree(position, matches, () =>
            backtracker(matches)
        );
    }

    /**
     * Matches the given component with minimising (lazy) match logic.
     *
     * @param {string} subject
     * @param {number} position
     * @param {boolean} isAnchored
     * @param {FragmentInterface} componentFragment
     * @param {number} minimumMatches
     * @param {number|null} maximumMatches
     * @param {FragmentMatchInterface} existingMatch
     * @param {Function} backtracker
     */
    matchMinimising(
        subject: string,
        position: number,
        isAnchored: boolean,
        componentFragment: FragmentInterface,
        minimumMatches: number,
        maximumMatches: number | null,
        existingMatch: FragmentMatchInterface,
        backtracker: (
            matches: FragmentMatchInterface[]
        ) => FragmentMatchInterface | null
    ): FragmentMatchInterface | null {
        const initialPosition = position;
        const matches: FragmentMatchInterface[] = [];

        for (let matchIndex = 0; matchIndex < minimumMatches; matchIndex++) {
            const match = componentFragment.match(
                subject,
                position,
                isAnchored,
                existingMatch.withSubsequentMatches(matches)
            );

            if (!match) {
                // One of the minimum required matches has failed,
                // so the entire quantifier match has failed.
                return null;
            }

            matches.push(match);

            position = match.getEnd();
        }

        return new FragmentMatchTree(initialPosition, matches, () =>
            backtracker(matches)
        );
    }

    /**
     * Parses the given quantifier string to a (max, min) matches tuple.
     *
     * @param {string} quantifier
     */
    parseQuantifier(quantifier: string): {
        minimumMatches: number;
        maximumMatches: number | null;
    } {
        let minimumMatches: number;
        let maximumMatches: number | null;

        switch (quantifier) {
            case '?':
                minimumMatches = 0;
                maximumMatches = 1;
                break;
            case '*':
                minimumMatches = 0;
                maximumMatches = null;
                break;
            case '+':
                minimumMatches = 1;
                maximumMatches = null;
                break;
            default:
                throw new Exception(`Unsupported quantifier "${quantifier}"`);
        }

        return { minimumMatches, maximumMatches };
    }
}
