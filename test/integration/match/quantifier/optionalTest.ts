/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import emulator from '../../../../src';
import { expect } from 'chai';

describe('Optional quantifier match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to match a quantifier one time', () => {
            const matcher = emulator.compile('my (possible)? text');

            const match = matcher.matchOne('my possible text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my possible text');
            expect(match?.getNumberedCapture(1)).to.equal('possible');
        });

        it('should be able to match a quantifier zero times', () => {
            const matcher = emulator.compile('my (possible)? text');

            const match = matcher.matchOne('my  text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my  text');
            // Note that a capture that was not reached has a value of null.
            expect(match?.getNumberedCapture(1)).to.be.null;
        });

        it('should not be able to match a quantifier multiple times', () => {
            const matcher = emulator.compile('my (possible)? text');

            const match = matcher.matchOne('my possiblepossiblepossible text');

            expect(match).to.be.null;
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to match a quantifier one time', () => {
            const matcher = emulator.compile('my (possible)? text', {
                optimise: false,
            });

            const match = matcher.matchOne('my possible text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my possible text');
            expect(match?.getNumberedCapture(1)).to.equal('possible');
        });

        it('should be able to match a quantifier zero times', () => {
            const matcher = emulator.compile('my (possible)? text', {
                optimise: false,
            });

            const match = matcher.matchOne('my  text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my  text');
            // Note that a capture that was not reached has a value of null.
            expect(match?.getNumberedCapture(1)).to.be.null;
        });

        it('should not be able to match a quantifier multiple times', () => {
            const matcher = emulator.compile('my (possible)? text', {
                optimise: false,
            });

            const match = matcher.matchOne('my possiblepossiblepossible text');

            expect(match).to.be.null;
        });
    });
});
