/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import emulator from '../../../../../../src';
import sinon = require('sinon');
import AstToIntermediateCompiler from '../../../../../../src/AstToIntermediateCompiler';
import Ast from '../../../../../../src/Ast';
import { SinonStubbedInstance } from 'sinon';

describe('AST-to-IR compiler possessive quantifier integration', () => {
    let compiler: AstToIntermediateCompiler;

    beforeEach(() => {
        compiler = emulator.createAstToIntermediateCompiler();
    });

    it('should be able to compile an AST with two quantifiers to IR', () => {
        const ast = sinon.createStubInstance(Ast) as SinonStubbedInstance<Ast> &
            Ast;
        ast.getParsingAst.returns({
            'name': 'N_PATTERN',
            'components': [
                { 'name': 'N_LITERAL', 'text': 'a' },
                {
                    'name': 'N_POSSESSIVE_QUANTIFIER',
                    'quantifier': '+',
                    'component': { 'name': 'N_LITERAL', 'text': 'b' },
                },
                {
                    'name': 'N_POSSESSIVE_QUANTIFIER',
                    'quantifier': '*',
                    'component': { 'name': 'N_LITERAL', 'text': 'c' },
                },
            ],
        });

        const intermediateRepresentation = compiler.compile(ast);

        expect(
            intermediateRepresentation.getTranspilerRepresentation()
        ).to.deep.equal({
            'name': 'I_PATTERN',
            'components': [
                {
                    'name': 'I_RAW_REGEX',
                    'chars': 'a',
                },
                {
                    'name': 'I_POSSESSIVE_QUANTIFIER',
                    'quantifier': '+',
                    'component': { 'name': 'I_RAW_REGEX', 'chars': 'b' },
                },
                {
                    'name': 'I_POSSESSIVE_QUANTIFIER',
                    'quantifier': '*',
                    'component': { 'name': 'I_RAW_REGEX', 'chars': 'c' },
                },
            ],
        });
    });
});
