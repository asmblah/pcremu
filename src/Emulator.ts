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
import { Context } from './spec/types/parser';
import { Flags } from './declarations/types';
import FragmentMatcher from './Match/FragmentMatcher';
import IntermediateOptimiser from './IntermediateOptimiser';
import IntermediateToPatternCompiler from './IntermediateToPatternCompiler';
import Matcher from './Matcher';
import Parser, { DEFAULT_FLAGS } from './Parser';
import PatternFactory from './PatternFactory';
import QuantifierMatcher from './Match/QuantifierMatcher';
import QuantifierParser from './Quantifier/QuantifierParser';

/**
 * Outermost library abstraction for PCREmu.
 */
export default class Emulator {
    constructor(
        private parsing: any,
        private transpiler: any,
        private parserGrammarSpec: any,
        private astToIntermediateTranspilerSpec: any,
        private intermediateOptimiserSpecs: any[],
        private intermediateToPatternTranspilerSpec: any,
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

    /**
     * Creates an AstToIntermediateCompiler.
     */
    createAstToIntermediateCompiler(): AstToIntermediateCompiler {
        const transpiler = this.transpiler.create(
            this.astToIntermediateTranspilerSpec,
        );

        return new AstToIntermediateCompiler(
            transpiler,
            new QuantifierParser(),
        );
    }

    /**
     * Creates a Compiler.
     */
    createCompiler(): Compiler {
        return new Compiler(
            this.createAstToIntermediateCompiler(),
            this.createIntermediateOptimiser(),
            this.createIntermediateToPatternCompiler(),
        );
    }

    /**
     * Creates an IntermediateOptimiser.
     */
    createIntermediateOptimiser(): IntermediateOptimiser {
        return new IntermediateOptimiser(
            this.intermediateOptimiserSpecs.map((spec) =>
                this.transpiler.create(spec),
            ),
        );
    }

    /**
     * Creates an IntermediateToPatternCompiler.
     */
    createIntermediateToPatternCompiler(): IntermediateToPatternCompiler {
        const transpiler = this.transpiler.create(
            this.intermediateToPatternTranspilerSpec,
        );

        return new IntermediateToPatternCompiler(
            new PatternFactory(),
            new FragmentMatcher(),
            new QuantifierMatcher(),
            transpiler,
        );
    }

    /**
     * Creates a Parser.
     */
    createParser(): Parser {
        const parsingContext: Context = { flags: DEFAULT_FLAGS };
        const parsingParser = this.parsing.create(
            this.parserGrammarSpec,
            null,
            { context: parsingContext },
        );

        return new Parser(parsingParser, parsingContext);
    }

    /**
     * Creates an IntermediateOptimiser with only the specified passes.
     *
     * @param {Object[]} intermediateOptimiserSpecs
     */
    createPartialIntermediateOptimiser(
        intermediateOptimiserSpecs: any[],
    ): IntermediateOptimiser {
        return new IntermediateOptimiser(
            intermediateOptimiserSpecs.map((spec) =>
                this.transpiler.create(spec),
            ),
        );
    }
}
