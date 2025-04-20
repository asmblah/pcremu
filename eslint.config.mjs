/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import buildbeltConfig from 'buildbelt/eslint.config.mjs';

export default [
    ...buildbeltConfig.map((config) =>
        Object.assign(config, {
            files: [
                '{src,test}/**/*.{js,jsx,mjs,mts,ts,tsx}',
                '*.{js,jsx,mjs,mts,ts,tsx}',
            ],
            rules: Object.assign({}, config.rules, {
                // For now, allow `any` for the untyped library APIs such as Parsing and Transpiler.
                '@typescript-eslint/no-explicit-any': 'off',
            }),
        }),
    ),
    {
        files: ['test/**/*.{js,jsx,mjs,mts,ts,tsx}'],
        rules: {
            // Allow assertion chains such as `.to.be.null`.
            '@typescript-eslint/no-unused-expressions': 'off',
        },
    },
];
