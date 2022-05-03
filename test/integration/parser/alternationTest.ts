/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import emulator from '../../../src';
import Parser from '../../../src/Parser';

describe('Parser alternation integration', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = emulator.createParser();
    });

    it('should be able to parse a regex pattern containing a single alternation at top level', () => {
        const ast = parser.parse('mystuff|yourthings');

        expect(ast.getPattern()).to.equal('mystuff|yourthings');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_ALTERNATION',
                    'alternatives': [
                        {
                            'name': 'N_ALTERNATIVE',
                            'components': [
                                {
                                    'name': 'N_LITERAL',
                                    'text': 'mystuff',
                                },
                            ],
                        },
                        {
                            'name': 'N_ALTERNATIVE',
                            'components': [
                                {
                                    'name': 'N_LITERAL',
                                    'text': 'yourthings',
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    it('should be able to parse a regex pattern with alternation nested inside capturing group', () => {
        const ast = parser.parse('my (stuff|things) here');

        expect(ast.getPattern()).to.equal('my (stuff|things) here');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'my',
                },
                {
                    'name': 'N_WHITESPACE',
                    'chars': ' ',
                },
                {
                    'name': 'N_CAPTURING_GROUP',
                    'components': [
                        {
                            'name': 'N_ALTERNATION',
                            'alternatives': [
                                {
                                    'name': 'N_ALTERNATIVE',
                                    'components': [
                                        {
                                            'name': 'N_LITERAL',
                                            'text': 'stuff',
                                        },
                                    ],
                                },
                                {
                                    'name': 'N_ALTERNATIVE',
                                    'components': [
                                        {
                                            'name': 'N_LITERAL',
                                            'text': 'things',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    'name': 'N_WHITESPACE',
                    'chars': ' ',
                },
                {
                    'name': 'N_LITERAL',
                    'text': 'here',
                },
            ],
        });
    });

    it('should be able to parse a regex pattern with empty alternation at start of group', () => {
        const ast = parser.parse('(|hello)');

        expect(ast.getPattern()).to.equal('(|hello)');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_CAPTURING_GROUP',
                    'components': [
                        {
                            'name': 'N_ALTERNATION',
                            'alternatives': [
                                {
                                    'name': 'N_ALTERNATIVE',
                                    'components': [],
                                },
                                {
                                    'name': 'N_ALTERNATIVE',
                                    'components': [
                                        {
                                            'name': 'N_LITERAL',
                                            'text': 'hello',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    it('should be able to parse a regex pattern with empty alternation at end of group', () => {
        const ast = parser.parse('(hello|)');

        expect(ast.getPattern()).to.equal('(hello|)');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_CAPTURING_GROUP',
                    'components': [
                        {
                            'name': 'N_ALTERNATION',
                            'alternatives': [
                                {
                                    'name': 'N_ALTERNATIVE',
                                    'components': [
                                        {
                                            'name': 'N_LITERAL',
                                            'text': 'hello',
                                        },
                                    ],
                                },
                                {
                                    'name': 'N_ALTERNATIVE',
                                    'components': [],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });
});
