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

describe('Match index capture integration', () => {
    describe('in optimised mode', () => {
        it('should be able to capture start and end indices for numbered capturing groups', () => {
            const matcher = emulator.compile('my (first) and (second) groups');

            const match = matcher.matchOne('my first and second groups');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(3);
            expect(match?.getNumberedCaptures()).to.deep.equal([
                'my first and second groups',
                'first',
                'second',
            ]);
            expect(match?.getNumberedCapture(0)).to.equal(
                'my first and second groups'
            );
            expect(match?.getNumberedCaptureStart(0)).to.equal(0);
            expect(match?.getNumberedCaptureEnd(0)).to.equal(26);
            expect(match?.getNumberedCapture(1)).to.equal('first');
            expect(match?.getNumberedCaptureStart(1)).to.equal(3);
            expect(match?.getNumberedCaptureEnd(1)).to.equal(8);
            expect(match?.getNumberedCapture(2)).to.equal('second');
            expect(match?.getNumberedCaptureStart(2)).to.equal(13);
            expect(match?.getNumberedCaptureEnd(2)).to.equal(19);
        });

        it('should be able to capture start and end indices for named capturing groups', () => {
            const matcher = emulator.compile(
                'my (?<group1>first) and (?<group2>second) groups'
            );

            const match = matcher.matchOne('my first and second groups');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(3);
            expect(match?.getNamedCaptures()).to.deep.equal({
                'group1': 'first',
                'group2': 'second',
            });
            expect(match?.getNamedCapture('group1')).to.equal('first');
            expect(match?.getNamedCaptureStart('group1')).to.equal(3);
            expect(match?.getNamedCaptureEnd('group1')).to.equal(8);
            expect(match?.getNamedCapture('group2')).to.equal('second');
            expect(match?.getNamedCaptureStart('group2')).to.equal(13);
            expect(match?.getNamedCaptureEnd('group2')).to.equal(19);
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to capture start and end indices for numbered capturing groups', () => {
            const matcher = emulator.compile('my (first) and (second) groups', {
                optimise: false,
            });

            const match = matcher.matchOne('my first and second groups');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(3);
            expect(match?.getNumberedCaptures()).to.deep.equal([
                'my first and second groups',
                'first',
                'second',
            ]);
            expect(match?.getNumberedCapture(0)).to.equal(
                'my first and second groups'
            );
            expect(match?.getNumberedCaptureStart(0)).to.equal(0);
            expect(match?.getNumberedCaptureEnd(0)).to.equal(26);
            expect(match?.getNumberedCapture(1)).to.equal('first');
            expect(match?.getNumberedCaptureStart(1)).to.equal(3);
            expect(match?.getNumberedCaptureEnd(1)).to.equal(8);
            expect(match?.getNumberedCapture(2)).to.equal('second');
            expect(match?.getNumberedCaptureStart(2)).to.equal(13);
            expect(match?.getNumberedCaptureEnd(2)).to.equal(19);
        });

        it('should be able to capture start and end indices for named capturing groups', () => {
            const matcher = emulator.compile(
                'my (?<group1>first) and (?<group2>second) groups',
                {
                    optimise: false,
                }
            );

            const match = matcher.matchOne('my first and second groups');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(3);
            expect(match?.getNamedCaptures()).to.deep.equal({
                'group1': 'first',
                'group2': 'second',
            });
            expect(match?.getNamedCapture('group1')).to.equal('first');
            expect(match?.getNamedCaptureStart('group1')).to.equal(3);
            expect(match?.getNamedCaptureEnd('group1')).to.equal(8);
            expect(match?.getNamedCapture('group2')).to.equal('second');
            expect(match?.getNamedCaptureStart('group2')).to.equal(13);
            expect(match?.getNamedCaptureEnd('group2')).to.equal(19);
        });
    });
});
