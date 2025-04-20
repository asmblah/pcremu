/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import LiteralFragment from '../../../../src/Match/Fragment/LiteralFragment';

describe('LiteralFragment', () => {
    let fragment: LiteralFragment;

    beforeEach(() => {
        fragment = new LiteralFragment('my-literal');
    });

    describe('getFixedLength()', () => {
        it('should return the length of the literal', () => {
            const fragment = new LiteralFragment('abc');

            expect(fragment.getFixedLength()).to.equal(3);
        });

        it('should return 0 for an empty literal', () => {
            const fragment = new LiteralFragment('');

            expect(fragment.getFixedLength()).to.equal(0);
        });
    });

    describe('match()', () => {
        describe('when un-anchored', () => {
            it('should match when the literal appears at the start position', () => {
                const match = fragment.match('here is my-literal', 8, false);

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-literal');
                expect(match?.getStart()).to.equal(8);
            });

            it('should match when the literal appears after the start position', () => {
                const match = fragment.match('here is my-literal', 5, false);

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-literal');
                expect(match?.getStart()).to.equal(8);
            });

            it('should return null when the literal does not appear in subject', () => {
                expect(fragment.match('something-else', 0, false)).to.be.null;
            });

            it('should return null when the literal appears before the start position', () => {
                expect(fragment.match('here is my-literal', 9, false)).to.be
                    .null;
            });
        });

        describe('when anchored', () => {
            it('should match when the literal appears at the start position', () => {
                const match = fragment.match('here is my-literal', 8, true);

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-literal');
                expect(match?.getStart()).to.equal(8);
            });

            it('should return null when the literal appears after the start position', () => {
                const match = fragment.match('here is my-literal', 5, true);

                expect(match).to.be.null;
            });

            it('should return null when the literal does not appear in subject', () => {
                expect(fragment.match('something-else', 0, true)).to.be.null;
            });

            it('should return null when the literal appears before the start position', () => {
                expect(fragment.match('here is my-literal', 9, true)).to.be
                    .null;
            });
        });
    });

    describe('toString()', () => {
        it('should return the chars', () => {
            expect(fragment.toString()).to.equal('my-literal');
        });
    });

    describe('toStructure()', () => {
        it('should return the correct structure', () => {
            expect(fragment.toStructure()).to.deep.equal({
                type: 'literal',
                chars: 'my-literal',
            });
        });
    });
});
