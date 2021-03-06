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
        describe('in optimised mode', () => {
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

        describe('in unoptimised mode', () => {
            it('should be able to match a string from a specified offset', () => {
                const matcher = emulator.compile('myliteral', {
                    optimise: false,
                });

                const matches = matcher.matchAll('here is myliteral', 5);

                expect(matches).to.have.length(1);
                expect(matches[0].getCaptureCount()).to.equal(1);
                expect(matches[0].getNumberedCapture(0)).to.equal('myliteral');
            });

            it('should fail to match if the start offset is beyond all candidates', () => {
                const matcher = emulator.compile('myliteral', {
                    optimise: false,
                });

                const matches = matcher.matchAll('here is myliteral', 9);

                expect(matches).to.have.length(0);
            });
        });
    });

    describe('matchOne()', () => {
        describe('in optimised mode', () => {
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

        describe('in unoptimised mode', () => {
            it('should be able to match a string from a specified offset', () => {
                const matcher = emulator.compile('myliteral', {
                    optimise: false,
                });

                const match = matcher.matchOne('here is myliteral', 5);

                expect(match).not.to.be.null;
                expect(match?.getCaptureCount()).to.equal(1);
                expect(match?.getNumberedCapture(0)).to.equal('myliteral');
            });

            it('should backtrack the top level of an un-anchored regex along the string', () => {
                // First capturing group will make zero-length matches along the string until "a" is reached.
                const matcher = emulator.compile('((?:^1234.*?)?)a(..)d', {
                    optimise: false,
                });

                const match = matcher.matchOne('abcd 1234 axyd', 5);

                expect(match).not.to.be.null;
                expect(match?.getCaptureCount()).to.equal(3);
                expect(match?.getNumberedCapture(0)).to.equal('axyd');
                expect(match?.getNumberedCaptureStart(0)).to.equal(10);
                expect(match?.getNumberedCapture(1)).to.equal('');
                expect(match?.getNumberedCaptureStart(1)).to.equal(10);
                expect(match?.getNumberedCapture(2)).to.equal('xy');
                expect(match?.getNumberedCaptureStart(2)).to.equal(11);
            });

            it('should not backtrack the top level of an anchored regex along the string', () => {
                // First capturing group will make zero-length matches along the string until "a" is reached.
                const matcher = emulator.compile('((?:^1234.*?)?)a(..)d', {
                    anchored: true,
                    optimise: false,
                });

                const match = matcher.matchOne('abcd 1234 axyd', 5);

                expect(match).to.be.null;
            });

            it('should fail to match if the start offset is beyond all candidates', () => {
                const matcher = emulator.compile('myliteral', {
                    optimise: false,
                });

                const match = matcher.matchOne('here is myliteral', 9);

                expect(match).to.be.null;
            });
        });
    });
});
