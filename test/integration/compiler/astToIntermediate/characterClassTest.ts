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
import sinon = require('sinon');

describe('AST-to-IR compiler character class integration', () => {
    let compiler: AstToIntermediateCompiler;

    beforeEach(() => {
        compiler = emulator.createAstToIntermediateCompiler();
    });

    it('should be able to compile an AST with one character class to IR', () => {
        const ast = sinon.createStubInstance(Ast) as SinonStubbedInstance<Ast> &
            Ast;
        ast.getParsingAst.returns({
            'name': 'N_PATTERN',
            'components': [
                { 'name': 'N_LITERAL', 'text': 'hello' },
                {
                    'name': 'N_CHARACTER_CLASS',
                    'negated': true,
                    'components': [
                        {
                            'name': 'N_CHARACTER',
                            'char': ']',
                        },
                        {
                            'name': 'N_CHARACTER_RANGE',
                            'from': { 'name': 'N_CHARACTER', 'char': 'c' },
                            'to': { 'name': 'N_CHARACTER', 'char': 'd' },
                        },
                        {
                            'name': 'N_CHARACTER',
                            'char': 'f',
                        },
                        {
                            'name': 'N_ESCAPED_CHAR',
                            // Check that we handle escaping of special chars correctly.
                            'char': ']',
                        },
                        {
                            'name': 'N_CHARACTER',
                            'char': 'g',
                        },
                        {
                            'name': 'N_HEX_CODE_CHAR',
                            'code': '9e',
                        },
                        {
                            'name': 'N_CHARACTER',
                            'char': 'h',
                        },
                        {
                            'name': 'N_CHARACTER',
                            'char': '(',
                        },
                        {
                            'name': 'N_CHARACTER',
                            'char': '-',
                        },
                    ],
                },
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
                    'name': 'I_CHARACTER_CLASS',
                    'negated': true,
                    'components': [
                        {
                            'name': 'I_RAW_REGEX',
                            'chunks': [
                                {
                                    'name': 'I_RAW_CHARS',
                                    'chars': '\\]',
                                },
                            ],
                        },
                        {
                            'name': 'I_CHARACTER_RANGE',
                            'from': {
                                'name': 'I_RAW_REGEX',
                                'chunks': [
                                    {
                                        'chars': 'c',
                                        'name': 'I_RAW_CHARS',
                                    },
                                ],
                            },
                            'to': {
                                'name': 'I_RAW_REGEX',
                                'chunks': [
                                    {
                                        'chars': 'd',
                                        'name': 'I_RAW_CHARS',
                                    },
                                ],
                            },
                        },
                        {
                            'name': 'I_RAW_REGEX',
                            'chunks': [
                                {
                                    'name': 'I_RAW_CHARS',
                                    'chars': 'f',
                                },
                            ],
                        },
                        {
                            'name': 'I_RAW_REGEX',
                            'chunks': [
                                {
                                    'name': 'I_RAW_CHARS',
                                    'chars': '\\]',
                                },
                            ],
                        },
                        {
                            'name': 'I_RAW_REGEX',
                            'chunks': [
                                {
                                    'chars': 'g',
                                    'name': 'I_RAW_CHARS',
                                },
                            ],
                        },
                        {
                            'name': 'I_RAW_REGEX',
                            'chunks': [
                                {
                                    'chars': '\\x9e',
                                    'name': 'I_RAW_CHARS',
                                },
                            ],
                        },
                        {
                            'name': 'I_RAW_REGEX',
                            'chunks': [
                                {
                                    'chars': 'h',
                                    'name': 'I_RAW_CHARS',
                                },
                            ],
                        },
                        {
                            'name': 'I_RAW_REGEX',
                            'chunks': [
                                {
                                    'chars': '\\(',
                                    'name': 'I_RAW_CHARS',
                                },
                            ],
                        },
                        {
                            'name': 'I_RAW_REGEX',
                            'chunks': [
                                {
                                    'chars': '\\x2d', // Hyphen.
                                    'name': 'I_RAW_CHARS',
                                },
                            ],
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
