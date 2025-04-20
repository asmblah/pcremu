/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import emulator from '../../../src';
import { expect } from 'chai';

describe('Matcher capturing groups integration', () => {
    it('should be able to fetch all numbered and named capturing groups in order', () => {
        const matcher = emulator.compile(
            'my (unnamed) (and) (?<named>groups) (over) (?<alsoNamed>here)',
        );

        expect(matcher.getCapturingGroupNames()).to.deep.equal([
            0, // Entire match.
            1, // "(unnamed)" capturing group.
            2, // "(and)" capturing group.
            'named', // "(?<named>...)" named capturing group.
            3, // Numbered instance of "(?<named>...)" named capturing group.
            4, // "(over)" capturing group.
            'alsoNamed', // "(?<alsoNamed>...)" named capturing group.
            5, // Numbered instance of "(?<alsoNamed>...)" named capturing group.
        ]);
    });
});
