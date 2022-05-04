/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { Flags } from './declarations/types';

/**
 * Intermediate Representation (IR) of a partially compiled PCRE regular expression.
 */
export default class IntermediateRepresentation {
    constructor(
        private transpilerRepresentation: any,
        private pattern: string,
        private flags: Flags
    ) {}

    /**
     * Fetches the flags (modifiers) of the regex.
     */
    getFlags(): Flags {
        return this.flags;
    }

    /**
     * Fetches the original PCRE pattern.
     */
    getPattern(): string {
        return this.pattern;
    }

    /**
     * Fetches the inner Transpiler library IR.
     */
    getTranspilerRepresentation(): any {
        return this.transpilerRepresentation;
    }
}
