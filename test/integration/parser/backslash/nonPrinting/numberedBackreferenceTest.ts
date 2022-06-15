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

describe('Parser numbered backreference integration', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = emulator.createParser();
    });

    it('should be able to parse a regex pattern containing backreferences and potential octal escapes', () => {
        const pattern =
            '(my)(capturing groups)(go)(here) \\5 \\4 \\3 \\2 \\1 \\6 \\7 \\8 \\9 \\10 \\11 \\764 \\87 \\92';
        const ast = parser.parse(pattern);

        expect(ast.getPattern()).to.equal(pattern);
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_CAPTURING_GROUP',
                    'components': [{ 'name': 'N_LITERAL', 'text': 'my' }],
                },
                {
                    'name': 'N_CAPTURING_GROUP',
                    'components': [
                        { 'name': 'N_LITERAL', 'text': 'capturing groups' },
                    ],
                },
                {
                    'name': 'N_CAPTURING_GROUP',
                    'components': [{ 'name': 'N_LITERAL', 'text': 'go' }],
                },
                {
                    'name': 'N_CAPTURING_GROUP',
                    'components': [{ 'name': 'N_LITERAL', 'text': 'here' }],
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' ',
                },
                {
                    'name': 'N_NUMBERED_BACKREFERENCE',
                    'number': 5,
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' ',
                },
                {
                    'name': 'N_NUMBERED_BACKREFERENCE',
                    'number': 4,
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' ',
                },
                {
                    'name': 'N_NUMBERED_BACKREFERENCE',
                    'number': 3,
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' ',
                },
                {
                    'name': 'N_NUMBERED_BACKREFERENCE',
                    'number': 2,
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' ',
                },
                {
                    'name': 'N_NUMBERED_BACKREFERENCE',
                    'number': 1,
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' ',
                },
                {
                    'name': 'N_NUMBERED_BACKREFERENCE',
                    'number': 6,
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' ',
                },
                {
                    'name': 'N_NUMBERED_BACKREFERENCE',
                    'number': 7,
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' ',
                },
                {
                    'name': 'N_NUMBERED_BACKREFERENCE',
                    'number': 8,
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' ',
                },
                {
                    'name': 'N_NUMBERED_BACKREFERENCE',
                    'number': 9,
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' ',
                },
                {
                    'name': 'N_NUMBERED_BACKREFERENCE_OR_OCTAL_CHAR',
                    'digits': '10',
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' ',
                },
                {
                    'name': 'N_NUMBERED_BACKREFERENCE_OR_OCTAL_CHAR',
                    'digits': '11',
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' ',
                },
                {
                    'name': 'N_NUMBERED_BACKREFERENCE_OR_OCTAL_CHAR',
                    'digits': '764',
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' ',
                },
                {
                    'name': 'N_NUMBERED_BACKREFERENCE',
                    // Begins with the digit 8 so always taken as a backreference.
                    'number': 87,
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' ',
                },
                {
                    'name': 'N_NUMBERED_BACKREFERENCE',
                    // Begins with the digit 9 so always taken as a backreference.
                    'number': 92,
                },
            ],
        });
    });
});
