/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import AlternativeFragment from './AlternativeFragment';
import FragmentInterface from './FragmentInterface';
import FragmentMatch from '../FragmentMatch';

/**
 * Matches one of a series of possible alternatives.
 *
 * Comprised of {@see {AlternativeFragment}} components.
 */
export default class AlternationFragment implements FragmentInterface {
    constructor(private alternativeFragments: AlternativeFragment[]) {}

    /**
     * @inheritDoc
     */
    match(
        subject: string,
        position: number,
        isAnchored: boolean
    ): FragmentMatch | null {
        let alternativeIndex = 0;

        const tryNextAlternative = (): FragmentMatch | null => {
            for (
                ;
                alternativeIndex < this.alternativeFragments.length;
                alternativeIndex++
            ) {
                const alternativeFragment =
                    this.alternativeFragments[alternativeIndex];

                const match = alternativeFragment.match(
                    subject,
                    position,
                    isAnchored
                );

                if (match) {
                    // Match succeeded.
                    return match.wrapBacktracker(
                        (previousMatch, previousBacktracker) => {
                            const backtrackedMatch = previousBacktracker();

                            if (backtrackedMatch) {
                                // The inside of the alternative was able to be backtracked, so we'll use that for now.
                                return backtrackedMatch;
                            }

                            // Otherwise, we could not backtrack inside the alternative itself,
                            // so we'll need to try the next alternative instead.
                            alternativeIndex++;

                            return tryNextAlternative();
                        }
                    );
                }
            }

            return null; // None of the alternatives matched.
        };

        return tryNextAlternative();
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return this.alternativeFragments
            .map((alternativeFragment) => alternativeFragment.toString())
            .join('|');
    }

    /**
     * @inheritDoc
     */
    toStructure(): object {
        return {
            type: 'alternation',
            alternatives: this.alternativeFragments.map((alternativeFragment) =>
                alternativeFragment.toStructure()
            ),
        };
    }
}
