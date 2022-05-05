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

describe('IR-to-Pattern compiler raw regex characters integration', () => {
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
            'components': [
                {
                    'name': 'I_RAW_REGEX',
                    'chars': 'hello',
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chars': 'world',
                },
            ],
        });

        const pattern = compiler.compile(intermediateRepresentation);

        expect(pattern.toString()).to.equal('/helloworld/dg');
    });
});
