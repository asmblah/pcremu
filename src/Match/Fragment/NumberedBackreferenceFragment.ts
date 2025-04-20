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
 * References the most recent capture of a capturing group.
 */
export default class NumberedBackreferenceFragment
    implements FragmentInterface
{
    constructor(private groupIndex: number) {}

    /**
     * @inheritDoc
     */
    getFixedLength(existingMatch: FragmentMatchInterface): number | null {
        const capture = existingMatch.getNumberedCapture(this.groupIndex);

        return capture !== null ? capture.length : null;
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
        const capture = existingMatch.getNumberedCapture(this.groupIndex);

        if (capture === null) {
            // Back-referenced capturing group has not yet made a capture:
            // this means any backreference will fail to match.
            return null;
        }

        const matchPosition = subject.indexOf(capture, position);

        if (matchPosition === -1) {
            // Literal is not present in the subject string at any point past the start position.
            return null;
        }

        if (isAnchored && matchPosition > position) {
            // Anchored matches must be at the start position.
            return null;
        }

        // Note no backtracking is possible.
        return new FragmentMatch(matchPosition, capture);
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return `\\${this.groupIndex}`;
    }

    /**
     * @inheritDoc
     */
    toStructure(): object {
        return {
            type: 'numbered-backreference',
            groupIndex: this.groupIndex,
        };
    }
}
