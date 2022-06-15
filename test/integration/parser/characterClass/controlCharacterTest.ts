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

describe('Parser character class control character escape integration', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = emulator.createParser();
    });

    it('should be able to parse a regex pattern with character class containing control character escapes', () => {
        const ast = parser.parse('before[a\\nb\\rc\\td]after');

        expect(ast.getPattern()).to.equal('before[a\\nb\\rc\\td]after');
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
                            'name': 'N_CONTROL_CHAR',
                            'type': 'n',
                        },
                        {
                            'name': 'N_CHARACTER',
                            'char': 'b',
                        },
                        {
                            'name': 'N_CONTROL_CHAR',
                            'type': 'r',
                        },
                        {
                            'name': 'N_CHARACTER',
                            'char': 'c',
                        },
                        {
                            'name': 'N_CONTROL_CHAR',
                            'type': 't',
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
