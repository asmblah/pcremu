/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import FragmentInterface from '../../../src/Match/Fragment/FragmentInterface';
import FragmentMatcher from '../../../src/Match/FragmentMatcher';
import FragmentMatchInterface from '../../../src/Match/FragmentMatchInterface';
import FragmentMatchTree from '../../../src/Match/FragmentMatchTree';
import { SinonStubbedInstance } from 'sinon';
import sinon, { stubInterface } from 'ts-sinon';
import FragmentMatch from '../../../src/Match/FragmentMatch';

describe('FragmentMatcher', () => {
    let existingMatch: FragmentMatchInterface;
    let fragmentMatcher: FragmentMatcher;

    beforeEach(() => {
        existingMatch = new FragmentMatchTree(0);

        fragmentMatcher = new FragmentMatcher();
    });

    describe('matchComponents()', () => {
        it('should be able to match a single component', () => {
            const componentFragment: SinonStubbedInstance<FragmentInterface> =
                stubInterface<FragmentInterface>();
            componentFragment.match
                .withArgs(
                    'this is my text inside here',
                    0,
                    false,
                    sinon.match.any
                )
                .callsFake(
                    (): FragmentMatchInterface | null =>
                        new FragmentMatch(8, 'my text')
                );

            const match = fragmentMatcher.matchComponents(
                'this is my text inside here',
                0,
                false,
                [componentFragment],
                existingMatch
            );

            expect(match).not.to.be.null;
            expect(match?.getCapture()).to.equal('my text');
            expect(match?.getStart()).to.equal(8);
            expect(match?.getEnd()).to.equal(15);
        });

        it('should be able to match multiple components', () => {
            const componentFragment1: SinonStubbedInstance<FragmentInterface> =
                stubInterface<FragmentInterface>();
            componentFragment1.match
                .withArgs(
                    'this is my text inside here',
                    0,
                    false,
                    sinon.match.any
                )
                .callsFake(
                    (): FragmentMatchInterface | null =>
                        new FragmentMatch(8, 'my text', {
                            4: 'my text',
                            5: 'tex',
                        })
                );
            const componentFragment2: SinonStubbedInstance<FragmentInterface> =
                stubInterface<FragmentInterface>();
            componentFragment2.match
                .withArgs(
                    'this is my text inside here',
                    15,
                    // Subsequent matches are forced to be anchored.
                    true,
                    sinon.match.any
                )
                .callsFake(
                    (): FragmentMatchInterface | null =>
                        new FragmentMatch(15, ' inside', {
                            6: 'ins',
                            7: 'id',
                        })
                );

            const match = fragmentMatcher.matchComponents(
                'this is my text inside here',
                0,
                false,
                [componentFragment1, componentFragment2],
                existingMatch
            );

            expect(match).not.to.be.null;
            expect(match?.getCapture()).to.equal('my text inside');
            expect(match?.getStart()).to.equal(8);
            expect(match?.getEnd()).to.equal(22);
            expect(match?.getNumberedCaptures()).to.deep.equal({
                4: 'my text',
                5: 'tex',
                6: 'ins',
                7: 'id',
            });
        });

        it('should be able to backtrack', () => {
            const componentFragment1: SinonStubbedInstance<FragmentInterface> =
                stubInterface<FragmentInterface>();
            componentFragment1.match
                .withArgs(
                    'this is my text inside here',
                    0,
                    false,
                    sinon.match.any
                )
                .callsFake(
                    (): FragmentMatchInterface | null =>
                        new FragmentMatch(
                            8,
                            'my text',
                            {
                                4: 'my text',
                                5: 'tex',
                            },
                            {},
                            {},
                            {},
                            (): FragmentMatchInterface | null =>
                                new FragmentMatch(15, 'my text', {
                                    4: 'm',
                                    5: 't',
                                })
                        )
                );
            const componentFragment2: SinonStubbedInstance<FragmentInterface> =
                stubInterface<FragmentInterface>();
            componentFragment2.match
                .withArgs(
                    'this is my text inside here',
                    sinon.match.any,
                    // Subsequent matches are forced to be anchored.
                    true,
                    sinon.match.any
                )
                .callsFake(
                    (
                        subject,
                        position,
                        isAnchored,
                        existingMatch
                    ): FragmentMatchInterface | null => {
                        if (existingMatch.getStart() === 8) {
                            // Fail to match initially, causing the previous fragment match to backtrack.
                            return null;
                        }

                        if (existingMatch.getStart() === 15) {
                            return new FragmentMatch(22, ' inside', {
                                6: 'ins',
                                7: 'id',
                            });
                        }

                        throw new Error('Unexpected existing match');
                    }
                );

            const match = fragmentMatcher.matchComponents(
                'this is my text inside here',
                0,
                false,
                [componentFragment1, componentFragment2],
                existingMatch
            );

            expect(match).not.to.be.null;
            expect(match?.getCapture()).to.equal('my text inside');
            expect(match?.getStart()).to.equal(15);
            expect(match?.getEnd()).to.equal(29);
            expect(match?.getNumberedCaptures()).to.deep.equal({
                4: 'm',
                5: 't',
                6: 'ins',
                7: 'id',
            });
        });

        it('should process the initial result (with no backtracking) via the given processor', () => {
            const componentFragment: SinonStubbedInstance<FragmentInterface> =
                stubInterface<FragmentInterface>();
            componentFragment.match
                .withArgs(
                    'this is my text inside here',
                    0,
                    false,
                    sinon.match.any
                )
                .callsFake(
                    (): FragmentMatchInterface | null =>
                        new FragmentMatch(8, 'my text')
                );

            const match = fragmentMatcher.matchComponents(
                'this is my text inside here',
                0,
                false,
                [componentFragment],
                existingMatch,
                (match: FragmentMatchInterface): FragmentMatchInterface => {
                    return match.withCaptureAs(21);
                }
            );

            expect(match).not.to.be.null;
            expect(match?.getCapture()).to.equal('my text');
            // From the processor.
            expect(match?.getNumberedCapture(21)).to.equal('my text');
        });

        it('should process any backtracked result via the processor', () => {
            const componentFragment1: SinonStubbedInstance<FragmentInterface> =
                stubInterface<FragmentInterface>();
            componentFragment1.match
                .withArgs(
                    'this is my text inside here',
                    0,
                    false,
                    sinon.match.any
                )
                .callsFake(
                    (): FragmentMatchInterface | null =>
                        new FragmentMatch(
                            8,
                            'my text',
                            {
                                4: 'my text',
                                5: 'tex',
                            },
                            {},
                            {},
                            {},
                            (): FragmentMatchInterface | null =>
                                new FragmentMatch(15, 'my text', {
                                    4: 'm',
                                    5: 't',
                                })
                        )
                );
            const componentFragment2: SinonStubbedInstance<FragmentInterface> =
                stubInterface<FragmentInterface>();
            componentFragment2.match
                .withArgs(
                    'this is my text inside here',
                    sinon.match.any,
                    // Subsequent matches are forced to be anchored.
                    true,
                    sinon.match.any
                )
                .callsFake(
                    (
                        subject,
                        position,
                        isAnchored,
                        existingMatch
                    ): FragmentMatchInterface | null => {
                        if (existingMatch.getStart() === 8) {
                            // Fail to match initially, causing the previous fragment match to backtrack.
                            return null;
                        }

                        if (existingMatch.getStart() === 15) {
                            return new FragmentMatch(22, ' inside', {
                                6: 'ins',
                                7: 'id',
                            });
                        }

                        throw new Error('Unexpected existing match');
                    }
                );

            const match = fragmentMatcher.matchComponents(
                'this is my text inside here',
                0,
                false,
                [componentFragment1, componentFragment2],
                existingMatch,
                (match: FragmentMatchInterface): FragmentMatchInterface => {
                    return match.withCaptureAs(21);
                }
            );

            expect(match).not.to.be.null;
            expect(match?.getCapture()).to.equal('my text inside');
            expect(match?.getStart()).to.equal(15);
            expect(match?.getEnd()).to.equal(29);
            expect(match?.getNumberedCaptures()).to.deep.equal({
                4: 'm',
                5: 't',
                6: 'ins',
                7: 'id',
                21: 'my text inside', // From the processor.
            });
        });
    });
});
