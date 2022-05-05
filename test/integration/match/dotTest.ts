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

describe('Dot (all) match integration', () => {
    it('should be able to match a string with a regex containing a dot', () => {
        const matcher = emulator.compile('my n.me');

        const match = matcher.matchOne('my nAme');

        expect(match).not.to.be.null;
        expect(match?.getCaptureCount()).to.equal(1);
        expect(match?.getNumberedCapture(0)).to.equal('my nAme');
    });
});