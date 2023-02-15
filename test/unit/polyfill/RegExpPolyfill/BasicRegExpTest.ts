/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import RegExpPolyfill from '../../../../src/polyfill/RegExp/RegExpPolyfill';

describe('RegExpPolyfill basic support', () => {
    describe('exec()', () => {
        describe('for a simple regex with one numbered capturing group and no flags', () => {
            let regex: RegExpPolyfill;

            beforeEach(() => {
                regex = new RegExpPolyfill('(b)c');
            });

            it('should correctly match', () => {
                const match = regex.exec('abcd');

                expect(match).to.have.length(2);
                expect(match).to.deep.equal(['bc', 'b']);
                expect(match?.groups).to.be.undefined;
                expect(match).to.not.have.property('indices');
            });

            it('should correctly fail to match', () => {
                const match = regex.exec('I will not match');

                expect(match).to.be.null;
            });
        });

        describe('for a simple regex with two nested numbered capturing groups and no flags', () => {
            let regex: RegExpPolyfill;

            beforeEach(() => {
                regex = new RegExpPolyfill('((b)c)d');
            });

            it('should correctly match', () => {
                const match = regex.exec('abcd');

                expect(match).to.have.length(3);
                expect(match).to.deep.equal(['bcd', 'bc', 'b']);
                expect(match?.groups).to.be.undefined;
                expect(match).to.not.have.property('indices');
            });

            it('should correctly fail to match', () => {
                const match = regex.exec('I will not match');

                expect(match).to.be.null;
            });
        });
    });
});
