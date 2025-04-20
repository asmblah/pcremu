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
import LookbehindFragment from '../../../../src/Match/Fragment/LookbehindFragment';
import { LookaroundBivalence } from '../../../../src/Pattern/LookaroundBivalence';
import NativeFragment from '../../../../src/Match/Fragment/NativeFragment';

describe('LookbehindFragment', () => {
    let existingMatch: FragmentMatchInterface;
    let fragment: LookbehindFragment;
    let fragmentMatcher: FragmentMatcher;

    beforeEach(() => {
        fragmentMatcher = new FragmentMatcher();
        existingMatch = new FragmentMatchTree(0);

        fragment = new LookbehindFragment(
            fragmentMatcher,
            [new LiteralFragment('my-'), new LiteralFragment('text')],
            LookaroundBivalence.Positive,
        );
    });

    describe('getFixedLength()', () => {
        it('should return the sum of fixed lengths of component fragments when all have fixed lengths', () => {
            expect(fragment.getFixedLength(existingMatch)).to.equal(7);
        });

        it('should return null when any component fragment has variable length', () => {
            const fragment = new LookbehindFragment(
                fragmentMatcher,
                [new LiteralFragment('my-'), new NativeFragment('text*', null)],
                LookaroundBivalence.Positive,
            );

            expect(fragment.getFixedLength(existingMatch)).to.be.null;
        });
    });

    describe('match()', () => {
        describe('when positive lookbehind', () => {
            describe('when un-anchored', () => {
                it('should match when the pattern appears before the current position', () => {
                    const match = fragment.match(
                        'here is my-text and more',
                        15,
                        false,
                        existingMatch,
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(''); // Lookarounds are zero-length assertions.
                    expect(match?.getStart()).to.equal(15); // Lookbehind assertion should finish at the end of its match.
                });

                it('should return null when the pattern does not appear before the current position', () => {
                    expect(
                        fragment.match(
                            'here is something else',
                            8,
                            false,
                            existingMatch,
                        ),
                    ).to.be.null;
                });

                it('should match when the pattern appears after the current position', () => {
                    const match = fragment.match(
                        'here is something else my-text and more',
                        10,
                        false,
                        existingMatch,
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(''); // Lookarounds are zero-length assertions.
                    expect(match?.getStart()).to.equal(30); // Lookbehind assertion should finish at the end of its match.
                });
            });

            describe('when anchored', () => {
                it('should match when the pattern appears before the current position', () => {
                    const match = fragment.match(
                        'here is my-text and more',
                        15,
                        true,
                        existingMatch,
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(''); // Lookarounds are zero-length assertions.
                    expect(match?.getStart()).to.equal(15); // Lookbehind assertion should finish at the end of its match.
                });

                it('should return null when the pattern does not appear before the current position', () => {
                    expect(
                        fragment.match(
                            'here is something else',
                            8,
                            true,
                            existingMatch,
                        ),
                    ).to.be.null;
                });

                it('should return null when the pattern appears after the current position', () => {
                    expect(
                        fragment.match(
                            'here is something else my-text',
                            8,
                            true,
                            existingMatch,
                        ),
                    ).to.be.null;
                });
            });
        });

        describe('when negative lookbehind', () => {
            beforeEach(() => {
                fragment = new LookbehindFragment(
                    fragmentMatcher,
                    [new LiteralFragment('my-'), new LiteralFragment('text')],
                    LookaroundBivalence.Negative,
                );
            });

            describe('when un-anchored', () => {
                it('should match when the pattern does not appear before the current position', () => {
                    const match = fragment.match(
                        'here is something else',
                        8,
                        false,
                        existingMatch,
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(''); // Lookarounds are zero-length assertions.
                    expect(match?.getStart()).to.equal(8);
                });

                it('should return null when the pattern appears before the current position', () => {
                    expect(
                        fragment.match(
                            'here is my-text and more',
                            15,
                            false,
                            existingMatch,
                        ),
                    ).to.be.null;
                });

                // Regex engine will not walk backwards in the string to find the match.
                it('should return null when the pattern appears far before the current position', () => {
                    const match = fragment.match(
                        'here is my-text and something else',
                        30,
                        false,
                        existingMatch,
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(''); // Lookarounds are zero-length assertions.
                    expect(match?.getStart()).to.equal(30);
                });
            });

            describe('when anchored', () => {
                it('should match when the pattern does not appear before the current position', () => {
                    const match = fragment.match(
                        'here is something else',
                        8,
                        true,
                        existingMatch,
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(''); // Lookarounds are zero-length assertions.
                    expect(match?.getStart()).to.equal(8);
                });

                it('should return null when the pattern appears before the current position', () => {
                    expect(
                        fragment.match(
                            'here is my-text and more',
                            15,
                            true,
                            existingMatch,
                        ),
                    ).to.be.null;
                });

                it('should match when the pattern appears far before the current position', () => {
                    const match = fragment.match(
                        'here is my-text and something else',
                        30,
                        true,
                        existingMatch,
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(''); // Lookarounds are zero-length assertions.
                    expect(match?.getStart()).to.equal(30);
                });
            });
        });
    });

    describe('toString()', () => {
        it('should return the correct string representation for positive lookbehind', () => {
            expect(fragment.toString()).to.equal('(?<=my-text)');
        });

        it('should return the correct string representation for negative lookbehind', () => {
            fragment = new LookbehindFragment(
                fragmentMatcher,
                [new LiteralFragment('my-'), new LiteralFragment('text')],
                LookaroundBivalence.Negative,
            );

            expect(fragment.toString()).to.equal('(?<!my-text)');
        });
    });

    describe('toStructure()', () => {
        it('should return the correct structure', () => {
            expect(fragment.toStructure()).to.deep.equal({
                type: 'lookbehind',
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
