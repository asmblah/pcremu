/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import FragmentInterface from './FragmentInterface';
import FragmentMatchInterface from '../FragmentMatchInterface';
import FragmentMatch from '../FragmentMatch';

/**
 * Matches one of a series of possible characters.
 */
export default class CharacterClassFragment implements FragmentInterface {
    constructor(
        private componentFragments: FragmentInterface[],
        private negated: boolean,
    ) {}

    /**
     * @inheritDoc
     */
    getFixedLength(): number | null {
        return 1; // Character classes always match exactly one character.
    }

    /**
     * @inheritDoc
     */
    match(
        subject: string,
        position: number,
        isAnchored: boolean,
        existingMatch: FragmentMatchInterface,
    ): FragmentMatchInterface | null {
        let match: FragmentMatchInterface | null = null;

        for (const componentFragment of this.componentFragments) {
            match = componentFragment.match(
                subject,
                position,
                isAnchored,
                // No previous components (if there have been any) are part of the existing match.
                existingMatch,
            );

            if (match) {
                break;
            }
        }

        if (this.negated) {
            return match
                ? // We found a match for the negated characters - so it's actually a failure.
                  null
                : // No match found for the negated class - consume the next character.
                  new FragmentMatch(position, subject.charAt(position));
        }

        return match;
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return (
            '[' +
            (this.negated ? '^' : '') +
            this.componentFragments
                .map((componentFragment) => componentFragment.toString())
                .join('') +
            ']'
        );
    }

    /**
     * @inheritDoc
     */
    toStructure(): object {
        return {
            type: 'character-class',
            negated: this.negated,
            components: this.componentFragments.map((componentFragment) =>
                componentFragment.toStructure(),
            ),
        };
    }
}
