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

describe('General repetition quantifier match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to match a quantifier one time', () => {
            const matcher = emulator.compile('my (possible){1,3} text');

            const match = matcher.matchOne('my possible text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my possible text');
            expect(match?.getNumberedCapture(1)).to.equal('possible');
        });

        it('should be able to match a quantifier multiple times', () => {
            const matcher = emulator.compile('my (possible){1,3} text');

            const match = matcher.matchOne('my possiblepossiblepossible text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal(
                'my possiblepossiblepossible text'
            );
            // Note that only the last capture is kept.
            expect(match?.getNumberedCapture(1)).to.equal('possible');
        });

        it('should not be able to match a quantifier fewer than the minimum number of times', () => {
            const matcher = emulator.compile('my (possible){2,} text');

            const match = matcher.matchOne('my possible text');

            expect(match).to.be.null;
        });

        it('should not be able to match a quantifier greater than the maximum number of times', () => {
            const matcher = emulator.compile('my (possible){2,3} text');

            const match = matcher.matchOne(
                'my possiblepossiblepossiblepossible text'
            );

            expect(match).to.be.null;
        });

        it('should backtrack when needed', () => {
            const matcher = emulator.compile('my ([ab]{1,}baaa)b text');

            const match = matcher.matchOne('my abaaab text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my abaaab text');
            expect(match?.getNumberedCapture(1)).to.equal('abaaa');
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to match a quantifier one time', () => {
            const matcher = emulator.compile('my (possible){1,3} text', {
                optimise: false,
            });

            const match = matcher.matchOne('my possible text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my possible text');
            expect(match?.getNumberedCapture(1)).to.equal('possible');
        });

        it('should be able to match a quantifier multiple times', () => {
            const matcher = emulator.compile('my (possible){1,3} text', {
                optimise: false,
            });

            const match = matcher.matchOne('my possiblepossiblepossible text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal(
                'my possiblepossiblepossible text'
            );
            // Note that only the last capture is kept.
            expect(match?.getNumberedCapture(1)).to.equal('possible');
        });

        it('should not be able to match a quantifier fewer than the minimum number of times', () => {
            const matcher = emulator.compile('my (possible){2,} text', {
                optimise: false,
            });

            const match = matcher.matchOne('my possible text');

            expect(match).to.be.null;
        });

        it('should not be able to match a quantifier greater than the maximum number of times', () => {
            const matcher = emulator.compile('my (possible){2,3} text', {
                optimise: false,
            });

            const match = matcher.matchOne(
                'my possiblepossiblepossiblepossible text'
            );

            expect(match).to.be.null;
        });

        it('should backtrack when needed', () => {
            const matcher = emulator.compile('my ([ab]{1,}baaa)b text', {
                optimise: false,
            });

            const match = matcher.matchOne('my abaaab text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my abaaab text');
            expect(match?.getNumberedCapture(1)).to.equal('abaaa');
        });
    });
});
