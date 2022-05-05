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

describe('Parser capturing group integration', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = emulator.createParser();
    });

    it('should be able to parse a regex pattern containing a single capturing group', () => {
        const ast = parser.parse('my (stuff inside) here');

        expect(ast.getPattern()).to.equal('my (stuff inside) here');
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
                            'name': 'N_LITERAL',
                            'text': 'stuff',
                        },
                        {
                            'name': 'N_WHITESPACE',
                            'chars': ' ',
                        },
                        {
                            'name': 'N_LITERAL',
                            'text': 'inside',
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

    it('should be able to parse a regex pattern containing a nested capturing group', () => {
        const ast = parser.parse('my (stuff (goes) inside) here');

        expect(ast.getPattern()).to.equal('my (stuff (goes) inside) here');
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
                            'name': 'N_LITERAL',
                            'text': 'stuff',
                        },
                        {
                            'name': 'N_WHITESPACE',
                            'chars': ' ',
                        },
                        {
                            'name': 'N_CAPTURING_GROUP',
                            'components': [
                                {
                                    'name': 'N_LITERAL',
                                    'text': 'goes',
                                },
                            ],
                        },
                        {
                            'name': 'N_WHITESPACE',
                            'chars': ' ',
                        },
                        {
                            'name': 'N_LITERAL',
                            'text': 'inside',
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
});
