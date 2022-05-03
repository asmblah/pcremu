/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

export default class IntermediateRepresentation {
    constructor(
        private transpilerRepresentation: any,
        private pattern: string
    ) {}

    getPattern(): string {
        return this.pattern;
    }

    getTranspilerRepresentation(): any {
        return this.transpilerRepresentation;
    }
}
