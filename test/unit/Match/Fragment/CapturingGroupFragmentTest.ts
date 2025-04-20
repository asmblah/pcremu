/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import { stubInterface } from 'ts-sinon';
import CapturingGroupFragment from '../../../../src/Match/Fragment/CapturingGroupFragment';
import FragmentMatcher from '../../../../src/Match/FragmentMatcher';
import FragmentMatchInterface from '../../../../src/Match/FragmentMatchInterface';
import FragmentMatchTree from '../../../../src/Match/FragmentMatchTree';
import LiteralFragment from '../../../../src/Match/Fragment/LiteralFragment';
import MaximisingQuantifierFragment from '../../../../src/Match/Fragment/MaximisingQuantifierFragment';
import QuantifierMatcher from '../../../../src/Match/QuantifierMatcher';

describe('CapturingGroupFragment', () => {
    let existingMatch: FragmentMatchInterface;
    let fragment: CapturingGroupFragment;
    let fragmentMatcher: FragmentMatcher;

    beforeEach(() => {
        fragmentMatcher = new FragmentMatcher();
        existingMatch = new FragmentMatchTree(0);

        fragment = new CapturingGroupFragment(
            fragmentMatcher,
            [new LiteralFragment('my-'), new LiteralFragment('text')],
            7,
        );
    });

    describe('getFixedLength()', () => {
        it('should return the fixed length of the group', () => {
            expect(fragment.getFixedLength(existingMatch)).to.equal(7);
        });

        it('should return null if the group has variable length', () => {
            const fragment = new CapturingGroupFragment(
                fragmentMatcher,
                [
                    new LiteralFragment('my-'),
                    new MaximisingQuantifierFragment(
                        stubInterface<QuantifierMatcher>(),
                        new LiteralFragment('text'),
                        1,
                        Infinity,
                    ),
                ],
                7,
            );

            expect(fragment.getFixedLength(existingMatch)).to.be.null;
        });
    });

    describe('match()', () => {
        describe('when un-anchored', () => {
            it('should match when the group appears at the start position', () => {
                const match = fragment.match(
                    'here is my-text',
                    8,
                    false,
                    existingMatch,
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-text');
                expect(match?.getStart()).to.equal(8);
                expect(match?.getNamedCaptures()).to.deep.equal({});
                expect(match?.getNamedCaptureIndices()).to.deep.equal({});
                expect(match?.getNumberedCaptures()).to.deep.equal({
                    7: 'my-text',
                });
                expect(match?.getNumberedCaptureIndices()).to.deep.equal({
                    7: [8, 15],
                });
            });

            it('should match when the group appears after the start position', () => {
                const match = fragment.match(
                    'here is my-text',
                    5,
                    false,
                    existingMatch,
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-text');
                expect(match?.getStart()).to.equal(8);
                expect(match?.getNamedCaptures()).to.deep.equal({});
                expect(match?.getNamedCaptureIndices()).to.deep.equal({});
                expect(match?.getNumberedCaptures()).to.deep.equal({
                    7: 'my-text',
                });
                expect(match?.getNumberedCaptureIndices()).to.deep.equal({
                    7: [8, 15],
                });
            });

            it('should return null when the group does not appear in the subject', () => {
                expect(
                    fragment.match('something-else', 0, false, existingMatch),
                ).to.be.null;
            });

            it('should return null when the only match appears before the start position', () => {
                expect(
                    fragment.match('here is my-text', 9, false, existingMatch),
                ).to.be.null;
            });
        });

        describe('when anchored', () => {
            it('should match when the group appears at the start position', () => {
                const match = fragment.match(
                    'here is my-text',
                    8,
                    true,
                    existingMatch,
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-text');
                expect(match?.getStart()).to.equal(8);
                expect(match?.getNamedCaptures()).to.deep.equal({});
                expect(match?.getNamedCaptureIndices()).to.deep.equal({});
                expect(match?.getNumberedCaptures()).to.deep.equal({
                    7: 'my-text',
                });
                expect(match?.getNumberedCaptureIndices()).to.deep.equal({
                    7: [8, 15],
                });
            });

            it('should return null when the group appears after the start position', () => {
                const match = fragment.match(
                    'here is my-text',
                    5,
                    true,
                    existingMatch,
                );

                expect(match).to.be.null;
            });

            it('should return null when the group does not appear in the subject', () => {
                expect(fragment.match('something-else', 0, true, existingMatch))
                    .to.be.null;
            });

            it('should return null when the only match appears before the start position', () => {
                expect(
                    fragment.match('here is my-text', 9, true, existingMatch),
                ).to.be.null;
            });
        });
    });

    describe('toString()', () => {
        it('should return the correct string representation', () => {
            expect(fragment.toString()).to.equal('(my-text)');
        });
    });

    describe('toStructure()', () => {
        it('should return the correct structure', () => {
            expect(fragment.toStructure()).to.deep.equal({
                type: 'capturing-group',
                groupIndex: 7,
                components: [
                    {
                        type: 'literal',
                        chars: 'my-',
                    },
                    {
                        type: 'literal',
                        chars: 'text',
                    },
                ],
            });
        });
    });
});
