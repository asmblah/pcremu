/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { LookaroundBivalence } from '../../Pattern/LookaroundBivalence';
import { LookaroundDirection } from '../../Pattern/LookaroundDirection';
import { Quantifier } from '../../declarations/types';

/**
 * Intermediate Representation (IR)-related types.
 *
 * IR node names start with I_*.
 */

export type I_ALTERNATION = I_COMPONENT & {
    name: 'I_ALTERNATION';
    alternatives: I_ALTERNATIVE[];
};
export type I_ALTERNATIVE = I_COMPONENT & {
    name: 'I_ALTERNATIVE';
    components: I_COMPONENT[];
};
export type I_CAPTURING_GROUP = I_COMPONENT & {
    name: 'I_CAPTURING_GROUP';
    groupIndex: number;
    components: I_COMPONENT[];
};
export type I_CHARACTER = I_CHARACTER_RANGE_EXTENT & {
    name: 'I_CHARACTER';
    char: string;
};
export type I_CHARACTER_CLASS = I_COMPONENT & {
    name: 'I_CHARACTER_CLASS';
    negated: boolean;
    components: I_COMPONENT[];
};
export type I_CHARACTER_CLASS_COMPONENT = I_COMPONENT;
export type I_CHARACTER_RANGE = I_CHARACTER_CLASS_COMPONENT & {
    name: 'I_CHARACTER_RANGE';
    from: I_CHARACTER_RANGE_EXTENT;
    to: I_CHARACTER_RANGE_EXTENT;
};
export type I_CHARACTER_RANGE_EXTENT = I_CHARACTER_CLASS_COMPONENT;
export type I_COMPONENT = I_NODE;
export type I_HEX_CODE_CHAR = I_CHARACTER_RANGE_EXTENT & {
    name: 'I_HEX_CODE_CHAR';
    code: string;
};
export type I_LOOKAROUND = I_COMPONENT & {
    name: 'I_LOOKAROUND';
    bivalence: LookaroundBivalence;
    direction: LookaroundDirection;
    components: I_COMPONENT[];
};
export type I_MAXIMISING_QUANTIFIER = I_COMPONENT & {
    name: 'I_MAXIMISING_QUANTIFIER';
    quantifier: Quantifier;
    component: I_COMPONENT;
};
export type I_MINIMISING_QUANTIFIER = I_COMPONENT & {
    name: 'I_MINIMISING_QUANTIFIER';
    quantifier: Quantifier;
    component: I_COMPONENT;
};
export type I_NAMED_CAPTURING_GROUP = I_COMPONENT & {
    name: 'I_NAMED_CAPTURING_GROUP';
    groupIndex: number;
    groupName: string;
    components: I_COMPONENT[];
};
export type I_NODE = { name: string };
export type I_NON_CAPTURING_GROUP = I_COMPONENT & {
    name: 'I_NON_CAPTURING_GROUP';
    components: I_COMPONENT[];
};
export type I_NOOP = I_COMPONENT & { name: 'I_NOOP' };
export type I_NUMBERED_BACKREFERENCE = I_COMPONENT & {
    name: 'I_NUMBERED_BACKREFERENCE';
    number: number;
};
export type I_OPTIMISED = I_COMPONENT;
export type I_PATTERN = I_NODE & {
    name: 'I_PATTERN';
    capturingGroups: Array<number | string>;
    components: I_COMPONENT[];
};
export type I_POSSESSIVE_QUANTIFIER = I_COMPONENT & {
    name: 'I_POSSESSIVE_QUANTIFIER';
    quantifier: Quantifier;
    component: I_COMPONENT;
};
export type I_RAW_REGEX = I_OPTIMISED & {
    name: 'I_RAW_REGEX';
    chunks: I_RAW_CHUNK[];
    fixedLength: number | null;
};
export type I_RAW_CHUNK =
    | I_RAW_BACKREFERENCE
    | I_RAW_CAPTURE
    | I_RAW_CHARS
    | I_RAW_GHOST_CAPTURE
    | I_RAW_LOOKAROUND
    | I_RAW_NAMED_CAPTURE
    | I_RAW_NESTED
    | I_RAW_NON_CAPTURE
    | I_RAW_NOOP
    | I_RAW_OPTIMISED;
export type I_RAW_BACKREFERENCE = {
    name: 'I_RAW_BACKREFERENCE';
    id: string;
};
export type I_RAW_CAPTURE = {
    name: 'I_RAW_CAPTURE';
    id?: string;
    groupIndex: number;
    chunks: I_RAW_CHUNK[];
};
export type I_RAW_CHARS = {
    name: 'I_RAW_CHARS';
    chars: string;
};
export type I_RAW_GHOST_CAPTURE = {
    name: 'I_RAW_GHOST_CAPTURE';
    id?: string;
    chunks: I_RAW_CHUNK[];
};
export type I_RAW_LOOKAROUND = {
    name: 'I_RAW_LOOKAROUND';
    bivalence: LookaroundBivalence;
    direction: LookaroundDirection;
    chunks: I_RAW_CHUNK[];
};
export type I_RAW_NAMED_CAPTURE = {
    name: 'I_RAW_NAMED_CAPTURE';
    id?: string;
    groupIndex: number;
    groupName: string;
    chunks: I_RAW_CHUNK[];
};
export type I_RAW_NESTED = {
    name: 'I_RAW_NESTED';
    node: I_RAW_REGEX;
};
export type I_RAW_NON_CAPTURE = {
    name: 'I_RAW_NON_CAPTURE';
    chunks: I_RAW_CHUNK[];
};
export type I_RAW_NOOP = {
    name: 'I_RAW_NOOP';
};
export type I_RAW_OPTIMISED = {
    name: 'I_RAW_OPTIMISED';
    chars: string;
    patternToEmulatedNumberedGroupIndex: {
        [key: number]: number;
    };
};
