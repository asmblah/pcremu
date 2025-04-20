/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import sinon from 'ts-sinon';
import { Flags } from '../../src/declarations/types';
import FragmentMatcher from '../../src/Match/FragmentMatcher';
import IntermediateRepresentation from '../../src/IntermediateRepresentation';
import IntermediateToPatternCompiler from '../../src/IntermediateToPatternCompiler';
import Pattern from '../../src/Pattern';
import PatternFactory from '../../src/PatternFactory';
import PatternFragment from '../../src/Match/Fragment/PatternFragment';
import QuantifierMatcher from '../../src/Match/QuantifierMatcher';
import { SinonStub, SinonStubbedInstance } from 'sinon';

describe('IntermediateToPatternCompiler', () => {
    let compiler: IntermediateToPatternCompiler;
    let flags: Flags;
    let fragmentMatcher: SinonStubbedInstance<FragmentMatcher> &
        FragmentMatcher;
    let intermediateToPatternTranspiler: any;
    let ir: SinonStubbedInstance<IntermediateRepresentation> &
        IntermediateRepresentation;
    let pattern: SinonStubbedInstance<Pattern> & Pattern;
    let patternFactory: SinonStubbedInstance<PatternFactory> & PatternFactory;
    let patternFragment: SinonStubbedInstance<PatternFragment> &
        PatternFragment;
    let quantifierMatcher: SinonStubbedInstance<QuantifierMatcher> &
        QuantifierMatcher;
    let transpile: SinonStub;
    let transpilerIr: object;

    beforeEach(() => {
        flags = { extended: true, caseless: false };
        fragmentMatcher = sinon.createStubInstance(
            FragmentMatcher,
        ) as SinonStubbedInstance<FragmentMatcher> & FragmentMatcher;
        quantifierMatcher = sinon.createStubInstance(
            QuantifierMatcher,
        ) as SinonStubbedInstance<QuantifierMatcher> & QuantifierMatcher;
        transpile = sinon.stub();
        intermediateToPatternTranspiler = {
            transpile,
        };
        ir = sinon.createStubInstance(
            IntermediateRepresentation,
        ) as SinonStubbedInstance<IntermediateRepresentation> &
            IntermediateRepresentation;
        pattern = sinon.createStubInstance(
            Pattern,
        ) as SinonStubbedInstance<Pattern> & Pattern;
        patternFactory = sinon.createStubInstance(
            PatternFactory,
        ) as SinonStubbedInstance<PatternFactory> & PatternFactory;
        patternFragment = sinon.createStubInstance(
            PatternFragment,
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
                fragmentMatcher: sinon.match.same(fragmentMatcher),
                quantifierMatcher: sinon.match.same(quantifierMatcher),
            })
            .returns(patternFragment);

        compiler = new IntermediateToPatternCompiler(
            patternFactory,
            fragmentMatcher,
            quantifierMatcher,
            intermediateToPatternTranspiler,
        );
    });

    describe('compile()', () => {
        it('should return a correctly constructed Pattern for a simple literal pattern with flags', () => {
            expect(compiler.compile(ir)).to.equal(pattern);
            expect(patternFactory.createPattern).to.have.been.calledOnce;
            expect(patternFactory.createPattern).to.have.been.calledWith(
                sinon.match.same(patternFragment),
                flags,
            );
        });
    });
});
