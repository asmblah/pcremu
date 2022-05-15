/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import emulator from '../../../../../src';
import { expect } from 'chai';

describe('Start-of-string simple (anchor) assertion match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to match the start of string', () => {
            const matcher = emulator.compile('^mytext');

            const match = matcher.matchOne('mytext and some more');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal('mytext');
        });

        it('should be able to fail to match the start of string', () => {
            const matcher = emulator.compile('^mytext');

            const match = matcher.matchOne('something before and then mytext');

            expect(match).to.be.null;
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to match the start of string', () => {
            const matcher = emulator.compile('^mytext', { optimise: false });

            const match = matcher.matchOne('mytext and some more');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal('mytext');
        });

        it('should be able to fail to match the start of string', () => {
            const matcher = emulator.compile('^mytext', { optimise: false });

            const match = matcher.matchOne('something before and then mytext');

            expect(match).to.be.null;
        });
    });
});
