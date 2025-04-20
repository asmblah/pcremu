/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import * as sinon from 'sinon';
import { stubInterface } from 'ts-sinon';
import FragmentInterface from '../../../src/Match/Fragment/FragmentInterface';
import FragmentMatch from '../../../src/Match/FragmentMatch';
import FragmentMatchTree from '../../../src/Match/FragmentMatchTree';
import QuantifierMatcher from '../../../src/Match/QuantifierMatcher';

describe('QuantifierMatcher', () => {
    let componentFragment: sinon.SinonStubbedInstance<FragmentInterface>;
    let createMatch: (end: number) => sinon.SinonStubbedInstance<FragmentMatch>;
    let existingMatch: sinon.SinonStubbedInstance<FragmentMatch>;

    beforeEach(() => {
        componentFragment = stubInterface<FragmentInterface>();
        existingMatch = sinon.createStubInstance(FragmentMatch);
        existingMatch.withSubsequentMatches.returns(existingMatch);

        createMatch = (end: number) => {
            const match = sinon.createStubInstance(FragmentMatch);
            match.getEnd.returns(end);
            return match;
        };
    });

    describe('matchMaximising()', () => {
        it('should match the maximum number of times when possible', () => {
            const backtracker = sinon.stub().returns(null);
            const quantifierMatcher = new QuantifierMatcher();
            const match1 = createMatch(1);
            const match2 = createMatch(2);
            componentFragment.match.onFirstCall().returns(match1);
            componentFragment.match.onSecondCall().returns(match2);
            componentFragment.match.onThirdCall().returns(null);

            const result = quantifierMatcher.matchMaximising(
                'aa',
                0,
                false,
                componentFragment,
                1,
                3,
                existingMatch,
                backtracker
            );

            expect(result).to.be.instanceOf(FragmentMatchTree);
            expect(componentFragment.match.args).to.deep.equal([
                ['aa', 0, false, existingMatch],
                ['aa', 1, true, existingMatch],
                ['aa', 2, true, existingMatch],
            ]);
        });

        it('should return null when the minimum number of matches is not met', () => {
            const backtracker = sinon.stub().returns(null);
            const quantifierMatcher = new QuantifierMatcher();
            componentFragment.match.returns(null);

            const result = quantifierMatcher.matchMaximising(
                'aa',
                0,
                false,
                componentFragment,
                2,
                3,
                existingMatch,
                backtracker
            );

            expect(result).to.be.null;
            expect(componentFragment.match.args).to.deep.equal([
                ['aa', 0, false, existingMatch],
            ]);
        });
    });

    describe('matchMinimising()', () => {
        it('should return an empty match when the minimum number of matches is zero', () => {
            const backtracker = sinon.stub().returns(null);
            const quantifierMatcher = new QuantifierMatcher();

            const result = quantifierMatcher.matchMinimising(
                'aa',
                0,
                false,
                componentFragment,
                0,
                3,
                existingMatch,
                backtracker
            );

            expect(result).to.be.instanceOf(FragmentMatchTree);
            expect(componentFragment.match.callCount).to.equal(0);
        });

        it('should match the minimum required number of times', () => {
            const backtracker = sinon.stub().returns(null);
            const quantifierMatcher = new QuantifierMatcher();
            const match1 = createMatch(1);
            const match2 = createMatch(2);
            componentFragment.match.onFirstCall().returns(match1);
            componentFragment.match.onSecondCall().returns(match2);

            const result = quantifierMatcher.matchMinimising(
                'aa',
                0,
                false,
                componentFragment,
                2,
                3,
                existingMatch,
                backtracker
            );

            expect(result).to.be.instanceOf(FragmentMatchTree);
            expect(componentFragment.match.args).to.deep.equal([
                ['aa', 0, false, existingMatch],
                ['aa', 1, true, existingMatch],
            ]);
        });

        it('should return null when the minimum number of matches cannot be met', () => {
            const backtracker = sinon.stub().returns(null);
            const quantifierMatcher = new QuantifierMatcher();
            const match1 = createMatch(1);
            componentFragment.match.onFirstCall().returns(match1);
            componentFragment.match.onSecondCall().returns(null);

            const result = quantifierMatcher.matchMinimising(
                'aa',
                0,
                false,
                componentFragment,
                2,
                3,
                existingMatch,
                backtracker
            );

            expect(result).to.be.null;
            expect(componentFragment.match.args).to.deep.equal([
                ['aa', 0, false, existingMatch],
                ['aa', 1, true, existingMatch],
            ]);
        });
    });
});
