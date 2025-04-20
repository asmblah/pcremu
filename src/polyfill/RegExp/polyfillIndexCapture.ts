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
import Exception from '../../Exception/Exception';

export default (
    pattern: string,
    namedCapturingGroupsToIndices: { [name: string]: number },
): string => {
    let groupIndex = 0;

    pattern = pattern.replace(
        /\\(\d\d?)|((?:\\[\s\S])+)|(\[[^\]]*])|(\()(?!\?)|\((\?<([^>]+)>)/g,
        (
            all,
            backrefNumber,
            escaped,
            characterClass,
            numberedCapturingGroupPrefix,
            namedCapturingGroupPrefix,
            namedCapturingGroupName,
        ) => {
            if (escaped) {
                // Skip over any escaped characters.
                return all;
            }

            if (characterClass) {
                // Don't match parentheses inside character classes.
                return all;
            }

            if (backrefNumber) {
                // Shift all backreferences to account for the extra capture groups we're adding.
                return '\\' + (backrefNumber * 2 - 1);
            }

            if (numberedCapturingGroupPrefix) {
                groupIndex++;

                // Add a capturing group inside the numbered one to capture the rest of the string
                // that we can use to calculate the start offset.
                return '((?=([\\s\\S]*))';
            }

            if (namedCapturingGroupPrefix) {
                groupIndex++;

                // Store the corresponding index for each named capturing group.
                namedCapturingGroupsToIndices[namedCapturingGroupName] =
                    groupIndex;

                // Add a capturing group inside the named one to capture the rest of the string
                // that we can use to calculate the start offset.
                return `(${namedCapturingGroupPrefix}(?=([\\s\\S]*))`;
            }

            throw new Exception('polyfillIndexCapture() :: Unexpected state');
        },
    );

    return pattern;
};
