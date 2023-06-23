/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import emulator from '../../../../../src';
import { expect } from 'chai';
import sinon from 'ts-sinon';
import { DEFAULT_FLAGS } from '../../../../../src/Parser';
import { SinonStubbedInstance } from 'sinon';
import IntermediateToPatternCompiler from '../../../../../src/IntermediateToPatternCompiler';
import IntermediateRepresentation from '../../../../../src/IntermediateRepresentation';

describe('IR-to-Pattern compiler (unoptimised) non-capturing group integration', () => {
    let compiler: IntermediateToPatternCompiler;

    beforeEach(() => {
        compiler = emulator.createIntermediateToPatternCompiler();
    });

    it('should be able to compile an IR with one non-capturing group node to Pattern', () => {
        const intermediateRepresentation = sinon.createStubInstance(
            IntermediateRepresentation
        ) as SinonStubbedInstance<IntermediateRepresentation> &
            IntermediateRepresentation;
        intermediateRepresentation.getFlags.returns(DEFAULT_FLAGS);
        intermediateRepresentation.getTranspilerRepresentation.returns({
            'name': 'I_PATTERN',
            'capturingGroups': [],
            'components': [
                {
                    'name': 'I_NON_CAPTURING_GROUP',
                    'components': [
                        {
                            'name': 'I_RAW_REGEX',
                            'chunks': [{ 'name': 'I_RAW_CHARS', chars: 'X' }],
                        },
                    ],
                },
            ],
        });

        const pattern = compiler.compile(intermediateRepresentation);

        // Note we just use the native syntax for this.
        expect(pattern.toStructure()).to.deep.equal({
            type: 'pattern',
            capturingGroups: [],
            components: [
                {
                    type: 'non-capturing-group',
                    components: [
                        {
                            type: 'native',
                            chars: 'X',
                            patternToEmulatedNumberedGroupIndex: {},
                        },
                    ],
                },
            ],
        });
    });
});
