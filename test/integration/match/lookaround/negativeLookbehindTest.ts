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

describe('Lookaround negative lookbehind match integration', () => {
    describe('in optimised mode', () => {
        it('should match content behind the current position', () => {
            const matcher = emulator.compile('(?<!(not-start))end');

            const matches = matcher.matchAll('here is startend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(13);
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.be.null;
        });

        it('should skip to later candidates if needed', () => {
            const matcher = emulator.compile('(?<!(hello ))end');

            const matches = matcher.matchAll('hello end then something end');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(25); // Skips to the second "end".
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.be.null;
        });
    });

    describe('in unoptimised mode', () => {
        it('should match content behind the current position', () => {
            const matcher = emulator.compile('(?<!(not-start))end', {
                optimise: false,
            });

            const matches = matcher.matchAll('here is startend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(13);
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.be.null;
        });

        it('should skip to later candidates if needed', () => {
            const matcher = emulator.compile('(?<!(hello ))end', {
                optimise: false,
            });

            const matches = matcher.matchAll('hello end then something end');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(25); // Skips to the second "end".
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.be.null;
        });
    });
});
