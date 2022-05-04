/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { RegExpMatchArrayIndices } from './declarations/types';

/**
 * Represents a match against a subject string.
 */
export default class Match {
    constructor(
        private numberedCaptures: string[],
        private namedCaptures: { [key: string]: string },
        private indices: RegExpMatchArrayIndices
    ) {}

    /**
     * Fetches the entire match.
     */
    getCapture(): string {
        return this.numberedCaptures[0];
    }

    /**
     * Fetches the number of captures (both numbered and named) made by this match.
     */
    getCaptureCount(): number {
        return this.numberedCaptures.length;
    }

    /**
     * Fetches the zero-based offset of the end of this match into the subject string.
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
    getNamedCapture(name: string): string | null {
        return this.namedCaptures[name] ?? null;
    }

    /**
     * Fetches the end offset of the specified named capture.
     *
     * @param {string} name
     */
    getNamedCaptureEnd(name: string): number | null {
        return this.indices.groups[name][1];
    }

    /**
     * Fetches the start offset of the specified named capture.
     *
     * @param {string} name
     */
    getNamedCaptureStart(name: string): number | null {
        return this.indices.groups[name][0];
    }

    /**
     * Fetches all named captures, without their indices.
     */
    getNamedCaptures(): { [key: string]: string } {
        return this.namedCaptures;
    }

    /**
     * Fetches the specified numbered capture of this match.
     *
     * @param {number} number
     */
    getNumberedCapture(number: number): string | null {
        return this.numberedCaptures[number] ?? null;
    }

    /**
     * Fetches the end offset of the specified numbered capture.
     *
     * @param {number} number
     */
    getNumberedCaptureEnd(number: number): number | null {
        return this.indices[number][1];
    }

    /**
     * Fetches the start offset of the specified numbered capture.
     *
     * @param {number} number
     */
    getNumberedCaptureStart(number: number): number | null {
        return this.indices[number][0];
    }

    /**
     * Fetches all numbered captures, without their indices.
     */
    getNumberedCaptures(): string[] {
        return this.numberedCaptures;
    }

    /**
     * Fetches the zero-based offset of the start of this match into the subject string.
     */
    getStart(): number {
        return this.indices[0][0];
    }
}
