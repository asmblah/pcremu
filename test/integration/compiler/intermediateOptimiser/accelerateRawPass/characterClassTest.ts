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

describe('IR optimiser accelerateRawPass compiler character class integration', () => {
    let optimiser: IntermediateOptimiser;

    beforeEach(() => {
        optimiser = emulator.createPartialIntermediateOptimiser([
            accelerateRawPassSpec,
        ]);
    });

    it('should be able to optimise an IR with a character class of optimisable components', () => {
        const ir = sinon.createStubInstance(
            IntermediateRepresentation,
        ) as SinonStubbedInstance<IntermediateRepresentation> &
            IntermediateRepresentation;
        ir.getTranspilerRepresentation.returns({
            'name': 'I_PATTERN',
            'capturingGroups': [0],
            'components': [
                {
                    'name': 'I_CHARACTER_CLASS',
                    'negated': false,
                    'components': [
                        {
                            'name': 'I_CHARACTER_RANGE',
                            'from': {
                                'name': 'I_RAW_REGEX',
                                'chunks': [
                                    {
                                        'chars': 'f',
                                        'name': 'I_RAW_CHARS',
                                    },
                                ],
                                'fixedLength': 1,
                            },
                            'to': {
                                'name': 'I_RAW_REGEX',
                                'chunks': [
                                    {
                                        'chars': 'k',
                                        'name': 'I_RAW_CHARS',
                                    },
                                ],
                                'fixedLength': 1,
                            },
                        },
                        {
                            'name': 'I_RAW_REGEX',
                            'chunks': [
                                {
                                    'name': 'I_RAW_CHARS',
                                    'chars': 'ab',
                                },
                            ],
                            'fixedLength': 2,
                        },
                    ],
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
                            'chars': '[',
                        },
                        {
                            'name': 'I_RAW_NESTED',
                            'node': {
                                'name': 'I_RAW_REGEX',
                                'chunks': [
                                    // Note that these would subsequently be concatenated
                                    // by compileRawPass.
                                    {
                                        'name': 'I_RAW_CHARS',
                                        'chars': 'f-k',
                                    },
                                    {
                                        'name': 'I_RAW_CHARS',
                                        'chars': 'ab',
                                    },
                                ],
                                'fixedLength': null,
                            },
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': ']',
                        },
                    ],
                    'fixedLength': 1,
                },
            ],
        });
    });
});
