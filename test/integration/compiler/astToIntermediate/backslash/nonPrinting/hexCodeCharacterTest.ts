/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import emulator from '../../../../../../src';
import { expect } from 'chai';
import AstToIntermediateCompiler from '../../../../../../src/AstToIntermediateCompiler';
import Ast from '../../../../../../src/Ast';
import { SinonStubbedInstance } from 'sinon';
import sinon from 'ts-sinon';

describe('AST-to-IR compiler hexadecimal code character escape integration', () => {
    let compiler: AstToIntermediateCompiler;

    beforeEach(() => {
        compiler = emulator.createAstToIntermediateCompiler();
    });

    it('should be able to compile an AST with hex code char escape and two literals to IR', () => {
        const ast = sinon.createStubInstance(Ast) as SinonStubbedInstance<Ast> &
            Ast;
        ast.getParsingAst.returns({
            'name': 'N_PATTERN',
            'components': [
                { 'name': 'N_LITERAL', 'text': 'hello' },
                { 'name': 'N_HEX_CODE_CHAR', 'code': '20' },
                { 'name': 'N_LITERAL', 'text': 'world' },
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
                            'chars': 'hello',
                        },
                    ],
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': '\\x20',
                        },
                    ],
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'world',
                        },
                    ],
                },
            ],
        });
    });
});
