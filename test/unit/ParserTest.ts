/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import sinon = require('sinon');
import Parser from '../../src/Parser';

describe('Parser', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = new Parser({ parse: sinon.stub().returns({}) });
    });

    describe('parse()', () => {
        it('should return a correctly constructed Ast when no flags provided', () => {
            const ast = parser.parse('my.*?regex');

            expect(ast.getFlags()).to.deep.equal({
                extended: false,
                multiline: false,
            });
            expect(ast.getPattern()).to.equal('my.*?regex');
        });

        it('should return a correctly constructed Ast when a flag is provided', () => {
            const ast = parser.parse('my.*?regex', { extended: true });

            expect(ast.getFlags()).to.deep.equal({
                extended: true,
                multiline: false,
            });
            expect(ast.getPattern()).to.equal('my.*?regex');
        });
    });
});
