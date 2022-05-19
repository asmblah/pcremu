/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import FragmentMatchInterface from '../FragmentMatchInterface';

export default interface FragmentInterface {
    /**
     * Attempts to match this fragment against the given subject string.
     *
     * @param {string} subject
     * @param {number} position
     * @param {boolean} isAnchored
     */
    match(
        subject: string,
        position: number,
        isAnchored: boolean
    ): FragmentMatchInterface | null;

    /**
     * Fetches a string representation of this pattern fragment.
     */
    toString(): string;

    /**
     * Fetches a recursive structure representing the pattern's fragments.
     */
    toStructure(): object;
}
