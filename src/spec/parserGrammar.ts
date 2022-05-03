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
        'N_SIMPLE_ASSERTION': {
            components: { name: 'assertion', what: /[\^]/ },
        },
        'N_LITERAL': {
            components: { name: 'text', what: /\w+/ },
        },
        'N_PATTERN': {
            components: {
                name: 'components',
                zeroOrMoreOf: {
                    oneOf: ['N_SIMPLE_ASSERTION', 'N_LITERAL', 'N_WHITESPACE'],
                },
            },
        },
        'N_WHITESPACE': {
            components: { name: 'chars', what: /\s+/ },
        },
    },
    start: 'N_PATTERN',
};
