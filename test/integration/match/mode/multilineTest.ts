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

describe('Multiline mode match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to match with ^ and $ as also start- and end-of-line in multiline mode', () => {
            const matcher = emulator.compile('^(my)text$', { multiline: true });

            const matches = matcher.matchAll('mytext\nmytext\nmytext');

            expect(matches).to.have.length(3);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(0);
            expect(matches[0].getNumberedCapture(0)).to.equal('mytext');
            expect(matches[0].getNumberedCapture(1)).to.equal('my');

            expect(matches[1].getCaptureCount()).to.equal(2);
            expect(matches[1].getStart()).to.equal(7);
            expect(matches[1].getNumberedCapture(0)).to.equal('mytext');
            expect(matches[1].getNumberedCapture(1)).to.equal('my');

            expect(matches[2].getCaptureCount()).to.equal(2);
            expect(matches[2].getStart()).to.equal(14);
            expect(matches[2].getNumberedCapture(0)).to.equal('mytext');
            expect(matches[2].getNumberedCapture(1)).to.equal('my');
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to match with ^ and $ as also start- and end-of-line in multiline mode', () => {
            const matcher = emulator.compile('^(my)text$', {
                multiline: true,
                optimise: false,
            });

            const matches = matcher.matchAll('mytext\nmytext\nmytext');

            expect(matches).to.have.length(3);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(0);
            expect(matches[0].getNumberedCapture(0)).to.equal('mytext');
            expect(matches[0].getNumberedCapture(1)).to.equal('my');

            expect(matches[1].getCaptureCount()).to.equal(2);
            expect(matches[1].getStart()).to.equal(7);
            expect(matches[1].getNumberedCapture(0)).to.equal('mytext');
            expect(matches[1].getNumberedCapture(1)).to.equal('my');

            expect(matches[2].getCaptureCount()).to.equal(2);
            expect(matches[2].getStart()).to.equal(14);
            expect(matches[2].getNumberedCapture(0)).to.equal('mytext');
            expect(matches[2].getNumberedCapture(1)).to.equal('my');
        });
    });
});
