/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import AstToIntermediateCompiler from './AstToIntermediateCompiler';
import Compiler from './Compiler';
import { Flags } from './declarations/types';
import IntermediateToPatternCompiler from './IntermediateToPatternCompiler';
import Matcher from './Matcher';
import Parser, { DEFAULT_FLAGS } from './Parser';

export default class Emulator {
    constructor(
        private parsing: any,
        private transpiler: any,
        private parserGrammarSpec: any,
        private astToIntermediateTranspilerSpec: any,
        private intermediateToPatternTranspilerSpec: any
    ) {}

    /**
     * A convenience method for parsing & compiling a regex pattern and its flags to a Matcher.
     *
     * @param {string} pattern
     * @param {Flags} flags
     */
    compile(pattern: string, flags: Flags = DEFAULT_FLAGS): Matcher {
        const compiler = this.createCompiler();
        const parser = this.createParser();

        return compiler.compile(parser.parse(pattern, flags));
    }

    createAstToIntermediateCompiler(): AstToIntermediateCompiler {
        const transpiler = this.transpiler.create(
            this.astToIntermediateTranspilerSpec
        );

        return new AstToIntermediateCompiler(transpiler);
    }

    createCompiler(): Compiler {
        return new Compiler(
            this.createAstToIntermediateCompiler(),
            this.createIntermediateToPatternCompiler()
        );
    }

    createIntermediateToPatternCompiler(): IntermediateToPatternCompiler {
        const transpiler = this.transpiler.create(
            this.intermediateToPatternTranspilerSpec
        );

        return new IntermediateToPatternCompiler(transpiler);
    }

    createParser(): Parser {
        const parsingParser = this.parsing.create(
            this.parserGrammarSpec,
            null,
            {}
        );

        return new Parser(parsingParser);
    }
}
