/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import {
    I_NODE,
    I_RAW_BACKREFERENCE,
    I_RAW_CAPTURE,
    I_RAW_CHARS,
    I_RAW_GHOST_CAPTURE,
    I_RAW_LOOKAROUND,
    I_RAW_NAMED_CAPTURE,
    I_RAW_NESTED,
    I_RAW_NON_CAPTURE,
    I_RAW_REGEX,
} from '../types/intermediateRepresentation';
import base from '../base/intermediateOptimiser';
import { N_NODE } from '../types/ast';
import Exception from '../../Exception/Exception';

type Interpret = (node: N_NODE, context?: object) => I_NODE | string;

type Context = {
    /**
     * Fetches a previously-added capturing or ghost-capturing group's index by its ID.
     *
     * @param {string} id
     * @throws {Exception} Throws when no capturing group has been added with the given ID.
     */
    getCapturingGroupIndex(id: string): number;

    /**
     * Records a capturing group for the current raw regex context,
     * which maps to a capturing group in the original PCRE pattern.
     * Optionally stores its index against the given ID, so that it may be fetched later
     * for a backreference (from N_RAW_BACKREFERENCE).
     *
     * @param {number} patternIndex
     * @param {string=} id
     */
    recordCapturingGroup(patternIndex: number, id?: string): void;

    /**
     * Records a "ghost" capturing group, which does _not_ map to a capturing group
     * in the original PCRE pattern, but which is captured for another emulation-related reason.
     *
     * For example, atomic groups are emulated with a capturing group inside a lookahead -
     * the capturing group's capture is not actually returned to the user,
     * only used by a backreference just after it.
     *
     * Optionally stores its index against the given ID, so that it may be fetched later
     * for a backreference (from N_RAW_BACKREFERENCE).
     *
     * @param {string=} id
     */
    recordGhostCapturingGroup(id?: string): void;
};

const hasOwn = {}.hasOwnProperty;

/**
 * Transpiler library spec to optimise a regular expression Intermediate Representation (IR)
 * using complex I_RAW_REGEX node trees to simple I_RAW_REGEX-wrapped I_RAW_OPTIMISED nodes.
 */
export default {
    nodes: {
        ...base.nodes,

        'I_RAW_BACKREFERENCE': (
            node: I_RAW_BACKREFERENCE,
            interpret: Interpret,
            context: Context,
        ): string => {
            return '\\' + context.getCapturingGroupIndex(node.id);
        },
        'I_RAW_CAPTURE': (
            node: I_RAW_CAPTURE,
            interpret: Interpret,
            context: Context,
        ): string => {
            context.recordCapturingGroup(node.groupIndex, node.id);

            return (
                // Add a native capturing group around.
                '(' +
                node.chunks.map((chunk) => interpret(chunk, context)).join('') +
                ')'
            );
        },
        'I_RAW_CHARS': (node: I_RAW_CHARS): string => {
            return node.chars;
        },
        'I_RAW_GHOST_CAPTURE': (
            node: I_RAW_GHOST_CAPTURE,
            interpret: Interpret,
            context: Context,
        ): string => {
            context.recordGhostCapturingGroup(node.id);

            return (
                // Add a native capturing group around. Note we don't use a native non-capturing group,
                // as we still need the data captured (e.g. for use by a backreference),
                // it just doesn't relate to a capturing group in the original PCRE pattern.
                '(' +
                node.chunks.map((chunk) => interpret(chunk, context)).join('') +
                ')'
            );
        },
        'I_RAW_LOOKAROUND': (
            node: I_RAW_LOOKAROUND,
            interpret: Interpret,
        ): string => {
            const bivalenceChar = node.bivalence === 'positive' ? '=' : '!';
            const directionChar = node.direction === 'behind' ? '<' : '';

            return (
                // Surround with a native lookaround group.
                `(?${directionChar}${bivalenceChar}` +
                node.chunks.map((chunk) => interpret(chunk)).join('') +
                ')'
            );
        },
        'I_RAW_NAMED_CAPTURE': (
            node: I_RAW_NAMED_CAPTURE,
            interpret: Interpret,
            context: Context,
        ): string => {
            context.recordCapturingGroup(node.groupIndex, node.id);

            return (
                // Add a native named capturing group around.
                '(?<' +
                node.groupName +
                '>' +
                node.chunks.map((chunk) => interpret(chunk, context)).join('') +
                ')'
            );
        },
        'I_RAW_NESTED': (node: I_RAW_NESTED, interpret: Interpret): string => {
            if (node.node.name !== 'I_RAW_REGEX') {
                throw new Exception('Expected an I_RAW_REGEX at this point');
            }

            const rawRegexNode = node.node as I_RAW_REGEX;

            return rawRegexNode.chunks
                .map((chunk) => interpret(chunk))
                .join('');
        },
        'I_RAW_NON_CAPTURE': (
            node: I_RAW_NON_CAPTURE,
            interpret: Interpret,
        ): string => {
            return (
                // Add a native non-capturing group around.
                '(?:' +
                node.chunks.map((chunk) => interpret(chunk)).join('') +
                ')'
            );
        },
        'I_RAW_NOOP': (): string => {
            return '';
        },
        'I_RAW_REGEX': (
            node: I_RAW_REGEX,
            interpret: Interpret,
        ): I_RAW_REGEX => {
            const capturingGroupIdToIndex: { [id: string]: number } = {};
            const patternToEmulatedNumberedGroupIndex: {
                [key: number]: number;
            } = {};
            let emulatedCapturingGroupCount = 1;

            const context: Context = {
                /**
                 * @inheritDoc
                 */
                getCapturingGroupIndex(id: string): number {
                    if (!hasOwn.call(capturingGroupIdToIndex, id)) {
                        throw new Exception(
                            `No capturing group defined with id ${id} for this I_RAW_REGEX`,
                        );
                    }

                    return capturingGroupIdToIndex[id];
                },

                /**
                 * @inheritDoc
                 */
                recordCapturingGroup(patternIndex: number, id?: string): void {
                    const index = emulatedCapturingGroupCount++;

                    if (id !== undefined) {
                        capturingGroupIdToIndex[id] = index;
                    }

                    patternToEmulatedNumberedGroupIndex[patternIndex] = index;
                },

                /**
                 * @inheritDoc
                 */
                recordGhostCapturingGroup(id?: string): void {
                    const index = emulatedCapturingGroupCount++;

                    if (id !== undefined) {
                        capturingGroupIdToIndex[id] = index;
                    }
                },
            };

            return {
                'name': 'I_RAW_REGEX',
                'chunks': [
                    {
                        'name': 'I_RAW_OPTIMISED',
                        'chars': node.chunks
                            .map((chunk) => interpret(chunk, context))
                            .join(''),
                        'patternToEmulatedNumberedGroupIndex':
                            patternToEmulatedNumberedGroupIndex,
                    },
                ],
                'fixedLength': node.fixedLength,
            };
        },
    },
};
