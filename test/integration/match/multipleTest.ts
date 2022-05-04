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

describe('Multiple match integration', () => {
    it('should be able to match multiple occurrences of the pattern in the subject string', () => {
        const matcher = emulator.compile('my literal');

        const matches = matcher.matchAll(
            'my literal and then my literal again'
        );

        expect(matches).to.have.length(2);
        expect(matches[0].getCaptureCount()).to.equal(1);
        expect(matches[0].getNumberedCapture(0)).to.equal('my literal');
    });
});
