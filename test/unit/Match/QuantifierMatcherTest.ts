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
import QuantifierMatcher from '../../../src/Match/QuantifierMatcher';

describe('QuantifierMatcher', () => {
    let quantifierMatcher: QuantifierMatcher;

    beforeEach(() => {
        quantifierMatcher = new QuantifierMatcher();
    });

    describe('parseQuantifier()', () => {
        it('should be able to parse the optional quantifier', () => {
            const parsed = quantifierMatcher.parseQuantifier('?');

            expect(parsed.minimumMatches).to.equal(0);
            expect(parsed.maximumMatches).to.equal(1);
        });

        it('should be able to parse the zero-or-more quantifier', () => {
            const parsed = quantifierMatcher.parseQuantifier('*');

            expect(parsed.minimumMatches).to.equal(0);
            expect(parsed.maximumMatches).to.be.null;
        });

        it('should be able to parse the one-or-more quantifier', () => {
            const parsed = quantifierMatcher.parseQuantifier('+');

            expect(parsed.minimumMatches).to.equal(1);
            expect(parsed.maximumMatches).to.be.null;
        });

        describe('for the general repetition quantifier', () => {
            it('should be able to parse with both minimum and maximum', () => {
                const parsed = quantifierMatcher.parseQuantifier('{21,102}');

                expect(parsed.minimumMatches).to.equal(21);
                expect(parsed.maximumMatches).to.equal(102);
            });

            it('should be able to parse with minimum only', () => {
                const parsed = quantifierMatcher.parseQuantifier('{21,}');

                expect(parsed.minimumMatches).to.equal(21);
                expect(parsed.maximumMatches).to.be.null;
            });

            it('should be able to parse with maximum only', () => {
                const parsed = quantifierMatcher.parseQuantifier('{,27}');

                // Note that the default minimum is zero and not null.
                expect(parsed.minimumMatches).to.equal(0);
                expect(parsed.maximumMatches).to.equal(27);
            });
        });

        it('should throw when an invalid quantifier is given', () => {
            expect(() => {
                quantifierMatcher.parseQuantifier('bang');
            }).to.throw(Exception, 'Unsupported quantifier "bang"');
        });
    });
});
