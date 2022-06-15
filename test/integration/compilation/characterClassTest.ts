/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import emulator from '../../../src';

describe('Character class compilation integration', () => {
    describe('in optimised mode', () => {
        it('should be able to compile a regex with two literals and a character class', () => {
            const matcher = emulator.compile('wo[r(ux-z]ld');

            expect(matcher.toStructure()).to.deep.equal({
                'type': 'pattern',
                'capturingGroups': [0],
                'components': [
                    {
                        'type': 'native',
                        // Note that the pattern is compiled down to a single native regex
                        // (which for this simple example is identical to the original).
                        'chars': 'wo[r\\(ux-z]ld',
                        'patternToEmulatedNumberedGroupIndex': {},
                    },
                ],
            });
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to compile a regex with two literals and a character class', () => {
            const matcher = emulator.compile('wo[r(ux-z]ld', {
                optimise: false,
            });

            // Note that the pattern is not compiled down to a single native regex,
            // unlike the above.
            expect(matcher.toStructure()).to.deep.equal({
                'type': 'pattern',
                'capturingGroups': [0],
                'components': [
                    {
                        'type': 'native',
                        'chars': 'wo',
                        'patternToEmulatedNumberedGroupIndex': {},
                    },
                    {
                        'type': 'character-class',
                        'negated': false,
                        'components': [
                            {
                                'type': 'native',
                                'chars': 'r',
                                'patternToEmulatedNumberedGroupIndex': {},
                            },
                            {
                                'type': 'native',
                                'chars': '\\(',
                                'patternToEmulatedNumberedGroupIndex': {},
                            },
                            {
                                'type': 'native',
                                'chars': 'u',
                                'patternToEmulatedNumberedGroupIndex': {},
                            },
                            {
                                'type': 'native',
                                'chars': '[x-z]',
                                'patternToEmulatedNumberedGroupIndex': {},
                            },
                        ],
                    },
                    {
                        'type': 'native',
                        'chars': 'ld',
                        'patternToEmulatedNumberedGroupIndex': {},
                    },
                ],
            });
        });
    });
});
