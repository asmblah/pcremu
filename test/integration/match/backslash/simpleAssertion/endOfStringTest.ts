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

describe('Simple assertion end-of-string match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to correctly match the end of a string with no trailing newline', () => {
            const matcher = emulator.compile('my([\\s\\S]*?)\\Z');

            const match = matcher.matchOne('my text\nacross two lines');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal(
                'my text\nacross two lines',
            );
            expect(match?.getNumberedCapture(1)).to.equal(
                ' text\nacross two lines',
            );
        });

        it('should be able to correctly match the end of a string with trailing newline', () => {
            const matcher = emulator.compile('my([\\s\\S]*?)\\Z');

            const match = matcher.matchOne('my text\nacross three lines\n');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal(
                'my text\nacross three lines',
                'Trailing newline should be ignored',
            );
            expect(match?.getNumberedCapture(1)).to.equal(
                ' text\nacross three lines',
            );
        });

        it('should be able to correctly match the end of a string with multiple trailing newlines', () => {
            const matcher = emulator.compile('my([\\s\\S]*?)\\Z');

            const match = matcher.matchOne('my text\nacross three lines\n\n\n');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal(
                'my text\nacross three lines\n\n',
                'Only the final trailing newline should be ignored',
            );
            expect(match?.getNumberedCapture(1)).to.equal(
                ' text\nacross three lines\n\n',
            );
        });

        it('should be able to correctly fail to match the end of a string', () => {
            const matcher = emulator.compile('my([\\s\\S]*?)two\\Z');

            const match = matcher.matchOne('my text\nacross two lines');

            expect(match).to.be.null;
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to correctly match the end of a string with no trailing newline', () => {
            const matcher = emulator.compile('my([\\s\\S]*?)\\Z', {
                optimise: false,
            });

            const match = matcher.matchOne('my text\nacross two lines');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal(
                'my text\nacross two lines',
            );
            expect(match?.getNumberedCapture(1)).to.equal(
                ' text\nacross two lines',
            );
        });

        it('should be able to correctly match the end of a string with trailing newline', () => {
            const matcher = emulator.compile('my([\\s\\S]*?)\\Z', {
                optimise: false,
            });

            const match = matcher.matchOne('my text\nacross three lines\n');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal(
                'my text\nacross three lines',
                'Trailing newline should be ignored',
            );
            expect(match?.getNumberedCapture(1)).to.equal(
                ' text\nacross three lines',
            );
        });

        it('should be able to correctly match the end of a string with multiple trailing newlines', () => {
            const matcher = emulator.compile('my([\\s\\S]*?)\\Z', {
                optimise: false,
            });

            const match = matcher.matchOne('my text\nacross three lines\n\n\n');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal(
                'my text\nacross three lines\n\n',
                'Only the final trailing newline should be ignored',
            );
            expect(match?.getNumberedCapture(1)).to.equal(
                ' text\nacross three lines\n\n',
            );
        });

        it('should be able to correctly fail to match the end of a string', () => {
            const matcher = emulator.compile('my([\\s\\S]*?)two\\Z', {
                optimise: false,
            });

            const match = matcher.matchOne('my text\nacross two lines');

            expect(match).to.be.null;
        });
    });
});
