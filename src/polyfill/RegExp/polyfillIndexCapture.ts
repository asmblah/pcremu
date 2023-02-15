/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

/*
 * Before every normal capturing group, add a lookahead that contains a capturing group
 * that captures the entire rest of the string. Later, we can use this to determine
 * the offset of the group that it precedes by subtracting this length from the entire input length.
 * Note that we explicitly match character classes here but return them unchanged,
 * in order to prevent any parentheses inside being recognised as a capturing group.
 */
export default (
    pattern: string,
    namedCapturingGroupsToIndices: { [name: string]: number }
): string => {
    let groupIndex = 0;

    pattern = pattern.replace(
        /((?:^|[^[(\\])(?:\\{2})+|[^[(\\]|^)(?:(\[[^\]]*])|(\(+)(?:(?!\?)|(?=\?<([^>]+)>)))|\\(\d\d?)/g,
        (
            all,
            escapePrefix,
            characterClass,
            nestedGroupOpenings,
            namedCapturingGroup,
            backrefNumber
        ) => {
            if (characterClass) {
                // Don't match parentheses inside character classes.
                return all;
            }

            if (backrefNumber) {
                // Shift all backreferences to account for the extra capture groups we're adding.
                return '\\' + backrefNumber * 2;
            }

            let result = escapePrefix;

            // Note that any named capture group will be included in this count here.
            for (let index = 0; index < nestedGroupOpenings.length; index++) {
                groupIndex += 1;

                result += '(?=([\\s\\S]*))(';
            }

            if (typeof namedCapturingGroup !== 'undefined') {
                // Store the corresponding index for each named capturing group.
                namedCapturingGroupsToIndices[namedCapturingGroup] = groupIndex;
            }

            return result;
        }
    );

    return pattern;
};
