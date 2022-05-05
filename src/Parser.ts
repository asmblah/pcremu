/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import Ast from './Ast';
import { Flags } from './declarations/types';

export const DEFAULT_FLAGS: Flags = {
    anchored: false,
    caseless: false,
    extended: false,
    multiline: false,
};

/**
 * Parses a PCRE regex to an AST.
 */
export default class Parser {
    constructor(private parsingParser: any) {}

    /**
     * Parses the given PCRE pattern to an AST.
     *
     * @param {string} pattern
     * @param {Flags} flags
     */
    parse(pattern: string, flags: Flags = DEFAULT_FLAGS): Ast {
        const parsingAst = this.parsingParser.parse(pattern, {
            // In extended mode, we'll ignore whitespace in the pattern
            // except for inside character classes.
            ignoreWhitespace: Boolean(flags.extended),
        });

        flags = Object.assign({}, DEFAULT_FLAGS, flags); // Apply default flags.

        return new Ast(parsingAst, pattern, flags);
    }
}
