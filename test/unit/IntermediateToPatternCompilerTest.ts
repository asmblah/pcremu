/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import IntermediateRepresentation from '../../src/IntermediateRepresentation';
import IntermediateToPatternCompiler from '../../src/IntermediateToPatternCompiler';
import Pattern from '../../src/Pattern';
import PatternFactory from '../../src/PatternFactory';
import PatternFragment from '../../src/Match/Fragment/PatternFragment';
import { SinonStub, SinonStubbedInstance } from 'sinon';
import sinon = require('sinon');
import { Flags } from '../../src/declarations/types';

describe('IntermediateToPatternCompiler', () => {
    let compiler: IntermediateToPatternCompiler;
    let flags: Flags;
    let intermediateToPatternTranspiler: any;
    let ir: SinonStubbedInstance<IntermediateRepresentation> &
        IntermediateRepresentation;
    let pattern: SinonStubbedInstance<Pattern> & Pattern;
    let patternFactory: SinonStubbedInstance<PatternFactory> & PatternFactory;
    let patternFragment: SinonStubbedInstance<PatternFragment> &
        PatternFragment;
    let transpile: SinonStub;
    let transpilerIr: object;

    beforeEach(() => {
        flags = { extended: true, caseless: false };
        transpile = sinon.stub();
        intermediateToPatternTranspiler = {
            transpile,
        };
        ir = sinon.createStubInstance(
            IntermediateRepresentation
        ) as SinonStubbedInstance<IntermediateRepresentation> &
            IntermediateRepresentation;
        pattern = sinon.createStubInstance(
            Pattern
        ) as SinonStubbedInstance<Pattern> & Pattern;
        patternFactory = sinon.createStubInstance(
            PatternFactory
        ) as SinonStubbedInstance<PatternFactory> & PatternFactory;
        patternFragment = sinon.createStubInstance(
            PatternFragment
        ) as SinonStubbedInstance<PatternFragment> & PatternFragment;
        transpilerIr = {
            'name': 'I_PATTERN',
            'components': [],
        };

        ir.getFlags.returns(flags);
        ir.getTranspilerRepresentation.returns(transpilerIr);
        patternFactory.createPattern.returns(pattern);

        transpile
            .withArgs(transpilerIr, {
                flags,
            })
            .returns(patternFragment);

        compiler = new IntermediateToPatternCompiler(
            patternFactory,
            intermediateToPatternTranspiler
        );
    });

    describe('compile()', () => {
        it('should return a correctly constructed Pattern for a simple literal pattern with flags', () => {
            expect(compiler.compile(ir)).to.equal(pattern);
            expect(patternFactory.createPattern).to.have.been.calledOnce;
            expect(patternFactory.createPattern).to.have.been.calledWith(
                sinon.match.same(patternFragment),
                flags
            );
        });
    });
});
