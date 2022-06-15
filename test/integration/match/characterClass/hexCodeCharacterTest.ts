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

describe('Character class hexadecimal character code match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to match a character class with hex code char', () => {
            const matcher = emulator.compile('my [a-c\\x20] text');

            const match = matcher.matchOne('my   text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCaptures()).to.deep.equal(['my   text']);
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to match a character class with hex code char', () => {
            const matcher = emulator.compile('my [a-c\\x20] text', {
                optimise: false,
            });

            const match = matcher.matchOne('my   text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCaptures()).to.deep.equal(['my   text']);
        });
    });
});
