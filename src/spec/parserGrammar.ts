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
} from './astToIntermediate';

/**
 * Parsing library grammar for parsing PCRE regular expressions to an AST.
 */
export default {
    // TODO: Improve error handling by implementing this.
    // ErrorHandler: ...,
    // State: ...,

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
        'N_CAPTURING_GROUP': {
            components: [
                /\(/,
                { name: 'components', zeroOrMoreOf: 'N_COMPONENT' },
                /\)/,
            ],
        },
        'N_CHARACTER': {
            components: { name: 'char', what: /[\d\w]/ },
        },
        'N_CHARACTER_CLASS': {
            components: [
                /\[/,
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
            components: { oneOf: ['N_CHARACTER_RANGE', 'N_CHARACTER'] },
        },
        'N_CHARACTER_RANGE': {
            components: [
                { name: 'from', what: /\w/ },
                /-/,
                { name: 'to', what: /\w/ },
            ],
        },
        'N_COMPONENT': 'N_COMPONENT_LEVEL_2',
        'N_COMPONENT_LEVEL_0': {
            components: {
                oneOf: [
                    'N_SIMPLE_ASSERTION',
                    'N_NAMED_CAPTURING_GROUP',
                    'N_CAPTURING_GROUP',
                    'N_CHARACTER_CLASS',
                    'N_GENERIC_CHAR',
                    'N_LITERAL',
                    'N_WHITESPACE',
                ],
            },
        },
        'N_COMPONENT_LEVEL_1': {
            captureAs: 'N_QUANTIFIER',
            components: [
                { name: 'component', rule: 'N_COMPONENT_LEVEL_0' },
                { name: 'quantifier', optionally: /[*+]/ },
            ],
            ifNoMatch: { component: 'quantifier', capture: 'component' },
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
        'N_GENERIC_CHAR': {
            components: {
                name: 'type',
                what: /\\([dDhHNsSvVwW])/,
                captureIndex: 1,
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
                // Note we exclude the escape sequences in N_GENERIC_CHAR.
                what: /(?:[^^$.[|()*+?{\s\\]|\\[^dDhHNsSvVwW])+/,
            },
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
