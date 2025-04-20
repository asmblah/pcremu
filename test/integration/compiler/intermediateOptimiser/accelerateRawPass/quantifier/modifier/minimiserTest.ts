/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import accelerateRawPassSpec from '../../../../../../../src/spec/intermediateOptimiser/accelerateRawPass';
import emulator from '../../../../../../../src';
import { SinonStubbedInstance } from 'sinon';
import IntermediateOptimiser from '../../../../../../../src/IntermediateOptimiser';
import IntermediateRepresentation from '../../../../../../../src/IntermediateRepresentation';
import sinon from 'ts-sinon';

describe('IR optimiser accelerateRawPass compiler minimising quantifier integration', () => {
    let optimiser: IntermediateOptimiser;

    beforeEach(() => {
        optimiser = emulator.createPartialIntermediateOptimiser([
            accelerateRawPassSpec,
        ]);
    });

    it('should be able to optimise an IR with two minimising quantifiers', () => {
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
                            'chars': 'a',
                        },
                    ],
                    'fixedLength': 1,
                },
                {
                    'name': 'I_MINIMISING_QUANTIFIER',
                    'quantifier': {
                        min: 0,
                        max: Infinity,
                        raw: '*',
                    },
                    'component': {
                        'name': 'I_RAW_REGEX',
                        'chunks': [
                            {
                                'name': 'I_RAW_CHARS',
                                'chars': 'b',
                            },
                        ],
                        'fixedLength': 1,
                    },
                },
                {
                    'name': 'I_MINIMISING_QUANTIFIER',
                    'quantifier': {
                        min: 1,
                        max: Infinity,
                        raw: '+',
                    },
                    'component': {
                        'name': 'I_RAW_REGEX',
                        'chunks': [
                            {
                                'name': 'I_RAW_CHARS',
                                'chars': 'c',
                            },
                        ],
                        'fixedLength': 1,
                    },
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
                            'chars': 'a',
                        },
                        {
                            'name': 'I_RAW_NESTED',
                            'node': {
                                'name': 'I_RAW_REGEX',
                                'chunks': [
                                    {
                                        'name': 'I_RAW_CHARS',
                                        'chars': 'b',
                                    },
                                ],
                                'fixedLength': 1,
                            },
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': '*?',
                        },
                        {
                            'name': 'I_RAW_NESTED',
                            'node': {
                                'name': 'I_RAW_REGEX',
                                'chunks': [
                                    {
                                        'name': 'I_RAW_CHARS',
                                        'chars': 'c',
                                    },
                                ],
                                'fixedLength': 1,
                            },
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': '+?',
                        },
                    ],
                    'fixedLength': null, // Variable-length quantifiers.
                },
            ],
        });
    });

    it('should be able to optimise an IR with one fixed-length minimising quantifier', () => {
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
                            'chars': 'a',
                        },
                    ],
                    'fixedLength': 1,
                },
                {
                    'name': 'I_MINIMISING_QUANTIFIER',
                    'quantifier': {
                        min: 2,
                        max: 2,
                        raw: '{2}',
                    },
                    'component': {
                        'name': 'I_RAW_REGEX',
                        'chunks': [
                            {
                                'name': 'I_RAW_CHARS',
                                'chars': 'bcd',
                            },
                        ],
                        'fixedLength': 3,
                    },
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
                            'chars': 'a',
                        },
                        {
                            'name': 'I_RAW_NESTED',
                            'node': {
                                'name': 'I_RAW_REGEX',
                                'chunks': [
                                    {
                                        'name': 'I_RAW_CHARS',
                                        'chars': 'bcd',
                                    },
                                ],
                                'fixedLength': 3,
                            },
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': '{2}?',
                        },
                    ],
                    'fixedLength': 7, // Fixed length: 1 (a) + 6 (bcd{2}).
                },
            ],
        });
    });
});
