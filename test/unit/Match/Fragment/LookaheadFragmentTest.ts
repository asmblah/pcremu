/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import FragmentMatcher from '../../../../src/Match/FragmentMatcher';
import FragmentMatchInterface from '../../../../src/Match/FragmentMatchInterface';
import FragmentMatchTree from '../../../../src/Match/FragmentMatchTree';
import LiteralFragment from '../../../../src/Match/Fragment/LiteralFragment';
import LookaheadFragment from '../../../../src/Match/Fragment/LookaheadFragment';
import { LookaroundBivalence } from '../../../../src/Pattern/LookaroundBivalence';
import NativeFragment from '../../../../src/Match/Fragment/NativeFragment';

describe('LookaheadFragment', () => {
    let existingMatch: FragmentMatchInterface;
    let fragment: LookaheadFragment;
    let fragmentMatcher: FragmentMatcher;

    beforeEach(() => {
        fragmentMatcher = new FragmentMatcher();
        existingMatch = new FragmentMatchTree(0);

        fragment = new LookaheadFragment(
            fragmentMatcher,
            [new LiteralFragment('my-'), new LiteralFragment('text')],
            LookaroundBivalence.Positive
        );
    });

    describe('getFixedLength()', () => {
        it('should return the sum of component fixed lengths', () => {
            expect(fragment.getFixedLength(existingMatch)).to.equal(7);
        });

        it('should return null when any component has variable length', () => {
            fragment = new LookaheadFragment(
                fragmentMatcher,
                [new LiteralFragment('my-'), new NativeFragment('text*', null)],
                LookaroundBivalence.Positive
            );

            expect(fragment.getFixedLength(existingMatch)).to.be.null;
        });
    });

    describe('match()', () => {
        describe('when positive lookahead', () => {
            describe('when un-anchored', () => {
                it('should match when the pattern appears after the current position', () => {
                    const match = fragment.match(
                        'here is my-text and more',
                        8,
                        false,
                        existingMatch
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(''); // Lookarounds are zero-length assertions.
                    expect(match?.getStart()).to.equal(8);
                });

                it('should return null when the pattern does not appear after the current position', () => {
                    expect(
                        fragment.match(
                            'here is something else',
                            8,
                            false,
                            existingMatch
                        )
                    ).to.be.null;
                });

                it('should match when the pattern appears far after the current position', () => {
                    const match = fragment.match(
                        'here is something else and my-text',
                        8,
                        false,
                        existingMatch
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(''); // Lookarounds are zero-length assertions.
                    expect(match?.getStart()).to.equal(27);
                });

                it('should return null when the pattern appears before the current position', () => {
                    expect(
                        fragment.match(
                            'my-text is here',
                            7,
                            false,
                            existingMatch
                        )
                    ).to.be.null;
                });

                it('should return null when the pattern appears far before the current position', () => {
                    expect(
                        fragment.match(
                            'my-text is here',
                            12,
                            false,
                            existingMatch
                        )
                    ).to.be.null;
                });
            });

            describe('when anchored', () => {
                it('should match when the pattern appears after the current position', () => {
                    const match = fragment.match(
                        'here is my-text and more',
                        8,
                        true,
                        existingMatch
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(''); // Lookarounds are zero-length assertions.
                    expect(match?.getStart()).to.equal(8);
                });

                it('should return null when the pattern does not appear after the current position', () => {
                    expect(
                        fragment.match(
                            'here is something else',
                            8,
                            true,
                            existingMatch
                        )
                    ).to.be.null;
                });

                it('should return null when the pattern appears far after the current position', () => {
                    expect(
                        fragment.match(
                            'here is something else and my-text',
                            8,
                            true,
                            existingMatch
                        )
                    ).to.be.null;
                });

                it('should return null when the pattern appears before the current position', () => {
                    expect(
                        fragment.match(
                            'my-text is here',
                            7,
                            true,
                            existingMatch
                        )
                    ).to.be.null;
                });

                it('should return null when the pattern appears far before the current position', () => {
                    expect(
                        fragment.match(
                            'my-text is here',
                            12,
                            true,
                            existingMatch
                        )
                    ).to.be.null;
                });
            });
        });

        describe('when negative lookahead', () => {
            beforeEach(() => {
                fragment = new LookaheadFragment(
                    fragmentMatcher,
                    [new LiteralFragment('my-'), new LiteralFragment('text')],
                    LookaroundBivalence.Negative
                );
            });

            describe('when un-anchored', () => {
                it('should match when the pattern does not appear after the current position', () => {
                    const match = fragment.match(
                        'here is something else',
                        8,
                        false,
                        existingMatch
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(''); // Lookarounds are zero-length assertions.
                    expect(match?.getStart()).to.equal(8);
                });

                it('should return null when the pattern appears after the current position', () => {
                    expect(
                        fragment.match(
                            'here is my-text and more',
                            8,
                            false,
                            existingMatch
                        )
                    ).to.be.null;
                });

                // Regex engine will not walk forwards in the string to find the match.
                it('should return null when the pattern appears far after the current position', () => {
                    expect(
                        fragment.match(
                            'here is something else and my-text',
                            8,
                            false,
                            existingMatch
                        )
                    ).to.be.null;
                });

                it('should match when the pattern appears before the current position', () => {
                    const match = fragment.match(
                        'here is my-text and more',
                        15,
                        false,
                        existingMatch
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(''); // Lookarounds are zero-length assertions.
                    expect(match?.getStart()).to.equal(15);
                });

                it('should match when the pattern appears far before the current position', () => {
                    const match = fragment.match(
                        'here is my-text and more',
                        20,
                        false,
                        existingMatch
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(''); // Lookarounds are zero-length assertions.
                    expect(match?.getStart()).to.equal(20);
                });
            });

            describe('when anchored', () => {
                it('should match when the pattern does not appear after the current position', () => {
                    const match = fragment.match(
                        'here is something else',
                        8,
                        true,
                        existingMatch
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(''); // Lookarounds are zero-length assertions.
                    expect(match?.getStart()).to.equal(8);
                });

                it('should return null when the pattern appears after the current position', () => {
                    expect(
                        fragment.match(
                            'here is my-text and more',
                            8,
                            true,
                            existingMatch
                        )
                    ).to.be.null;
                });

                it('should match when the pattern appears far after the current position', () => {
                    const match = fragment.match(
                        'here is something else and my-text',
                        8,
                        true,
                        existingMatch
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(''); // Lookarounds are zero-length assertions.
                    expect(match?.getStart()).to.equal(8);
                });

                it('should match when the pattern appears before the current position', () => {
                    const match = fragment.match(
                        'here is my-text and more',
                        15,
                        true,
                        existingMatch
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(''); // Lookarounds are zero-length assertions.
                    expect(match?.getStart()).to.equal(15);
                });

                it('should match when the pattern appears far before the current position', () => {
                    const match = fragment.match(
                        'here is my-text and more',
                        20,
                        true,
                        existingMatch
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(''); // Lookarounds are zero-length assertions.
                    expect(match?.getStart()).to.equal(20);
                });
            });
        });
    });

    describe('toString()', () => {
        it('should return the correct string representation for positive lookahead', () => {
            expect(fragment.toString()).to.equal('(?=my-text)');
        });

        it('should return the correct string representation for negative lookahead', () => {
            fragment = new LookaheadFragment(
                fragmentMatcher,
                [new LiteralFragment('my-'), new LiteralFragment('text')],
                LookaroundBivalence.Negative
            );

            expect(fragment.toString()).to.equal('(?!my-text)');
        });
    });

    describe('toStructure()', () => {
        it('should return the correct structure', () => {
            expect(fragment.toStructure()).to.deep.equal({
                type: 'lookahead',
                bivalence: 'positive',
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
