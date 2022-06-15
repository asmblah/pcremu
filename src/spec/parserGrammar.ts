/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import {
    N_ALTERNATION,
    N_CHARACTER,
    N_CHARACTER_CLASS,
    N_COMPONENT,
} from './types/ast';
import { Context } from './types/parser';

/**
 * Parsing library grammar for parsing PCRE regular expressions to an AST.
 */
export default {
    // TODO: Improve error handling by implementing this.
    // ErrorHandler: ...,
    // State: ...,

    ignore: 'N_IGNORE',
    offsets: 'offset',
    rules: {
        'N_ALTERNATIVE': {
            components: [
                /\|/,
                /*
                 * Note that we allow zero components to be matched in order
                 * to support an empty final alternative in an alternation,
                 * eg. "my (pattern|)".
                 */
                { name: 'components', zeroOrMoreOf: 'N_COMPONENT_LEVEL_1' },
            ],
        },
        'N_BACKSLASH': {
            components: { oneOf: ['N_GENERIC_CHAR', 'N_NON_PRINTING_CHAR'] },
        },
        'N_CAPTURING_GROUP': {
            components: [
                /\(/,
                { name: 'components', zeroOrMoreOf: 'N_COMPONENT' },
                /\)/,
            ],
        },
        'N_CHARACTER': {
            components: {
                name: 'char',
                what: /[^\]\\]/,
            },
        },
        'N_CHARACTER_CLASS': {
            components: [
                // Make sure we don't ignore whitespace that could exist just _before_
                // the opening of the character class.
                /\[/,
                {
                    ignoreWhitespace: false,
                    what: [
                        { name: 'negated', optionally: /\^/ },
                        // Literal closing bracket may appear right at beginning of class.
                        { name: 'literalClosingBracket', optionally: /]/ },
                        {
                            name: 'components',
                            oneOrMoreOf: 'N_CHARACTER_CLASS_COMPONENT',
                        },
                        // Literal hyphen may appear right at end of class.
                        { name: 'literalHyphen', optionally: /-/ },
                        /]/,
                    ],
                },
            ],
            processor(
                node: N_CHARACTER_CLASS & {
                    literalClosingBracket?: string;
                    literalHyphen?: string;
                }
            ) {
                node.negated = Boolean(node.negated);

                if (node.literalClosingBracket) {
                    node.components.unshift({
                        'name': 'N_CHARACTER',
                        'char': ']',
                    } as N_CHARACTER);
                }

                if (node.literalHyphen) {
                    node.components.push({
                        'name': 'N_CHARACTER',
                        'char': '-',
                    } as N_CHARACTER);
                }

                delete node.literalClosingBracket;
                delete node.literalHyphen;

                return node;
            },
        },
        'N_CHARACTER_CLASS_COMPONENT': {
            components: {
                oneOf: [
                    'N_CHARACTER_RANGE',
                    'N_GENERIC_CHAR',
                    'N_CHARACTER_RANGE_EXTENT',
                ],
            },
        },
        'N_CHARACTER_RANGE_EXTENT': {
            components: {
                oneOf: [
                    'N_ESCAPED_CHAR',
                    'N_CHARACTER_CLASS_NON_PRINTING_CHAR',
                    'N_CHARACTER',
                ],
            },
        },
        'N_CHARACTER_CLASS_NON_PRINTING_CHAR': {
            components: {
                oneOf: ['N_HEX_CODE_CHAR', 'N_CONTROL_CHAR'],
            },
        },
        'N_CHARACTER_RANGE': {
            components: [
                { name: 'from', rule: 'N_CHARACTER_RANGE_EXTENT' },
                /-/,
                { name: 'to', rule: 'N_CHARACTER_RANGE_EXTENT' },
            ],
        },
        'N_COMMENT': /#.*?(?:[\r\n]+|$)/,
        'N_COMPONENT': 'N_COMPONENT_LEVEL_2',
        'N_COMPONENT_LEVEL_0': {
            components: {
                oneOf: [
                    'N_SIMPLE_ASSERTION',
                    'N_NAMED_CAPTURING_GROUP',
                    'N_NON_CAPTURING_GROUP',
                    'N_CAPTURING_GROUP',
                    'N_CHARACTER_CLASS',
                    'N_BACKSLASH',
                    'N_LITERAL',
                    'N_DOT',
                ],
            },
        },
        'N_COMPONENT_LEVEL_1': {
            components: {
                oneOf: [
                    'N_POSSESSIVE_QUANTIFIER',
                    'N_MINIMISING_QUANTIFIER',
                    'N_MAXIMISING_QUANTIFIER',
                    'N_COMPONENT_LEVEL_0',
                ],
            },
        },
        'N_MAXIMISING_QUANTIFIER': {
            components: [
                { name: 'component', rule: 'N_COMPONENT_LEVEL_0' },
                { name: 'quantifier', what: /[*+?]/ },
            ],
        },
        'N_MINIMISING_QUANTIFIER': {
            components: [
                { name: 'component', rule: 'N_COMPONENT_LEVEL_0' },
                { name: 'quantifier', what: /[*+?]/ },
                // Keep as a separate component to allow for whitespace/comments in between
                // (in extended mode).
                { what: /\?/ },
            ],
        },
        'N_POSSESSIVE_QUANTIFIER': {
            components: [
                { name: 'component', rule: 'N_COMPONENT_LEVEL_0' },
                { name: 'quantifier', what: /[*+?]/ },
                // Keep as a separate component to allow for whitespace/comments in between
                // (in extended mode).
                { what: /\+/ },
            ],
        },
        'N_COMPONENT_LEVEL_2': {
            components: [
                { name: 'leadingEmptyAlternative', optionally: /\|/ },
                // Due to left-recursion, we must always try to match all other
                // higher precedence components first.
                { name: 'left', rule: 'N_COMPONENT_LEVEL_1' },
                {
                    optionally: [
                        {
                            /*
                             * Next, capture any remaining components for the first alternative.
                             * Note that this match will need to be thrown away
                             * if no alternatives are found below.
                             */
                            name: 'remaining',
                            zeroOrMoreOf: 'N_COMPONENT_LEVEL_1',
                        },
                        { name: 'alternatives', oneOrMoreOf: 'N_ALTERNATIVE' },
                    ],
                },
            ],
            processor(
                node: N_ALTERNATION & {
                    leadingEmptyAlternative?: string;
                    left: N_COMPONENT;
                    remaining?: N_COMPONENT[];
                }
            ) {
                if (!node.leadingEmptyAlternative && !node.alternatives) {
                    // This is not an alternation at all (left-recursion handling).
                    return node.left;
                }

                const alternatives = [
                    {
                        'name': 'N_ALTERNATIVE',
                        'components': [node.left, ...(node.remaining ?? [])],
                    },
                    ...(node.alternatives ?? []),
                ];

                if (node.leadingEmptyAlternative) {
                    // Alternation has an empty alternative at the start,
                    // eg. "my (|pattern)"
                    alternatives.unshift({
                        'name': 'N_ALTERNATIVE',
                        'components': [],
                    });
                }

                return {
                    'name': 'N_ALTERNATION',
                    'alternatives': alternatives,
                };
            },
        },
        'N_CONTROL_CHAR': {
            components: {
                name: 'type',
                what: /\\([nrt])/,
                captureIndex: 1,
            },
        },
        'N_DOT': {
            components: { allowMerge: false, what: /\./ },
        },
        'N_ESCAPED_CHAR': {
            components: {
                name: 'char',
                /*
                 * Allow escaped special characters and whitespace
                 * but discard the backslash.
                 */
                what: /\\([^a-zA-Z\d])/,
                captureIndex: 1,
            },
        },
        'N_GENERIC_CHAR': {
            components: {
                name: 'type',
                what: /\\([dDhHNsSvVwW])/,
                captureIndex: 1,
            },
        },
        'N_HEX_CODE_CHAR': {
            components: {
                name: 'code',
                what: /\\x([0-9a-fA-F]{2})/,
                captureIndex: 1,
            },
        },
        'N_IGNORE': {
            components: {
                oneOrMoreOf: { oneOf: ['N_WHITESPACE', 'N_COMMENT'] },
            },
            processor(
                node: unknown,
                parse: unknown,
                abort: unknown,
                context: Context
            ) {
                // Only skip whitespace and comments in extended mode.
                return context.flags.extended ? node : null;
            },
        },
        'N_LITERAL': {
            /*
             * No need to worry about excluding closing brace as that quantifier syntax
             * does not match N_LITERAL inside. It is restricted to {X,Y}.
             *
             * No need to worry about excluding closing square bracket
             * as character classes do not match N_LITERAL inside.
             *
             * We do not allow a closing parenthesis even though it could technically be allowed
             * if there was no matching opening one.
             */
            components: {
                name: 'text',
                oneOf: [
                    // Capture a run of characters that have no quantifier applied, or...
                    { oneOrMoreOf: ['N_LITERAL_CHAR', /(?![*+?{])/] },
                    // ... a single character that does have a quantifier applied.
                    ['N_LITERAL_CHAR', /(?=[*+?{])/],
                ],
            },
        },
        'N_LITERAL_CHAR': {
            components: [
                {
                    oneOf: [
                        // Allow unescaped non-special characters and whitespace.
                        { what: /[^$^.[|()*+?{\s\\]/ },
                        /*
                         * Allow escaped special characters and whitespace
                         * including hash (extended mode comment),
                         * but discard the backslash.
                         */
                        { what: /\\([^a-zA-Z\d])/, captureIndex: 1 },
                        {
                            // Allow unescaped whitespace inside literals in non-extended mode.
                            what: /\s/,
                            modifier(
                                capture: string,
                                parse: unknown,
                                abort: unknown,
                                context: Context
                            ) {
                                return context.flags.extended ? null : capture;
                            },
                        },
                    ],
                },
            ],
        },
        'N_NAMED_CAPTURING_GROUP': {
            components: [
                /\(\?</,
                { name: 'groupName', what: /[^>]+/ },
                />/,
                { name: 'components', zeroOrMoreOf: 'N_COMPONENT' },
                /\)/,
            ],
        },
        'N_NON_CAPTURING_GROUP': {
            components: [
                /\(\?:/,
                { name: 'components', zeroOrMoreOf: 'N_COMPONENT' },
                /\)/,
            ],
        },
        'N_NON_PRINTING_CHAR': {
            components: {
                oneOf: [
                    'N_HEX_CODE_CHAR',
                    'N_CONTROL_CHAR',
                    'N_NUMBERED_BACKREFERENCE_OR_OCTAL_CHAR',
                ],
            },
        },
        'N_NUMBERED_BACKREFERENCE_OR_OCTAL_CHAR': {
            components: [
                /\\/,
                {
                    ignoreWhitespace: false,
                    name: 'digits',
                    what: /(?=\d)[^0]\d{0,2}/,
                },
            ],
            processor(node: { digits: string; name: string }) {
                const number = Number(node.digits);

                /*
                 * From the docs:
                 *
                 *   "... If the number is less than 10, begins with the digit 8 or 9,
                 *   or if there are at least that many previous capture groups in the expression,
                 *   the entire sequence is taken as a backreference".
                 *
                 * Note that at this point we do not know how many capturing groups there are,
                 * so in the ambiguous scenario the node will be left as N_NUMBERED_BACKREFERENCE_OR_OCTAL_CHAR.
                 */
                if (number < 10 || /^[89]/.test(node.digits)) {
                    return { name: 'N_NUMBERED_BACKREFERENCE', number };
                }

                return node;
            },
        },
        'N_PATTERN': {
            components: {
                name: 'components',
                zeroOrMoreOf: 'N_COMPONENT',
            },
        },
        'N_SIMPLE_ASSERTION': {
            components: { name: 'assertion', what: /[\^$]/ },
        },
        'N_WHITESPACE': {
            components: { name: 'chars', what: /\s+/ },
        },
    },
    start: 'N_PATTERN',
};
