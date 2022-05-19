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

describe('Zero-width match handling integration', () => {
    describe('in optimised mode', () => {
        it('should not cause an infinite loop when using an empty match with .matchAll(...)', () => {
            const matcher = emulator.compile('a*');

            // Note that "a*" will match nothing at each position but still be successful.
            const matches = matcher.matchAll('xyzxyz');

            expect(matches).to.have.length(7);
            expect(matches[0].getCapture()).to.equal('');
            expect(matches[1].getCapture()).to.equal('');
            expect(matches[2].getCapture()).to.equal('');
            expect(matches[3].getCapture()).to.equal('');
            expect(matches[4].getCapture()).to.equal('');
            expect(matches[5].getCapture()).to.equal('');
            expect(matches[6].getCapture()).to.equal('');
        });
    });

    describe('in unoptimised mode', () => {
        it('should not cause an infinite loop when using an empty match with .matchAll(...)', () => {
            const matcher = emulator.compile('a*', { optimise: false });

            // Note that "a*" will match nothing at each position but still be successful.
            const matches = matcher.matchAll('xyzxyz');

            expect(matches).to.have.length(7);
            expect(matches[0].getCapture()).to.equal('');
            expect(matches[1].getCapture()).to.equal('');
            expect(matches[2].getCapture()).to.equal('');
            expect(matches[3].getCapture()).to.equal('');
            expect(matches[4].getCapture()).to.equal('');
            expect(matches[5].getCapture()).to.equal('');
            expect(matches[6].getCapture()).to.equal('');
        });
    });
});
