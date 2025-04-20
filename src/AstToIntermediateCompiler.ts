/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import Ast from './Ast';
import IntermediateRepresentation from './IntermediateRepresentation';
import QuantifierParser from './Quantifier/QuantifierParser';

/**
 * Compiler for PCRE ASTs to an Intermediate Representation (IR) structure.
 */
export default class AstToIntermediateCompiler {
    constructor(
        private astToIntermediateTranspiler: any,
        private quantifierParser: QuantifierParser,
    ) {}

    /**
     * Compiles the given AST to its IR.
     *
     * @param {Ast} ast
     */
    compile(ast: Ast): IntermediateRepresentation {
        const transpilerRepresentation =
            this.astToIntermediateTranspiler.transpile(ast.getParsingAst(), {
                flags: ast.getFlags(),
                quantifierParser: this.quantifierParser,
            });

        return new IntermediateRepresentation(
            transpilerRepresentation,
            ast.getPattern(),
            ast.getFlags(),
        );
    }
}
