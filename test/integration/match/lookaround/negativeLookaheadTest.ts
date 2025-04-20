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

describe('Lookaround negative lookahead match integration', () => {
    describe('in optimised mode', () => {
        it('should match content ahead of the current position', () => {
            const matcher = emulator.compile('start(?!(not-end))(e)nd');

            const matches = matcher.matchAll('here is startend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(3);
            expect(matches[0].getStart()).to.equal(8);
            expect(matches[0].getNumberedCapture(0)).to.equal('startend');
            expect(matches[0].getNumberedCapture(1)).to.be.null;
            expect(matches[0].getNumberedCapture(2)).to.equal('e');
        });

        it('should fail to match later candidates beyond the current position', () => {
            const matcher = emulator.compile('start(?!(end)) (a)nd');

            const matches = matcher.matchAll('here is startend and then done');

            expect(matches).to.have.length(0);
        });
    });

    describe('in unoptimised mode', () => {
        it('should match content ahead of the current position', () => {
            const matcher = emulator.compile('start(?!(not-end))(e)nd', {
                optimise: false,
            });

            const matches = matcher.matchAll('here is startend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(3);
            expect(matches[0].getStart()).to.equal(8);
            expect(matches[0].getNumberedCapture(0)).to.equal('startend');
            expect(matches[0].getNumberedCapture(1)).to.be.null;
            expect(matches[0].getNumberedCapture(2)).to.equal('e');
        });

        it('should fail to match later candidates beyond the current position', () => {
            const matcher = emulator.compile('start(?!(end)) (a)nd', {
                optimise: false,
            });

            const matches = matcher.matchAll('here is startend and then done');

            expect(matches).to.have.length(0);
        });
    });
});
