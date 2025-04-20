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

describe('Parser generic character types integration', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = emulator.createParser();
    });

    it('should be able to parse a regex pattern containing all generic character types', () => {
        const ast = parser.parse(
            'before\\d\\D,\\h\\H,\\N\\s\\S,\\v\\V\\w\\Wafter',
        );

        expect(ast.getPattern()).to.equal(
            'before\\d\\D,\\h\\H,\\N\\s\\S,\\v\\V\\w\\Wafter',
        );
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'before',
                },
                {
                    'name': 'N_GENERIC_CHAR',
                    'type': 'd',
                },
                {
                    'name': 'N_GENERIC_CHAR',
                    'type': 'D',
                },
                {
                    'name': 'N_LITERAL',
                    'text': ',',
                },
                {
                    'name': 'N_GENERIC_CHAR',
                    'type': 'h',
                },
                {
                    'name': 'N_GENERIC_CHAR',
                    'type': 'H',
                },
                {
                    'name': 'N_LITERAL',
                    'text': ',',
                },
                {
                    'name': 'N_GENERIC_CHAR',
                    'type': 'N',
                },
                {
                    'name': 'N_GENERIC_CHAR',
                    'type': 's',
                },
                {
                    'name': 'N_GENERIC_CHAR',
                    'type': 'S',
                },
                {
                    'name': 'N_LITERAL',
                    'text': ',',
                },
                {
                    'name': 'N_GENERIC_CHAR',
                    'type': 'v',
                },
                {
                    'name': 'N_GENERIC_CHAR',
                    'type': 'V',
                },
                {
                    'name': 'N_GENERIC_CHAR',
                    'type': 'w',
                },
                {
                    'name': 'N_GENERIC_CHAR',
                    'type': 'W',
                },
                {
                    'name': 'N_LITERAL',
                    'text': 'after',
                },
            ],
        });
    });
});
