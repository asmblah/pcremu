/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { RegExpMatchArrayIndices } from './declarations/types';

export default class Match {
    constructor(
        private numberedCaptures: string[],
        private namedCaptures: { [key: string]: string },
        private indices: RegExpMatchArrayIndices
    ) {}

    /**
     * Fetches the number of captures (both numbered and named) made by this match.
     */
    getCaptureCount(): number {
        return this.numberedCaptures.length;
    }

    /**
     * Fetches the zero-based offset of the end of this match into the input string.
     */
    getEnd(): number {
        return this.indices[0][1];
    }

    /**
     * Fetches the total length of this match.
     */
    getLength(): number {
        return this.numberedCaptures[0].length;
    }

    /**
     * Fetches the specified named capture of this match.
     *
     * @param {string} name
     */
    getNamedCapture(name: string): string {
        return this.namedCaptures[name];
    }

    /**
     * Fetches the specified numbered capture of this match.
     *
     * @param {number} number
     */
    getNumberedCapture(number: number): string {
        return this.numberedCaptures[number];
    }

    /**
     * Fetches the zero-based offset of the start of this match into the input string.
     */
    getStart(): number {
        return this.indices[0][0];
    }
}
