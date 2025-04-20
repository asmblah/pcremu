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
import NativeFragment from '../../../../src/Match/Fragment/NativeFragment';
import PatternFragment from '../../../../src/Match/Fragment/PatternFragment';

describe('PatternFragment', () => {
    let existingMatch: FragmentMatchInterface;
    let fragment: PatternFragment;
    let fragmentMatcher: FragmentMatcher;

    beforeEach(() => {
        fragmentMatcher = new FragmentMatcher();
        existingMatch = new FragmentMatchTree(0);

        fragment = new PatternFragment(
            fragmentMatcher,
            [new LiteralFragment('my-'), new LiteralFragment('text')],
            [0, 1, 'myGroup', 2],
        );
    });

    describe('getFixedLength()', () => {
        it('should return the sum of fixed lengths of component fragments when all have fixed lengths', () => {
            expect(fragment.getFixedLength(existingMatch)).to.equal(7);
        });

        it('should return null when any component fragment has no fixed length', () => {
            const fragment = new PatternFragment(
                fragmentMatcher,
                [new LiteralFragment('my-'), new NativeFragment('.*', null)],
                [],
            );

            expect(fragment.getFixedLength(existingMatch)).to.be.null;
        });
    });

    describe('match()', () => {
        describe('when un-anchored', () => {
            it('should match when the pattern appears at the start position', () => {
                const match = fragment.match(
                    'here is my-text',
                    8,
                    false,
                    existingMatch,
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-text');
                expect(match?.getStart()).to.equal(8);
            });

            it('should match when a partial match appears before a full one', () => {
                const match = fragment.match(
                    'here is my-prefix followed by my-text',
                    8,
                    false,
                    existingMatch,
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-text');
                expect(match?.getStart()).to.equal(30);
            });

            it('should match when the pattern appears after the start position', () => {
                const match = fragment.match(
                    'here is my-text',
                    5,
                    false,
                    existingMatch,
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-text');
                expect(match?.getStart()).to.equal(8);
            });

            it('should return null when the pattern does not appear in the subject', () => {
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
            it('should match when the pattern appears at the start position', () => {
                const match = fragment.match(
                    'here is my-text',
                    8,
                    true,
                    existingMatch,
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-text');
                expect(match?.getStart()).to.equal(8);
            });

            it('should match when a partial match appears before a full one', () => {
                const match = fragment.match(
                    'here is my-prefix followed by my-text',
                    30,
                    true,
                    existingMatch,
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-text');
                expect(match?.getStart()).to.equal(30);
            });

            it('should return null when the pattern appears after the start position', () => {
                const match = fragment.match(
                    'here is my-text',
                    5,
                    true,
                    existingMatch,
                );

                expect(match).to.be.null;
            });

            it('should return null when the pattern does not appear in the subject', () => {
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
            expect(fragment.toString()).to.equal('my-text');
        });
    });

    describe('toStructure()', () => {
        it('should return the correct structure', () => {
            expect(fragment.toStructure()).to.deep.equal({
                type: 'pattern',
                capturingGroups: [0, 1, 'myGroup', 2],
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
