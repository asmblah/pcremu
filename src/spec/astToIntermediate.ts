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
    I_CHARACTER_CLASS,
    I_CHARACTER_RANGE,
    I_LOOKAROUND,
    I_MAXIMISING_QUANTIFIER,
    I_MINIMISING_QUANTIFIER,
    I_NAMED_CAPTURING_GROUP,
    I_NODE,
    I_NON_CAPTURING_GROUP,
    I_NOOP,
    I_NUMBERED_BACKREFERENCE,
    I_PATTERN,
    I_POSSESSIVE_QUANTIFIER,
    I_RAW_REGEX,
} from './types/intermediateRepresentation';
import { Flags } from '../declarations/types';
import {
    N_ALTERNATION,
    N_ALTERNATIVE,
    N_CAPTURING_GROUP,
    N_CHARACTER,
    N_CHARACTER_CLASS,
    N_CHARACTER_RANGE,
    N_COMPONENT,
    N_CONTROL_CHAR,
    N_ESCAPED_CHAR,
    N_GENERIC_CHAR,
    N_HEX_CODE_CHAR,
    N_LITERAL,
    N_LOOKAROUND,
    N_MAXIMISING_QUANTIFIER,
    N_MINIMISING_QUANTIFIER,
    N_NAMED_CAPTURING_GROUP,
    N_NODE,
    N_NON_CAPTURING_GROUP,
    N_NUMBERED_BACKREFERENCE,
    N_NUMBERED_BACKREFERENCE_OR_OCTAL_CHAR,
    N_PATTERN,
    N_POSSESSIVE_QUANTIFIER,
    N_SIMPLE_ASSERTION,
    N_WHITESPACE,
} from './types/ast';
import escapeStringRegexp = require('escape-string-regexp');
import QuantifierParser from '../Quantifier/QuantifierParser';

export interface TrackingContext {
    /**
     * Records a named capturing group.
     * Note that named capturing groups are also recorded by their index.
     *
     * @param {string} name
     * @returns {number} Returns the index of the group
     */
    addNamedCapturingGroup(name: number | string): number;

    /**
     * Records a numbered capturing group.
     *
     * @returns {number} Returns the index of the group
     */
    addNumberedCapturingGroup(): number;

    /**
     * Determines whether a capturing group with the given index exists so far.
     *
     * @param {number} index
     */
    hasNumberedCapturingGroup(index: number): boolean;
}
export interface Context extends TrackingContext {
    flags: Flags;
    quantifierParser: QuantifierParser;
}
type Interpret = (node: N_NODE, context?: object) => I_NODE;

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
            interpret: Interpret,
            context: Context
        ): I_CAPTURING_GROUP => {
            const groupIndex = context.addNumberedCapturingGroup();

            return {
                'name': 'I_CAPTURING_GROUP',
                'groupIndex': groupIndex,
                'components': node.components.map((node: N_NODE) =>
                    interpret(node)
                ),
            };
        },
        'N_CHARACTER': (node: N_CHARACTER): I_RAW_REGEX => {
            return {
                'name': 'I_RAW_REGEX',
                'chunks': [
                    {
                        'name': 'I_RAW_CHARS',
                        'chars': escapeStringRegexp(node.char),
                    },
                ],
                'fixedLength': 1,
            };
        },
        'N_CHARACTER_CLASS': (
            node: N_CHARACTER_CLASS,
            interpret: Interpret
        ): I_CHARACTER_CLASS => {
            return {
                'name': 'I_CHARACTER_CLASS',
                'negated': node.negated,
                'components': node.components.map((node: N_NODE) =>
                    interpret(node)
                ),
            };
        },
        'N_CHARACTER_RANGE': (
            node: N_CHARACTER_RANGE,
            interpret: Interpret
        ): I_CHARACTER_RANGE => {
            return {
                'name': 'I_CHARACTER_RANGE',
                'from': interpret(node.from),
                'to': interpret(node.to),
            };
        },
        'N_CONTROL_CHAR': (node: N_CONTROL_CHAR): I_RAW_REGEX => {
            return {
                'name': 'I_RAW_REGEX',
                'chunks': [
                    {
                        'name': 'I_RAW_CHARS',
                        'chars': '\\' + node.type,
                    },
                ],
                'fixedLength': 1,
            };
        },
        'N_DOT': (): I_RAW_REGEX => {
            return {
                'name': 'I_RAW_REGEX',
                'chunks': [
                    {
                        'name': 'I_RAW_CHARS',
                        'chars': '.',
                    },
                ],
                'fixedLength': 1,
            };
        },
        'N_END_OF_STRING_ASSERTION': (): I_RAW_REGEX => {
            return {
                'name': 'I_RAW_REGEX',
                'chunks': [
                    {
                        'name': 'I_RAW_CHARS',
                        // Also match before a newline at the end of the subject.
                        'chars': '(?=\\n?(?![\\s\\S]))',
                    },
                ],
                'fixedLength': 0,
            };
        },
        'N_ESCAPED_CHAR': (node: N_ESCAPED_CHAR): I_RAW_REGEX => {
            return {
                'name': 'I_RAW_REGEX',
                'chunks': [
                    {
                        'name': 'I_RAW_CHARS',
                        'chars': '\\' + node.char,
                    },
                ],
                'fixedLength': 1,
            };
        },
        'N_EXCLUSIVE_END_OF_STRING_ASSERTION': (): I_RAW_REGEX => {
            return {
                'name': 'I_RAW_REGEX',
                'chunks': [
                    {
                        'name': 'I_RAW_CHARS',
                        // Note that unlike the non-exclusive variant, any newline is ignored.
                        'chars': '(?![\\s\\S])',
                    },
                ],
                'fixedLength': 0,
            };
        },
        'N_GENERIC_CHAR': (node: N_GENERIC_CHAR): I_RAW_REGEX => {
            return {
                'name': 'I_RAW_REGEX',
                'chunks': [
                    {
                        'name': 'I_RAW_CHARS',
                        'chars': '\\' + node.type,
                    },
                ],
                'fixedLength': 1,
            };
        },
        'N_HEX_CODE_CHAR': (node: N_HEX_CODE_CHAR): I_RAW_REGEX => {
            return {
                'name': 'I_RAW_REGEX',
                'chunks': [
                    {
                        'name': 'I_RAW_CHARS',
                        'chars': '\\x' + node.code,
                    },
                ],
                'fixedLength': 1,
            };
        },
        'N_LITERAL': (node: N_LITERAL): I_RAW_REGEX => {
            return {
                'name': 'I_RAW_REGEX',
                'chunks': [
                    {
                        // TODO: Implement I_RAW_LITERAL, concat with I_RAW_CHARS in optimiser,
                        //       any isolated ones that remain become LiteralFragments.
                        'name': 'I_RAW_CHARS',
                        'chars': escapeStringRegexp(node.text),
                    },
                ],
                'fixedLength': node.text.length,
            };
        },
        'N_MAXIMISING_QUANTIFIER': (
            node: N_MAXIMISING_QUANTIFIER,
            interpret: Interpret,
            context: Context
        ): I_MAXIMISING_QUANTIFIER => {
            const quantifier = context.quantifierParser.parseQuantifier(
                node.quantifier
            );

            return {
                'name': 'I_MAXIMISING_QUANTIFIER',
                'quantifier': quantifier,
                'component': interpret(node.component),
            };
        },
        'N_MINIMISING_QUANTIFIER': (
            node: N_MINIMISING_QUANTIFIER,
            interpret: Interpret,
            context: Context
        ): I_MINIMISING_QUANTIFIER => {
            const quantifier = context.quantifierParser.parseQuantifier(
                node.quantifier
            );

            return {
                'name': 'I_MINIMISING_QUANTIFIER',
                'quantifier': quantifier,
                'component': interpret(node.component),
            };
        },
        'N_NAMED_CAPTURING_GROUP': (
            node: N_NAMED_CAPTURING_GROUP,
            interpret: Interpret,
            context: Context
        ): I_NAMED_CAPTURING_GROUP => {
            const groupIndex = context.addNamedCapturingGroup(node.groupName);

            return {
                'name': 'I_NAMED_CAPTURING_GROUP',
                'groupName': node.groupName,
                'groupIndex': groupIndex,
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
        'N_NON_WORD_BOUNDARY_ASSERTION': (): I_RAW_REGEX => {
            return {
                'name': 'I_RAW_REGEX',
                'chunks': [
                    {
                        'name': 'I_RAW_CHARS',
                        'chars': '\\B',
                    },
                ],
                'fixedLength': 0,
            };
        },
        'N_NUMBERED_BACKREFERENCE': (
            node: N_NUMBERED_BACKREFERENCE
        ): I_NUMBERED_BACKREFERENCE => {
            return {
                'name': 'I_NUMBERED_BACKREFERENCE',
                'number': node.number,
            };
        },
        'N_NUMBERED_BACKREFERENCE_OR_OCTAL_CHAR': (
            node: N_NUMBERED_BACKREFERENCE_OR_OCTAL_CHAR,
            interpret: Interpret,
            context: Context
        ): I_NUMBERED_BACKREFERENCE | I_RAW_REGEX => {
            const octalAsNumber: number = parseInt(node.digits, 8);

            // Ambiguous escape sequences resolve to a numbered backreference if there have been
            // that many in the pattern so far, otherwise an octal character code escape.
            const isNumberedBackreference =
                context.hasNumberedCapturingGroup(octalAsNumber);

            return isNumberedBackreference
                ? {
                      'name': 'I_NUMBERED_BACKREFERENCE',
                      'number': octalAsNumber,
                  }
                : {
                      'name': 'I_RAW_REGEX',
                      'chunks': [
                          {
                              'name': 'I_RAW_CHARS',
                              'chars': String.fromCharCode(octalAsNumber),
                          },
                      ],
                      'fixedLength': 1,
                  };
        },
        'N_PATTERN': (node: N_PATTERN, interpret: Interpret): I_PATTERN => {
            // Note we include "0" as the entire match is always captured as group 0.
            const capturingGroupNames: Array<number | string> = [0];
            let patternCapturingGroupCount = 1;

            const context: TrackingContext = {
                /**
                 * @inheritDoc
                 */
                addNamedCapturingGroup(name: number | string): number {
                    const groupIndex = patternCapturingGroupCount++;

                    capturingGroupNames.push(name);
                    // Named capturing groups are also stored by their index.
                    capturingGroupNames.push(groupIndex);

                    return groupIndex;
                },

                /**
                 * @inheritDoc
                 */
                addNumberedCapturingGroup(): number {
                    const groupIndex = patternCapturingGroupCount++;

                    capturingGroupNames.push(groupIndex);

                    return groupIndex;
                },

                /**
                 * @inheritDoc
                 */
                hasNumberedCapturingGroup(index: number): boolean {
                    return patternCapturingGroupCount > index;
                },
            };

            return {
                'name': 'I_PATTERN',
                'capturingGroups': capturingGroupNames,
                'components': node.components.map((node: N_NODE) =>
                    interpret(node, context)
                ),
            };
        },
        'N_LOOKAROUND': (
            node: N_LOOKAROUND,
            interpret: Interpret
        ): I_LOOKAROUND => {
            return {
                'name': 'I_LOOKAROUND',
                'bivalence': node.bivalence,
                'direction': node.direction,
                'components': node.components.map((node: N_NODE) =>
                    interpret(node)
                ),
            };
        },
        'N_POSSESSIVE_QUANTIFIER': (
            node: N_POSSESSIVE_QUANTIFIER,
            interpret: Interpret,
            context: Context
        ): I_POSSESSIVE_QUANTIFIER => {
            const quantifier = context.quantifierParser.parseQuantifier(
                node.quantifier
            );

            return {
                'name': 'I_POSSESSIVE_QUANTIFIER',
                'quantifier': quantifier,
                'component': interpret(node.component),
            };
        },
        'N_SIMPLE_ASSERTION': (
            node: N_SIMPLE_ASSERTION,
            interpret: Interpret,
            context: Context
        ): I_RAW_REGEX => {
            let assertion = node.assertion;

            /*
             * Dollar always matches before any trailing newline (and only the final one if so).
             * Dollar-end-only mode disregards any trailing newline and only matches at the very end of the string,
             * however if multiline mode is also enabled then dollar-end-only mode is ignored.
             */
            if (
                assertion === '$' &&
                (!context.flags.dollarEndOnly || context.flags.multiline)
            ) {
                assertion = '(?:$|(?=\\n$))';
            }

            return {
                'name': 'I_RAW_REGEX',
                'chunks': [
                    {
                        'name': 'I_RAW_CHARS',
                        'chars': assertion,
                    },
                ],
                'fixedLength': 0,
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
                'chunks': [
                    {
                        'name': 'I_RAW_CHARS',
                        'chars': node.chars,
                    },
                ],
                'fixedLength': node.chars.length,
            };
        },
        'N_WORD_BOUNDARY_ASSERTION': (): I_RAW_REGEX => {
            return {
                'name': 'I_RAW_REGEX',
                'chunks': [
                    {
                        'name': 'I_RAW_CHARS',
                        'chars': '\\b',
                    },
                ],
                'fixedLength': 0,
            };
        },
    },
};
