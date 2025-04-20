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
 * Captures part of a regular expression match as a given numbered index.
 */
export default class CapturingGroupFragment implements FragmentInterface {
    constructor(
        private fragmentMatcher: FragmentMatcher,
        private componentFragments: FragmentInterface[],
        private groupIndex: number
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
        existingMatch: FragmentMatchInterface
    ): FragmentMatchInterface | null {
        return this.fragmentMatcher.matchComponents(
            subject,
            position,
            isAnchored,
            this.componentFragments,
            existingMatch,
            (match: FragmentMatchInterface) =>
                match.withCaptureAs(this.groupIndex)
        );
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return (
            '(' +
            this.componentFragments
                .map((componentFragment) => componentFragment.toString())
                .join('') +
            ')'
        );
    }

    /**
     * @inheritDoc
     */
    toStructure(): object {
        return {
            type: 'capturing-group',
            groupIndex: this.groupIndex,
            components: this.componentFragments.map((componentFragment) =>
                componentFragment.toStructure()
            ),
        };
    }
}
