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

export const DEFAULT_FLAGS = { extended: false };

export default class Parser {
    constructor(private parsingParser: any) {}

    parse(pattern: string, flags: Flags = DEFAULT_FLAGS): Ast {
        const parsingAst = this.parsingParser.parse(pattern);

        return new Ast(parsingAst, pattern, flags);
    }
}
