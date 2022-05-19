/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

/**
 * General match-related types.
 */

import FragmentMatchInterface from '../../Match/FragmentMatchInterface';

export type Backtracker = (
    previousMatch: FragmentMatchInterface
) => FragmentMatchInterface | null;

export type NamedCaptures = { [key: string]: string | null };
export type NamedCaptureIndices = { [key: string]: [number, number] };
export type NumberedCaptures = { [key: number]: string | null };
export type NumberedCaptureIndices = { [key: number]: [number, number] };
