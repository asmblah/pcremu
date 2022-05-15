/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import emulator from '../../../../src';
import { expect } from 'chai';
import sinon = require('sinon');
import { DEFAULT_FLAGS } from '../../../../src/Parser';
import IntermediateToPatternCompiler from '../../../../src/IntermediateToPatternCompiler';
import IntermediateRepresentation from '../../../../src/IntermediateRepresentation';
import { SinonStubbedInstance } from 'sinon';

describe('IR-to-Pattern compiler (unoptimised) raw regex characters integration', () => {
    let compiler: IntermediateToPatternCompiler;

    beforeEach(() => {
        compiler = emulator.createIntermediateToPatternCompiler();
    });

    it('should be able to compile an IR with two raw regex nodes to Pattern', () => {
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
                    'name': 'I_RAW_REGEX',
                    'chunks': [{ 'name': 'I_RAW_CHARS', chars: 'hello' }],
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [{ 'name': 'I_RAW_CHARS', chars: 'world' }],
                },
            ],
        });

        const pattern = compiler.compile(intermediateRepresentation);

        expect(pattern.toStructure()).to.deep.equal({
            type: 'pattern',
            capturingGroups: [],
            components: [
                {
                    type: 'native',
                    chars: 'hello',
                    patternToEmulatedNumberedGroupIndex: [],
                },
                {
                    type: 'native',
                    chars: 'world',
                    patternToEmulatedNumberedGroupIndex: [],
                },
            ],
        });
    });
});
