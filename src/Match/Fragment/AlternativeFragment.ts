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

/**
 * Forms part of an alternation.
 *
 * @see {AlternationFragment}
 */
export default class AlternativeFragment implements FragmentInterface {
    constructor(
        private fragmentMatcher: FragmentMatcher,
        private componentFragments: FragmentInterface[],
    ) {}

    /**
     * @inheritDoc
     */
    getFixedLength(existingMatch: FragmentMatchInterface): number | null {
        let totalLength = 0;

        for (const componentFragment of this.componentFragments) {
            const length = componentFragment.getFixedLength(existingMatch);

            if (length === null) {
                return null;
            }

            totalLength += length;
        }

        return totalLength;
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
        return this.fragmentMatcher.matchComponents(
            subject,
            position,
            isAnchored,
            this.componentFragments,
            existingMatch,
        );
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return this.componentFragments
            .map((componentFragment) => componentFragment.toString())
            .join('');
    }

    /**
     * @inheritDoc
     */
    toStructure(): object {
        return {
            type: 'alternative',
            components: this.componentFragments.map((componentFragment) =>
                componentFragment.toStructure(),
            ),
        };
    }
}
