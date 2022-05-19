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
        private maximumMatches: number | null
    ) {}

    /**
     * @inheritDoc
     */
    match(
        subject: string,
        position: number,
        isAnchored: boolean
    ): FragmentMatchInterface | null {
        return this.quantifierMatcher.matchMaximising(
            subject,
            position,
            isAnchored,
            this.componentFragment,
            this.minimumMatches,
            this.maximumMatches,
            // Possessive matches cannot backtrack.
            () => null
        );
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return (
            this.componentFragment.toString() +
            `{${this.minimumMatches},${this.maximumMatches ?? ''}}+`
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
