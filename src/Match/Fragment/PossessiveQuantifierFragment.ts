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
import QuantifierMatcher from '../QuantifierMatcher';

/**
 * Matches greedily similar to a maximising match,
 * however no part of the match will ever be given up, i.e. backtracking is prevented.
 */
export default class PossessiveQuantifierFragment implements FragmentInterface {
    constructor(
        private quantifierMatcher: QuantifierMatcher,
        private componentFragment: FragmentInterface,
        private minimumMatches: number,
        private maximumMatches: number,
    ) {}

    /**
     * @inheritDoc
     */
    getFixedLength(existingMatch: FragmentMatchInterface): number | null {
        const componentLength =
            this.componentFragment.getFixedLength(existingMatch);

        if (componentLength === null) {
            return null;
        }

        if (this.minimumMatches === this.maximumMatches) {
            // Fixed-length repetition, so we can determine a fixed length for the quantifier.
            return componentLength * this.minimumMatches;
        }

        return null;
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
        return this.quantifierMatcher.matchMaximising(
            subject,
            position,
            isAnchored,
            this.componentFragment,
            this.minimumMatches,
            this.maximumMatches,
            existingMatch,
            // Possessive matches cannot backtrack.
            () => null,
        );
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return (
            this.componentFragment.toString() +
            `{${this.minimumMatches},${
                this.maximumMatches === Infinity ? '' : this.maximumMatches
            }}+`
        );
    }

    /**
     * @inheritDoc
     */
    toStructure(): object {
        return {
            type: 'possessive-quantifier',
            minimumMatches: this.minimumMatches,
            maximumMatches: this.maximumMatches,
            component: this.componentFragment.toStructure(),
        };
    }
}
