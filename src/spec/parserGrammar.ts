/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { N_CHARACTER, N_CHARACTER_CLASS } from './astToIntermediate';

export default {
    // TODO: Improve error handling by implementing this.
    // ErrorHandler: ...,
    // State: ...,

    offsets: 'offset',
    rules: {
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
        'N_COMPONENT': {
            components: {
                oneOf: [
                    'N_SIMPLE_ASSERTION',
                    'N_NAMED_CAPTURING_GROUP',
                    'N_CAPTURING_GROUP',
                    'N_CHARACTER_CLASS',
                    'N_LITERAL',
                    'N_WHITESPACE',
                ],
            },
        },
        'N_LITERAL': {
            components: { name: 'text', what: /\w+/ },
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
