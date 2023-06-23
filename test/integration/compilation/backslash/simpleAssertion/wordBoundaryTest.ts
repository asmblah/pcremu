/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import emulator from '../../../../../src';

describe('Simple assertion word boundary compilation integration', () => {
    describe('in optimised mode', () => {
        it('should be able to compile a regex with two literals and a simple word boundary assertion', () => {
            const matcher = emulator.compile('wo\\bld');

            expect(matcher.toStructure()).to.deep.equal({
                'type': 'pattern',
                'capturingGroups': [0],
                'components': [
                    {
                        'type': 'native',
                        // Note that the pattern is compiled down to a single native regex
                        // (which for this simple example is identical to the original).
                        'chars': 'wo\\bld',
                        'patternToEmulatedNumberedGroupIndex': {},
                    },
                ],
            });
        });
    });

    describe('in unoptimised mode', () => {
        it('should be able to compile a regex with two literals and a simple word boundary assertion', () => {
            const matcher = emulator.compile('wo\\bld', {
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
                        'type': 'native',
                        'chars': '\\b',
                        'patternToEmulatedNumberedGroupIndex': {},
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
