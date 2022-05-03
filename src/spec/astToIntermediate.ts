/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import {
    I_CAPTURING_GROUP,
    I_NAMED_CAPTURING_GROUP,
    I_NODE,
    I_NOOP,
    I_PATTERN,
    I_RAW_REGEX,
} from './intermediateToPattern';
import { Flags } from '../declarations/types';

type Context = { flags: Flags };
type Interpret = (node: N_NODE) => I_NODE;
export type N_CAPTURING_GROUP = N_COMPONENT & {
    name: 'N_CAPTURING_GROUP';
    components: N_COMPONENT[];
};
export type N_COMPONENT = N_NODE;
export type N_LITERAL = N_COMPONENT & { name: 'N_LITERAL'; text: string };
export type N_NAMED_CAPTURING_GROUP = N_COMPONENT & {
    name: 'N_NAMED_CAPTURING_GROUP';
    components: N_COMPONENT[];
    groupName: string;
};
export type N_NODE = { name: string };
export type N_PATTERN = N_NODE & {
    name: 'N_PATTERN';
    components: N_COMPONENT[];
};
export type N_SIMPLE_ASSERTION = N_COMPONENT & {
    name: 'N_SIMPLE_ASSERTION';
    assertion: string;
};
export type N_WHITESPACE = N_COMPONENT & {
    name: 'N_WHITESPACE';
    chars: string;
};

export default {
    nodes: {
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
        'N_LITERAL': (node: N_LITERAL): I_RAW_REGEX => {
            return {
                'name': 'I_RAW_REGEX',
                'chars': node.text,
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
        'N_PATTERN': (node: N_PATTERN, interpret: Interpret): I_PATTERN => {
            return {
                'name': 'I_PATTERN',
                'components': node.components.map((node: N_NODE) =>
                    interpret(node)
                ),
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
