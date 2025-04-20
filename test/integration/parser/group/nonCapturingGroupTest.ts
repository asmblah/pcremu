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

describe('Parser non-capturing group integration', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = emulator.createParser();
    });

    it('should be able to parse a regex pattern containing a single non-capturing group', () => {
        const ast = parser.parse('my (?:stuff inside) here');

        expect(ast.getPattern()).to.equal('my (?:stuff inside) here');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'my ',
                },
                {
                    'name': 'N_NON_CAPTURING_GROUP',
                    'components': [
                        {
                            'name': 'N_LITERAL',
                            'text': 'stuff inside',
                        },
                    ],
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' here',
                },
            ],
        });
    });

    it('should be able to parse a regex pattern containing a non capturing group nested inside a named one', () => {
        const ast = parser.parse('my (?<found>stuff (?:goes) inside) here');

        expect(ast.getPattern()).to.equal(
            'my (?<found>stuff (?:goes) inside) here',
        );
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'my ',
                },
                {
                    'name': 'N_NAMED_CAPTURING_GROUP',
                    'groupName': 'found',
                    'components': [
                        {
                            'name': 'N_LITERAL',
                            'text': 'stuff ',
                        },
                        {
                            'name': 'N_NON_CAPTURING_GROUP',
                            'components': [
                                {
                                    'name': 'N_LITERAL',
                                    'text': 'goes',
                                },
                            ],
                        },
                        {
                            'name': 'N_LITERAL',
                            'text': ' inside',
                        },
                    ],
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' here',
                },
            ],
        });
    });
});
