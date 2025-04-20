/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import emulator from '../../../../src';
import AstToIntermediateCompiler from '../../../../src/AstToIntermediateCompiler';
import Ast from '../../../../src/Ast';
import { SinonStubbedInstance } from 'sinon';
import sinon from 'ts-sinon';

describe('AST-to-IR compiler whitespace integration', () => {
    let compiler: AstToIntermediateCompiler;

    beforeEach(() => {
        compiler = emulator.createAstToIntermediateCompiler();
    });

    it('should be able to compile an AST with two whitespace and one literal to IR outside extended mode', () => {
        const ast = sinon.createStubInstance(Ast) as SinonStubbedInstance<Ast> &
            Ast;
        ast.getFlags.returns({ extended: false });
        ast.getParsingAst.returns({
            'name': 'N_PATTERN',
            'components': [
                { 'name': 'N_WHITESPACE', 'chars': '    ' },
                { 'name': 'N_LITERAL', 'text': 'hello' },
                { 'name': 'N_WHITESPACE', 'chars': '  \t ' },
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
                            'chars': '    ',
                        },
                    ],
                    'fixedLength': 4,
                },
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
                            'chars': '  \t ',
                        },
                    ],
                    'fixedLength': 4,
                },
            ],
        });
    });

    it('should be able to compile an AST with two whitespace and one literal to IR in extended mode', () => {
        const ast = sinon.createStubInstance(Ast) as SinonStubbedInstance<Ast> &
            Ast;
        ast.getFlags.returns({ extended: true });
        ast.getParsingAst.returns({
            'name': 'N_PATTERN',
            'components': [
                { 'name': 'N_WHITESPACE', 'chars': '    ' },
                { 'name': 'N_LITERAL', 'text': 'hello' },
                { 'name': 'N_WHITESPACE', 'chars': '  \t ' },
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
                    // Whitespace is compiled to a no-op at this stage in extended mode, as it will be ignored.
                    'name': 'I_NOOP',
                },
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
                    // As above.
                    'name': 'I_NOOP',
                },
            ],
        });
    });
});
