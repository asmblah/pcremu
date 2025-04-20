/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import FragmentInterface from './FragmentInterface';
import FragmentMatch from '../FragmentMatch';
import FragmentMatchInterface from '../FragmentMatchInterface';

/**
 * Represents a part of a matcher pattern that does nothing; may be the result of an optimisation.
 */
export default class NoopFragment implements FragmentInterface {
    /**
     * @inheritDoc
     */
    getFixedLength(): number | null {
        return 0;
    }

    /**
     * @inheritDoc
     */
    match(subject: string, position: number): FragmentMatchInterface | null {
        return new FragmentMatch(position);
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return '';
    }

    /**
     * @inheritDoc
     */
    toStructure(): object {
        return {
            type: 'noop',
        };
    }
}
