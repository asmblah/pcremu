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

describe('Multiple match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to match multiple occurrences of the pattern in the subject string', () => {
            const matcher = emulator.compile('my literal');

            const matches = matcher.matchAll(
                'my literal and then my literal again'
            );

            expect(matches).to.have.length(2);
            expect(matches[0].getCaptureCount()).to.equal(1);
            expect(matches[0].getStart()).to.equal(0);
            expect(matches[0].getEnd()).to.equal(10);
            expect(matches[0].getNumberedCapture(0)).to.equal('my literal');

            expect(matches[1].getCaptureCount()).to.equal(1);
            expect(matches[1].getStart()).to.equal(20);
            expect(matches[1].getEnd()).to.equal(30);
            expect(matches[1].getNumberedCapture(0)).to.equal('my literal');
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to match multiple occurrences of the pattern in the subject string', () => {
            const matcher = emulator.compile('my literal', { optimise: false });

            const matches = matcher.matchAll(
                'my literal and then my literal again'
            );

            expect(matches).to.have.length(2);
            expect(matches[0].getCaptureCount()).to.equal(1);
            expect(matches[0].getStart()).to.equal(0);
            expect(matches[0].getEnd()).to.equal(10);
            expect(matches[0].getNumberedCapture(0)).to.equal('my literal');

            expect(matches[1].getCaptureCount()).to.equal(1);
            expect(matches[1].getStart()).to.equal(20);
            expect(matches[1].getEnd()).to.equal(30);
            expect(matches[1].getNumberedCapture(0)).to.equal('my literal');
        });
    });
});
