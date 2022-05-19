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

describe('Anchored mode match integration', () => {
    describe('in optimised mode', () => {
        it('should match at the start position or previous match end', () => {
            const matcher = emulator.compile('(my)text', { anchored: true });

            const matches = matcher.matchAll('pad mytextmytext', 4);

            expect(matches).to.have.length(2);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(4);
            expect(matches[0].getNumberedCapture(0)).to.equal('mytext');
            expect(matches[0].getNumberedCapture(1)).to.equal('my');

            expect(matches[1].getCaptureCount()).to.equal(2);
            expect(matches[1].getStart()).to.equal(10);
            expect(matches[1].getNumberedCapture(0)).to.equal('mytext');
            expect(matches[1].getNumberedCapture(1)).to.equal('my');
        });

        it('should fail to match later candidates beyond the start position', () => {
            const matcher = emulator.compile('(my)text', { anchored: true });

            const matches = matcher.matchAll('pad mytextmytext');

            expect(matches).to.have.length(0);
        });
    });

    describe('in unoptimised mode', () => {
        it('should match at the start position or previous match end', () => {
            const matcher = emulator.compile('(my)text', {
                anchored: true,
                optimise: false,
            });

            const matches = matcher.matchAll('pad mytextmytext', 4);

            expect(matches).to.have.length(2);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(4);
            expect(matches[0].getNumberedCapture(0)).to.equal('mytext');
            expect(matches[0].getNumberedCapture(1)).to.equal('my');

            expect(matches[1].getCaptureCount()).to.equal(2);
            expect(matches[1].getStart()).to.equal(10);
            expect(matches[1].getNumberedCapture(0)).to.equal('mytext');
            expect(matches[1].getNumberedCapture(1)).to.equal('my');
        });

        it('should fail to match later candidates beyond the start position', () => {
            const matcher = emulator.compile('(my)text', {
                anchored: true,
                optimise: false,
            });

            const matches = matcher.matchAll('pad mytextmytext');

            expect(matches).to.have.length(0);
        });
    });
});
