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
    describe('in optimised mode', () => {
        it('should be able to capture a single chevron-bracketed Perl named capturing group', () => {
            const matcher = emulator.compile('my (?<grabbed>captured) text');

            const match = matcher.matchOne('my captured text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            // Named captures are also available by their index.
            expect(match?.getNumberedCapture(0)).to.equal('my captured text');
            expect(match?.getNumberedCapture(1)).to.equal('captured');
            expect(match?.getNamedCapture('grabbed')).to.equal('captured');
        });

        it('should be able to capture a single-quoted Perl named capturing group', () => {
            const matcher = emulator.compile("my (?'grabbed'captured) text");

            const match = matcher.matchOne('my captured text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            // Named captures are also available by their index.
            expect(match?.getNumberedCapture(0)).to.equal('my captured text');
            expect(match?.getNumberedCapture(1)).to.equal('captured');
            expect(match?.getNamedCapture('grabbed')).to.equal('captured');
        });

        it('should be able to capture a single Python named capturing group', () => {
            const matcher = emulator.compile('my (?P<grabbed>captured) text');

            const match = matcher.matchOne('my captured text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            // Named captures are also available by their index.
            expect(match?.getNumberedCapture(0)).to.equal('my captured text');
            expect(match?.getNumberedCapture(1)).to.equal('captured');
            expect(match?.getNamedCapture('grabbed')).to.equal('captured');
        });

        it('should be able to backtrack into a capturing group', () => {
            const matcher = emulator.compile('my (?<grabbed>a+)aa text');

            const match = matcher.matchOne('my aaaaaa text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            // Named captures are also available by their index.
            expect(match?.getNumberedCapture(0)).to.equal('my aaaaaa text');
            expect(match?.getNumberedCapture(1)).to.equal(
                'aaaa',
                'Only first 4 "a"s should be captured'
            );
            expect(match?.getNamedCapture('grabbed')).to.equal(
                'aaaa',
                'Only first 4 "a"s should be captured'
            );
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to capture a named capturing group', () => {
            const matcher = emulator.compile('my (?<grabbed>captured) text', {
                optimise: false,
            });

            const match = matcher.matchOne('my captured text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            // Named captures are also available by their index.
            expect(match?.getNumberedCapture(0)).to.equal('my captured text');
            expect(match?.getNumberedCapture(1)).to.equal('captured');
            expect(match?.getNamedCapture('grabbed')).to.equal('captured');
        });

        it('should be able to backtrack into a capturing group', () => {
            const matcher = emulator.compile('my (?<grabbed>a+)aa text', {
                optimise: false,
            });

            const match = matcher.matchOne('my aaaaaa text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            // Named captures are also available by their index.
            expect(match?.getNumberedCapture(0)).to.equal('my aaaaaa text');
            expect(match?.getNumberedCapture(1)).to.equal(
                'aaaa',
                'Only first 4 "a"s should be captured'
            );
            expect(match?.getNamedCapture('grabbed')).to.equal(
                'aaaa',
                'Only first 4 "a"s should be captured'
            );
        });
    });
});
