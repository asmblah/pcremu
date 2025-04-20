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

describe('IR optimiser accelerateRawPass compiler raw regex integration', () => {
    let optimiser: IntermediateOptimiser;

    beforeEach(() => {
        optimiser = emulator.createPartialIntermediateOptimiser([
            accelerateRawPassSpec,
        ]);
    });

    it('should be able to optimise an IR with a raw regex character class', () => {
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
                            'chars': 'hello',
                        },
                    ],
                    'fixedLength': 5,
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': '[^]c-dfg-]',
                        },
                    ],
                    'fixedLength': 1,
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
                            'chars': 'hello',
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': '[^]c-dfg-]',
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'world',
                        },
                    ],
                    'fixedLength': 11,
                },
            ],
        });
    });
});
