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
import LiteralFragment from '../../../../src/Match/Fragment/LiteralFragment';
import MinimisingQuantifierFragment from '../../../../src/Match/Fragment/MinimisingQuantifierFragment';
import NativeFragment from '../../../../src/Match/Fragment/NativeFragment';
import QuantifierMatcher from '../../../../src/Match/QuantifierMatcher';

describe('MinimisingQuantifierFragment', () => {
    let fragment: MinimisingQuantifierFragment;
    let fragmentMatcher: FragmentMatcher;
    let quantifierMatcher: QuantifierMatcher;

    beforeEach(() => {
        fragmentMatcher = new FragmentMatcher();
        quantifierMatcher = new QuantifierMatcher(fragmentMatcher);

        fragment = new MinimisingQuantifierFragment(
            fragmentMatcher,
            quantifierMatcher,
            new LiteralFragment('my-text'),
            2,
            4
        );
    });

    describe('match()', () => {
        describe('when un-anchored', () => {
            it('should not match when the component appears at the start position once', () => {
                const match = fragment.match('here is my-text', 8, false);

                expect(match).to.be.null;
            });

            it('should match when the component appears at the start position twice consecutively', () => {
                const match = fragment.match(
                    'here is my-textmy-text',
                    8,
                    false
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-textmy-text');
                expect(match?.getStart()).to.equal(8);
            });

            it('should match when the component appears at the start position twice consecutively after the start position', () => {
                const match = fragment.match(
                    'here is my-textmy-text',
                    5,
                    false
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-textmy-text');
                expect(match?.getStart()).to.equal(8);
            });

            it('should not include a third occurrence in the match initially', () => {
                const match = fragment.match(
                    'here is my-textmy-textmy-text',
                    8,
                    false
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal(
                    // Only the first two (up to minimumMatches) are matched.
                    'my-textmy-text'
                );
                expect(match?.getStart()).to.equal(8);
            });

            it('should backtrack inside the most recent occurrence while there are at least the minimum number of matches', () => {
                fragment = new MinimisingQuantifierFragment(
                    fragmentMatcher,
                    quantifierMatcher,
                    new CapturingGroupFragment(
                        fragmentMatcher,
                        [new NativeFragment('my(?:-text)?')],
                        12
                    ),
                    2,
                    4
                );

                const match = fragment.match(
                    'here is my-textmy-text',
                    8,
                    false
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-textmy-text');
                const backtrackedMatch = match?.backtrack();
                expect(backtrackedMatch?.getCapture()).to.equal('my-textmy');
            });

            it('should capture the next on backtrack while there are less than the maximum number of matches to capture', () => {
                const match = fragment.match(
                    'here is my-textmy-textmy-text',
                    8,
                    false
                );

                expect(match).not.to.be.null;
                const backtrackedMatch = match?.backtrack();
                expect(backtrackedMatch?.getCapture()).to.equal(
                    'my-textmy-textmy-text'
                );
            });

            it('should fail to backtrack when the maximum has been reached', () => {
                const match = fragment.match(
                    'here is my-textmy-textmy-textmy-textmy-text',
                    8,
                    false
                );

                expect(match).not.to.be.null;
                const backtrackedMatch = match
                    ?.backtrack()
                    ?.backtrack()
                    ?.backtrack(); // Backtrack three times - the third should fail to match.
                expect(backtrackedMatch).to.be.null;
            });

            it('should return null when the component does not appear in the subject', () => {
                expect(fragment.match('something-else', 0, false)).to.be.null;
            });

            it('should return null when the only match appears before the start position', () => {
                expect(fragment.match('here is my-textmy-text', 9, false)).to.be
                    .null;
            });
        });

        describe('when anchored', () => {
            it('should not match when the component appears at the start position once', () => {
                const match = fragment.match('here is my-text', 8, true);

                expect(match).to.be.null;
            });

            it('should match when the component appears at the start position twice consecutively', () => {
                const match = fragment.match('here is my-textmy-text', 8, true);

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-textmy-text');
                expect(match?.getStart()).to.equal(8);
            });

            it('should return null when the component appears at the start position twice consecutively after the start position', () => {
                const match = fragment.match('here is my-textmy-text', 5, true);

                expect(match).to.be.null;
            });

            it('should not include a third occurrence in the match initially', () => {
                const match = fragment.match(
                    'here is my-textmy-textmy-text',
                    8,
                    true
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal(
                    // Only the first two (up to minimumMatches) are matched.
                    'my-textmy-text'
                );
                expect(match?.getStart()).to.equal(8);
            });

            it('should backtrack inside the most recent occurrence while there are at least the minimum number of matches', () => {
                fragment = new MinimisingQuantifierFragment(
                    fragmentMatcher,
                    quantifierMatcher,
                    new CapturingGroupFragment(
                        fragmentMatcher,
                        [new NativeFragment('my(?:-text)?')],
                        12
                    ),
                    2,
                    4
                );

                const match = fragment.match('here is my-textmy-text', 8, true);

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-textmy-text');
                const backtrackedMatch = match?.backtrack();
                expect(backtrackedMatch?.getCapture()).to.equal('my-textmy');
            });

            it('should capture the next on backtrack while there are less than the maximum number of matches to capture', () => {
                const match = fragment.match(
                    'here is my-textmy-textmy-text',
                    8,
                    true
                );

                expect(match).not.to.be.null;
                const backtrackedMatch = match?.backtrack();
                expect(backtrackedMatch?.getCapture()).to.equal(
                    'my-textmy-textmy-text'
                );
            });

            it('should fail to backtrack when the maximum has been reached', () => {
                const match = fragment.match(
                    'here is my-textmy-textmy-textmy-textmy-text',
                    8,
                    true
                );

                expect(match).not.to.be.null;
                const backtrackedMatch = match
                    ?.backtrack()
                    ?.backtrack()
                    ?.backtrack(); // Backtrack three times - the third should fail to match.
                expect(backtrackedMatch).to.be.null;
            });

            it('should return null when the component does not appear in the subject', () => {
                expect(fragment.match('something-else', 0, true)).to.be.null;
            });

            it('should return null when the only match appears before the start position', () => {
                expect(fragment.match('here is my-textmy-text', 9, true)).to.be
                    .null;
            });
        });
    });

    describe('toString()', () => {
        it('should return the correct string representation', () => {
            expect(fragment.toString()).to.equal('my-text{2,4}?');
        });
    });

    describe('toStructure()', () => {
        it('should return the correct structure', () => {
            expect(fragment.toStructure()).to.deep.equal({
                type: 'minimising-quantifier',
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
