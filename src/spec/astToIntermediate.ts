/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import {
    I_ALTERNATION,
    I_ALTERNATIVE,
    I_CAPTURING_GROUP,
    I_NAMED_CAPTURING_GROUP,
    I_NODE,
    I_NOOP,
    I_PATTERN,
    I_MAXIMISING_QUANTIFIER,
    I_MINIMISING_QUANTIFIER,
    I_NON_CAPTURING_GROUP,
    I_POSSESSIVE_QUANTIFIER,
    I_RAW_REGEX,
} from './intermediateToPattern';
import { Flags } from '../declarations/types';

interface Context {
    flags: Flags;
}
type Interpret = (node: N_NODE) => I_NODE;
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
export type N_CHARACTER_CLASS = N_COMPONENT & {
    name: 'N_CHARACTER_CLASS';
    components: N_CHARACTER_CLASS_COMPONENT[];
    negated: boolean;
};
export type N_CHARACTER_CLASS_COMPONENT = N_COMPONENT;
export type N_CHARACTER_RANGE = N_CHARACTER_CLASS_COMPONENT & {
    name: 'N_CHARACTER_RANGE';
    from: string;
    to: string;
};
export type N_COMPONENT = N_NODE;
export type N_DOT = N_COMPONENT & {
    name: 'N_DOT';
};
export type N_GENERIC_CHAR = N_COMPONENT & {
    name: 'N_GENERIC_CHAR';
    type: string;
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

/**
 * Transpiler library spec to translate a regular expression AST to an Intermediate Representation (IR).
 */
export default {
    nodes: {
        'N_ALTERNATION': (
            node: N_ALTERNATION,
            interpret: Interpret
        ): I_ALTERNATION => {
            return {
                'name': 'I_ALTERNATION',
                'alternatives': node.alternatives.map(
                    (node: N_ALTERNATIVE) => interpret(node) as I_ALTERNATIVE
                ),
            };
        },
        'N_ALTERNATIVE': (
            node: N_ALTERNATIVE,
            interpret: Interpret
        ): I_ALTERNATIVE => {
            return {
                'name': 'I_ALTERNATIVE',
                'components': node.components.map((node: N_COMPONENT) =>
                    interpret(node)
                ),
            };
        },
        'N_CAPTURING_GROUP': (
            node: N_CAPTURING_GROUP,
            interpret: Interpret
        ): I_CAPTURING_GROUP => {
            return {
                'name': 'I_CAPTURING_GROUP',
                'components': node.components.map((node: N_NODE) =>
                    interpret(node)
                ),
            };
        },
        'N_CHARACTER': (node: N_CHARACTER): string => {
            return node.char;
        },
        'N_CHARACTER_CLASS': (
            node: N_CHARACTER_CLASS,
            interpret: Interpret
        ): I_RAW_REGEX => {
            return {
                'name': 'I_RAW_REGEX',
                'chars':
                    '[' +
                    (node.negated ? '^' : '') +
                    node.components
                        .map((node: N_NODE) => interpret(node))
                        .join('') +
                    ']',
            };
        },
        'N_CHARACTER_RANGE': (node: N_CHARACTER_RANGE): string => {
            return node.from + '-' + node.to;
        },
        'N_DOT': (): I_RAW_REGEX => {
            return { 'name': 'I_RAW_REGEX', chars: '.' };
        },
        'N_GENERIC_CHAR': (node: N_GENERIC_CHAR): I_RAW_REGEX => {
            return {
                'name': 'I_RAW_REGEX',
                'chars': '\\' + node.type,
            };
        },
        'N_LITERAL': (node: N_LITERAL): I_RAW_REGEX => {
            return {
                'name': 'I_RAW_REGEX',
                'chars': node.text,
            };
        },
        'N_MAXIMISING_QUANTIFIER': (
            node: N_MAXIMISING_QUANTIFIER,
            interpret: Interpret
        ): I_MAXIMISING_QUANTIFIER => {
            return {
                'name': 'I_MAXIMISING_QUANTIFIER',
                'quantifier': node.quantifier,
                'component': interpret(node.component),
            };
        },
        'N_MINIMISING_QUANTIFIER': (
            node: N_MINIMISING_QUANTIFIER,
            interpret: Interpret
        ): I_MINIMISING_QUANTIFIER => {
            return {
                'name': 'I_MINIMISING_QUANTIFIER',
                'quantifier': node.quantifier,
                'component': interpret(node.component),
            };
        },
        'N_NAMED_CAPTURING_GROUP': (
            node: N_NAMED_CAPTURING_GROUP,
            interpret: Interpret
        ): I_NAMED_CAPTURING_GROUP => {
            return {
                'name': 'I_NAMED_CAPTURING_GROUP',
                'groupName': node.groupName,
                'components': node.components.map((node: N_NODE) =>
                    interpret(node)
                ),
            };
        },
        'N_NON_CAPTURING_GROUP': (
            node: N_NON_CAPTURING_GROUP,
            interpret: Interpret
        ): I_NON_CAPTURING_GROUP => {
            return {
                'name': 'I_NON_CAPTURING_GROUP',
                'components': node.components.map((node: N_NODE) =>
                    interpret(node)
                ),
            };
        },
        'N_PATTERN': (node: N_PATTERN, interpret: Interpret): I_PATTERN => {
            return {
                'name': 'I_PATTERN',
                'components': node.components.map((node: N_NODE) =>
                    interpret(node)
                ),
            };
        },
        'N_POSSESSIVE_QUANTIFIER': (
            node: N_POSSESSIVE_QUANTIFIER,
            interpret: Interpret
        ): I_POSSESSIVE_QUANTIFIER => {
            return {
                'name': 'I_POSSESSIVE_QUANTIFIER',
                'quantifier': node.quantifier,
                'component': interpret(node.component),
            };
        },
        'N_SIMPLE_ASSERTION': (node: N_SIMPLE_ASSERTION): I_RAW_REGEX => {
            return {
                'name': 'I_RAW_REGEX',
                'chars': node.assertion,
            };
        },
        'N_WHITESPACE': (
            node: N_WHITESPACE,
            interpret: Interpret,
            context: Context
        ): I_NOOP | I_RAW_REGEX => {
            if (context.flags.extended) {
                // In extended mode, whitespace is ignored (except in character classes).
                return { 'name': 'I_NOOP' };
            }

            return {
                'name': 'I_RAW_REGEX',
                'chars': node.chars,
            };
        },
    },
};
