/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import {
    Capture,
    CaptureIndex,
    NamedCaptureIndices,
    NamedCaptures,
    NumberedCaptureIndices,
    NumberedCaptures,
} from './spec/types/match';

/**
 * Represents a match against a subject string.
 */
export default class Match {
    constructor(
        private numberedCaptures: NumberedCaptures,
        private namedCaptures: NamedCaptures,
        private numberedCaptureIndices: NumberedCaptureIndices,
        private namedCaptureIndices: NamedCaptureIndices
    ) {}

    /**
     * Fetches the entire match.
     */
    getCapture(): string {
        return this.numberedCaptures[0] ?? '';
    }

    /**
     * Fetches the number of captures (both numbered and named) made by this match.
     */
    getCaptureCount(): number {
        return Object.keys(this.numberedCaptures).length;
    }

    /**
     * Fetches the zero-based offset of the end of this match into the subject string.
     */
    getEnd(): number {
        return (this.numberedCaptureIndices[0] as number[])[1];
    }

    /**
     * Fetches the total length of this match.
     */
    getLength(): number {
        return this.getCapture().length;
    }

    /**
     * Fetches the specified named capture of this match.
     *
     * @param {string} name
     */
    getNamedCapture(name: string): Capture {
        return this.namedCaptures[name] ?? null;
    }

    /**
     * Fetches the end offset of the specified named capture.
     *
     * @param {string} name
     */
    getNamedCaptureEnd(name: string): CaptureIndex {
        return this.namedCaptureIndices[name]?.[1] ?? null;
    }

    /**
     * Fetches the start offset of the specified named capture.
     *
     * @param {string} name
     */
    getNamedCaptureStart(name: string): CaptureIndex {
        return this.namedCaptureIndices[name]?.[0] ?? null;
    }

    /**
     * Fetches all named captures, without their indices.
     */
    getNamedCaptures(): NamedCaptures {
        return this.namedCaptures;
    }

    /**
     * Fetches the position at which a subsequent match should be tried.
     */
    getNextMatchPosition(): number {
        return (
            this.getEnd() +
            // Prevent infinite loop if match is zero-width -
            // ensure we always advance by at least 1 character.
            (this.getLength() === 0 ? 1 : 0)
        );
    }

    /**
     * Fetches the specified numbered capture of this match.
     *
     * @param {number} number
     */
    getNumberedCapture(number: number): Capture {
        return this.numberedCaptures[number] ?? null;
    }

    /**
     * Fetches the end offset of the specified numbered capture.
     *
     * @param {number} number
     */
    getNumberedCaptureEnd(number: number): CaptureIndex {
        return this.numberedCaptureIndices[number]?.[1] ?? null;
    }

    /**
     * Fetches the start offset of the specified numbered capture.
     *
     * @param {number} number
     */
    getNumberedCaptureStart(number: number): CaptureIndex {
        return this.numberedCaptureIndices[number]?.[0] ?? null;
    }

    /**
     * Fetches all numbered captures, without their indices.
     *
     * Presents as an array, note this differs from FragmentMatch.
     */
    getNumberedCaptures(): Capture[] {
        // Build an array-like object from the captures to spread below.
        const capturesArray = {
            length: Object.keys(this.numberedCaptures).length,
            ...this.numberedCaptures,
        };

        return [...(capturesArray as Capture[])];
    }

    /**
     * Fetches the zero-based offset of the start of this match into the subject string.
     */
    getStart(): number {
        return (this.numberedCaptureIndices[0] as number[])[0];
    }
}
