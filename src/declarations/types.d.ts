/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

export type Flags = {
    anchored?: boolean;
    caseless?: boolean;
    dotAll?: boolean;
    extended?: boolean;
    multiline?: boolean;
    optimise?: boolean;
};

export type RegExpMatchArrayIndices = [number, number][] & {
    groups?: { [key: string]: [number, number] };
};

export type IndexCapturingRegExpExecArray = RegExpExecArray & {
    indices: RegExpMatchArrayIndices;
};
