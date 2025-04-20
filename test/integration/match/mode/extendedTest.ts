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

describe('Extended mode match integration', () => {
    describe('in optimised mode', () => {
        it('should ignore whitespace and comments inside the pattern except for inside character classes', () => {
            const matcher = emulator.compile(
                ' my ( text ) + +  # My comment to be ignored\n  [ ]+  (?<grabbed> after ) ',
                { extended: true },
            );

            const match = matcher.matchOne('pad mytexttexttext   after');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(3);
            expect(match?.getStart()).to.equal(4);
            expect(match?.getNumberedCapture(0)).to.equal(
                'mytexttexttext   after',
            );
            expect(match?.getNumberedCapture(1)).to.equal('text');
            expect(match?.getNumberedCapture(2)).to.equal('after');
            expect(match?.getNamedCapture('grabbed')).to.equal('after');
        });
    });

    describe('in unoptimised mode', () => {
        it('should ignore whitespace and comments inside the pattern except for inside character classes', () => {
            const matcher = emulator.compile(
                ' my ( text ) + +  # My comment to be ignored\n  [ ]+  (?<grabbed> after ) ',
                { extended: true, optimise: false },
            );

            const match = matcher.matchOne('pad mytexttexttext   after');

            expect(match).not.to.be.null;
            expect(match?.getCaptureCount()).to.equal(3);
            expect(match?.getStart()).to.equal(4);
            expect(match?.getNumberedCapture(0)).to.equal(
                'mytexttexttext   after',
            );
            expect(match?.getNumberedCapture(1)).to.equal('text');
            expect(match?.getNumberedCapture(2)).to.equal('after');
            expect(match?.getNamedCapture('grabbed')).to.equal('after');
        });
    });
});
