/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import NativeFragment from '../../../../src/Match/Fragment/NativeFragment';

describe('NativeFragment', () => {
    let fragment: NativeFragment;

    beforeEach(() => {
        fragment = new NativeFragment('(is )my(?<myGroup>.*)text', null, {
            7: 1,
            12: 2,
        });
    });

    describe('getFixedLength()', () => {
        it('should return the fixed length when specified', () => {
            const fragment = new NativeFragment('abc', 3);

            expect(fragment.getFixedLength()).to.equal(3);
        });

        it('should return null for a variable-length pattern with quantifier', () => {
            const fragment = new NativeFragment('a.*', null);

            expect(fragment.getFixedLength()).to.be.null;
        });
    });

    describe('match()', () => {
        describe('when un-anchored', () => {
            it('should match when the pattern appears at the start position', () => {
                const match = fragment.match(
                    'here is my-literal-text',
                    5,
                    false
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('is my-literal-text');
                expect(match?.getStart()).to.equal(5);
                expect(match?.getNamedCaptures()).to.deep.equal({
                    'myGroup': '-literal-',
                });
                expect(match?.getNumberedCaptures()).to.deep.equal({
                    // Note the numbered matches have been mapped accordingly.
                    7: 'is ',
                    12: '-literal-',
                });
            });

            it('should match when the pattern appears after the start position', () => {
                const match = fragment.match(
                    'here is my-literal-text',
                    3,
                    false
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('is my-literal-text');
                expect(match?.getStart()).to.equal(5);
                expect(match?.getNamedCaptures()).to.deep.equal({
                    'myGroup': '-literal-',
                });
                expect(match?.getNumberedCaptures()).to.deep.equal({
                    7: 'is ',
                    12: '-literal-',
                });
            });

            it('should backtrack a native maximising (greedy) match backwards', () => {
                const match = fragment.match(
                    'here is my-literal-with-text-then-text',
                    3,
                    false
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal(
                    'is my-literal-with-text-then-text'
                );
                expect(match?.getStart()).to.equal(5);
                expect(match?.getNamedCaptures()).to.deep.equal({
                    'myGroup': '-literal-with-text-then-',
                });
                expect(match?.getNumberedCaptures()).to.deep.equal({
                    7: 'is ',
                    12: '-literal-with-text-then-',
                });
                const backtrackedMatch = match?.backtrack();
                expect(backtrackedMatch?.getCapture()).to.equal(
                    'is my-literal-with-text'
                );
                expect(backtrackedMatch?.getStart()).to.equal(5);
                expect(backtrackedMatch?.getNamedCaptures()).to.deep.equal({
                    'myGroup': '-literal-with-',
                });
                expect(backtrackedMatch?.getNumberedCaptures()).to.deep.equal({
                    7: 'is ',
                    12: '-literal-with-',
                });
                expect(backtrackedMatch?.backtrack()).to.be.null;
            });

            it('should backtrack a native minimising (lazy) match forwards', () => {
                fragment = new NativeFragment(
                    '(is )my(?<myGroup>.*?)text',
                    null,
                    {
                        7: 1,
                        12: 2,
                    }
                );
                const match = fragment.match(
                    'here is my-literal-with-text-then-text',
                    3,
                    false
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('is my-literal-with-text');
                expect(match?.getStart()).to.equal(5);
                expect(match?.getNamedCaptures()).to.deep.equal({
                    'myGroup': '-literal-with-',
                });
                expect(match?.getNumberedCaptures()).to.deep.equal({
                    7: 'is ',
                    12: '-literal-with-',
                });
                const backtrackedMatch = match?.backtrack();
                expect(backtrackedMatch?.getCapture()).to.equal(
                    'is my-literal-with-text-then-text'
                );
                expect(backtrackedMatch?.getStart()).to.equal(5);
                expect(backtrackedMatch?.getNamedCaptures()).to.deep.equal({
                    'myGroup': '-literal-with-text-then-',
                });
                expect(backtrackedMatch?.getNumberedCaptures()).to.deep.equal({
                    7: 'is ',
                    12: '-literal-with-text-then-',
                });
                expect(backtrackedMatch?.backtrack()).to.be.null;
            });

            it('should return null when the pattern does not appear in subject', () => {
                expect(fragment.match('something-else', 0, false)).to.be.null;
            });

            it('should return null when the pattern appears before the start position', () => {
                expect(fragment.match('here is my-literal-text', 6, false)).to
                    .be.null;
            });
        });

        describe('when anchored', () => {
            it('should match when the pattern appears at the start position', () => {
                const match = fragment.match(
                    'here is my-literal-text',
                    5,
                    true
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('is my-literal-text');
                expect(match?.getStart()).to.equal(5);
                expect(match?.getNamedCaptures()).to.deep.equal({
                    'myGroup': '-literal-',
                });
                expect(match?.getNumberedCaptures()).to.deep.equal({
                    // Note the numbered matches have been mapped accordingly.
                    7: 'is ',
                    12: '-literal-',
                });
            });

            it('should return null when the pattern appears after the start position', () => {
                const match = fragment.match(
                    'here is my-literal-text',
                    3,
                    true
                );

                expect(match).to.be.null;
            });

            it('should backtrack a native maximising (greedy) match backwards', () => {
                const match = fragment.match(
                    'here is my-literal-with-text-then-text',
                    5,
                    true
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal(
                    'is my-literal-with-text-then-text'
                );
                expect(match?.getStart()).to.equal(5);
                expect(match?.getNamedCaptures()).to.deep.equal({
                    'myGroup': '-literal-with-text-then-',
                });
                expect(match?.getNumberedCaptures()).to.deep.equal({
                    7: 'is ',
                    12: '-literal-with-text-then-',
                });
                const backtrackedMatch = match?.backtrack();
                expect(backtrackedMatch?.getCapture()).to.equal(
                    'is my-literal-with-text'
                );
                expect(backtrackedMatch?.getStart()).to.equal(5);
                expect(backtrackedMatch?.getNamedCaptures()).to.deep.equal({
                    'myGroup': '-literal-with-',
                });
                expect(backtrackedMatch?.getNumberedCaptures()).to.deep.equal({
                    7: 'is ',
                    12: '-literal-with-',
                });
                expect(backtrackedMatch?.backtrack()).to.be.null;
            });

            it('should backtrack a native minimising (lazy) match forwards', () => {
                fragment = new NativeFragment(
                    '(is )my(?<myGroup>.*?)text',
                    null,
                    {
                        7: 1,
                        12: 2,
                    }
                );
                const match = fragment.match(
                    'here is my-literal-with-text-then-text',
                    5,
                    true
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('is my-literal-with-text');
                expect(match?.getStart()).to.equal(5);
                expect(match?.getNamedCaptures()).to.deep.equal({
                    'myGroup': '-literal-with-',
                });
                expect(match?.getNumberedCaptures()).to.deep.equal({
                    7: 'is ',
                    12: '-literal-with-',
                });
                const backtrackedMatch = match?.backtrack();
                expect(backtrackedMatch?.getCapture()).to.equal(
                    'is my-literal-with-text-then-text'
                );
                expect(backtrackedMatch?.getStart()).to.equal(5);
                expect(backtrackedMatch?.getNamedCaptures()).to.deep.equal({
                    'myGroup': '-literal-with-text-then-',
                });
                expect(backtrackedMatch?.getNumberedCaptures()).to.deep.equal({
                    7: 'is ',
                    12: '-literal-with-text-then-',
                });
                expect(backtrackedMatch?.backtrack()).to.be.null;
            });

            it('should return null when the pattern does not appear in subject', () => {
                expect(fragment.match('something-else', 0, true)).to.be.null;
            });

            it('should return null when the pattern appears before the start position', () => {
                expect(fragment.match('here is my-literal-text', 6, true)).to.be
                    .null;
            });
        });

        describe('caseless mode', () => {
            it('should match case-sensitively outside caseless mode', () => {
                expect(fragment.match('here is MY-literal-text', 0, false)).to
                    .be.null;
            });

            it('should match case-insensitively in caseless mode', () => {
                fragment = new NativeFragment(
                    '(is )my(?<myGroup>.*)text',
                    null,
                    {
                        7: 1,
                        12: 2,
                    },
                    { caseless: true }
                );

                const match = fragment.match(
                    'here is MY-literal-text',
                    0,
                    false
                );

                expect(match).not.to.be.null;
                expect(match?.getCapture()).to.equal('is MY-literal-text');
                expect(match?.getStart()).to.equal(5);
            });
        });

        describe('multiline mode', () => {
            it('should not match ^ and $ as start- and end-of-line assertions outside multiline mode', () => {
                fragment = new NativeFragment(
                    '^my(.*)text$',
                    null,
                    {
                        9: 1,
                    },
                    { multiline: false }
                );

                const match = fragment.match(
                    'here is\nmy multiline text\nthe end',
                    0,
                    false
                );

                expect(match).to.be.null;
            });

            describe('in multiline mode', () => {
                beforeEach(() => {
                    fragment = new NativeFragment(
                        '^my([\\s\\S]*)text$',
                        null,
                        {
                            9: 1,
                        },
                        { multiline: true }
                    );
                });

                it('should match ^ and $ as start- and end-of-line assertions', () => {
                    const match = fragment.match(
                        'here is\nmy multiline text\nthe end',
                        0,
                        false
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal('my multiline text');
                    expect(match?.getStart()).to.equal(8);
                    expect(match?.getNamedCaptures()).to.deep.equal({});
                    expect(match?.getNumberedCaptures()).to.deep.equal({
                        9: ' multiline ',
                    });
                });

                it('should be able to backtrack across newlines', () => {
                    const match = fragment.match(
                        'here is\nmy multiline text\nand more text\nthe end',
                        0,
                        false
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(
                        'my multiline text\nand more text'
                    );
                    expect(match?.getStart()).to.equal(8);
                    expect(match?.getNamedCaptures()).to.deep.equal({});
                    expect(match?.getNumberedCaptures()).to.deep.equal({
                        9: ' multiline text\nand more ',
                    });
                    const backtrackedMatch = match?.backtrack();
                    expect(backtrackedMatch?.getCapture()).to.equal(
                        'my multiline text'
                    );
                    expect(backtrackedMatch?.getStart()).to.equal(8);
                    expect(backtrackedMatch?.getNamedCaptures()).to.deep.equal(
                        {}
                    );
                    expect(
                        backtrackedMatch?.getNumberedCaptures()
                    ).to.deep.equal({
                        9: ' multiline ',
                    });
                });
            });
        });

        describe('dot (all) mode', () => {
            it('should not match dot against newlines outside dot (all) mode', () => {
                fragment = new NativeFragment(
                    '(is )my(?<myGroup>.*)text',
                    null,
                    {
                        7: 1,
                        12: 2,
                    },
                    {
                        dotAll: false,
                    }
                );

                expect(fragment.match('here is my-lit\neral-text', 0, false)).to
                    .be.null;
            });

            describe('in dot (all) mode', () => {
                it('should match dot against newlines', () => {
                    fragment = new NativeFragment(
                        '(is )my(?<myGroup>.*)text',
                        null,
                        {
                            7: 1,
                            12: 2,
                        },
                        {
                            dotAll: true,
                        }
                    );

                    const match = fragment.match(
                        'this is my-lit\neral-text in here',
                        0,
                        false
                    );

                    expect(match).not.to.be.null;
                    expect(match?.getCapture()).to.equal(
                        'is my-lit\neral-text'
                    );
                    expect(match?.getStart()).to.equal(5);
                    expect(match?.getNamedCaptures()).to.deep.equal({
                        'myGroup': '-lit\neral-',
                    });
                    expect(match?.getNumberedCaptures()).to.deep.equal({
                        7: 'is ',
                        12: '-lit\neral-',
                    });
                });
            });
        });
    });

    describe('toString()', () => {
        it('should return the chars', () => {
            expect(fragment.toString()).to.equal('(is )my(?<myGroup>.*)text');
        });
    });

    describe('toStructure()', () => {
        it('should return the correct structure', () => {
            expect(fragment.toStructure()).to.deep.equal({
                type: 'native',
                chars: '(is )my(?<myGroup>.*)text',
                patternToEmulatedNumberedGroupIndex: {
                    '7': 1,
                    '12': 2,
                },
            });
        });
    });
});
