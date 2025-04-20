/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import Exception from '../Exception/Exception';
import { Quantifier } from '../declarations/types';

/**
 * Parses quantifier strings.
 */
export default class QuantifierParser {
    /**
     * Parses the given quantifier string to a Quantifier object.
     *
     * @param {string} quantifier
     */
    parseQuantifier(quantifier: string): Quantifier {
        let min: number;
        let max: number;

        switch (quantifier) {
            case '?':
                min = 0;
                max = 1;
                break;
            case '*':
                min = 0;
                max = Infinity;
                break;
            case '+':
                min = 1;
                max = Infinity;
                break;
            default: {
                const match = quantifier.match(/\{(\d+)?(,)?(\d+)?}/);

                if (match === null) {
                    throw new Exception(
                        `Unsupported quantifier "${quantifier}"`,
                    );
                }

                // Note that the default minimum is zero and not null.
                min = typeof match[1] !== 'undefined' ? Number(match[1]) : 0;

                if (match[2] === ',') {
                    max =
                        typeof match[3] !== 'undefined'
                            ? Number(match[3])
                            : Infinity;
                } else {
                    max = min;
                }
            }
        }

        return { min, max, raw: quantifier };
    }
}
