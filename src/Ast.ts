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
 * Abstract Syntax Tree (AST) for a PCRE regular expression.
 */
export default class Ast {
    constructor(
        private parsingAst: any,
        private pattern: string,
        private flags: Flags,
    ) {}

    /**
     * Fetches the flags (modifiers) for the expression.
     *
     * For example, "extended" mode (to allow regex pattern whitespace to be ignored)
     * is enabled via the "extended" flag.
     */
    getFlags(): Flags {
        return this.flags;
    }

    /**
     * Fetches the inner Parsing library AST.
     */
    getParsingAst(): any {
        return this.parsingAst;
    }

    /**
     * Fetches the original PCRE pattern.
     */
    getPattern(): string {
        return this.pattern;
    }
}
