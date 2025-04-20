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
import FragmentMatchInterface from '../FragmentMatchInterface';
import { LookaroundBivalence } from '../../Pattern/LookaroundBivalence';

/**
 * Groups part of a regular expression, matching ahead of the current position
 * but not advancing past it.
 */
export default class LookaheadFragment implements FragmentInterface {
    constructor(
        private fragmentMatcher: FragmentMatcher,
        private componentFragments: FragmentInterface[],
        private readonly bivalence: LookaroundBivalence
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
        const match = this.fragmentMatcher.matchComponents(
            subject,
            position,
            isAnchored,
            this.componentFragments,
            existingMatch
        );

        if (this.bivalence === LookaroundBivalence.Negative) {
            return match === null
                ? new FragmentMatch(position)
                : // A match was found, so the negative lookahead must fail.
                  null;
        }

        if (match === null) {
            return null;
        }

        return new FragmentMatch(
            match.getStart(),
            '',
            match.getNumberedCaptures(),
            match.getNamedCaptures(),
            match.getNumberedCaptureIndices(),
            match.getNamedCaptureIndices()
        );
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        const bivalenceChar = this.bivalence === 'positive' ? '=' : '!';

        const inner = this.componentFragments
            .map((componentFragment) => componentFragment.toString())
            .join('');

        return `(?${bivalenceChar}${inner})`;
    }

    /**
     * @inheritDoc
     */
    toStructure(): object {
        return {
            type: 'lookahead',
            bivalence: this.bivalence,
            components: this.componentFragments.map((componentFragment) =>
                componentFragment.toStructure()
            ),
        };
    }
}
