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

const isRegExpIndicesFlagSupported = (() => {
    try {
        new RegExp('.', 'd');
    } catch (error) {
        return false;
    }

    return true;
})();

export default isRegExpIndicesFlagSupported ? RegExp : RegExpPolyfill;
