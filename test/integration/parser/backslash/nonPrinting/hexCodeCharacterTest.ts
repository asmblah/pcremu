/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import emulator from '../../../../../src';
import Parser from '../../../../../src/Parser';

describe('Parser hexadecimal code character escape integration', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = emulator.createParser();
    });

    it('should be able to parse a regex pattern containing hex code char escapes', () => {
        const pattern = 'here (is\\x20) my text';
        const ast = parser.parse(pattern);

        expect(ast.getPattern()).to.equal(pattern);
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'here ',
                },
                {
                    'name': 'N_CAPTURING_GROUP',
                    'components': [
                        { 'name': 'N_LITERAL', 'text': 'is' },
                        { 'name': 'N_HEX_CODE_CHAR', 'code': '20' },
                    ],
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' my text',
                },
            ],
        });
    });
});
