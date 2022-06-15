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

describe('Parser character class character range integration', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = emulator.createParser();
    });

    it('should be able to parse a regex pattern containing a negated character class with range between letters and special chars', () => {
        const ast = parser.parse('before[^]c-d}f{g-]after');

        expect(ast.getPattern()).to.equal('before[^]c-d}f{g-]after');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'before',
                },
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
                            'char': '}',
                        },
                        {
                            'name': 'N_CHARACTER',
                            'char': 'f',
                        },
                        {
                            'name': 'N_CHARACTER',
                            'char': '{',
                        },
                        {
                            'name': 'N_CHARACTER',
                            'char': 'g',
                        },
                        {
                            'name': 'N_CHARACTER',
                            'char': '-',
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

    it('should be able to parse a regex pattern containing a range between hex code char escapes', () => {
        const ast = parser.parse('before[a\\x20-\\x25b]after');

        expect(ast.getPattern()).to.equal('before[a\\x20-\\x25b]after');
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
                            'name': 'N_CHARACTER_RANGE',
                            'from': { 'name': 'N_HEX_CODE_CHAR', 'code': '20' },
                            'to': { 'name': 'N_HEX_CODE_CHAR', 'code': '25' },
                        },
                        {
                            'name': 'N_CHARACTER',
                            'char': 'b',
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
