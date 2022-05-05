/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import sinon = require('sinon');
import { Context } from '../../src/spec/intermediateToPattern';
import { DEFAULT_FLAGS } from '../../src/Parser';
import IntermediateRepresentation from '../../src/IntermediateRepresentation';
import IntermediateToPatternCompiler from '../../src/IntermediateToPatternCompiler';
import PatternFactory from '../../src/PatternFactory';
import Pattern from '../../src/Pattern';
import { SinonStub, SinonStubbedInstance } from 'sinon';

describe('IntermediateToPatternCompiler', () => {
    let compiler: IntermediateToPatternCompiler;
    let intermediateToPatternTranspiler: any;
    let ir: SinonStubbedInstance<IntermediateRepresentation> &
        IntermediateRepresentation;
    let pattern: SinonStubbedInstance<Pattern> & Pattern;
    let patternFactory: SinonStubbedInstance<PatternFactory> & PatternFactory;
    let transpile: SinonStub;
    let transpilerIr: object;

    beforeEach(() => {
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
        transpilerIr = {
            'name': 'I_PATTERN',
            'components': [],
        };

        ir.getFlags.returns(DEFAULT_FLAGS);
        ir.getTranspilerRepresentation.returns(transpilerIr);
        patternFactory.createPattern.returns(pattern);

        transpile.withArgs(transpilerIr).returns('hello');

        compiler = new IntermediateToPatternCompiler(
            patternFactory,
            intermediateToPatternTranspiler
        );
    });

    describe('compile()', () => {
        it('should return a correctly constructed Pattern for a simple literal pattern with no flags', () => {
            expect(compiler.compile(ir)).to.equal(pattern);
            expect(patternFactory.createPattern).to.have.been.calledOnce;
            expect(String(patternFactory.createPattern.args[0][0])).to.equal(
                '/hello/dg'
            );
            // capturingGroupNames should only include the entire match group (0).
            expect(patternFactory.createPattern.args[0][1]).to.deep.equal([0]);
            // patternToEmulatedNumberedGroupIndex should only include the entire match group (0).
            expect(patternFactory.createPattern.args[0][2]).to.deep.equal([0]);
        });

        it('should return a correctly constructed Pattern for a complex pattern with flags', () => {
            ir.getFlags.returns({ multiline: true });
            transpile
                .withArgs(transpilerIr)
                .callsFake((transpilerIr, context: Context) => {
                    context.addNumberedCapturingGroup();
                    context.addAtomicGroup();
                    context.addNumberedCapturingGroup();
                    context.addNamedCapturingGroup('gr');

                    return '(?!(a){4,})(b)(?<gr>c)';
                });

            expect(compiler.compile(ir)).to.equal(pattern);
            expect(patternFactory.createPattern).to.have.been.calledOnce;
            expect(String(patternFactory.createPattern.args[0][0])).to.equal(
                '/(?!(a){4,})(b)(?<gr>c)/dgm'
            );
            // capturingGroupNames should only include the entire match group (0).
            expect(patternFactory.createPattern.args[0][1]).to.deep.equal([
                0,
                1,
                2,
                'gr',
                3,
            ]);
            // patternToEmulatedNumberedGroupIndex should only include the entire match group (0).
            expect(patternFactory.createPattern.args[0][2]).to.deep.equal([
                0, 1,
                // Note 2 is skipped as it is an emulation capturing group only used
                // via a backreference to emulate atomic matching.
                3,
                4,
            ]);
        });
    });
});
