/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import compileRawPassSpec from '../../../../../src/spec/intermediateOptimiser/compileRawPass';
import emulator from '../../../../../src';
import { SinonStubbedInstance } from 'sinon';
import IntermediateOptimiser from '../../../../../src/IntermediateOptimiser';
import IntermediateRepresentation from '../../../../../src/IntermediateRepresentation';
import sinon from 'ts-sinon';

describe('IR optimiser compileRawPass compiler all nodes integration', () => {
    let optimiser: IntermediateOptimiser;

    beforeEach(() => {
        optimiser = emulator.createPartialIntermediateOptimiser([
            compileRawPassSpec,
        ]);
    });

    it('should be able to optimise an IR with all raw nodes', () => {
        const ir = sinon.createStubInstance(
            IntermediateRepresentation
        ) as SinonStubbedInstance<IntermediateRepresentation> &
            IntermediateRepresentation;
        ir.getTranspilerRepresentation.returns({
            'name': 'I_PATTERN',
            'capturingGroups': [0, 1, 'myGroup', 3],
            'components': [
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'before-capture-one',
                        },
                        {
                            'name': 'I_RAW_CAPTURE',
                            'id': 'myFirstRef',
                            'groupIndex': 2,
                            'chunks': [
                                {
                                    'name': 'I_RAW_CHARS',
                                    'chars': 'in-capture-one',
                                },
                            ],
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'after-capture-one',
                        },
                        {
                            'name': 'I_RAW_BACKREFERENCE',
                            'id': 'myFirstRef',
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'before-capture-two',
                        },
                        {
                            'name': 'I_RAW_CAPTURE',
                            'id': 'mySecondRef',
                            'groupIndex': 1,
                            'chunks': [
                                {
                                    'name': 'I_RAW_CHARS',
                                    'chars': 'in-capture-two',
                                },
                            ],
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'after-capture-two',
                        },
                        {
                            'name': 'I_RAW_BACKREFERENCE',
                            'id': 'mySecondRef',
                        },
                    ],
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'before-ghost',
                        },
                        {
                            'name': 'I_RAW_GHOST_CAPTURE',
                            'id': 'myThirdRef',
                            'chunks': [
                                {
                                    'name': 'I_RAW_CHARS',
                                    'chars': 'in-ghost',
                                },
                            ],
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'after-ghost',
                        },
                        {
                            'name': 'I_RAW_BACKREFERENCE',
                            'id': 'myThirdRef',
                        },
                    ],
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'before-named',
                        },
                        {
                            'name': 'I_RAW_NAMED_CAPTURE',
                            'id': 'myThirdRef',
                            'groupIndex': 3,
                            'groupName': 'myGroup',
                            'chunks': [
                                {
                                    'name': 'I_RAW_CHARS',
                                    'chars': 'in-named',
                                },
                            ],
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'after-named',
                        },
                        {
                            'name': 'I_RAW_BACKREFERENCE',
                            'id': 'myThirdRef',
                        },
                    ],
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'before-nested',
                        },
                        {
                            'name': 'I_RAW_NESTED',
                            'node': {
                                'name': 'I_RAW_REGEX',
                                'chunks': [
                                    {
                                        'name': 'I_RAW_CHARS',
                                        'chars': 'in-nested',
                                    },
                                ],
                            },
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'after-nested',
                        },
                    ],
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'before-non-capture',
                        },
                        {
                            'name': 'I_RAW_NON_CAPTURE',
                            'chunks': [
                                {
                                    'name': 'I_RAW_CHARS',
                                    'chars': 'in-non-capture',
                                },
                            ],
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'after-non-capture',
                        },
                    ],
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'before-noop',
                        },
                        {
                            'name': 'I_RAW_NOOP',
                        },
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'after-noop',
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
            'capturingGroups': [0, 1, 'myGroup', 3],
            'components': [
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_OPTIMISED',
                            'chars':
                                'before-capture-one(in-capture-one)after-capture-one\\1before-capture-two(in-capture-two)after-capture-two\\2',
                            'patternToEmulatedNumberedGroupIndex': {
                                '2': 1,
                                '1': 2,
                            },
                        },
                    ],
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_OPTIMISED',
                            'chars': 'before-ghost(in-ghost)after-ghost\\1',
                            'patternToEmulatedNumberedGroupIndex': {},
                        },
                    ],
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_OPTIMISED',
                            'chars':
                                'before-named(?<myGroup>in-named)after-named\\1',
                            'patternToEmulatedNumberedGroupIndex': {
                                '3': 1,
                            },
                        },
                    ],
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_OPTIMISED',
                            'chars': 'before-nestedin-nestedafter-nested',
                            'patternToEmulatedNumberedGroupIndex': {},
                        },
                    ],
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_OPTIMISED',
                            'chars':
                                'before-non-capture(?:in-non-capture)after-non-capture',
                            'patternToEmulatedNumberedGroupIndex': {},
                        },
                    ],
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_OPTIMISED',
                            'chars': 'before-noopafter-noop',
                            'patternToEmulatedNumberedGroupIndex': {},
                        },
                    ],
                },
            ],
        });
    });
});
