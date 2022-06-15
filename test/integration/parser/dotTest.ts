/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import emulator from '../../../src';
import Parser from '../../../src/Parser';

describe('Parser dot (all) character integration', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = emulator.createParser();
    });

    it('should be able to parse a regex pattern containing a dot (all) metacharacter', () => {
        const ast = parser.parse('my.literal');

        expect(ast.getPattern()).to.equal('my.literal');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'my',
                },
                {
                    'name': 'N_DOT',
                },
                {
                    'name': 'N_LITERAL',
                    'text': 'literal',
                },
            ],
        });
    });

    it('should be able to parse a regex pattern containing an escaped dot character, giving it no special meaning', () => {
        const ast = parser.parse('my\\.literal');

        expect(ast.getPattern()).to.equal('my\\.literal');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'my.literal',
                },
            ],
        });
    });

    it('should be able to parse a regex pattern containing an escaped dot character between generic characters', () => {
        const ast = parser.parse('my\\d\\.\\dliteral');

        expect(ast.getPattern()).to.equal('my\\d\\.\\dliteral');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'my',
                },
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
                {
                    'name': 'N_LITERAL',
                    'text': 'literal',
                },
            ],
        });
    });
});
