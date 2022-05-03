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

describe('End-of-string simple (anchor) assertion match integration', () => {
    it('should be able to match the end of string', () => {
        const matcher = emulator.compile('mytext$');

        const match = matcher.matchOne('here is mytext');

        expect(match).not.to.be.null;
        expect(match?.getCaptureCount()).to.equal(1);
        expect(match?.getNumberedCapture(0)).to.equal('mytext');
    });

    it('should be able to fail to match the end of string', () => {
        const matcher = emulator.compile('mytext$');

        const match = matcher.matchOne('mytext with something after it');

        expect(match).to.be.null;
    });
});
