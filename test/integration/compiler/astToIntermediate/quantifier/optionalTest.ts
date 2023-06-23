/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import emulator from '../../../../../src';
import AstToIntermediateCompiler from '../../../../../src/AstToIntermediateCompiler';
import Ast from '../../../../../src/Ast';
import { SinonStubbedInstance } from 'sinon';
import sinon from 'ts-sinon';

describe('AST-to-IR compiler optional quantifier integration', () => {
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
                    'name': 'N_MAXIMISING_QUANTIFIER',
                    'quantifier': '?',
                    'component': { 'name': 'N_LITERAL', 'text': 'b' },
                },
                {
                    'name': 'N_MAXIMISING_QUANTIFIER',
                    'quantifier': '?',
                    'component': { 'name': 'N_LITERAL', 'text': 'c' },
                },
            ],
        });

        const intermediateRepresentation = compiler.compile(ast);

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
                            'chars': 'a',
                        },
                    ],
                },
                {
                    'name': 'I_MAXIMISING_QUANTIFIER',
                    'quantifier': '?',
                    'component': {
                        'name': 'I_RAW_REGEX',
                        'chunks': [
                            {
                                'name': 'I_RAW_CHARS',
                                'chars': 'b',
                            },
                        ],
                    },
                },
                {
                    'name': 'I_MAXIMISING_QUANTIFIER',
                    'quantifier': '?',
                    'component': {
                        'name': 'I_RAW_REGEX',
                        'chunks': [
                            {
                                'name': 'I_RAW_CHARS',
                                'chars': 'c',
                            },
                        ],
                    },
                },
            ],
        });
    });
});
