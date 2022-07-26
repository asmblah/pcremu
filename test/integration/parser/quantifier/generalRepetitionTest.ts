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

describe('Parser general repetition quantifier integration', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = emulator.createParser();
    });

    it('should be able to parse a regex pattern containing a general repetition quantifier of a single character', () => {
        const ast = parser.parse('beforeH{10,42}after');

        expect(ast.getPattern()).to.equal('beforeH{10,42}after');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'before',
                },
                {
                    'name': 'N_MAXIMISING_QUANTIFIER',
                    'quantifier': '{10,42}',
                    'component': {
                        'name': 'N_LITERAL',
                        'text': 'H',
                    },
                },
                {
                    'name': 'N_LITERAL',
                    'text': 'after',
                },
            ],
        });
    });

    it('should be able to parse a regex pattern containing a general repetition quantifier of a capturing group', () => {
        const ast = parser.parse('before (inner){7,11} after');

        expect(ast.getPattern()).to.equal('before (inner){7,11} after');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'before ',
                },
                {
                    'name': 'N_MAXIMISING_QUANTIFIER',
                    'quantifier': '{7,11}',
                    'component': {
                        'name': 'N_CAPTURING_GROUP',
                        'components': [
                            {
                                'name': 'N_LITERAL',
                                'text': 'inner',
                            },
                        ],
                    },
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' after',
                },
            ],
        });
    });
});
