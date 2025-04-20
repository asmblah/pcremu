/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import NoopFragment from '../../../../src/Match/Fragment/NoopFragment';

describe('NoopFragment', () => {
    let fragment: NoopFragment;

    beforeEach(() => {
        fragment = new NoopFragment();
    });

    describe('getFixedLength()', () => {
        it('should return 0', () => {
            expect(fragment.getFixedLength()).to.equal(0);
        });
    });

    describe('match()', () => {
        it('should return an empty match', () => {
            const match = fragment.match('here is my-text', 6);

            expect(match).not.to.be.null;
            expect(match?.getCapture()).to.equal('');
            expect(match?.getStart()).to.equal(6);
        });
    });

    describe('toString()', () => {
        it('should return the empty string', () => {
            expect(fragment.toString()).to.equal('');
        });
    });

    describe('toStructure()', () => {
        it('should return the correct structure', () => {
            expect(fragment.toStructure()).to.deep.equal({
                type: 'noop',
            });
        });
    });
});
