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

describe('Caseless mode match integration', () => {
    it('should be able to match case-insensitively in caseless mode', () => {
        const matcher = emulator.compile('my[t]eXt', { caseless: true });

        const matches = matcher.matchAll('MyTExTmytextMYtext');

        expect(matches).to.have.length(3);
        expect(matches[0].getCaptureCount()).to.equal(1);
        expect(matches[0].getStart()).to.equal(0);
        expect(matches[0].getNumberedCapture(0)).to.equal('MyTExT');

        expect(matches[1].getCaptureCount()).to.equal(1);
        expect(matches[1].getStart()).to.equal(6);
        expect(matches[1].getNumberedCapture(0)).to.equal('mytext');

        expect(matches[2].getCaptureCount()).to.equal(1);
        expect(matches[2].getStart()).to.equal(12);
        expect(matches[2].getNumberedCapture(0)).to.equal('MYtext');
    });
});
