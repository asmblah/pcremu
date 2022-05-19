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
    I_MAXIMISING_QUANTIFIER,
    I_MINIMISING_QUANTIFIER,
    I_NAMED_CAPTURING_GROUP,
    I_NON_CAPTURING_GROUP,
    I_PATTERN,
    I_POSSESSIVE_QUANTIFIER,
    I_RAW_REGEX,
} from './types/intermediateRepresentation';
import { N_NODE } from './types/ast';
import AlternativeFragment from '../Match/Fragment/AlternativeFragment';
import AlternationFragment from '../Match/Fragment/AlternationFragment';
import CapturingGroupFragment from '../Match/Fragment/CapturingGroupFragment';
import Exception from '../Exception/Exception';
import { Flags } from '../declarations/types';
import FragmentInterface from '../Match/Fragment/FragmentInterface';
import FragmentMatcher from '../Match/FragmentMatcher';
import MaximisingQuantifierFragment from '../Match/Fragment/MaximisingQuantifierFragment';
import NamedCapturingGroupFragment from '../Match/Fragment/NamedCapturingGroupFragment';
import NativeFragment from '../Match/Fragment/NativeFragment';
import NoopFragment from '../Match/Fragment/NoopFragment';
import PatternFragment from '../Match/Fragment/PatternFragment';
import QuantifierMatcher from '../Match/QuantifierMatcher';
import PossessiveQuantifierFragment from '../Match/Fragment/PossessiveQuantifierFragment';
import MinimisingQuantifierFragment from '../Match/Fragment/MinimisingQuantifierFragment';
import NonCapturingGroupFragment from '../Match/Fragment/NonCapturingGroupFragment';

type Context = {
    flags: Flags;
    fragmentMatcher: FragmentMatcher;
    quantifierMatcher: QuantifierMatcher;
};
type Interpret = (node: N_NODE, context?: object) => FragmentInterface;

/**
 * Transpiler library spec to translate a regular expression Intermediate Representation (IR)
 * to Fragment instances suitable for building a Pattern.
 */
export default {
    nodes: {
        'I_ALTERNATION': (
            node: I_ALTERNATION,
            interpret: Interpret
        ): AlternationFragment => {
            const alternativeFragments = node.alternatives.map(
                (node: I_ALTERNATIVE) => interpret(node) as AlternativeFragment
            );

            return new AlternationFragment(alternativeFragments);
        },
        'I_ALTERNATIVE': (
            node: I_ALTERNATIVE,
            interpret: Interpret,
            context: Context
        ): AlternativeFragment => {
            const componentFragments = node.components.map((node) =>
                interpret(node)
            );

            return new AlternativeFragment(
                context.fragmentMatcher,
                componentFragments
            );
        },
        'I_CAPTURING_GROUP': (
            node: I_CAPTURING_GROUP,
            interpret: Interpret,
            context: Context
        ): CapturingGroupFragment => {
            const componentFragments = node.components.map((node) =>
                interpret(node)
            );

            return new CapturingGroupFragment(
                context.fragmentMatcher,
                componentFragments,
                node.groupIndex
            );
        },
        'I_MAXIMISING_QUANTIFIER': (
            node: I_MAXIMISING_QUANTIFIER,
            interpret: Interpret,
            context: Context
        ): MaximisingQuantifierFragment => {
            const componentFragment = interpret(node.component);
            const { minimumMatches, maximumMatches } =
                context.quantifierMatcher.parseQuantifier(node.quantifier);

            return new MaximisingQuantifierFragment(
                context.fragmentMatcher,
                context.quantifierMatcher,
                componentFragment,
                minimumMatches,
                maximumMatches
            );
        },
        'I_MINIMISING_QUANTIFIER': (
            node: I_MINIMISING_QUANTIFIER,
            interpret: Interpret,
            context: Context
        ): MinimisingQuantifierFragment => {
            const componentFragment = interpret(node.component);
            const { minimumMatches, maximumMatches } =
                context.quantifierMatcher.parseQuantifier(node.quantifier);

            return new MinimisingQuantifierFragment(
                context.fragmentMatcher,
                context.quantifierMatcher,
                componentFragment,
                minimumMatches,
                maximumMatches
            );
        },
        'I_NAMED_CAPTURING_GROUP': (
            node: I_NAMED_CAPTURING_GROUP,
            interpret: Interpret,
            context: Context
        ): NamedCapturingGroupFragment => {
            const componentFragments = node.components.map((node) =>
                interpret(node)
            );

            return new NamedCapturingGroupFragment(
                context.fragmentMatcher,
                componentFragments,
                node.groupIndex,
                node.groupName
            );
        },
        'I_NON_CAPTURING_GROUP': (
            node: I_NON_CAPTURING_GROUP,
            interpret: Interpret,
            context: Context
        ): NonCapturingGroupFragment => {
            const componentFragments = node.components.map((node) =>
                interpret(node)
            );

            return new NonCapturingGroupFragment(
                context.fragmentMatcher,
                componentFragments
            );
        },
        'I_NOOP': (): NoopFragment => {
            return new NoopFragment();
        },
        'I_PATTERN': (
            node: I_PATTERN,
            interpret: Interpret
        ): PatternFragment => {
            const fragmentMatcher = new FragmentMatcher();
            const quantifierMatcher = new QuantifierMatcher(fragmentMatcher);
            const context = { fragmentMatcher, quantifierMatcher };

            const componentFragments = node.components.map((node) =>
                interpret(node, context)
            );

            return new PatternFragment(
                fragmentMatcher,
                componentFragments,
                node.capturingGroups
            );
        },
        'I_POSSESSIVE_QUANTIFIER': (
            node: I_POSSESSIVE_QUANTIFIER,
            interpret: Interpret,
            context: Context
        ): PossessiveQuantifierFragment => {
            const componentFragment = interpret(node.component);
            const { minimumMatches, maximumMatches } =
                context.quantifierMatcher.parseQuantifier(node.quantifier);

            return new PossessiveQuantifierFragment(
                context.quantifierMatcher,
                componentFragment,
                minimumMatches,
                maximumMatches
            );
        },
        'I_RAW_REGEX': (
            node: I_RAW_REGEX,
            interpret: Interpret,
            context: Context
        ): NativeFragment => {
            if (node.chunks.length !== 1) {
                throw new Exception(
                    'Only a single I_RAW_CHARS or I_RAW_OPTIMISED I_RAW_CHUNK is expected at this point'
                );
            }

            const optimisedNode = node.chunks[0];

            if (optimisedNode.name === 'I_RAW_CHARS') {
                // Unoptimised I_RAW_CHARS provides no pattern-to-emulated-group-index map,
                // as no native capturing groups should have been output that would require mapping.
                return new NativeFragment(
                    optimisedNode.chars,
                    [],
                    context.flags
                );
            }

            if (optimisedNode.name === 'I_RAW_OPTIMISED') {
                return new NativeFragment(
                    optimisedNode.chars,
                    optimisedNode.patternToEmulatedNumberedGroupIndex,
                    context.flags
                );
            }

            // compileRawPass will compile any complex trees inside I_RAW_REGEX from accelerateRawPass
            // to a single I_RAW_OPTIMISED chunk.
            throw new Exception(
                'Only plain I_RAW_CHARS or I_RAW_OPTIMISED are expected at this point - ' +
                    'did you forget to run compileRawPass?'
            );
        },
    },
};
