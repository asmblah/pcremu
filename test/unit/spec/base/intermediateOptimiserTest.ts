/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import { concatenateRawRegexNodes } from '../../../../src/spec/base/intermediateOptimiser';
import {
    I_RAW_CHUNK,
    I_RAW_REGEX,
} from '../../../../src/spec/types/intermediateRepresentation';

describe('Base spec intermediateOptimiser', () => {
    describe('concatenateRawRegexNodes()', () => {
        it('should concatenate sequential I_RAW_REGEX nodes with default glue (empty)', () => {
            const node1: I_RAW_REGEX = {
                name: 'I_RAW_REGEX',
                chunks: [{ name: 'I_RAW_CHARS', chars: 'a' }],
                fixedLength: 1,
            };
            const node2: I_RAW_REGEX = {
                name: 'I_RAW_REGEX',
                chunks: [{ name: 'I_RAW_CHARS', chars: 'b' }],
                fixedLength: 1,
            };
            const node3: I_RAW_REGEX = {
                name: 'I_RAW_REGEX',
                chunks: [{ name: 'I_RAW_CHARS', chars: 'c' }],
                fixedLength: 1,
            };

            const result = concatenateRawRegexNodes([node1, node2, node3]);

            expect(result).to.have.length(1);
            expect(result[0].name).to.equal('I_RAW_REGEX');
            expect((result[0] as I_RAW_REGEX).chunks).to.deep.equal([
                { name: 'I_RAW_CHARS', chars: 'a' },
                { name: 'I_RAW_CHARS', chars: 'b' },
                { name: 'I_RAW_CHARS', chars: 'c' },
            ]);
            expect((result[0] as I_RAW_REGEX).fixedLength).to.equal(3);
        });

        it('should concatenate sequential I_RAW_REGEX nodes with custom glue', () => {
            const node1: I_RAW_REGEX = {
                name: 'I_RAW_REGEX',
                chunks: [{ name: 'I_RAW_CHARS', chars: 'a' }],
                fixedLength: 1,
            };
            const node2: I_RAW_REGEX = {
                name: 'I_RAW_REGEX',
                chunks: [{ name: 'I_RAW_CHARS', chars: 'b' }],
                fixedLength: 1,
            };
            const glue: I_RAW_CHUNK = { name: 'I_RAW_CHARS', chars: '-' };

            const result = concatenateRawRegexNodes([node1, node2], glue);

            expect(result).to.deep.equal([
                {
                    name: 'I_RAW_REGEX',
                    chunks: [
                        { name: 'I_RAW_CHARS', chars: 'a' },
                        { name: 'I_RAW_CHARS', chars: '-' },
                        { name: 'I_RAW_CHARS', chars: 'b' },
                    ],
                    fixedLength: 2,
                },
            ]);
        });

        it('should finish runs when encountering non-I_RAW_REGEX nodes', () => {
            const node1: I_RAW_REGEX = {
                name: 'I_RAW_REGEX',
                chunks: [{ name: 'I_RAW_CHARS', chars: 'a' }],
                fixedLength: 1,
            };
            const node2 = { name: 'OTHER_NODE' };
            const node3: I_RAW_REGEX = {
                name: 'I_RAW_REGEX',
                chunks: [{ name: 'I_RAW_CHARS', chars: 'b' }],
                fixedLength: 1,
            };
            const node4: I_RAW_REGEX = {
                name: 'I_RAW_REGEX',
                chunks: [{ name: 'I_RAW_CHARS', chars: 'cd' }],
                fixedLength: 2,
            };

            const result = concatenateRawRegexNodes([
                node1,
                node2,
                node3,
                node4,
            ]);

            expect(result).to.deep.equal([
                {
                    name: 'I_RAW_REGEX',
                    chunks: [{ name: 'I_RAW_CHARS', chars: 'a' }],
                    fixedLength: 1,
                },
                {
                    name: 'OTHER_NODE',
                },
                {
                    name: 'I_RAW_REGEX',
                    chunks: [
                        { name: 'I_RAW_CHARS', chars: 'b' },
                        { name: 'I_RAW_CHARS', chars: 'cd' },
                    ],
                    fixedLength: 3,
                },
            ]);
        });

        it('should handle custom updateRunFixedLength functions', () => {
            const node1: I_RAW_REGEX = {
                name: 'I_RAW_REGEX',
                chunks: [{ name: 'I_RAW_CHARS', chars: 'abc' }],
                fixedLength: 3,
            };
            const node2: I_RAW_REGEX = {
                name: 'I_RAW_REGEX',
                chunks: [{ name: 'I_RAW_CHARS', chars: 'de' }],
                fixedLength: 2,
            };
            const customUpdateRunFixedLength = (prev: number, next: number) =>
                prev * next;

            const result = concatenateRawRegexNodes(
                [node1, node2],
                null,
                undefined,
                undefined,
                customUpdateRunFixedLength,
            );

            expect(result).to.deep.equal([
                {
                    name: 'I_RAW_REGEX',
                    chunks: [
                        { name: 'I_RAW_CHARS', chars: 'abc' },
                        { name: 'I_RAW_CHARS', chars: 'de' },
                    ],
                    // Note fixedLength is the product as defined by the custom updateRunFixedLength function above.
                    fixedLength: 6,
                },
            ]);
        });

        it('should handle null fixedLength for any single I_RAW_REGEX node by using null as the fixedLength', () => {
            const node1: I_RAW_REGEX = {
                name: 'I_RAW_REGEX',
                chunks: [{ name: 'I_RAW_CHARS', chars: 'a' }],
                fixedLength: 1,
            };
            const node2: I_RAW_REGEX = {
                name: 'I_RAW_REGEX',
                chunks: [{ name: 'I_RAW_CHARS', chars: 'b' }],
                fixedLength: null,
            };

            const result = concatenateRawRegexNodes([node1, node2]);

            expect(result).to.deep.equal([
                {
                    name: 'I_RAW_REGEX',
                    chunks: [
                        { name: 'I_RAW_CHARS', chars: 'a' },
                        { name: 'I_RAW_CHARS', chars: 'b' },
                    ],
                    // Note the resulting fixedLength is null
                    // because one of the original fixedLengths was null.
                    fixedLength: null,
                },
            ]);
        });
    });
});
