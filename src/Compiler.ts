/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import Matcher from './Matcher';
import Ast from './Ast';
import IntermediateToPatternCompiler from './IntermediateToPatternCompiler';
import AstToIntermediateCompiler from './AstToIntermediateCompiler';

/**
 * Abstraction for compiling a PCRE regex AST to a Matcher object.
 */
export default class Compiler {
    constructor(
        private astToIntermediateCompiler: AstToIntermediateCompiler,
        private intermediateToPatternCompiler: IntermediateToPatternCompiler
    ) {}

    /**
     * Compiles the given AST to a Matcher.
     *
     * @param {Ast} ast
     */
    compile(ast: Ast): Matcher {
        const intermediateRepresentation =
                this.astToIntermediateCompiler.compile(ast),
            pattern = this.intermediateToPatternCompiler.compile(
                intermediateRepresentation
            );

        return new Matcher(pattern);
    }
}
