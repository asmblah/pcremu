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

describe('General repetition quantifier match integration', () => {
    describe('in optimised mode', () => {
        it('should be able to match a quantifier one time', () => {
            const matcher = emulator.compile('my (possible){1,3} text');

            const match = matcher.matchOne('my possible text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my possible text');
            expect(match?.getNumberedCapture(1)).to.equal('possible');
        });

        it('should be able to match a quantifier multiple times', () => {
            const matcher = emulator.compile('my (possible){1,3} text');

            const match = matcher.matchOne('my possiblepossiblepossible text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal(
                'my possiblepossiblepossible text'
            );
            // Note that only the last capture is kept.
            expect(match?.getNumberedCapture(1)).to.equal('possible');
        });

        it('should be able to match a quantifier an exact number of times using the shorthand', () => {
            const matcher = emulator.compile('my (possible){2} text');

            const match = matcher.matchOne('my possiblepossible text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal(
                'my possiblepossible text'
            );
            // Note that only the last capture is kept.
            expect(match?.getNumberedCapture(1)).to.equal('possible');
        });

        it('should not be able to match a quantifier less than the exact number of times using the shorthand', () => {
            const matcher = emulator.compile('my (possible){2} text');

            const match = matcher.matchOne('my possible text');

            expect(match).to.be.null;
        });

        it('should not be able to match a quantifier more than the exact number of times using the shorthand', () => {
            const matcher = emulator.compile('my (possible){2} text');

            const match = matcher.matchOne('my possiblepossiblepossible text');

            expect(match).to.be.null;
        });

        it('should not be able to match a quantifier fewer than the minimum number of times', () => {
            const matcher = emulator.compile('my (possible){2,} text');

            const match = matcher.matchOne('my possible text');

            expect(match).to.be.null;
        });

        it('should not be able to match a quantifier greater than the maximum number of times', () => {
            const matcher = emulator.compile('my (possible){2,3} text');

            const match = matcher.matchOne(
                'my possiblepossiblepossiblepossible text'
            );

            expect(match).to.be.null;
        });

        it('should backtrack when needed', () => {
            const matcher = emulator.compile('my ([ab]{1,}baaa)b text');

            const match = matcher.matchOne('my abaaab text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my abaaab text');
            expect(match?.getNumberedCapture(1)).to.equal('abaaa');
        });

        it('should handle maximising general repetition quantifier in positive lookbehind', () => {
            const matcher = emulator.compile('(?<=\\b([ab]{2}))end');

            const matches = matcher.matchAll('here is ababend and then abend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(27);
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.equal('ab');
        });

        it('should handle maximising general repetition quantifier in negative lookbehind', () => {
            const matcher = emulator.compile('(?<!([ab]{4}))end');

            const matches = matcher.matchAll('here is ababend and then abend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(27);
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.be.null;
        });

        it('should handle minimising quantifier in positive lookbehind', () => {
            const matcher = emulator.compile('(?<=\\b([ab]{2}?))end');

            const matches = matcher.matchAll('here is ababend and then abend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(27);
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.equal('ab');
        });

        it('should handle minimising quantifier in negative lookbehind', () => {
            const matcher = emulator.compile('(?<!([ab]{4}?))end');

            const matches = matcher.matchAll('here is ababend and then abend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(27);
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.be.null;
        });

        it('should handle possessive quantifier in positive lookbehind', () => {
            const matcher = emulator.compile('(?<=\\b([ab]{2}+))end');

            const matches = matcher.matchAll('here is ababend and then abend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(27);
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.equal('ab');
        });

        it('should handle possessive quantifier in negative lookbehind', () => {
            const matcher = emulator.compile('(?<!([ab]{4}+))end');

            const matches = matcher.matchAll('here is ababend and then abend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(27);
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.be.null;
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to match a quantifier one time', () => {
            const matcher = emulator.compile('my (possible){1,3} text', {
                optimise: false,
            });

            const match = matcher.matchOne('my possible text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my possible text');
            expect(match?.getNumberedCapture(1)).to.equal('possible');
        });

        it('should be able to match a quantifier multiple times', () => {
            const matcher = emulator.compile('my (possible){1,3} text', {
                optimise: false,
            });

            const match = matcher.matchOne('my possiblepossiblepossible text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal(
                'my possiblepossiblepossible text'
            );
            // Note that only the last capture is kept.
            expect(match?.getNumberedCapture(1)).to.equal('possible');
        });

        it('should be able to match a quantifier an exact number of times using the shorthand', () => {
            const matcher = emulator.compile('my (possible){2} text', {
                optimise: false,
            });

            const match = matcher.matchOne('my possiblepossible text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal(
                'my possiblepossible text'
            );
            // Note that only the last capture is kept.
            expect(match?.getNumberedCapture(1)).to.equal('possible');
        });

        it('should not be able to match a quantifier less than the exact number of times using the shorthand', () => {
            const matcher = emulator.compile('my (possible){2} text', {
                optimise: false,
            });

            const match = matcher.matchOne('my possible text');

            expect(match).to.be.null;
        });

        it('should not be able to match a quantifier more than the exact number of times using the shorthand', () => {
            const matcher = emulator.compile('my (possible){2} text', {
                optimise: false,
            });

            const match = matcher.matchOne('my possiblepossiblepossible text');

            expect(match).to.be.null;
        });

        it('should not be able to match a quantifier fewer than the minimum number of times', () => {
            const matcher = emulator.compile('my (possible){2,} text', {
                optimise: false,
            });

            const match = matcher.matchOne('my possible text');

            expect(match).to.be.null;
        });

        it('should not be able to match a quantifier greater than the maximum number of times', () => {
            const matcher = emulator.compile('my (possible){2,3} text', {
                optimise: false,
            });

            const match = matcher.matchOne(
                'my possiblepossiblepossiblepossible text'
            );

            expect(match).to.be.null;
        });

        it('should handle maximising general repetition quantifier in positive lookbehind', () => {
            const matcher = emulator.compile('(?<=\\b([ab]{2}))end', {
                optimise: false,
            });

            const matches = matcher.matchAll('here is ababend and then abend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(27);
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.equal('ab');
        });

        it('should handle maximising general repetition quantifier in negative lookbehind', () => {
            const matcher = emulator.compile('(?<!([ab]{4}))end', {
                optimise: false,
            });

            const matches = matcher.matchAll('here is ababend and then abend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(27);
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.be.null;
        });

        it('should handle minimising quantifier in positive lookbehind', () => {
            const matcher = emulator.compile('(?<=\\b([ab]{2}?))end', {
                optimise: false,
            });

            const matches = matcher.matchAll('here is ababend and then abend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(27);
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.equal('ab');
        });

        it('should handle minimising quantifier in negative lookbehind', () => {
            const matcher = emulator.compile('(?<!([ab]{4}?))end', {
                optimise: false,
            });

            const matches = matcher.matchAll('here is ababend and then abend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(27);
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.be.null;
        });

        it('should handle possessive quantifier in positive lookbehind', () => {
            const matcher = emulator.compile('(?<=\\b([ab]{2}+))end', {
                optimise: false,
            });

            const matches = matcher.matchAll('here is ababend and then abend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(27);
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.equal('ab');
        });

        it('should handle possessive quantifier in negative lookbehind', () => {
            const matcher = emulator.compile('(?<!([ab]{4}+))end', {
                optimise: false,
            });

            const matches = matcher.matchAll('here is ababend and then abend');

            expect(matches).to.have.length(1);
            expect(matches[0].getCaptureCount()).to.equal(2);
            expect(matches[0].getStart()).to.equal(27);
            expect(matches[0].getNumberedCapture(0)).to.equal('end');
            expect(matches[0].getNumberedCapture(1)).to.be.null;
        });

        it('should backtrack when needed', () => {
            const matcher = emulator.compile('my ([ab]{1,}baaa)b text', {
                optimise: false,
            });

            const match = matcher.matchOne('my abaaab text');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(2);
            expect(match?.getNumberedCapture(0)).to.equal('my abaaab text');
            expect(match?.getNumberedCapture(1)).to.equal('abaaa');
        });
    });
});
