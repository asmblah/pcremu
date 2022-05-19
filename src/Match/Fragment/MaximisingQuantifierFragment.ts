/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import FragmentInterface from './FragmentInterface';
import FragmentMatcher from '../FragmentMatcher';
import FragmentMatchInterface from '../FragmentMatchInterface';
import QuantifierMatcher from '../QuantifierMatcher';

/**
 * Matches greedily, giving up matches if/as required during backtracking.
 */
export default class MaximisingQuantifierFragment implements FragmentInterface {
    constructor(
        private fragmentMatcher: FragmentMatcher,
        private quantifierMatcher: QuantifierMatcher,
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
    ): FragmentMatchInterface | null {
        const initialPosition = position;

        const backtracker = (
            matches: FragmentMatchInterface[]
        ): FragmentMatchInterface | null => {
            if (matches.length === 0) {
                // We've got an empty match (therefore minimum must be zero)
                // so we cannot backtrack.
                return null;
            }

            let backtrackedMatch = matches[matches.length - 1].backtrack();

            if (backtrackedMatch) {
                // Overwrite the latest match with its backtracked version.
                matches[matches.length - 1] = backtrackedMatch;
            } else {
                if (matches.length === this.minimumMatches) {
                    // We've already got a minimal match of this quantifier,
                    // we cannot give up any matches.
                    return null;
                }

                // Otherwise, we could not backtrack this repeated instance of the match,
                // so we'll need to give up the whole instance (assuming we still meet our minimum).
                matches.pop(); // Give up the latest match.

                if (matches.length === 0) {
                    // We've given up the final instance, therefore the whole match for this quantifier has failed.
                    return null;
                }

                if (matches.length < this.minimumMatches) {
                    return null; // Minimum would no longer be met, so this entire repeated match fails.
                }

                // Use the previous repetition as the new backtracked match.
                backtrackedMatch = matches[matches.length - 1];
            }

            position = backtrackedMatch.getEnd();

            return this.fragmentMatcher.concatenateMatches(
                matches,
                initialPosition,
                () => backtracker(matches)
            );
        };

        return this.quantifierMatcher.matchMaximising(
            subject,
            position,
            isAnchored,
            this.componentFragment,
            this.minimumMatches,
            this.maximumMatches,
            backtracker
        );
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return (
            this.componentFragment.toString() +
            `{${this.minimumMatches},${this.maximumMatches ?? ''}}`
        );
    }

    /**
     * @inheritDoc
     */
    toStructure(): object {
        return {
            type: 'maximising-quantifier',
            minimumMatches: this.minimumMatches,
            maximumMatches: this.maximumMatches,
            component: this.componentFragment.toStructure(),
        };
    }
}
