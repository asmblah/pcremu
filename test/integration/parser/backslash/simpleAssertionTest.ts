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
import Parser from '../../../../src/Parser';

describe('Parser simple assertion integration', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = emulator.createParser();
    });

    it('should be able to parse a regex pattern containing all simple assertions', () => {
        const ast = parser.parse('before \\b,\\B,\\A,\\Z,\\z,\\G after');

        expect(ast.getPattern()).to.equal(
            'before \\b,\\B,\\A,\\Z,\\z,\\G after',
        );
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'before ',
                },
                {
                    'name': 'N_WORD_BOUNDARY_ASSERTION',
                },
                {
                    'name': 'N_LITERAL',
                    'text': ',',
                },
                {
                    'name': 'N_NON_WORD_BOUNDARY_ASSERTION',
                },
                {
                    'name': 'N_LITERAL',
                    'text': ',',
                },
                {
                    'name': 'N_START_OF_STRING_ASSERTION',
                },
                {
                    'name': 'N_LITERAL',
                    'text': ',',
                },
                {
                    'name': 'N_END_OF_STRING_ASSERTION',
                },
                {
                    'name': 'N_LITERAL',
                    'text': ',',
                },
                {
                    'name': 'N_EXCLUSIVE_END_OF_STRING_ASSERTION',
                },
                {
                    'name': 'N_LITERAL',
                    'text': ',',
                },
                {
                    'name': 'N_MATCH_START_ASSERTION',
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' after',
                },
            ],
        });
    });
});
