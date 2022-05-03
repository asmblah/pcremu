/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { Flags } from './declarations/types';

export default class Ast {
    constructor(
        private parsingAst: any,
        private pattern: string,
        private flags: Flags
    ) {}

    getFlags(): Flags {
        return this.flags;
    }

    getParsingAst(): any {
        return this.parsingAst;
    }

    getPattern(): string {
        return this.pattern;
    }
}
