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

describe('Non-capturing group match integration', () => {
    it('should be able to group part of a pattern without capturing', () => {
        const matcher = emulator.compile('my (?:one two)* text');

        const match = matcher.matchOne('my one twoone two text');

        expect(match).not.to.be.null;
        expect(match?.getCaptureCount()).to.equal(1);
        expect(match?.getNumberedCapture(0)).to.equal('my one twoone two text');
    });
});
