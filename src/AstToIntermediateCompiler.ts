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

export default class AstToIntermediateCompiler {
    constructor(private astToIntermediateTranspiler: any) {}

    compile(ast: Ast): IntermediateRepresentation {
        const transpilerRepresentation =
            this.astToIntermediateTranspiler.transpile(ast.getParsingAst(), {
                flags: ast.getFlags(),
            });

        return new IntermediateRepresentation(
            transpilerRepresentation,
            ast.getPattern()
        );
    }
}
