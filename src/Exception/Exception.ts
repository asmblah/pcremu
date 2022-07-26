/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

export default class Exception extends Error {
    constructor(message?: string) {
        super(message);

        // As we are extending a builtin, the superconstructor call above will return a new Error instance -
        // we need to adjust that new instance's prototype chain to extend our custom error class.
        Object.setPrototypeOf(this, Exception.prototype);
    }
}
