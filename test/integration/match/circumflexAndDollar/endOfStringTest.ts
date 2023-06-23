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

describe('End-of-string assertion (anchor) match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to match the end of string when there is no trailing newline', () => {
            const matcher = emulator.compile('mytext$');

            const match = matcher.matchOne('here is mytext');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal('mytext');
        });

        // See also test/integration/match/mode/dollarEndOnlyTest.ts.
        it('should be able to match the end of string when there is a trailing newline', () => {
            const matcher = emulator.compile('mytext$');

            const match = matcher.matchOne('here is mytext\n');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal(
                'mytext',
                'Trailing newline should be ignored'
            );
        });

        it('should be able to match the end of string when there are multiple trailing newlines', () => {
            const matcher = emulator.compile('mytext[\\s\\S]*?$');

            const match = matcher.matchOne('here is mytext\n\n\n');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal(
                'mytext\n\n',
                'Only the final trailing newline should be ignored'
            );
        });

        it('should be able to fail to match the end of string', () => {
            const matcher = emulator.compile('mytext$');

            const match = matcher.matchOne('mytext with something after it');

            expect(match).to.be.null;
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to match the end of string', () => {
            const matcher = emulator.compile('mytext$', { optimise: false });

            const match = matcher.matchOne('here is mytext');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal('mytext');
        });

        // See also test/integration/match/mode/dollarEndOnlyTest.ts.
        it('should be able to match the end of string when there is a trailing newline', () => {
            const matcher = emulator.compile('mytext$', { optimise: false });

            const match = matcher.matchOne('here is mytext\n');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal(
                'mytext',
                'Trailing newline should be ignored'
            );
        });

        it('should be able to match the end of string when there are multiple trailing newlines', () => {
            const matcher = emulator.compile('mytext[\\s\\S]*?$', {
                optimise: false,
            });

            const match = matcher.matchOne('here is mytext\n\n\n');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(1);
            expect(match?.getNumberedCapture(0)).to.equal(
                'mytext\n\n',
                'Only the final trailing newline should be ignored'
            );
        });

        it('should be able to fail to match the end of string', () => {
            const matcher = emulator.compile('mytext$', { optimise: false });

            const match = matcher.matchOne('mytext with something after it');

            expect(match).to.be.null;
        });
    });
});
