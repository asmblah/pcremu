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

export type Processor = (
    match: FragmentMatchInterface
) => FragmentMatchInterface;

export type Capture = string | null;
export type CaptureIndex = number | null;
export type CaptureIndexPair = [number, number] | null;
export type NamedCaptures = { [key: string]: Capture };
export type NamedCaptureIndices = { [key: string]: CaptureIndexPair };
export type NumberedCaptures = { [key: number]: Capture };
export type NumberedCaptureIndices = { [key: number]: CaptureIndexPair };
