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

describe('RegExpPolyfill indices capture', () => {
    describe('.hasIndices property', () => {
        it('should be true when regex has d flag', () => {
            const regex = new RegExpPolyfill('abc', 'dm');

            expect(regex.hasIndices).to.be.true;
        });

        it('should be false when regex does not have d flag', () => {
            const regex = new RegExpPolyfill('abc', 'gm');

            expect(regex.hasIndices).to.be.false;
        });
    });

    describe('exec()', () => {
        describe('for a simple regex with one numbered capturing group and d flag', () => {
            let regex: RegExpPolyfill;

            beforeEach(() => {
                regex = new RegExpPolyfill('(b)c', 'd');
            });

            it('should correctly match', () => {
                const match = regex.exec('abcd');

                expect(match).to.have.length(2);
                expect(match).to.deep.equal(['bc', 'b']);
                expect(match?.groups).to.be.undefined;
                expect(match?.indices).to.have.length(2);
                expect(match?.indices).to.deep.equal([
                    [1, 3],
                    [1, 2],
                ]);
                expect(match?.indices.groups).to.be.undefined;
            });

            it('should correctly fail to match', () => {
                const match = regex.exec('I will not match');

                expect(match).to.be.null;
            });
        });

        describe('for a simple regex with two nested numbered capturing groups and d flag', () => {
            let regex: RegExpPolyfill;

            beforeEach(() => {
                regex = new RegExpPolyfill('((b)c)d', 'd');
            });

            it('should correctly match', () => {
                const match = regex.exec('abcd');

                expect(match).to.have.length(3);
                expect(match).to.deep.equal(['bcd', 'bc', 'b']);
                expect(match?.groups).to.be.undefined;
                expect(match?.indices).to.have.length(3);
                expect(match?.indices).to.deep.equal([
                    [1, 4],
                    [1, 3],
                    [1, 2],
                ]);
                expect(match?.indices.groups).to.be.undefined;
            });

            it('should correctly fail to match', () => {
                const match = regex.exec('I will not match');

                expect(match).to.be.null;
            });
        });

        describe('for a regex with both named capturing groups and d flag', () => {
            let regex: RegExpPolyfill;

            beforeEach(() => {
                regex = new RegExpPolyfill('a(?<first>b)c(?<second>d)e', 'd');
            });

            it('should correctly match', () => {
                const match = regex.exec('123abcde456');

                expect(match).to.have.length(3);
                expect(match).to.deep.equal(['abcde', 'b', 'd']);
                expect(match?.groups).to.deep.equal({
                    'first': 'b',
                    'second': 'd',
                });
                expect(match?.indices).to.have.length(3);
                expect(match?.indices).to.deep.equal([
                    [3, 8],
                    [4, 5],
                    [6, 7],
                ]);
                expect(match?.indices.groups).to.deep.equal({
                    'first': [4, 5],
                    'second': [6, 7],
                });
            });

            it('should correctly fail to match', () => {
                const match = regex.exec('I will not match');

                expect(match).to.be.null;
            });
        });
    });
});
