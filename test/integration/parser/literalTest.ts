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

describe('Parser literal integration', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = emulator.createParser();
    });

    it('should be able to parse a regex pattern containing only a literal and no whitespace', () => {
        const ast = parser.parse('myliteral');

        expect(ast.getPattern()).to.equal('myliteral');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'myliteral',
                },
            ],
        });
    });

    it('should be able to parse a regex pattern containing a literal with all metacharacters that do not require escaping', () => {
        const ast = parser.parse('my ]}- literal');

        expect(ast.getPattern()).to.equal('my ]}- literal');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'my ]}- literal',
                },
            ],
        });
    });

    it('should be able to parse a regex pattern containing a literal with all metacharacters escaped', () => {
        const ast = parser.parse(
            'my \\\\ \\^\\$\\.\\[\\|\\(\\)\\*\\+\\?\\{ literal',
        );

        expect(ast.getPattern()).to.equal(
            'my \\\\ \\^\\$\\.\\[\\|\\(\\)\\*\\+\\?\\{ literal',
        );
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'my \\ ^$.[|()*+?{ literal',
                },
            ],
        });
    });

    it('should not be able to parse a regex pattern containing an ASCII letter that is unnecessarily escaped', () => {
        // TODO: Improve syntax error messages.
        expect(() => {
            parser.parse('my \\literal');
        }).to.throw('Parser.parse() :: Unexpected "l"');
    });

    it('should not be able to parse a regex pattern containing an ASCII non-letter that is unnecessarily escaped', () => {
        const ast = parser.parse('my\\;literal');

        expect(ast.getPattern()).to.equal('my\\;literal');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'my;literal',
                },
            ],
        });
    });

    it('should be able to parse a regex pattern containing a literal and whitespace', () => {
        const ast = parser.parse('my literal');

        expect(ast.getPattern()).to.equal('my literal');
        expect(ast.getParsingAst()).to.deep.equal({
            'name': 'N_PATTERN',
            'components': [
                {
                    'name': 'N_LITERAL',
                    'text': 'my literal',
                },
            ],
        });
    });
});
