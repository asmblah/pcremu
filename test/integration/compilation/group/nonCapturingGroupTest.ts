/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import emulator from '../../../../src';

describe('Non-capturing group compilation integration', () => {
    describe('in optimised mode', () => {
        it('should be able to compile a regex with an optional non-capturing group', () => {
            const matcher = emulator.compile('before(?:inside)?after');

            expect(matcher.toStructure()).to.deep.equal({
                'type': 'pattern',
                'capturingGroups': [0],
                'components': [
                    {
                        'type': 'native',
                        // Note that the pattern is compiled down to a single native regex
                        // (which for this simple example is identical to the original).
                        'chars': 'before(?:inside)?after',
                        'patternToEmulatedNumberedGroupIndex': {},
                    },
                ],
            });
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to compile a regex with two literals and a character class', () => {
            const matcher = emulator.compile('before(?:inside)?after', {
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
                        'chars': 'before',
                        'patternToEmulatedNumberedGroupIndex': {},
                    },
                    {
                        'type': 'maximising-quantifier',
                        'minimumMatches': 0,
                        'maximumMatches': 1,
                        'component': {
                            'type': 'non-capturing-group',
                            'components': [
                                {
                                    'type': 'native',
                                    'chars': 'inside',
                                    'patternToEmulatedNumberedGroupIndex': {},
                                },
                            ],
                        },
                    },
                    {
                        'type': 'native',
                        'chars': 'after',
                        'patternToEmulatedNumberedGroupIndex': {},
                    },
                ],
            });
        });
    });
});
