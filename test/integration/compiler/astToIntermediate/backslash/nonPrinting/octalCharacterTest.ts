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

describe('AST-to-IR compiler octal character escape integration', () => {
    let compiler: AstToIntermediateCompiler;

    beforeEach(() => {
        compiler = emulator.createAstToIntermediateCompiler();
    });

    it('should be able to compile an AST with octal char escape and two literals to IR', () => {
        const ast = sinon.createStubInstance(Ast) as SinonStubbedInstance<Ast> &
            Ast;
        ast.getParsingAst.returns({
            'name': 'N_PATTERN',
            'components': [
                { 'name': 'N_LITERAL', 'text': 'hello' },
                {
                    'name': 'N_NUMBERED_BACKREFERENCE_OR_OCTAL_CHAR',
                    'digits': '10',
                },
                { 'name': 'N_LITERAL', 'text': 'world' },
            ],
        });
        ast.getPattern.returns('hello\\10world');
        ast.getFlags.returns({});

        const intermediateRepresentation = compiler.compile(ast);

        expect(intermediateRepresentation.getPattern()).to.equal(
            'hello\\10world'
        );
        expect(intermediateRepresentation.getFlags()).to.deep.equal({});
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
                    'fixedLength': 5,
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': String.fromCharCode(0o10), // Octal character escape.
                        },
                    ],
                    'fixedLength': 1,
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_CHARS',
                            'chars': 'world',
                        },
                    ],
                    'fixedLength': 5,
                },
            ],
        });
    });
});
