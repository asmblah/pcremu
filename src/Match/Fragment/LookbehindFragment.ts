/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import Exception from '../../Exception/Exception';
import FragmentInterface from './FragmentInterface';
import FragmentMatch from '../FragmentMatch';
import FragmentMatcher from '../FragmentMatcher';
import FragmentMatchInterface from '../FragmentMatchInterface';
import { LookaroundBivalence } from '../../Pattern/LookaroundBivalence';

/**
 * Groups part of a regular expression, matching behind the current position.
 */
export default class LookbehindFragment implements FragmentInterface {
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

        for (const fragment of this.componentFragments) {
            const length = fragment.getFixedLength(existingMatch);

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
        const fixedLength = this.getFixedLength(existingMatch);

        if (fixedLength === null) {
            throw new Exception('Variable length not supported for lookbehind');
        }

        const match = this.fragmentMatcher.matchComponents(
            subject,
            // Move back from the current position by the fixed length of the lookbehind,
            // and attempt to match it from there.
            position - fixedLength,
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
            // For lookbehind, the position of the match is the end position of the lookbehind.
            match.getEnd(),
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

        return `(?<${bivalenceChar}${inner})`;
    }

    /**
     * @inheritDoc
     */
    toStructure(): object {
        return {
            type: 'lookbehind',
            bivalence: this.bivalence,
            components: this.componentFragments.map((componentFragment) =>
                componentFragment.toStructure()
            ),
        };
    }
}
