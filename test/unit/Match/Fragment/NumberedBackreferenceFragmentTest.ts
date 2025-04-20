/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import FragmentMatchInterface from '../../../../src/Match/FragmentMatchInterface';
import NumberedBackreferenceFragment from '../../../../src/Match/Fragment/NumberedBackreferenceFragment';
import { stubInterface } from 'ts-sinon';
import { SinonStubbedInstance } from 'sinon';

describe('NumberedBackreferenceFragment', () => {
    let existingMatch: SinonStubbedInstance<FragmentMatchInterface>;
    let fragment: NumberedBackreferenceFragment;

    beforeEach(() => {
        existingMatch = stubInterface<FragmentMatchInterface>();
        existingMatch.getNumberedCapture.withArgs(21).returns('my-literal');

        fragment = new NumberedBackreferenceFragment(21);
    });

    describe('getFixedLength()', () => {
        it('should return the length of the referenced capture when it exists', () => {
            expect(fragment.getFixedLength(existingMatch)).to.equal(10);
        });

        it('should return null when the referenced capture does not exist', () => {
            const fragment = new NumberedBackreferenceFragment(2);
            existingMatch.getNumberedCapture.withArgs(2).returns(null);

            expect(fragment.getFixedLength(existingMatch)).to.be.null;
        });
    });

    describe('match()', () => {
        describe('when un-anchored', () => {
            it('should match when the literal appears at the start position', () => {
                const match = fragment.match(
                    'here is my-literal',
                    8,
                    false,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-literal');
                expect(match?.getStart()).to.equal(8);
            });

            it('should match when the literal appears after the start position', () => {
                const match = fragment.match(
                    'here is my-literal',
                    5,
                    false,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-literal');
                expect(match?.getStart()).to.equal(8);
            });

            it('should return null when the literal does not appear in subject', () => {
                expect(
                    fragment.match('something-else', 0, false, existingMatch)
                ).to.be.null;
            });

            it('should return null when the literal appears before the start position', () => {
                expect(
                    fragment.match(
                        'here is my-literal',
                        9,
                        false,
                        existingMatch
                    )
                ).to.be.null;
            });

            it('should return null when the capturing group has not yet been captured', () => {
                existingMatch.getNumberedCapture.withArgs(21).returns(null);

                expect(
                    fragment.match(
                        'here is my-literal',
                        8,
                        false,
                        existingMatch
                    )
                ).to.be.null;
            });
        });

        describe('when anchored', () => {
            it('should match when the literal appears at the start position', () => {
                const match = fragment.match(
                    'here is my-literal',
                    8,
                    true,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-literal');
                expect(match?.getStart()).to.equal(8);
            });

            it('should return null when the literal appears after the start position', () => {
                const match = fragment.match(
                    'here is my-literal',
                    5,
                    true,
                    existingMatch
                );

                expect(match).to.be.null;
            });

            it('should return null when the literal does not appear in subject', () => {
                expect(fragment.match('something-else', 0, true, existingMatch))
                    .to.be.null;
            });

            it('should return null when the literal appears before the start position', () => {
                expect(
                    fragment.match('here is my-literal', 9, true, existingMatch)
                ).to.be.null;
            });

            it('should return null when the capturing group has not yet been captured', () => {
                existingMatch.getNumberedCapture.withArgs(21).returns(null);

                expect(
                    fragment.match('here is my-literal', 8, true, existingMatch)
                ).to.be.null;
            });
        });
    });

    describe('toString()', () => {
        it('should return the correct representation', () => {
            expect(fragment.toString()).to.equal('\\21');
        });
    });

    describe('toStructure()', () => {
        it('should return the correct structure', () => {
            expect(fragment.toStructure()).to.deep.equal({
                type: 'numbered-backreference',
                groupIndex: 21,
            });
        });
    });
});
