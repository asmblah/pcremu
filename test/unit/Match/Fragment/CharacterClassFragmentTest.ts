/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import CharacterClassFragment from '../../../../src/Match/Fragment/CharacterClassFragment';
import NativeFragment from '../../../../src/Match/Fragment/NativeFragment';
import FragmentMatchInterface from '../../../../src/Match/FragmentMatchInterface';
import FragmentMatchTree from '../../../../src/Match/FragmentMatchTree';

describe('CharacterClassFragment', () => {
    let existingMatch: FragmentMatchInterface;
    let fragment: CharacterClassFragment;

    beforeEach(() => {
        existingMatch = new FragmentMatchTree(0);

        fragment = new CharacterClassFragment(
            [new NativeFragment('m'), new NativeFragment('t')],
            false
        );
    });

    describe('match()', () => {
        describe('when un-anchored', () => {
            it('should match when a component appears at the start position', () => {
                const match = fragment.match(
                    'here is my-literal',
                    8,
                    false,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('m');
                expect(match?.getStart()).to.equal(8);
            });

            it('should match when a component appears after the start position', () => {
                const match = fragment.match(
                    'here is my-literal',
                    5,
                    false,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('m');
                expect(match?.getStart()).to.equal(8);
            });

            it('should return null when a component does not appear in subject', () => {
                expect(fragment.match('abcd', 0, false, existingMatch)).to.be
                    .null;
            });

            it('should return null when all matching components appear before the start position', () => {
                expect(
                    fragment.match(
                        'here is my-literal',
                        14,
                        false,
                        existingMatch
                    )
                ).to.be.null;
            });
        });

        describe('when anchored', () => {
            it('should match when a component appears at the start position', () => {
                const match = fragment.match(
                    'here is my-literal',
                    8,
                    true,
                    existingMatch
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('m');
                expect(match?.getStart()).to.equal(8);
            });

            it('should return null when a component appears after the start position', () => {
                const match = fragment.match(
                    'here is my-literal',
                    5,
                    true,
                    existingMatch
                );

                expect(match).to.be.null;
            });

            it('should return null when a component does not appear in subject', () => {
                expect(fragment.match('something-else', 0, true, existingMatch))
                    .to.be.null;
            });

            it('should return null when all matching components appear before the start position', () => {
                expect(
                    fragment.match('here is my-literal', 9, true, existingMatch)
                ).to.be.null;
            });
        });
    });

    describe('toString()', () => {
        it('should return the correct representation', () => {
            expect(fragment.toString()).to.equal('[mt]');
        });
    });

    describe('toStructure()', () => {
        it('should return the correct structure', () => {
            expect(fragment.toStructure()).to.deep.equal({
                type: 'character-class',
                negated: false,
                components: [
                    {
                        type: 'native',
                        chars: 'm',
                        patternToEmulatedNumberedGroupIndex: {},
                    },
                    {
                        type: 'native',
                        chars: 't',
                        patternToEmulatedNumberedGroupIndex: {},
                    },
                ],
            });
        });
    });
});
