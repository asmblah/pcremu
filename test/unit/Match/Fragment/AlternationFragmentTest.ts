/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import AlternationFragment from '../../../../src/Match/Fragment/AlternationFragment';
import AlternativeFragment from '../../../../src/Match/Fragment/AlternativeFragment';
import FragmentMatcher from '../../../../src/Match/FragmentMatcher';
import FragmentMatchInterface from '../../../../src/Match/FragmentMatchInterface';
import FragmentMatchTree from '../../../../src/Match/FragmentMatchTree';
import LiteralFragment from '../../../../src/Match/Fragment/LiteralFragment';

describe('AlternationFragment', () => {
    let existingMatch: FragmentMatchInterface;
    let fragment: AlternationFragment;
    let fragmentMatcher: FragmentMatcher;

    beforeEach(() => {
        fragmentMatcher = new FragmentMatcher();
        existingMatch = new FragmentMatchTree(0);

        fragment = new AlternationFragment([
            new AlternativeFragment(fragmentMatcher, [
                new LiteralFragment('my'),
            ]),
            new AlternativeFragment(fragmentMatcher, [
                new LiteralFragment('your'),
            ]),
            new AlternativeFragment(fragmentMatcher, [
                new LiteralFragment('my-literal'),
            ]),
        ]);
    });

    describe('match()', () => {
        describe('when un-anchored', () => {
            it('should match when the first alternative appears at the start position', () => {
                const match = fragment.match(
                    'here is my-literal',
                    8,
                    false,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my');
                expect(match?.getStart()).to.equal(8);
            });

            it('should match when the second alternative appears at the start position', () => {
                const match = fragment.match(
                    'here is your-literal',
                    8,
                    false,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('your');
                expect(match?.getStart()).to.equal(8);
            });

            it('should match when the first alternative appears after the start position', () => {
                const match = fragment.match(
                    'here is my-literal',
                    5,
                    false,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my');
                expect(match?.getStart()).to.equal(8);
            });

            it('should return null when no alternative appears in the subject', () => {
                expect(
                    fragment.match('something-else', 0, false, existingMatch)
                ).to.be.null;
            });

            it('should return null when the only matching alternative appears before the start position', () => {
                expect(
                    fragment.match(
                        'here is my-literal',
                        9,
                        false,
                        existingMatch
                    )
                ).to.be.null;
            });
        });

        describe('when anchored', () => {
            it('should match when the first alternative appears at the start position', () => {
                const match = fragment.match(
                    'here is my-literal',
                    8,
                    true,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my');
                expect(match?.getStart()).to.equal(8);
            });

            it('should match when the second alternative appears at the start position', () => {
                const match = fragment.match(
                    'here is your-literal',
                    8,
                    true,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('your');
                expect(match?.getStart()).to.equal(8);
            });

            it('should return null when the first alternative appears after the start position', () => {
                const match = fragment.match(
                    'here is my-literal',
                    5,
                    true,
                    existingMatch
                );

                expect(match).to.be.null;
            });

            it('should return null when no alternative appears in the subject', () => {
                expect(fragment.match('something-else', 0, true, existingMatch))
                    .to.be.null;
            });

            it('should return null when the only matching alternative appears before the start position', () => {
                expect(
                    fragment.match('here is my-literal', 9, true, existingMatch)
                ).to.be.null;
            });
        });
    });

    describe('toString()', () => {
        it('should return the correct string representation', () => {
            expect(fragment.toString()).to.equal('my|your|my-literal');
        });
    });

    describe('toStructure()', () => {
        it('should return the correct structure', () => {
            expect(fragment.toStructure()).to.deep.equal({
                type: 'alternation',
                alternatives: [
                    {
                        type: 'alternative',
                        components: [{ type: 'literal', chars: 'my' }],
                    },
                    {
                        type: 'alternative',
                        components: [{ type: 'literal', chars: 'your' }],
                    },
                    {
                        type: 'alternative',
                        components: [{ type: 'literal', chars: 'my-literal' }],
                    },
                ],
            });
        });
    });
});
