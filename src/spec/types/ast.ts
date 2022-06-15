/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

/**
 * AST-related types.
 *
 * AST node names start with N_*.
 */

export type N_ALTERNATION = N_COMPONENT & {
    name: 'N_ALTERNATION';
    alternatives: N_ALTERNATIVE[];
};
export type N_ALTERNATIVE = N_COMPONENT & {
    name: 'N_ALTERNATIVE';
    components: N_COMPONENT[];
};
export type N_CAPTURING_GROUP = N_COMPONENT & {
    name: 'N_CAPTURING_GROUP';
    components: N_COMPONENT[];
};
export type N_CHARACTER = N_CHARACTER_CLASS_COMPONENT & {
    name: 'N_CHARACTER';
    char: string;
};
export type N_ESCAPED_CHAR = N_CHARACTER_CLASS_COMPONENT & {
    name: 'N_ESCAPED_CHAR';
    char: string;
};
export type N_CHARACTER_CLASS = N_COMPONENT & {
    name: 'N_CHARACTER_CLASS';
    negated: boolean;
    components: N_CHARACTER_CLASS_COMPONENT[];
};
export type N_CHARACTER_CLASS_COMPONENT = N_COMPONENT;
export type N_CHARACTER_RANGE = N_CHARACTER_CLASS_COMPONENT & {
    name: 'N_CHARACTER_RANGE';
    from: N_CHARACTER_CLASS_COMPONENT;
    to: N_CHARACTER_CLASS_COMPONENT;
};
export type N_COMPONENT = N_NODE;
export type N_CONTROL_CHAR = N_CHARACTER_CLASS_COMPONENT & {
    name: 'N_CONTROL_CHAR';
    type: string;
};
export type N_DOT = N_COMPONENT & {
    name: 'N_DOT';
};
export type N_GENERIC_CHAR = N_CHARACTER_CLASS_COMPONENT & {
    name: 'N_GENERIC_CHAR';
    type: string;
};
export type N_HEX_CODE_CHAR = N_CHARACTER_CLASS_COMPONENT & {
    name: 'N_HEX_CODE_CHAR';
    code: string;
};
export type N_LITERAL = N_COMPONENT & { name: 'N_LITERAL'; text: string };
export type N_MAXIMISING_QUANTIFIER = N_COMPONENT & {
    name: 'N_MAXIMISING_QUANTIFIER';
    quantifier: string;
    component: N_COMPONENT;
};
export type N_MINIMISING_QUANTIFIER = N_COMPONENT & {
    name: 'N_MINIMISING_QUANTIFIER';
    quantifier: string;
    component: N_COMPONENT;
};
export type N_NAMED_CAPTURING_GROUP = N_COMPONENT & {
    name: 'N_NAMED_CAPTURING_GROUP';
    components: N_COMPONENT[];
    groupName: string;
};
export type N_NODE = { name: string };
export type N_NON_CAPTURING_GROUP = N_COMPONENT & {
    name: 'N_NON_CAPTURING_GROUP';
    components: N_COMPONENT[];
};
export type N_NUMBERED_BACKREFERENCE = N_COMPONENT & {
    name: 'N_NUMBERED_BACKREFERENCE';
    number: number;
};
export type N_NUMBERED_BACKREFERENCE_OR_OCTAL_CHAR = N_COMPONENT & {
    name: 'N_NUMBERED_BACKREFERENCE_OR_OCTAL_CHAR';
    digits: string;
};
export type N_PATTERN = N_NODE & {
    name: 'N_PATTERN';
    components: N_COMPONENT[];
};
export type N_POSSESSIVE_QUANTIFIER = N_COMPONENT & {
    name: 'N_POSSESSIVE_QUANTIFIER';
    quantifier: string;
    component: N_COMPONENT;
};
export type N_SIMPLE_ASSERTION = N_COMPONENT & {
    name: 'N_SIMPLE_ASSERTION';
    assertion: string;
};
export type N_WHITESPACE = N_COMPONENT & {
    name: 'N_WHITESPACE';
    chars: string;
};
