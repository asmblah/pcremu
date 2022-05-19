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
import sinon = require('sinon');

describe('IR optimiser accelerateRawPass compiler capturing group integration', () => {
    let optimiser: IntermediateOptimiser;

    beforeEach(() => {
        optimiser = emulator.createPartialIntermediateOptimiser([
            accelerateRawPassSpec,
        ]);
    });

    it('should be able to optimise an IR with a capturing group', () => {
        const ir = sinon.createStubInstance(
            IntermediateRepresentation
        ) as SinonStubbedInstance<IntermediateRepresentation> &
            IntermediateRepresentation;
        ir.getTranspilerRepresentation.returns({
            'name': 'I_PATTERN',
            // Note that capturing group name "1" is included here.
            'capturingGroups': [0, 1],
            'components': [
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'hello',
                        },
                    ],
                },
                {
                    'name': 'I_CAPTURING_GROUP',
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
                },
            ],
        });

        const intermediateRepresentation = optimiser.optimise(ir);

        expect(
            intermediateRepresentation.getTranspilerRepresentation()
        ).to.deep.equal({
            'name': 'I_PATTERN',
            // Note that capturing group name "1" is included here.
            'capturingGroups': [0, 1],
            'components': [
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'hello',
                        },
                        {
                            'name': 'I_RAW_CAPTURE',
                            'groupIndex': 1,
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
                                    },
                                },
                            ],
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'world',
                        },
                    ],
                },
            ],
        });
    });
});
