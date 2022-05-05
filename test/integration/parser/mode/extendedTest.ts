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

describe('Parser extended mode integration', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = emulator.createParser();
    });

    it('should ignore whitespace and comments except when escaped or inside character classes', () => {
        const ast = parser.parse(
            ' my ( text ) + +  # My comment to be ignored\n  [ ]+  (?<grabbed> after\\ end ) ',
            { extended: true }
        );

        expect(ast.getPattern()).to.equal(
            ' my ( text ) + +  # My comment to be ignored\n  [ ]+  (?<grabbed> after\\ end ) '
        );
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'my',
                },
                {
                    'name': 'N_POSSESSIVE_QUANTIFIER',
                    'quantifier': '+',
                    'component': {
                        'name': 'N_CAPTURING_GROUP',
                        'components': [
                            {
                                'name': 'N_LITERAL',
                                'text': 'text',
                            },
                        ],
                    },
                },
                {
                    'name': 'N_MAXIMISING_QUANTIFIER',
                    'quantifier': '+',
                    'component': {
                        'name': 'N_CHARACTER_CLASS',
                        'negated': false,
                        'components': [
                            {
                                'name': 'N_CHARACTER',
                                'char': ' ',
                            },
                        ],
                    },
                },
                {
                    'name': 'N_NAMED_CAPTURING_GROUP',
                    'groupName': 'grabbed',
                    'components': [
                        {
                            'name': 'N_LITERAL',
                            // Note that escapes for whitespace characters should be removed.
                            'text': 'after end',
                        },
                    ],
                },
                {
                    'name': 'N_WHITESPACE',
                    'chars': ' ',
                },
            ],
        });
    });

    it('should not ignore a comment when the hash is escaped', () => {
        const ast = parser.parse(' mytext \\#not a comment\n ', {
            extended: true,
        });

        expect(ast.getPattern()).to.equal(' mytext \\#not a comment\n ');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'mytext\\#notacomment',
                },
            ],
        });
    });
});
