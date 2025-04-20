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

describe('Lookaround positive lookbehind match integration', () => {
    describe('in optimised mode', () => {
        it('should match content behind the current position', () => {
            const matcher = emulator.compile('(?<=(start))end');

            const matches = matcher.matchAll('here is startend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(13); // Match starts at the "end" capture.
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.equal('start'); // Lookbehind can contain capturing groups.
        });

        it('should fail to match earlier candidates before the current position', () => {
            const matcher = emulator.compile('(?<=(end)) (e)nd');

            const matches = matcher.matchAll('here is end and then end');

            expect(matches).to.have.length(0);
        });
    });

    describe('in unoptimised mode', () => {
        it('should match content behind the current position', () => {
            const matcher = emulator.compile('(?<=(start))end', {
                optimise: false,
            });

            const matches = matcher.matchAll('here is startend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(13);
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.equal('start');
        });

        it('should fail to match earlier candidates before the current position', () => {
            const matcher = emulator.compile('(?<=(end)) (e)nd', {
                optimise: false,
            });

            const matches = matcher.matchAll('here is end and then end');

            expect(matches).to.have.length(0);
        });
    });
});
