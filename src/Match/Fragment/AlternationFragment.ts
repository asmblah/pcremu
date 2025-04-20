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
import FragmentMatchInterface from '../FragmentMatchInterface';

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
    getFixedLength(existingMatch: FragmentMatchInterface): number | null {
        let alternativeLength: number | null = -1;

        for (const alternativeFragment of this.alternativeFragments) {
            const length = alternativeFragment.getFixedLength(existingMatch);

            if (alternativeLength !== -1 && length !== alternativeLength) {
                // The alternative fragments have different fixed lengths,
                // so we cannot determine a fixed length for the alternation.
                return null;
            }

            alternativeLength = length;
        }

        return alternativeLength === -1 ? 0 : alternativeLength;
    }

    /**
     * @inheritDoc
     */
    match(
        subject: string,
        position: number,
        isAnchored: boolean,
        existingMatch: FragmentMatchInterface
    ): FragmentMatchInterface | null {
        let alternativeIndex = 0;

        const tryNextAlternative = (): FragmentMatchInterface | null => {
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
                    isAnchored,
                    // No previous alternatives (if there have been any) are part of the existing match.
                    existingMatch
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
