/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import emulator from '../../../../../src';

describe('Possessive quantifier match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to match a run', () => {
            const matcher = emulator.compile('my (a*+)(?<gr>b)');

            const match = matcher.matchOne('my aaaaaab');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(3);
            expect(match?.getNumberedCapture(0)).to.equal('my aaaaaab');
            expect(match?.getNumberedCaptureStart(0)).to.equal(0);
            expect(match?.getNumberedCaptureEnd(0)).to.equal(10);
            expect(match?.getNumberedCapture(1)).to.equal('aaaaaa');
            expect(match?.getNumberedCaptureStart(1)).to.equal(3);
            expect(match?.getNumberedCaptureEnd(1)).to.equal(9);
            expect(match?.getNumberedCapture(2)).to.equal('b');
            expect(match?.getNumberedCaptureStart(2)).to.equal(9);
            expect(match?.getNumberedCaptureEnd(2)).to.equal(10);
            expect(match?.getNamedCapture('gr')).to.equal('b');
            expect(match?.getNamedCaptureStart('gr')).to.equal(9);
            expect(match?.getNamedCaptureEnd('gr')).to.equal(10);
        });

        it('should not allow backtracking (match atomically)', () => {
            // Possessive match is unable to give up the final "a"
            // for the next pattern char to match and consume.
            const matcher = emulator.compile('my (a*+)a');

            const match = matcher.matchOne('my aaaaaaa');

            expect(match).to.be.null;
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to match a run', () => {
            const matcher = emulator.compile('my (a*+)(?<gr>b)', {
                optimise: false,
            });

            const match = matcher.matchOne('my aaaaaab');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(3);
            expect(match?.getNumberedCapture(0)).to.equal('my aaaaaab');
            expect(match?.getNumberedCaptureStart(0)).to.equal(0);
            expect(match?.getNumberedCaptureEnd(0)).to.equal(10);
            expect(match?.getNumberedCapture(1)).to.equal('aaaaaa');
            expect(match?.getNumberedCaptureStart(1)).to.equal(3);
            expect(match?.getNumberedCaptureEnd(1)).to.equal(9);
            expect(match?.getNumberedCapture(2)).to.equal('b');
            expect(match?.getNumberedCaptureStart(2)).to.equal(9);
            expect(match?.getNumberedCaptureEnd(2)).to.equal(10);
            expect(match?.getNamedCapture('gr')).to.equal('b');
            expect(match?.getNamedCaptureStart('gr')).to.equal(9);
            expect(match?.getNamedCaptureEnd('gr')).to.equal(10);
        });

        it('should not allow backtracking (match atomically)', () => {
            // Possessive match is unable to give up the final "a"
            // for the next pattern char to match and consume.
            const matcher = emulator.compile('my (a*+)a', { optimise: false });

            const match = matcher.matchOne('my aaaaaaa');

            expect(match).to.be.null;
        });
    });
});
