/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import Exception from '../../../src/Exception/Exception';
import QuantifierParser from '../../../src/Quantifier/QuantifierParser';

describe('QuantifierParser', () => {
    let quantifierParser: QuantifierParser;

    beforeEach(() => {
        quantifierParser = new QuantifierParser();
    });

    describe('parseQuantifier()', () => {
        it('should be able to parse the optional quantifier', () => {
            const parsed = quantifierParser.parseQuantifier('?');

            expect(parsed.min).to.equal(0);
            expect(parsed.max).to.equal(1);
            expect(parsed.raw).to.equal('?');
        });

        it('should be able to parse the zero-or-more quantifier', () => {
            const parsed = quantifierParser.parseQuantifier('*');

            expect(parsed.min).to.equal(0);
            expect(parsed.max).to.equal(Infinity);
            expect(parsed.raw).to.equal('*');
        });

        it('should be able to parse the one-or-more quantifier', () => {
            const parsed = quantifierParser.parseQuantifier('+');

            expect(parsed.min).to.equal(1);
            expect(parsed.max).to.equal(Infinity);
            expect(parsed.raw).to.equal('+');
        });

        describe('for the general repetition quantifier', () => {
            it('should be able to parse with both minimum and maximum', () => {
                const parsed = quantifierParser.parseQuantifier('{21,102}');

                expect(parsed.min).to.equal(21);
                expect(parsed.max).to.equal(102);
                expect(parsed.raw).to.equal('{21,102}');
            });

            it('should be able to parse with minimum only', () => {
                const parsed = quantifierParser.parseQuantifier('{21,}');

                expect(parsed.min).to.equal(21);
                expect(parsed.max).to.equal(Infinity);
                expect(parsed.raw).to.equal('{21,}');
            });

            it('should be able to parse with maximum only', () => {
                const parsed = quantifierParser.parseQuantifier('{,27}');

                // Note that the default minimum is zero.
                expect(parsed.min).to.equal(0);
                expect(parsed.max).to.equal(27);
                expect(parsed.raw).to.equal('{,27}');
            });

            it('should be able to parse the shorthand for fixed repetition', () => {
                const parsed = quantifierParser.parseQuantifier('{21}');

                expect(parsed.min).to.equal(21);
                expect(parsed.max).to.equal(21);
                expect(parsed.raw).to.equal('{21}');
            });
        });

        it('should throw when an invalid quantifier is given', () => {
            expect(() => {
                quantifierParser.parseQuantifier('bang');
            }).to.throw(Exception, 'Unsupported quantifier "bang"');
        });
    });
});
