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
    I_COMPONENT,
    I_MAXIMISING_QUANTIFIER,
    I_MINIMISING_QUANTIFIER,
    I_NAMED_CAPTURING_GROUP,
    I_NODE,
    I_NON_CAPTURING_GROUP,
    I_NOOP,
    I_NUMBERED_BACKREFERENCE,
    I_PATTERN,
    I_POSSESSIVE_QUANTIFIER,
    I_RAW_CHARS,
    I_RAW_CHUNK,
    I_RAW_REGEX,
} from '../types/intermediateRepresentation';
import { N_NODE } from '../types/ast';

type Interpret = (node: N_NODE) => I_NODE;

/**
 * Joins the chunks of any sequential I_RAW_REGEX nodes together
 * to facilitate optimisation.
 *
 * @param {I_COMPONENT[]} nodes
 * @param {I_RAW_CHUNK|null} glue
 * @param {Function} unpackItem
 * @param {Function} repackItem
 */
export const concatenateRawRegexNodes = <T extends I_COMPONENT>(
    nodes: T[],
    glue: I_RAW_CHUNK | null = null,
    unpackItem = (node: T): I_COMPONENT | null => node,
    repackItem = (node: I_RAW_REGEX): T => node as unknown as T
) => {
    let currentRunChunks: I_RAW_CHUNK[] = [];
    const resultNodes: T[] = [];

    const addRunItem = () => {
        resultNodes.push(
            repackItem({
                'name': 'I_RAW_REGEX',
                'chunks': currentRunChunks,
            })
        );
    };

    for (const node of nodes) {
        const item = unpackItem(node);

        if (item !== null && item.name === 'I_RAW_REGEX') {
            if (glue !== null && currentRunChunks.length > 0) {
                currentRunChunks.push(glue);
            }

            currentRunChunks.push(...(item as I_RAW_REGEX).chunks);
        } else if (currentRunChunks.length > 0) {
            addRunItem();

            // Reset for the next run.
            currentRunChunks = [];

            // Make sure we add the non-run item that ended the run to the result too.
            resultNodes.push(node);
        } else {
            // When we're outside a run, just add the item to the result.
            resultNodes.push(node);
        }
    }

    // Clear up any leftovers.
    if (currentRunChunks.length > 0) {
        addRunItem();
    }

    return resultNodes;
};

/**
 * Optimises a single component as much as possible.
 *
 * @param {I_COMPONENT} component
 * @param {Function} interpret
 * @param {Function} buildOptimised
 * @param {Function} buildUnoptimised
 */
export const optimiseComponent = <T extends I_COMPONENT>(
    component: I_COMPONENT,
    interpret: Interpret,
    buildOptimised: (rawRegexNode: I_RAW_REGEX) => I_RAW_REGEX,
    buildUnoptimised: (optimisedComponent: I_COMPONENT) => T
): T | I_RAW_REGEX => {
    // Apply optimisations to the component.
    const optimisedComponent = interpret(component);

    if (optimisedComponent.name === 'I_RAW_REGEX') {
        const rawRegexNode = optimisedComponent as I_RAW_REGEX;

        // Fully optimised mode - component has been compiled down
        // to a native regex fragment, so we can generate a native fragment for the whole thing.
        return buildOptimised(rawRegexNode);
    }

    // Partially-optimised mode: component has been optimised as much as possible,
    // but we've been unable to produce a single raw regex fragment.
    return buildUnoptimised(optimisedComponent);
};

/**
 * Optimises a list of components as much as possible.
 *
 * @param {I_COMPONENT[]} components
 * @param {Function} interpret
 * @param {Function} buildOptimised
 * @param {Function} buildUnoptimised
 */
export const optimiseComponents = <T extends I_COMPONENT>(
    components: I_COMPONENT[],
    interpret: Interpret,
    buildOptimised: (rawRegexNode: I_RAW_REGEX) => I_RAW_REGEX,
    buildUnoptimised: (concatenatedComponents: I_COMPONENT[]) => T
): T | I_RAW_REGEX => {
    // Apply optimisations to all components.
    const optimisedComponents = components.map((node: I_COMPONENT) =>
        interpret(node)
    );

    // Now combine any runs of components together "ab...".
    const concatenatedComponents =
        concatenateRawRegexNodes(optimisedComponents);

    if (
        concatenatedComponents.length === 1 &&
        concatenatedComponents[0].name === 'I_RAW_REGEX'
    ) {
        const rawRegexNode = concatenatedComponents[0] as I_RAW_REGEX;

        // Fully optimised mode - entire contents inside group have been compiled down
        // to a native regex fragment, so we can generate a native fragment for the whole thing.
        return buildOptimised(rawRegexNode);
    }

    // Partially-optimised mode: components have been optimised as much as possible,
    // but we've been unable to produce a single raw regex fragment.
    return buildUnoptimised(concatenatedComponents);
};

/**
 * Transpiler library spec to optimise a regular expression Intermediate Representation (IR)
 * to a new IR that will use native JavaScript regex features as much as possible.
 */
export default {
    nodes: {
        'I_ALTERNATION': (
            node: I_ALTERNATION,
            interpret: Interpret
        ): I_ALTERNATION => {
            return {
                'name': 'I_ALTERNATION',
                'alternatives': node.alternatives.map((node: I_ALTERNATIVE) =>
                    interpret(node)
                ) as I_ALTERNATIVE[],
            };
        },
        'I_ALTERNATIVE': (
            node: I_ALTERNATIVE,
            interpret: Interpret
        ): I_ALTERNATIVE => {
            return {
                'name': 'I_ALTERNATIVE',
                'components': node.components.map((node: I_COMPONENT) =>
                    interpret(node)
                ),
            };
        },
        'I_CAPTURING_GROUP': (
            node: I_CAPTURING_GROUP,
            interpret: Interpret
        ): I_CAPTURING_GROUP => {
            return {
                'name': 'I_CAPTURING_GROUP',
                'groupIndex': node.groupIndex,
                'components': node.components.map((node: I_COMPONENT) =>
                    interpret(node)
                ),
            };
        },
        'I_CHARACTER_CLASS': (
            node: I_CHARACTER_CLASS,
            interpret: Interpret
        ): I_CHARACTER_CLASS => {
            return {
                'name': 'I_CHARACTER_CLASS',
                'negated': node.negated,
                'components': node.components.map((node: I_COMPONENT) =>
                    interpret(node)
                ),
            };
        },
        'I_CHARACTER_RANGE': (node: I_CHARACTER_RANGE): I_RAW_REGEX => {
            const from = ((node.from as I_RAW_REGEX).chunks[0] as I_RAW_CHARS)
                .chars;
            const to = ((node.to as I_RAW_REGEX).chunks[0] as I_RAW_CHARS)
                .chars;

            return {
                'name': 'I_RAW_REGEX',
                'chunks': [
                    {
                        'name': 'I_RAW_CHARS',
                        'chars': `${from}-${to}`,
                    },
                ],
            };
        },
        'I_MAXIMISING_QUANTIFIER': (
            node: I_MAXIMISING_QUANTIFIER,
            interpret: Interpret
        ): I_MAXIMISING_QUANTIFIER => {
            return {
                'name': 'I_MAXIMISING_QUANTIFIER',
                'component': interpret(node.component),
                'quantifier': node.quantifier,
            };
        },
        'I_MINIMISING_QUANTIFIER': (
            node: I_MINIMISING_QUANTIFIER,
            interpret: Interpret
        ): I_MINIMISING_QUANTIFIER => {
            return {
                'name': 'I_MINIMISING_QUANTIFIER',
                'component': interpret(node.component),
                'quantifier': node.quantifier,
            };
        },
        'I_NAMED_CAPTURING_GROUP': (
            node: I_NAMED_CAPTURING_GROUP,
            interpret: Interpret
        ): I_NAMED_CAPTURING_GROUP => {
            return {
                'name': 'I_NAMED_CAPTURING_GROUP',
                'groupIndex': node.groupIndex,
                'groupName': node.groupName,
                'components': node.components.map((node: I_COMPONENT) =>
                    interpret(node)
                ),
            };
        },
        'I_NON_CAPTURING_GROUP': (
            node: I_NON_CAPTURING_GROUP,
            interpret: Interpret
        ): I_NON_CAPTURING_GROUP => {
            return {
                'name': 'I_NON_CAPTURING_GROUP',
                'components': node.components.map((node: I_COMPONENT) =>
                    interpret(node)
                ),
            };
        },
        'I_NOOP': (node: I_NOOP): I_NOOP => {
            return node;
        },
        'I_NUMBERED_BACKREFERENCE': (
            node: I_NUMBERED_BACKREFERENCE
        ): I_NUMBERED_BACKREFERENCE => {
            return node;
        },
        'I_PATTERN': (node: I_PATTERN, interpret: Interpret): I_PATTERN => {
            return {
                'name': 'I_PATTERN',
                'capturingGroups': node.capturingGroups,
                'components': node.components.map((node: I_COMPONENT) =>
                    interpret(node)
                ),
            };
        },
        'I_POSSESSIVE_QUANTIFIER': (
            node: I_POSSESSIVE_QUANTIFIER,
            interpret: Interpret
        ): I_POSSESSIVE_QUANTIFIER => {
            return {
                'name': 'I_POSSESSIVE_QUANTIFIER',
                'component': interpret(node.component),
                'quantifier': node.quantifier,
            };
        },
        'I_RAW_REGEX': (node: I_RAW_REGEX): I_RAW_REGEX => {
            return node;
        },
    },
};
