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

describe('Numbered backreference match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to match a string with a regex containing a numbered backreference backslash-escape sequence', () => {
            const matcher = emulator.compile(
                'over (here) and then \\1 and done'
            );

            const match = matcher.matchOne('over here and then here and done');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal(
                'over here and then here and done'
            );
            expect(match?.getNumberedCapture(1)).to.equal('here');
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to match a string with a regex containing a numbered backreference backslash-escape sequence', () => {
            const matcher = emulator.compile(
                'over (here) and then \\1 and done',
                {
                    optimise: false,
                }
            );

            const match = matcher.matchOne('over here and then here and done');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal(
                'over here and then here and done'
            );
            expect(match?.getNumberedCapture(1)).to.equal('here');
        });
    });
});
