/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import CapturingGroupFragment from '../../../../src/Match/Fragment/CapturingGroupFragment';
import FragmentMatcher from '../../../../src/Match/FragmentMatcher';
import FragmentMatchInterface from '../../../../src/Match/FragmentMatchInterface';
import FragmentMatchTree from '../../../../src/Match/FragmentMatchTree';
import LiteralFragment from '../../../../src/Match/Fragment/LiteralFragment';
import NativeFragment from '../../../../src/Match/Fragment/NativeFragment';
import PossessiveQuantifierFragment from '../../../../src/Match/Fragment/PossessiveQuantifierFragment';
import QuantifierMatcher from '../../../../src/Match/QuantifierMatcher';

describe('PossessiveQuantifierFragment', () => {
    let existingMatch: FragmentMatchInterface;
    let fragment: PossessiveQuantifierFragment;
    let fragmentMatcher: FragmentMatcher;
    let quantifierMatcher: QuantifierMatcher;

    beforeEach(() => {
        fragmentMatcher = new FragmentMatcher();
        quantifierMatcher = new QuantifierMatcher();
        existingMatch = new FragmentMatchTree(0);

        fragment = new PossessiveQuantifierFragment(
            quantifierMatcher,
            new LiteralFragment('my-text'),
            2,
            4
        );
    });

    describe('getFixedLength()', () => {
        it('should return the fixed length of the quantifier when minimum and maximum matches are identical', () => {
            fragment = new PossessiveQuantifierFragment(
                quantifierMatcher,
                new LiteralFragment('my-text'),
                2,
                2
            );

            expect(fragment.getFixedLength(existingMatch)).to.equal(14);
        });

        it('should return null when the fragment has variable length', () => {
            expect(fragment.getFixedLength(existingMatch)).to.be.null;
        });

        it('should return null when the fragment has no upper bound', () => {
            fragment = new PossessiveQuantifierFragment(
                quantifierMatcher,
                new LiteralFragment('my-text'),
                2,
                Infinity
            );

            expect(fragment.getFixedLength(existingMatch)).to.be.null;
        });
    });

    describe('match()', () => {
        describe('when un-anchored', () => {
            it('should not match when the component appears at the start position once', () => {
                const match = fragment.match(
                    'here is my-text',
                    8,
                    false,
                    existingMatch
                );

                expect(match).to.be.null;
            });

            it('should match when the component appears at the start position twice consecutively', () => {
                const match = fragment.match(
                    'here is my-textmy-text',
                    8,
                    false,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-textmy-text');
                expect(match?.getStart()).to.equal(8);
            });

            it('should match when the component appears at the start position three times consecutively', () => {
                const match = fragment.match(
                    'here is my-textmy-textmy-text',
                    8,
                    false,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-textmy-textmy-text');
                expect(match?.getStart()).to.equal(8);
            });

            it('should match when the component appears at the start position four times consecutively', () => {
                const match = fragment.match(
                    'here is my-textmy-textmy-textmy-text',
                    8,
                    false,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal(
                    'my-textmy-textmy-textmy-text'
                );
                expect(match?.getStart()).to.equal(8);
            });

            it('should not include a fifth occurrence in the match', () => {
                const match = fragment.match(
                    'here is my-textmy-textmy-textmy-textmy-text',
                    8,
                    false,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal(
                    // Only the first four (up to maximumMatches) are matched.
                    'my-textmy-textmy-textmy-text'
                );
                expect(match?.getStart()).to.equal(8);
            });

            it('should match when the component appears after the start position', () => {
                const match = fragment.match(
                    'here is my-textmy-text',
                    5,
                    false,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-textmy-text');
                expect(match?.getStart()).to.equal(8);
            });

            it('should fail to backtrack inside the most recent occurrence', () => {
                fragment = new PossessiveQuantifierFragment(
                    quantifierMatcher,
                    new CapturingGroupFragment(
                        fragmentMatcher,
                        [new NativeFragment('my(?:-text)?', null)],
                        12
                    ),
                    2,
                    4
                );

                const match = fragment.match(
                    'here is my-textmy-text',
                    8,
                    false,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-textmy-text');
                const backtrackedMatch = match?.backtrack();
                expect(backtrackedMatch).to.be.null;
            });

            it('should fail to backtrack while there are more than the minimum number of matches to give up', () => {
                const match = fragment.match(
                    'here is my-textmy-textmy-text',
                    8,
                    false,
                    existingMatch
                );

                expect(match).not.to.be.null;
                const backtrackedMatch = match?.backtrack();
                expect(backtrackedMatch).to.be.null;
            });

            it('should return null when the component does not appear in the subject', () => {
                expect(
                    fragment.match('something-else', 0, false, existingMatch)
                ).to.be.null;
            });

            it('should return null when the only match appears before the start position', () => {
                expect(
                    fragment.match(
                        'here is my-textmy-text',
                        9,
                        false,
                        existingMatch
                    )
                ).to.be.null;
            });
        });

        describe('when anchored', () => {
            it('should not match when the component appears at the start position once', () => {
                const match = fragment.match(
                    'here is my-text',
                    8,
                    true,
                    existingMatch
                );

                expect(match).to.be.null;
            });

            it('should match when the component appears at the start position twice consecutively', () => {
                const match = fragment.match(
                    'here is my-textmy-text',
                    8,
                    true,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-textmy-text');
                expect(match?.getStart()).to.equal(8);
            });

            it('should match when the component appears at the start position three times consecutively', () => {
                const match = fragment.match(
                    'here is my-textmy-textmy-text',
                    8,
                    true,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-textmy-textmy-text');
                expect(match?.getStart()).to.equal(8);
            });

            it('should match when the component appears at the start position four times consecutively', () => {
                const match = fragment.match(
                    'here is my-textmy-textmy-textmy-text',
                    8,
                    true,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal(
                    'my-textmy-textmy-textmy-text'
                );
                expect(match?.getStart()).to.equal(8);
            });

            it('should not include a fifth occurrence in the match', () => {
                const match = fragment.match(
                    'here is my-textmy-textmy-textmy-textmy-text',
                    8,
                    true,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal(
                    // Only the first four (up to maximumMatches) are matched.
                    'my-textmy-textmy-textmy-text'
                );
                expect(match?.getStart()).to.equal(8);
            });

            it('should return null when the component appears after the start position', () => {
                const match = fragment.match(
                    'here is my-textmy-text',
                    5,
                    true,
                    existingMatch
                );

                expect(match).to.be.null;
            });

            it('should fail to backtrack inside the most recent occurrence', () => {
                fragment = new PossessiveQuantifierFragment(
                    quantifierMatcher,
                    new CapturingGroupFragment(
                        fragmentMatcher,
                        [new NativeFragment('my(?:-text)?', null)],
                        12
                    ),
                    2,
                    4
                );

                const match = fragment.match(
                    'here is my-textmy-text',
                    8,
                    true,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-textmy-text');
                const backtrackedMatch = match?.backtrack();
                expect(backtrackedMatch).to.be.null;
            });

            it('should fail to backtrack while there are more than the minimum number of matches to give up', () => {
                const match = fragment.match(
                    'here is my-textmy-textmy-text',
                    8,
                    true,
                    existingMatch
                );

                expect(match).not.to.be.null;
                const backtrackedMatch = match?.backtrack();
                expect(backtrackedMatch).to.be.null;
            });

            it('should return null when the component does not appear in the subject', () => {
                expect(fragment.match('something-else', 0, true, existingMatch))
                    .to.be.null;
            });

            it('should return null when the only match appears before the start position', () => {
                expect(
                    fragment.match(
                        'here is my-textmy-text',
                        9,
                        true,
                        existingMatch
                    )
                ).to.be.null;
            });
        });
    });

    describe('toString()', () => {
        it('should return the correct string representation', () => {
            expect(fragment.toString()).to.equal('my-text{2,4}+');
        });
    });

    describe('toStructure()', () => {
        it('should return the correct structure', () => {
            expect(fragment.toStructure()).to.deep.equal({
                type: 'possessive-quantifier',
                minimumMatches: 2,
                maximumMatches: 4,
                component: {
                    type: 'literal',
                    chars: 'my-text',
                },
            });
        });
    });
});
