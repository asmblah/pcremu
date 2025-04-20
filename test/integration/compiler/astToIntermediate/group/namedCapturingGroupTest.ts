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

describe('AST-to-IR compiler named capturing group integration', () => {
    let compiler: AstToIntermediateCompiler;

    beforeEach(() => {
        compiler = emulator.createAstToIntermediateCompiler();
    });

    it('should be able to compile an AST with one capturing group to IR', () => {
        const ast = sinon.createStubInstance(Ast) as SinonStubbedInstance<Ast> &
            Ast;
        ast.getParsingAst.returns({
            'name': 'N_PATTERN',
            'components': [
                { 'name': 'N_LITERAL', 'text': 'hello' },
                {
                    'name': 'N_NAMED_CAPTURING_GROUP',
                    'groupName': 'myGroup',
                    'components': [{ 'name': 'N_LITERAL', 'text': 'inner' }],
                },
                { 'name': 'N_LITERAL', 'text': 'world' },
            ],
        });

        const intermediateRepresentation = compiler.compile(ast);

        expect(
            intermediateRepresentation.getTranspilerRepresentation()
        ).to.deep.equal({
            'name': 'I_PATTERN',
            // Note that both capturing group name "myGroup" and its index 1 are included here.
            'capturingGroups': [0, 'myGroup', 1],
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
                    'name': 'I_NAMED_CAPTURING_GROUP',
                    'groupIndex': 1,
                    'groupName': 'myGroup',
                    'components': [
                        {
                            'name': 'I_RAW_REGEX',
                            'chunks': [
                                {
                                    'name': 'I_RAW_CHARS',
                                    'chars': 'inner',
                                },
                            ],
                            'fixedLength': 5,
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
                    'fixedLength': 5,
                },
            ],
        });
    });
});
