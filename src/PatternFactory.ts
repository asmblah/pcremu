/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { Flags } from './declarations/types';
import Pattern from './Pattern';
import PatternFragment from './Match/Fragment/PatternFragment';

/**
 * Creates Pattern-related objects.
 */
export default class PatternFactory {
    /**
     * Creates a new Pattern.
     *
     * @param {PatternFragment} patternFragment
     * @param {Flags} flags
     */
    createPattern(patternFragment: PatternFragment, flags: Flags): Pattern {
        return new Pattern(patternFragment, flags);
    }
}
