/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import {
    IndexCapturingRegExpExecArray,
    RegExpMatchArrayIndices,
} from '../../declarations/types';
import polyfillIndexCapture from './polyfillIndexCapture';

/**
 * Extends the built-in RegExp class with support for index capturing with the `d` flag.
 */
export default class RegExpPolyfill extends RegExp {
    public hasIndices: boolean;
    private readonly namedCapturingGroupsToIndices: { [p: string]: number };
    private originalPattern: string;

    /**
     * @inheritDoc
     */
    constructor(pattern: string, flags?: string) {
        const namedCapturingGroupsToIndices: { [name: string]: number } = {};
        const originalPattern = pattern;

        flags ??= '';

        let hasIndices = false;

        if (flags.indexOf('d') > -1) {
            hasIndices = true;

            flags = flags.replace(/d/g, '');

            pattern = polyfillIndexCapture(
                pattern,
                namedCapturingGroupsToIndices
            );
        }

        super(pattern, flags);

        // As we are extending a builtin, the superconstructor call above will return a new RegExp instance -
        // we need to adjust that new instance's prototype chain to extend our custom RegExp class.
        Object.setPrototypeOf(this, RegExpPolyfill.prototype);

        this.hasIndices = hasIndices;
        this.namedCapturingGroupsToIndices = namedCapturingGroupsToIndices;
        this.originalPattern = originalPattern;
    }

    /**
     * @inheritDoc
     */
    exec(string: string): IndexCapturingRegExpExecArray | null {
        const match = super.exec(string) as IndexCapturingRegExpExecArray;

        if (match === null) {
            return null;
        }

        if (!this.hasIndices) {
            // No polyfilling to be done if the regex does not use index capturing.
            return match;
        }

        const indices: RegExpMatchArrayIndices = [];

        // TODO: Consider looping through capturing groups based on initial parsing that we already do.
        for (let index = match.length - 1; index > 0; index--) {
            if (index % 2 === 0) {
                // This capture is one of the special ones added in the constructor above -
                // use it to calculate the offset of the original capturing group it precedes.

                const restOfStringMatch = match[index];
                const actualMatch = match[index - 1];

                if (restOfStringMatch !== undefined) {
                    const start = string.length - restOfStringMatch.length;

                    indices.unshift([start, start + actualMatch.length]);
                } else {
                    // Nothing was captured (e.g. the original capturing group and this special one
                    // were part of an unmatched branch of an alternation) - so use -1 as the indices.
                    indices.unshift([-1, -1]); // FIXME: Test this!
                }

                match.splice(index, 1);
            }
        }

        const fullCaptureStartIndex = match.index;
        const fullCaptureEndIndex = match.index + match[0].length;

        // Add the full capture indices.
        indices.unshift([fullCaptureStartIndex, fullCaptureEndIndex]);

        const groupIndices = Object.create(null);

        for (const groupName of Object.keys(
            this.namedCapturingGroupsToIndices
        )) {
            const groupIndex = this.namedCapturingGroupsToIndices[groupName];

            groupIndices[groupName] = indices[groupIndex];
        }

        // Add the `<RegExp>.indices.groups` property.
        indices.groups =
            Object.keys(groupIndices).length > 0 ? groupIndices : undefined;

        // Add the `<RegExp>.indices` property.
        match.indices = indices;

        return match;
    }
}
