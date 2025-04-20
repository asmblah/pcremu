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

describe('Dot-all mode match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to match dot against newline characters too', () => {
            const matcher = emulator.compile('start.*end', { dotAll: true });

            const match = matcher.matchOne(
                // Note we check use of both carriage-return and linefeed.
                'start blah blah\nline 2\rline 3\nand end',
            );

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getStart()).to.equal(0);
            expect(match?.getNumberedCapture(0)).to.equal(
                'start blah blah\nline 2\rline 3\nand end',
            );
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to match dot against newline characters too', () => {
            const matcher = emulator.compile('start.*end', {
                dotAll: true,
                optimise: false,
            });

            const match = matcher.matchOne(
                // Note we check use of both carriage-return and linefeed.
                'start blah blah\nline 2\rline 3\nand end',
            );

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getStart()).to.equal(0);
            expect(match?.getNumberedCapture(0)).to.equal(
                'start blah blah\nline 2\rline 3\nand end',
            );
        });
    });
});
