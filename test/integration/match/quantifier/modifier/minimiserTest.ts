/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import emulator from '../../../../../src';
import { expect } from 'chai';

describe('Quantifier minimiser match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to make a quantifier match lazily', () => {
            const matcher = emulator.compile('my (a[ab]*?a)');

            const match = matcher.matchOne('my abbbabbba text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my abbba');
            expect(match?.getNumberedCapture(1)).to.equal('abbba');
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to make a quantifier match lazily', () => {
            const matcher = emulator.compile('my (a[ab]*?a)', {
                optimise: false,
            });

            const match = matcher.matchOne('my abbbabbba text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my abbba');
            expect(match?.getNumberedCapture(1)).to.equal('abbba');
        });
    });
});
