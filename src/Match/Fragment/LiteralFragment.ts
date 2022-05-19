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

/**
 * Matches a series of plain characters with no special meaning.
 */
export default class LiteralFragment implements FragmentInterface {
    constructor(private chars: string) {}

    /**
     * @inheritDoc
     */
    match(
        subject: string,
        position: number,
        isAnchored: boolean
    ): FragmentMatch | null {
        const matchPosition = subject.indexOf(this.chars, position);

        if (matchPosition === -1) {
            // Literal is not present in the subject string at any point past the start position.
            return null;
        }

        if (isAnchored && matchPosition > position) {
            // Anchored matches must be at the start position.
            return null;
        }

        // Note no backtracking is possible.
        return new FragmentMatch(matchPosition, this.chars);
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return this.chars;
    }

    /**
     * @inheritDoc
     */
    toStructure(): object {
        return {
            type: 'literal',
            chars: this.chars,
        };
    }
}
