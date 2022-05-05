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
import sinon = require('sinon');

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
            'components': [
                {
                    'name': 'I_RAW_REGEX',
                    'chars': 'hello',
                },
                {
                    'name': 'I_NAMED_CAPTURING_GROUP',
                    'groupName': 'myGroup',
                    'components': [
                        {
                            'name': 'I_RAW_REGEX',
                            'chars': 'inner',
                        },
                    ],
                },
                {
                    'name': 'I_RAW_REGEX',
                    'chars': 'world',
                },
            ],
        });
    });
});
