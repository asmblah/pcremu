/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

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
export type I_COMPONENT = I_NODE;
export type I_MAXIMISING_QUANTIFIER = I_COMPONENT & {
    name: 'I_MAXIMISING_QUANTIFIER';
    quantifier: string;
    component: I_COMPONENT;
};
export type I_MINIMISING_QUANTIFIER = I_COMPONENT & {
    name: 'I_MINIMISING_QUANTIFIER';
    quantifier: string;
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
    quantifier: string;
    component: I_COMPONENT;
};
export type I_RAW_REGEX = I_OPTIMISED & {
    name: 'I_RAW_REGEX';
    chunks: I_RAW_CHUNK[];
};
export type I_RAW_CHUNK =
    | I_RAW_BACKREFERENCE
    | I_RAW_CAPTURE
    | I_RAW_CHARS
    | I_RAW_GHOST_CAPTURE
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
