/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import accelerateRawPassSpec from '../../../../../../src/spec/intermediateOptimiser/accelerateRawPass';
import emulator from '../../../../../../src';
import { SinonStubbedInstance } from 'sinon';
import IntermediateOptimiser from '../../../../../../src/IntermediateOptimiser';
import IntermediateRepresentation from '../../../../../../src/IntermediateRepresentation';
import sinon from 'ts-sinon';

describe('IR optimiser accelerateRawPass compiler maximising quantifier integration', () => {
    let optimiser: IntermediateOptimiser;

    beforeEach(() => {
        optimiser = emulator.createPartialIntermediateOptimiser([
            accelerateRawPassSpec,
        ]);
    });

    it('should be able to optimise an IR with two maximising quantifiers', () => {
        const ir = sinon.createStubInstance(
            IntermediateRepresentation
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
                },
                {
                    'name': 'I_MAXIMISING_QUANTIFIER',
                    'quantifier': '*',
                    'component': {
                        'name': 'I_RAW_REGEX',
                        'chunks': [
                            {
                                'name': 'I_RAW_CHARS',
                                'chars': 'b',
                            },
                        ],
                    },
                },
                {
                    'name': 'I_MAXIMISING_QUANTIFIER',
                    'quantifier': '+',
                    'component': {
                        'name': 'I_RAW_REGEX',
                        'chunks': [
                            {
                                'name': 'I_RAW_CHARS',
                                'chars': 'c',
                            },
                        ],
                    },
                },
            ],
        });

        const intermediateRepresentation = optimiser.optimise(ir);

        expect(
            intermediateRepresentation.getTranspilerRepresentation()
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
                            },
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': '*',
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
                            },
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': '+',
                        },
                    ],
                },
            ],
        });
    });
});
