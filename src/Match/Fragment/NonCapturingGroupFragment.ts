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
 * Groups part of a regular expression, without causing the result to be captured.
 */
export default class NonCapturingGroupFragment implements FragmentInterface {
    constructor(
        private fragmentMatcher: FragmentMatcher,
        private componentFragments: FragmentInterface[]
    ) {}

    /**
     * @inheritDoc
     */
    match(
        subject: string,
        position: number,
        isAnchored: boolean
    ): FragmentMatchInterface | null {
        return this.fragmentMatcher.matchComponents(
            subject,
            position,
            isAnchored,
            this.componentFragments
        );
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        const inner = this.componentFragments
            .map((componentFragment) => componentFragment.toString())
            .join('');

        return `(?:${inner})`;
    }

    /**
     * @inheritDoc
     */
    toStructure(): object {
        return {
            type: 'non-capturing-group',
            components: this.componentFragments.map((componentFragment) =>
                componentFragment.toStructure()
            ),
        };
    }
}
