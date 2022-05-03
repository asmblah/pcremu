/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { N_NODE } from './astToIntermediate';

type Interpret = (node: N_NODE) => I_NODE;
export type I_NODE = { name: string };
export type I_NOOP = I_NODE & { name: 'I_NOOP' };
export type I_PATTERN = I_NODE & { name: 'I_PATTERN'; components: I_NODE[] };
export type I_RAW_REGEX = I_NODE & { name: 'I_RAW_REGEX'; chars: string };

export default {
    nodes: {
        'I_NOOP': (): string => {
            return '';
        },
        'I_PATTERN': (node: I_PATTERN, interpret: Interpret): string => {
            return node.components
                .map((node: I_NODE) => interpret(node))
                .join('');
        },
        'I_RAW_REGEX': (node: I_RAW_REGEX): string => {
            return node.chars;
        },
    },
};
