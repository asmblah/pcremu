/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

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
        'N_COMPONENT': {
            components: {
                oneOf: [
                    'N_SIMPLE_ASSERTION',
                    'N_CAPTURING_GROUP',
                    'N_LITERAL',
                    'N_WHITESPACE',
                ],
            },
        },
        'N_LITERAL': {
            components: { name: 'text', what: /\w+/ },
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
