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

describe('Character class match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to match a character class', () => {
            const matcher = emulator.compile('my [a-c] text');

            const match = matcher.matchOne('my b text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal('my b text');
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to match a character class', () => {
            const matcher = emulator.compile('my [a-c] text', {
                optimise: false,
            });

            const match = matcher.matchOne('my b text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal('my b text');
        });
    });
});
