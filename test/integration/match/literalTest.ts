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

describe('Literal match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to match a string with a regex containing only a literal', () => {
            const matcher = emulator.compile('myliteral');

            const match = matcher.matchOne('myliteral');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal('myliteral');
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to match a string with a regex containing only a literal', () => {
            const matcher = emulator.compile('myliteral', { optimise: false });

            const match = matcher.matchOne('myliteral');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal('myliteral');
        });
    });

    describe('in non-extended mode', () => {
        it('should treat whitespace as literal, matching 1-for-1', () => {
            const matcher = emulator.compile('my literal');

            const match = matcher.matchOne('my literal');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal('my literal');
        });

        it('should treat whitespace as literal, failing if missing in subject', () => {
            const matcher = emulator.compile('my literal');

            const match = matcher.matchOne('myliteral');

            expect(match).to.be.null;
        });
    });

    describe('in extended mode', () => {
        it('should ignore whitespace, succeeding if missing', () => {
            const matcher = emulator.compile('my literal', { extended: true });

            const match = matcher.matchOne('myliteral');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal('myliteral');
        });

        it('should ignore whitespace, failing if present', () => {
            const matcher = emulator.compile('my literal', { extended: true });

            const match = matcher.matchOne('my literal');

            expect(match).to.be.null;
        });
    });
});
