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

describe('Parser character class generic character types integration', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = emulator.createParser();
    });

    it('should be able to parse a regex pattern with character class containing generic char type', () => {
        const ast = parser.parse('before[c\\de]after');

        expect(ast.getPattern()).to.equal('before[c\\de]after');
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
                            'char': 'c',
                        },
                        {
                            'name': 'N_GENERIC_CHAR',
                            'type': 'd',
                        },
                        {
                            'name': 'N_CHARACTER',
                            'char': 'e',
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
