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
     * Returns the fixed length of this fragment if it has one, or null if it is variable length.
     * For composite fragments, returns null if any sub-fragment is variable length.
     */
    getFixedLength(existingMatch: FragmentMatchInterface): number | null;

    /**
     * Attempts to match this fragment against the given subject string.
     *
     * @param {string} subject
     * @param {number} position
     * @param {boolean} isAnchored
     * @param {FragmentMatchInterface} existingMatch
     */
    match(
        subject: string,
        position: number,
        isAnchored: boolean,
        existingMatch: FragmentMatchInterface
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
