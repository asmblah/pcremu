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
    I_NON_CAPTURING_GROUP,
    I_NUMBERED_BACKREFERENCE,
    I_PATTERN,
    I_POSSESSIVE_QUANTIFIER,
    I_RAW_CHARS,
    I_RAW_REGEX,
} from './types/intermediateRepresentation';
import { N_NODE } from './types/ast';
import AlternativeFragment from '../Match/Fragment/AlternativeFragment';
import AlternationFragment from '../Match/Fragment/AlternationFragment';
import CapturingGroupFragment from '../Match/Fragment/CapturingGroupFragment';
import CharacterClassFragment from '../Match/Fragment/CharacterClassFragment';
import Exception from '../Exception/Exception';
import { Flags } from '../declarations/types';
import FragmentInterface from '../Match/Fragment/FragmentInterface';
import FragmentMatcher from '../Match/FragmentMatcher';
import LookaheadFragment from '../Match/Fragment/LookaheadFragment';
import LookbehindFragment from '../Match/Fragment/LookbehindFragment';
import { LookaroundDirection } from '../Pattern/LookaroundDirection';
import MaximisingQuantifierFragment from '../Match/Fragment/MaximisingQuantifierFragment';
import MinimisingQuantifierFragment from '../Match/Fragment/MinimisingQuantifierFragment';
import NamedCapturingGroupFragment from '../Match/Fragment/NamedCapturingGroupFragment';
import NativeFragment from '../Match/Fragment/NativeFragment';
import NonCapturingGroupFragment from '../Match/Fragment/NonCapturingGroupFragment';
import NoopFragment from '../Match/Fragment/NoopFragment';
import NumberedBackreferenceFragment from '../Match/Fragment/NumberedBackreferenceFragment';
import PatternFragment from '../Match/Fragment/PatternFragment';
import PossessiveQuantifierFragment from '../Match/Fragment/PossessiveQuantifierFragment';
import QuantifierMatcher from '../Match/QuantifierMatcher';

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
        'I_CHARACTER_CLASS': (
            node: I_CHARACTER_CLASS,
            interpret: Interpret
        ): CharacterClassFragment => {
            const componentFragments = node.components.map((node) =>
                interpret(node)
            );

            return new CharacterClassFragment(componentFragments, node.negated);
        },
        'I_CHARACTER_RANGE': (node: I_CHARACTER_RANGE): NativeFragment => {
            const from = ((node.from as I_RAW_REGEX).chunks[0] as I_RAW_CHARS)
                .chars;
            const to = ((node.to as I_RAW_REGEX).chunks[0] as I_RAW_CHARS)
                .chars;

            return new NativeFragment(`[${from}-${to}]`, 1);
        },
        'I_LOOKAROUND': (
            node: I_LOOKAROUND,
            interpret: Interpret,
            context: Context
        ): FragmentInterface => {
            const componentFragments = node.components.map((node) =>
                interpret(node)
            );

            return node.direction === LookaroundDirection.Ahead
                ? new LookaheadFragment(
                      context.fragmentMatcher,
                      componentFragments,
                      node.bivalence
                  )
                : new LookbehindFragment(
                      context.fragmentMatcher,
                      componentFragments,
                      node.bivalence
                  );
        },
        'I_MAXIMISING_QUANTIFIER': (
            node: I_MAXIMISING_QUANTIFIER,
            interpret: Interpret,
            context: Context
        ): MaximisingQuantifierFragment => {
            const componentFragment = interpret(node.component);

            return new MaximisingQuantifierFragment(
                context.quantifierMatcher,
                componentFragment,
                node.quantifier.min,
                node.quantifier.max
            );
        },
        'I_MINIMISING_QUANTIFIER': (
            node: I_MINIMISING_QUANTIFIER,
            interpret: Interpret,
            context: Context
        ): MinimisingQuantifierFragment => {
            const componentFragment = interpret(node.component);

            return new MinimisingQuantifierFragment(
                context.quantifierMatcher,
                componentFragment,
                node.quantifier.min,
                node.quantifier.max
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
        'I_NUMBERED_BACKREFERENCE': (
            node: I_NUMBERED_BACKREFERENCE
        ): NumberedBackreferenceFragment => {
            return new NumberedBackreferenceFragment(node.number);
        },
        'I_PATTERN': (
            node: I_PATTERN,
            interpret: Interpret,
            context: Context
        ): PatternFragment => {
            const componentFragments = node.components.map((node) =>
                interpret(node, context)
            );

            return new PatternFragment(
                context.fragmentMatcher,
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

            return new PossessiveQuantifierFragment(
                context.quantifierMatcher,
                componentFragment,
                node.quantifier.min,
                node.quantifier.max
            );
        },
        'I_RAW_REGEX': (
            node: I_RAW_REGEX,
            _interpret: Interpret,
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
                    node.fixedLength,
                    {},
                    context.flags
                );
            }

            if (optimisedNode.name === 'I_RAW_OPTIMISED') {
                return new NativeFragment(
                    optimisedNode.chars,
                    node.fixedLength,
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
