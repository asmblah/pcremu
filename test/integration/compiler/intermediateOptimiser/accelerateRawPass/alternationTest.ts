/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import accelerateRawPassSpec from '../../../../../src/spec/intermediateOptimiser/accelerateRawPass';
import emulator from '../../../../../src';
import { SinonStubbedInstance } from 'sinon';
import IntermediateOptimiser from '../../../../../src/IntermediateOptimiser';
import IntermediateRepresentation from '../../../../../src/IntermediateRepresentation';
import sinon from 'ts-sinon';

describe('IR optimiser accelerateRawPass compiler alternation integration', () => {
    let optimiser: IntermediateOptimiser;

    beforeEach(() => {
        optimiser = emulator.createPartialIntermediateOptimiser([
            accelerateRawPassSpec,
        ]);
    });

    it('should be able to optimise an IR with one alternation where each alternative has a different fixed length', () => {
        const ir = sinon.createStubInstance(
            IntermediateRepresentation,
        ) as SinonStubbedInstance<IntermediateRepresentation> &
            IntermediateRepresentation;
        ir.getTranspilerRepresentation.returns({
            'name': 'I_PATTERN',
            'capturingGroups': [0],
            'components': [
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'hello',
                        },
                    ],
                    'fixedLength': 5,
                },
                {
                    'name': 'I_NON_CAPTURING_GROUP',
                    'components': [
                        {
                            'name': 'I_ALTERNATION',
                            'alternatives': [
                                {
                                    'name': 'I_ALTERNATIVE',
                                    'components': [
                                        {
                                            'name': 'I_RAW_REGEX',
                                            'chunks': [
                                                {
                                                    'name': 'I_RAW_CHARS',
                                                    'chars': 'to',
                                                },
                                            ],
                                            'fixedLength': 2,
                                        },
                                    ],
                                },
                                {
                                    'name': 'I_ALTERNATIVE',
                                    'components': [
                                        {
                                            'name': 'I_RAW_REGEX',
                                            'chunks': [
                                                {
                                                    'name': 'I_RAW_CHARS',
                                                    'chars': 'you',
                                                },
                                            ],
                                            'fixedLength': 3,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'world',
                        },
                    ],
                    'fixedLength': 5,
                },
            ],
        });

        const intermediateRepresentation = optimiser.optimise(ir);

        expect(
            intermediateRepresentation.getTranspilerRepresentation(),
        ).to.deep.equal({
            'name': 'I_PATTERN',
            'capturingGroups': [0],
            'components': [
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'hello',
                        },
                        {
                            'name': 'I_RAW_NON_CAPTURE',
                            'chunks': [
                                {
                                    'name': 'I_RAW_NESTED',
                                    'node': {
                                        'name': 'I_RAW_REGEX',
                                        'chunks': [
                                            {
                                                'name': 'I_RAW_NESTED',
                                                'node': {
                                                    'name': 'I_RAW_REGEX',
                                                    'chunks': [
                                                        {
                                                            'name': 'I_RAW_CHARS',
                                                            'chars': 'to',
                                                        },
                                                        {
                                                            'name': 'I_RAW_CHARS',
                                                            'chars': '|',
                                                        },
                                                        {
                                                            'name': 'I_RAW_CHARS',
                                                            'chars': 'you',
                                                        },
                                                    ],
                                                    'fixedLength': null, // Alternatives have different fixed lengths.
                                                },
                                            },
                                        ],
                                        'fixedLength': null, // Alternatives have different fixed lengths.
                                    },
                                },
                            ],
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'world',
                        },
                    ],
                    'fixedLength': null, // Alternatives have different fixed lengths.
                },
            ],
        });
    });

    it('should be able to optimise an IR with one alternation where each alternative has the same fixed length', () => {
        const ir = sinon.createStubInstance(
            IntermediateRepresentation,
        ) as SinonStubbedInstance<IntermediateRepresentation> &
            IntermediateRepresentation;
        ir.getTranspilerRepresentation.returns({
            'name': 'I_PATTERN',
            'capturingGroups': [0],
            'components': [
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'hello',
                        },
                    ],
                    'fixedLength': 5,
                },
                {
                    'name': 'I_NON_CAPTURING_GROUP',
                    'components': [
                        {
                            'name': 'I_ALTERNATION',
                            'alternatives': [
                                {
                                    'name': 'I_ALTERNATIVE',
                                    'components': [
                                        {
                                            'name': 'I_RAW_REGEX',
                                            'chunks': [
                                                {
                                                    'name': 'I_RAW_CHARS',
                                                    'chars': 'to',
                                                },
                                            ],
                                            'fixedLength': 2,
                                        },
                                    ],
                                },
                                {
                                    'name': 'I_ALTERNATIVE',
                                    'components': [
                                        {
                                            'name': 'I_RAW_REGEX',
                                            'chunks': [
                                                {
                                                    'name': 'I_RAW_CHARS',
                                                    'chars': 'it',
                                                },
                                            ],
                                            'fixedLength': 2,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'world',
                        },
                    ],
                    'fixedLength': 5,
                },
            ],
        });

        const intermediateRepresentation = optimiser.optimise(ir);

        expect(
            intermediateRepresentation.getTranspilerRepresentation(),
        ).to.deep.equal({
            'name': 'I_PATTERN',
            'capturingGroups': [0],
            'components': [
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'hello',
                        },
                        {
                            'name': 'I_RAW_NON_CAPTURE',
                            'chunks': [
                                {
                                    'name': 'I_RAW_NESTED',
                                    'node': {
                                        'name': 'I_RAW_REGEX',
                                        'chunks': [
                                            {
                                                'name': 'I_RAW_NESTED',
                                                'node': {
                                                    'name': 'I_RAW_REGEX',
                                                    'chunks': [
                                                        {
                                                            'name': 'I_RAW_CHARS',
                                                            'chars': 'to',
                                                        },
                                                        {
                                                            'name': 'I_RAW_CHARS',
                                                            'chars': '|',
                                                        },
                                                        {
                                                            'name': 'I_RAW_CHARS',
                                                            'chars': 'it',
                                                        },
                                                    ],
                                                    'fixedLength': 2, // Alternatives have the same fixed length.
                                                },
                                            },
                                        ],
                                        'fixedLength': 2,
                                    },
                                },
                            ],
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'world',
                        },
                    ],
                    'fixedLength': 12,
                },
            ],
        });
    });
});
