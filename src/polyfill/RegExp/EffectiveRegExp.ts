/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import RegExpPolyfill from './RegExpPolyfill';

// Avoid minification of the test regex below.
const RegExp = global.RegExp;

// Check for native support of indices - if none then use our polyfill.
const isRegExpIndicesFlagSupported = (() => {
    try {
        new RegExp('.', 'd');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return false;
    }

    return true;
})();

export default isRegExpIndicesFlagSupported ? RegExp : RegExpPolyfill;
