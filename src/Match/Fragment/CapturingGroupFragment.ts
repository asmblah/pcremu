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
    match(
        subject: string,
        position: number,
        isAnchored: boolean
    ): FragmentMatch | null {
        const match = this.fragmentMatcher.matchComponents(
            subject,
            position,
            isAnchored,
            this.componentFragments
        );

        if (!match) {
            return null;
        }

        return match.withCaptureAs(this.groupIndex);
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return (
            '(' +
            this.componentFragments
                .map((componentFragment) => componentFragment.toString())
                .join('|') +
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
