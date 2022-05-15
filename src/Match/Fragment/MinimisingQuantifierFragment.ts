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
import FragmentMatcher from '../FragmentMatcher';

/**
 * Performs a lazy match with the given quantifier.
 */
export default class MinimisingQuantifierFragment implements FragmentInterface {
    constructor(
        private fragmentMatcher: FragmentMatcher,
        private componentFragment: FragmentInterface,
        private minimumMatches: number,
        private maximumMatches: number | null
    ) {}

    /**
     * @inheritDoc
     */
    match(
        subject: string,
        position: number,
        isAnchored: boolean
    ): FragmentMatch | null {
        const initialPosition = position;
        const matches: FragmentMatch[] = [];

        for (
            let matchIndex = 0;
            matchIndex < this.minimumMatches;
            matchIndex++
        ) {
            const match = this.componentFragment.match(
                subject,
                position,
                isAnchored
            );

            if (!match) {
                // One of the minimum required matches has failed,
                // so the entire quantifier match has failed.
                return null;
            }

            matches.push(match);

            position = match.getEnd();
        }

        let backtrackingBackwards = true;

        const backtracker = (): FragmentMatch | null => {
            if (backtrackingBackwards && matches.length > 0) {
                const previousMatch = matches[matches.length - 1];
                const backtrackedMatch = previousMatch.backtrack();

                if (backtrackedMatch) {
                    position = backtrackedMatch.getEnd();

                    // Replace with the backtracked match in our record.
                    matches[matches.length - 1] = backtrackedMatch;

                    return this.fragmentMatcher.concatenateMatches(
                        matches,
                        initialPosition,
                        backtracker
                    );
                }
            }

            backtrackingBackwards = false;

            // FIXME: Check max

            const nextMatch = this.componentFragment.match(
                subject,
                position,
                isAnchored
            );

            if (!nextMatch) {
                // Tracking forwards has also failed,
                // so the entire quantifier match has failed.
                return null;
            }

            position = nextMatch.getEnd();

            // Add the new match to our record.
            matches.push(nextMatch);

            return this.fragmentMatcher.concatenateMatches(
                matches,
                initialPosition,
                backtracker
            );
        };

        return this.fragmentMatcher.concatenateMatches(
            matches,
            initialPosition,
            backtracker
        );
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return (
            this.componentFragment.toString() +
            `{${this.minimumMatches},${this.maximumMatches ?? ''}}?`
        );
    }

    /**
     * @inheritDoc
     */
    toStructure(): object {
        return {
            type: 'minimising-quantifier',
            minimumMatches: this.minimumMatches,
            maximumMatches: this.maximumMatches,
            component: this.componentFragment.toStructure(),
        };
    }
}
