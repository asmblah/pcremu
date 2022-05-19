/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import emulator from '../../../src';
import { expect } from 'chai';

describe('Alternation match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to match an alternation', () => {
            const matcher = emulator.compile('my (initial|final) text');

            const match = matcher.matchOne('my final text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my final text');
            expect(match?.getNumberedCapture(1)).to.equal('final');
        });

        it("should be able to match an alternation's empty alternative", () => {
            const matcher = emulator.compile('my (initial|final|) text');

            const match = matcher.matchOne('my  text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my  text');
            expect(match?.getNumberedCapture(1)).to.equal('');
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to match an alternation', () => {
            const matcher = emulator.compile('my (initial|final) text', {
                optimise: false,
            });

            const match = matcher.matchOne('my final text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my final text');
            expect(match?.getNumberedCapture(1)).to.equal('final');
        });

        it("should be able to match an alternation's empty alternative", () => {
            const matcher = emulator.compile('my (initial|final|) text', {
                optimise: false,
            });

            const match = matcher.matchOne('my  text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my  text');
            expect(match?.getNumberedCapture(1)).to.equal('');
        });
    });
});
