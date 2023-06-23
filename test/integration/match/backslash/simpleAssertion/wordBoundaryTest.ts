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

describe('Simple assertion word boundary match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to correctly match a string with a regex using word boundary assertion "\\b"', () => {
            const matcher = emulator.compile('my text\\b.*done');

            const match = matcher.matchOne('my text done');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal('my text done');
        });

        it('should be able to correctly fail to match a string with a regex using word boundary assertion "\\b"', () => {
            const matcher = emulator.compile('my text\\b.*done');

            const match = matcher.matchOne('my text1done');

            expect(match).to.be.null;
        });

        it('should be able to correctly match a string with a regex using non-word boundary assertion "\\B"', () => {
            const matcher = emulator.compile('my text\\B.*done');

            const match = matcher.matchOne('my text123done');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal('my text123done');
        });

        it('should be able to correctly fail to match a string with a regex using non-word boundary assertion "\\B"', () => {
            const matcher = emulator.compile('my text\\B.*done');

            const match = matcher.matchOne('my text done');

            expect(match).to.be.null;
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to correctly match a string with a regex using word boundary assertion "\\b"', () => {
            const matcher = emulator.compile('my text\\b.*done', {
                optimise: false,
            });

            const match = matcher.matchOne('my text done');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal('my text done');
        });

        it('should be able to correctly fail to match a string with a regex using word boundary assertion "\\b"', () => {
            const matcher = emulator.compile('my text\\b.*done', {
                optimise: false,
            });

            const match = matcher.matchOne('my text1done');

            expect(match).to.be.null;
        });

        it('should be able to correctly match a string with a regex using non-word boundary assertion "\\B"', () => {
            const matcher = emulator.compile('my text\\B.*done', {
                optimise: false,
            });

            const match = matcher.matchOne('my text123done');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal('my text123done');
        });

        it('should be able to correctly fail to match a string with a regex using non-word boundary assertion "\\B"', () => {
            const matcher = emulator.compile('my text\\B.*done', {
                optimise: false,
            });

            const match = matcher.matchOne('my text done');

            expect(match).to.be.null;
        });
    });
});
