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

describe('IR optimiser accelerateRawPass compiler non-capturing group integration', () => {
    let optimiser: IntermediateOptimiser;

    beforeEach(() => {
        optimiser = emulator.createPartialIntermediateOptimiser([
            accelerateRawPassSpec,
        ]);
    });

    it('should be able to optimise an IR with a non-capturing group', () => {
        const ir = sinon.createStubInstance(
            IntermediateRepresentation,
        ) as SinonStubbedInstance<IntermediateRepresentation> &
            IntermediateRepresentation;
        ir.getTranspilerRepresentation.returns({
            'name': 'I_PATTERN',
            // Note that capturing group index "1" is _not_ included here as this group is non-capturing.
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
                    'groupIndex': 1,
                    'components': [
                        {
                            'name': 'I_RAW_REGEX',
                            'chunks': [
                                {
                                    'name': 'I_RAW_CHARS',
                                    'chars': 'inner',
                                },
                            ],
                            'fixedLength': 5,
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
            // Note that capturing group index "1" is _not_ included here as this group is non-capturing.
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
                                                'name': 'I_RAW_CHARS',
                                                'chars': 'inner',
                                            },
                                        ],
                                        'fixedLength': 5,
                                    },
                                },
                            ],
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'world',
                        },
                    ],
                    'fixedLength': 15,
                },
            ],
        });
    });
});
