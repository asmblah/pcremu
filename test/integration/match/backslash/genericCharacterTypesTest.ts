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

describe('Generic character types match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to match a string with a regex containing a decimal digit escape sequence', () => {
            const matcher = emulator.compile('my number \\d first');

            const match = matcher.matchOne('my number 7 first');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal('my number 7 first');
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to match a string with a regex containing a decimal digit escape sequence', () => {
            const matcher = emulator.compile('my number \\d first', {
                optimise: false,
            });

            const match = matcher.matchOne('my number 7 first');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal('my number 7 first');
        });
    });
});
