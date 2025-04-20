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
    dollarEndOnly?: boolean;
    dotAll?: boolean;
    extended?: boolean;
    multiline?: boolean;
    optimise?: boolean;
};

export type RegExpMatchArrayIndices = ([number, number] | undefined)[] & {
    groups?: { [key: string]: [number, number] };
};

export type IndexCapturingRegExpExecArray = RegExpExecArray & {
    indices: RegExpMatchArrayIndices;
};

export type NativeNamedCaptures = {
    [key: string]: string;
};

export type NativeNamedCaptureIndices = {
    [key: string]: [number, number] | undefined;
};

export type Quantifier = {
    min: number;
    max: number; // Use Infinity for unbounded matches.
    raw: string; // The original quantifier string.
};
