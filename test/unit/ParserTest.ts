/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import { Context } from '../../src/spec/types/parser';
import Parser, { DEFAULT_FLAGS } from '../../src/Parser';
import sinon = require('sinon');

describe('Parser', () => {
    let parser: Parser;
    let parsingContext: Context;

    beforeEach(() => {
        parsingContext = { flags: DEFAULT_FLAGS };

        parser = new Parser(
            { parse: sinon.stub().returns({}) },
            parsingContext
        );
    });

    describe('parse()', () => {
        it('should return a correctly constructed Ast when no flags provided', () => {
            const ast = parser.parse('my.*?regex');

            expect(ast.getFlags()).to.deep.equal({
                anchored: false,
                caseless: false,
                dotAll: false,
                extended: false,
                multiline: false,
                optimise: true,
            });
            expect(ast.getPattern()).to.equal('my.*?regex');
        });

        it('should return a correctly constructed Ast when a flag is provided', () => {
            const ast = parser.parse('my.*?regex', { extended: true });

            expect(ast.getFlags()).to.deep.equal({
                anchored: false,
                caseless: false,
                dotAll: false,
                extended: true,
                multiline: false,
                optimise: true,
            });
            expect(ast.getPattern()).to.equal('my.*?regex');
        });

        it('should assign the flags to the Parsing context object', () => {
            parser.parse('my.*?regex', { extended: true });

            expect(parsingContext.flags).to.deep.equal({
                anchored: false,
                caseless: false,
                dotAll: false,
                extended: true,
                multiline: false,
                optimise: true,
            });
        });
    });
});
