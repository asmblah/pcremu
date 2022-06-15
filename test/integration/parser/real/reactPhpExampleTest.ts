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

describe('Parser ReactPHP real example integration', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = emulator.createParser();
    });

    it('should be able to parse the request line regex', () => {
        // Taken from ReactPHP: https://github.com/reactphp/http/blob/9c2d98f1f5b590082faa1a74aba5549cd0107977/src/Io/RequestHeaderParser.php#L133.
        const pattern =
            '^(?<method>[^ ]+) (?<target>[^ ]+) HTTP/(?<version>\\d\\.\\d)';
        const ast = parser.parse(pattern);

        expect(ast.getPattern()).to.equal(pattern);
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_SIMPLE_ASSERTION',
                    'assertion': '^',
                },
                {
                    'name': 'N_NAMED_CAPTURING_GROUP',
                    'groupName': 'method',
                    'components': [
                        {
                            'name': 'N_MAXIMISING_QUANTIFIER',
                            'quantifier': '+',
                            'component': {
                                'name': 'N_CHARACTER_CLASS',
                                'negated': true,
                                'components': [
                                    {
                                        'name': 'N_CHARACTER',
                                        'char': ' ',
                                    },
                                ],
                            },
                        },
                    ],
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' ',
                },
                {
                    'name': 'N_NAMED_CAPTURING_GROUP',
                    'groupName': 'target',
                    'components': [
                        {
                            'name': 'N_MAXIMISING_QUANTIFIER',
                            'quantifier': '+',
                            'component': {
                                'name': 'N_CHARACTER_CLASS',
                                'negated': true,
                                'components': [
                                    {
                                        'name': 'N_CHARACTER',
                                        'char': ' ',
                                    },
                                ],
                            },
                        },
                    ],
                },
                {
                    'name': 'N_LITERAL',
                    'text': ' HTTP/',
                },
                {
                    'name': 'N_NAMED_CAPTURING_GROUP',
                    'groupName': 'version',
                    'components': [
                        {
                            'name': 'N_GENERIC_CHAR',
                            'type': 'd',
                        },
                        {
                            'name': 'N_LITERAL',
                            'text': '.',
                        },
                        {
                            'name': 'N_GENERIC_CHAR',
                            'type': 'd',
                        },
                    ],
                },
            ],
        });
    });
});
