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
 * Matches the given subject string.
 *
 * Top level of the Fragment tree.
 */
export default class PatternFragment implements FragmentInterface {
    constructor(
        private fragmentMatcher: FragmentMatcher,
        private componentFragments: FragmentInterface[],
        private capturingGroupNames: Array<number | string>,
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
     * Fetches all numbered and named capturing group names for the pattern,
     * in the order they are defined.
     *
     * Note that named capturing groups also appear by their index.
     */
    getCapturingGroupNames(): Array<number | string> {
        return this.capturingGroupNames;
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
        do {
            const match = this.fragmentMatcher.matchComponents(
                subject,
                position,
                isAnchored,
                this.componentFragments,
                existingMatch,
            );

            if (match) {
                return match.withMissingCapturesBackfilled(
                    this.capturingGroupNames,
                );
            }

            // Match failed: if it is un-anchored then the top-level of the pattern is special,
            // as it can then move to the next character position to try again.
            position++;
        } while (!isAnchored && position < subject.length);

        return null;
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
            type: 'pattern',
            capturingGroups: this.capturingGroupNames,
            components: this.componentFragments.map((componentFragment) =>
                componentFragment.toStructure(),
            ),
        };
    }
}
