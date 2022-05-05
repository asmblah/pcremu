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

describe('Named capturing group match integration', () => {
    it('should be able to capture a named capturing group', () => {
        const matcher = emulator.compile('my (?<grabbed>captured) text');

        const match = matcher.matchOne('my captured text');

        expect(match).not.to.be.null;
        expect(match?.getCaptureCount()).to.equal(2);
        // Named captures are also available by their index.
        expect(match?.getNumberedCapture(0)).to.equal('my captured text');
        expect(match?.getNumberedCapture(1)).to.equal('captured');
        expect(match?.getNamedCapture('grabbed')).to.equal('captured');
    });
});
