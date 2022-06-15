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

describe('Parser character class hexadecimal code character escape integration', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = emulator.createParser();
    });

    it('should be able to parse a regex pattern with character class containing hex code character escape', () => {
        const ast = parser.parse('before[a\\x20b]after');

        expect(ast.getPattern()).to.equal('before[a\\x20b]after');
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
                            'name': 'N_HEX_CODE_CHAR',
                            'code': '20',
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
