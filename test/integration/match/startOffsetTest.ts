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

describe('Start offset match integration', () => {
    describe('matchAll()', () => {
        it('should be able to match a string from a specified offset', () => {
            const matcher = emulator.compile('myliteral');

            const matches = matcher.matchAll('here is myliteral', 5);

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(1);
            expect(matches[0].getNumberedCapture(0)).to.equal('myliteral');
        });

        it('should fail to match if the start offset is beyond all candidates', () => {
            const matcher = emulator.compile('myliteral');

            const matches = matcher.matchAll('here is myliteral', 9);

            expect(matches).to.have.length(0);
        });
    });

    describe('matchOne()', () => {
        it('should be able to match a string from a specified offset', () => {
            const matcher = emulator.compile('myliteral');

            const match = matcher.matchOne('here is myliteral', 5);

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal('myliteral');
        });

        it('should fail to match if the start offset is beyond all candidates', () => {
            const matcher = emulator.compile('myliteral');

            const match = matcher.matchOne('here is myliteral', 9);

            expect(match).to.be.null;
        });
    });
});
