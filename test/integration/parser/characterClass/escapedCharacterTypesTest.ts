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

describe('Parser character class escaped character types integration', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = emulator.createParser();
    });

    it('should be able to parse a regex pattern with character class containing escaped square brackets', () => {
        const ast = parser.parse('before[a\\[b\\]d]after');

        expect(ast.getPattern()).to.equal('before[a\\[b\\]d]after');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'before',
                },
                {
                    'name': 'N_CHARACTER_CLASS',
                    'negated': false,
                    'components': [
                        {
                            'name': 'N_CHARACTER',
                            'char': 'a',
                        },
                        {
                            'name': 'N_ESCAPED_CHAR',
                            'char': '[',
                        },
                        {
                            'name': 'N_CHARACTER',
                            'char': 'b',
                        },
                        {
                            'name': 'N_ESCAPED_CHAR',
                            'char': ']',
                        },
                        {
                            'name': 'N_CHARACTER',
                            'char': 'd',
                        },
                    ],
                },
                {
                    'name': 'N_LITERAL',
                    'text': 'after',
                },
            ],
        });
    });

    it('should be able to parse a regex pattern with character class containing escaped backslash and unnecessarily-escaped non-alphanumeric character', () => {
        const ast = parser.parse('before[a\\\\\\;d]after');

        expect(ast.getPattern()).to.equal('before[a\\\\\\;d]after');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'before',
                },
                {
                    'name': 'N_CHARACTER_CLASS',
                    'negated': false,
                    'components': [
                        {
                            'name': 'N_CHARACTER',
                            'char': 'a',
                        },
                        {
                            'name': 'N_ESCAPED_CHAR',
                            'char': '\\',
                        },
                        {
                            'name': 'N_ESCAPED_CHAR',
                            'char': ';',
                        },
                        {
                            'name': 'N_CHARACTER',
                            'char': 'd',
                        },
                    ],
                },
                {
                    'name': 'N_LITERAL',
                    'text': 'after',
                },
            ],
        });
    });
});
