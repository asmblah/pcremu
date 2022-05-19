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
import LiteralFragment from '../../../../src/Match/Fragment/LiteralFragment';
import NonCapturingGroupFragment from '../../../../src/Match/Fragment/NonCapturingGroupFragment';

describe('NonCapturingGroupFragment', () => {
    let fragment: NonCapturingGroupFragment;
    let fragmentMatcher: FragmentMatcher;

    beforeEach(() => {
        fragmentMatcher = new FragmentMatcher();

        fragment = new NonCapturingGroupFragment(fragmentMatcher, [
            new LiteralFragment('my-'),
            new LiteralFragment('text'),
        ]);
    });

    describe('match()', () => {
        describe('when un-anchored', () => {
            it('should match when the group appears at the start position', () => {
                const match = fragment.match('here is my-text', 8, false);

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-text');
                expect(match?.getStart()).to.equal(8);
            });

            it('should match when the group appears after the start position', () => {
                const match = fragment.match('here is my-text', 5, false);

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-text');
                expect(match?.getStart()).to.equal(8);
            });

            it('should return null when the group does not appear in the subject', () => {
                expect(fragment.match('something-else', 0, false)).to.be.null;
            });

            it('should return null when the only match appears before the start position', () => {
                expect(fragment.match('here is my-text', 9, false)).to.be.null;
            });
        });

        describe('when anchored', () => {
            it('should match when the group appears at the start position', () => {
                const match = fragment.match('here is my-text', 8, true);

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('my-text');
                expect(match?.getStart()).to.equal(8);
            });

            it('should return null when the group appears after the start position', () => {
                const match = fragment.match('here is my-text', 5, true);

                expect(match).to.be.null;
            });

            it('should return null when the group does not appear in the subject', () => {
                expect(fragment.match('something-else', 0, true)).to.be.null;
            });

            it('should return null when the only match appears before the start position', () => {
                expect(fragment.match('here is my-text', 9, true)).to.be.null;
            });
        });
    });

    describe('toString()', () => {
        it('should return the correct string representation', () => {
            expect(fragment.toString()).to.equal('(?:my-text)');
        });
    });

    describe('toStructure()', () => {
        it('should return the correct structure', () => {
            expect(fragment.toStructure()).to.deep.equal({
                type: 'non-capturing-group',
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
