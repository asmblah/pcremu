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
    I_COMPONENT,
    I_MAXIMISING_QUANTIFIER,
    I_MINIMISING_QUANTIFIER,
    I_NAMED_CAPTURING_GROUP,
    I_NODE,
    I_NON_CAPTURING_GROUP,
    I_PATTERN,
    I_POSSESSIVE_QUANTIFIER,
    I_RAW_REGEX,
} from '../types/intermediateRepresentation';
import base, {
    concatenateRawRegexNodes,
    optimiseComponent,
    optimiseComponents,
} from '../base/intermediateOptimiser';
import { N_NODE } from '../types/ast';

type Interpret = (node: N_NODE) => I_NODE;

/**
 * Transpiler library spec to optimise a regular expression Intermediate Representation (IR)
 * to a new IR that will use native JavaScript regex features as much as possible.
 */
export default {
    nodes: {
        ...base.nodes,

        'I_ALTERNATION': (
            node: I_ALTERNATION,
            interpret: Interpret
        ): I_ALTERNATION | I_RAW_REGEX => {
            // Apply optimisations to all alternatives.
            // Note this will combine any raw regex fragments within each alternative if possible.
            const optimisedAlternatives = node.alternatives.map(
                (node: I_ALTERNATIVE) => interpret(node)
            ) as I_ALTERNATIVE[];

            // Now combine any runs of alternatives into raw alternations "a|b|...".
            const concatenatedAlternatives =
                concatenateRawRegexNodes<I_ALTERNATIVE>(
                    optimisedAlternatives,
                    {
                        'name': 'I_RAW_CHARS',
                        'chars': '|',
                    },
                    (node): I_RAW_REGEX | null => {
                        if (node.components.length === 0) {
                            // Optimise the special case of an empty alternative in the alternation.
                            return {
                                'name': 'I_RAW_REGEX',
                                // TODO: Output an empty chunks array instead?
                                'chunks': [
                                    {
                                        'name': 'I_RAW_NOOP',
                                    },
                                ],
                            };
                        }

                        return node.components.length === 1 &&
                            node.components[0].name === 'I_RAW_REGEX'
                            ? (node.components[0] as I_RAW_REGEX)
                            : null;
                    },
                    (node) => ({
                        'name': 'I_ALTERNATIVE',
                        'components': [node],
                    })
                );

            if (
                concatenatedAlternatives.length === 1 &&
                concatenatedAlternatives[0].components.length === 1 &&
                concatenatedAlternatives[0].components[0].name === 'I_RAW_REGEX'
            ) {
                const rawRegexNode = concatenatedAlternatives[0]
                    .components[0] as I_RAW_REGEX;

                // Fully optimised mode - entire contents of alternation have been compiled down
                // to a native regex fragment, so we have a native alternation to use.
                return {
                    'name': 'I_RAW_REGEX',
                    'chunks': [
                        {
                            'name': 'I_RAW_NESTED',
                            'node': rawRegexNode,
                        },
                    ],
                };
            }

            // Partially-optimised mode: alternatives have been optimised as much as possible,
            // but we've been unable to produce a single raw regex fragment.
            return {
                'name': 'I_ALTERNATION',
                'alternatives': concatenatedAlternatives,
            };
        },
        'I_ALTERNATIVE': (
            node: I_ALTERNATIVE,
            interpret: Interpret
        ): I_ALTERNATIVE => {
            // Apply optimisations to all components.
            const optimisedComponents = node.components.map(
                (node: I_COMPONENT) => interpret(node)
            );

            // Now combine any runs of components together "ab...".
            const concatenatedComponents =
                concatenateRawRegexNodes(optimisedComponents);

            return {
                'name': 'I_ALTERNATIVE',
                'components': concatenatedComponents,
            };
        },
        'I_CAPTURING_GROUP': (
            node: I_CAPTURING_GROUP,
            interpret: Interpret
        ): I_CAPTURING_GROUP | I_RAW_REGEX => {
            return optimiseComponents<I_CAPTURING_GROUP>(
                node.components,
                interpret,
                (rawRegexNode) => {
                    // Fully optimised mode - entire contents inside capturing group have been compiled down
                    // to a native regex fragment, so we can wrap it all in a native capturing group.
                    return {
                        'name': 'I_RAW_REGEX',
                        'chunks': [
                            {
                                'name': 'I_RAW_CAPTURE',
                                'groupIndex': node.groupIndex,
                                'chunks': [
                                    {
                                        'name': 'I_RAW_NESTED',
                                        'node': rawRegexNode,
                                    },
                                ],
                            },
                        ],
                    };
                },
                (concatenatedComponents) => {
                    // Partially-optimised mode: components have been optimised as much as possible,
                    // but we've been unable to produce a single raw regex fragment.
                    return {
                        'name': 'I_CAPTURING_GROUP',
                        'groupIndex': node.groupIndex,
                        'components': concatenatedComponents,
                    };
                }
            );
        },
        'I_MAXIMISING_QUANTIFIER': (
            node: I_MAXIMISING_QUANTIFIER,
            interpret: Interpret
        ): I_MAXIMISING_QUANTIFIER | I_RAW_REGEX => {
            return optimiseComponent<I_MAXIMISING_QUANTIFIER>(
                node.component,
                interpret,
                (rawRegexNode) => {
                    // Fully optimised mode - component has been compiled down
                    // to a native regex fragment, so we can just append the correct native quantifier.
                    return {
                        'name': 'I_RAW_REGEX',
                        'chunks': [
                            {
                                'name': 'I_RAW_NESTED',
                                'node': rawRegexNode,
                            },
                            {
                                'name': 'I_RAW_CHARS',
                                'chars': node.quantifier,
                            },
                        ],
                    };
                },
                (optimisedComponent) => {
                    // Partially-optimised mode: component has been optimised as much as possible,
                    // but we've been unable to produce a single raw regex fragment.
                    return {
                        'name': 'I_MAXIMISING_QUANTIFIER',
                        'component': optimisedComponent,
                        'quantifier': node.quantifier,
                    };
                }
            );
        },
        'I_MINIMISING_QUANTIFIER': (
            node: I_MINIMISING_QUANTIFIER,
            interpret: Interpret
        ): I_MINIMISING_QUANTIFIER | I_RAW_REGEX => {
            return optimiseComponent<I_MINIMISING_QUANTIFIER>(
                node.component,
                interpret,
                (rawRegexNode) => {
                    // Fully optimised mode - component has been compiled down
                    // to a native regex fragment, so we can just append the correct native quantifier.
                    return {
                        'name': 'I_RAW_REGEX',
                        'chunks': [
                            {
                                'name': 'I_RAW_NESTED',
                                'node': rawRegexNode,
                            },
                            {
                                'name': 'I_RAW_CHARS',
                                'chars': node.quantifier + '?',
                            },
                        ],
                    };
                },
                (optimisedComponent) => {
                    // Partially-optimised mode: component has been optimised as much as possible,
                    // but we've been unable to produce a single raw regex fragment.
                    return {
                        'name': 'I_MINIMISING_QUANTIFIER',
                        'component': optimisedComponent,
                        'quantifier': node.quantifier,
                    };
                }
            );
        },
        'I_NAMED_CAPTURING_GROUP': (
            node: I_NAMED_CAPTURING_GROUP,
            interpret: Interpret
        ): I_NAMED_CAPTURING_GROUP | I_RAW_REGEX => {
            return optimiseComponents<I_NAMED_CAPTURING_GROUP>(
                node.components,
                interpret,
                (rawRegexNode) => {
                    // Fully optimised mode - entire contents inside capturing group have been compiled down
                    // to a native regex fragment, so we can wrap it all in a native named capturing group.
                    return {
                        'name': 'I_RAW_REGEX',
                        'chunks': [
                            {
                                'name': 'I_RAW_NAMED_CAPTURE',
                                'groupIndex': node.groupIndex,
                                'groupName': node.groupName,
                                'chunks': [
                                    {
                                        'name': 'I_RAW_NESTED',
                                        'node': rawRegexNode,
                                    },
                                ],
                            },
                        ],
                    };
                },
                (concatenatedComponents) => {
                    // Partially-optimised mode: components have been optimised as much as possible,
                    // but we've been unable to produce a single raw regex fragment.
                    return {
                        'name': 'I_NAMED_CAPTURING_GROUP',
                        'groupIndex': node.groupIndex,
                        'groupName': node.groupName,
                        'components': concatenatedComponents,
                    };
                }
            );
        },
        'I_NON_CAPTURING_GROUP': (
            node: I_NON_CAPTURING_GROUP,
            interpret: Interpret
        ): I_NON_CAPTURING_GROUP | I_RAW_REGEX => {
            return optimiseComponents<I_NON_CAPTURING_GROUP>(
                node.components,
                interpret,
                (rawRegexNode) => {
                    // Fully optimised mode - entire contents inside capturing group have been compiled down
                    // to a native regex fragment, so we can wrap it all in a native non-capturing group.
                    return {
                        'name': 'I_RAW_REGEX',
                        'chunks': [
                            {
                                'name': 'I_RAW_NON_CAPTURE',
                                'chunks': [
                                    {
                                        'name': 'I_RAW_NESTED',
                                        'node': rawRegexNode,
                                    },
                                ],
                            },
                        ],
                    };
                },
                (concatenatedComponents) => {
                    // Partially-optimised mode: components have been optimised as much as possible,
                    // but we've been unable to produce a single raw regex fragment.
                    return {
                        'name': 'I_NON_CAPTURING_GROUP',
                        'components': concatenatedComponents,
                    };
                }
            );
        },
        /*
         * TODO: Optimise N_NUMBERED_BACKREFERENCE where possible.
         */
        'I_PATTERN': (node: I_PATTERN, interpret: Interpret): I_PATTERN => {
            // Apply optimisations to all components.
            const optimisedComponents = node.components.map(
                (node: I_COMPONENT) => interpret(node)
            );

            // Now combine any runs of components together "ab...".
            const concatenatedComponents =
                concatenateRawRegexNodes(optimisedComponents);

            // Note that we always return an I_PATTERN node even if its entire contents
            // have been optimised to a single raw regex fragment.
            return {
                'name': 'I_PATTERN',
                'capturingGroups': node.capturingGroups,
                'components': concatenatedComponents,
            };
        },
        'I_POSSESSIVE_QUANTIFIER': (
            node: I_POSSESSIVE_QUANTIFIER,
            interpret: Interpret
        ): I_POSSESSIVE_QUANTIFIER | I_RAW_REGEX => {
            return optimiseComponent<I_POSSESSIVE_QUANTIFIER>(
                node.component,
                interpret,
                (rawRegexNode) => {
                    // Fully optimised mode - component has been compiled down
                    // to a native regex fragment, so we can just emulate with a native lookahead.
                    return {
                        'name': 'I_RAW_REGEX',
                        'chunks': [
                            {
                                'name': 'I_RAW_CHARS',
                                'chars': '(?=',
                            },
                            {
                                // Use an "emulated"-type chunk as it does not relate
                                // to a capturing group in the original pattern.
                                'name': 'I_RAW_GHOST_CAPTURE',
                                'id': 'atomic',
                                'chunks': [
                                    {
                                        'name': 'I_RAW_NESTED',
                                        'node': rawRegexNode,
                                    },
                                    {
                                        'name': 'I_RAW_CHARS',
                                        'chars': node.quantifier,
                                    },
                                ],
                            },
                            {
                                'name': 'I_RAW_CHARS',
                                'chars': ')',
                            },
                            // Concatenate the capturing group index on the end.
                            {
                                'name': 'I_RAW_BACKREFERENCE',
                                'id': 'atomic',
                            },
                        ],
                    };
                },
                (optimisedComponent) => {
                    // Partially-optimised mode: component has been optimised as much as possible,
                    // but we've been unable to produce a single raw regex fragment.
                    return {
                        'name': 'I_POSSESSIVE_QUANTIFIER',
                        'component': optimisedComponent,
                        'quantifier': node.quantifier,
                    };
                }
            );
        },
    },
};
