/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { N_NODE } from './astToIntermediate';

export interface Context {
    /**
     * Records an atomic group.
     *
     * Atomic groups are emulated with a real native capturing group inside a lookahead,
     * that is then immediately referenced by a backreference.
     *
     * Returns the index of the emulation capturing group.
     */
    addAtomicGroup(): number;

    /**
     * Records a named capturing group.
     * Note that named capturing groups are also recorded by their index.
     *
     * @param {string} name
     */
    addNamedCapturingGroup(name: number | string): void;

    /**
     * Records a numbered capturing group.
     */
    addNumberedCapturingGroup(): void;
}
type Interpret = (node: N_NODE) => I_NODE;
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
    components: I_COMPONENT[];
    groupName: string;
};
export type I_NODE = { name: string };
export type I_NOOP = I_COMPONENT & { name: 'I_NOOP' };
export type I_PATTERN = I_NODE & {
    name: 'I_PATTERN';
    components: I_COMPONENT[];
};
export type I_POSSESSIVE_QUANTIFIER = I_COMPONENT & {
    name: 'I_POSSESSIVE_QUANTIFIER';
    quantifier: string;
    component: I_COMPONENT;
};
export type I_RAW_REGEX = I_COMPONENT & { name: 'I_RAW_REGEX'; chars: string };

/**
 * Transpiler library spec to translate a regular expression Intermediate Representation (IR)
 * to data suitable for building a Pattern.
 */
export default {
    nodes: {
        'I_ALTERNATION': (
            node: I_ALTERNATION,
            interpret: Interpret
        ): string => {
            return node.alternatives
                .map((node: I_ALTERNATIVE) => interpret(node))
                .join('|');
        },
        'I_ALTERNATIVE': (
            node: I_ALTERNATIVE,
            interpret: Interpret
        ): string => {
            return node.components
                .map((node: I_COMPONENT) => interpret(node))
                .join('');
        },
        'I_CAPTURING_GROUP': (
            node: I_CAPTURING_GROUP,
            interpret: Interpret,
            context: Context
        ): string => {
            context.addNumberedCapturingGroup();

            return (
                '(' +
                node.components
                    .map((node: I_COMPONENT) => interpret(node))
                    .join('') +
                ')'
            );
        },
        'I_MAXIMISING_QUANTIFIER': (
            node: I_MAXIMISING_QUANTIFIER,
            interpret: Interpret
        ): string => {
            return interpret(node.component) + node.quantifier;
        },
        'I_MINIMISING_QUANTIFIER': (
            node: I_MINIMISING_QUANTIFIER,
            interpret: Interpret
        ): string => {
            return interpret(node.component) + node.quantifier + '?';
        },
        'I_NAMED_CAPTURING_GROUP': (
            node: I_NAMED_CAPTURING_GROUP,
            interpret: Interpret,
            context: Context
        ): string => {
            context.addNamedCapturingGroup(node.groupName);

            return (
                '(?<' +
                node.groupName +
                '>' +
                node.components
                    .map((node: I_COMPONENT) => interpret(node))
                    .join('') +
                ')'
            );
        },
        'I_NOOP': (): string => {
            return '';
        },
        'I_PATTERN': (node: I_PATTERN, interpret: Interpret): string => {
            return node.components
                .map((node: I_COMPONENT) => interpret(node))
                .join('');
        },
        'I_POSSESSIVE_QUANTIFIER': (
            node: I_POSSESSIVE_QUANTIFIER,
            interpret: Interpret,
            context: Context
        ): string => {
            const atomicGroupIndex = context.addAtomicGroup();

            return (
                '(?=(' +
                interpret(node.component) +
                node.quantifier +
                '))\\' +
                atomicGroupIndex
            );
        },
        'I_RAW_REGEX': (node: I_RAW_REGEX): string => {
            return node.chars;
        },
    },
};
