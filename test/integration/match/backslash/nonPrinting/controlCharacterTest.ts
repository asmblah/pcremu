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

describe('Control character match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to match a string with a regex containing a control character backslash-escape sequence', () => {
            const matcher = emulator.compile('over (here) and\\nthen done');

            const match = matcher.matchOne('over here and\nthen done');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCaptures()).to.deep.equal([
                'over here and\nthen done',
                'here',
            ]);
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to match a string with a regex containing a control character backslash-escape sequence', () => {
            const matcher = emulator.compile('over (here) and\\nthen done', {
                optimise: false,
            });

            const match = matcher.matchOne('over here and\nthen done');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCaptures()).to.deep.equal([
                'over here and\nthen done',
                'here',
            ]);
        });
    });
});
