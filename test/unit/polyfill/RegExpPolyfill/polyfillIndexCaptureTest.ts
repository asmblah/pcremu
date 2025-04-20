/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import { expect } from 'chai';
import polyfillIndexCapture from '../../../../src/polyfill/RegExp/polyfillIndexCapture';

describe('polyfillIndexCapture()', () => {
    it('should correctly transform a pattern with no capturing groups', () => {
        const namedGroupsToIndices = {};

        const result = polyfillIndexCapture('hello', namedGroupsToIndices);

        expect(result).to.equal('hello');
        expect(namedGroupsToIndices).to.deep.equal({});
    });

    it('should correctly transform a pattern with one numbered capturing group', () => {
        const namedGroupsToIndices = {};

        const result = polyfillIndexCapture('h(el)lo', namedGroupsToIndices);

        expect(result).to.equal('h((?=([\\s\\S]*))el)lo');
        expect(namedGroupsToIndices).to.deep.equal({});
    });

    it('should correctly transform a pattern with one numbered capturing group and backreference', () => {
        const namedGroupsToIndices = {};

        const result = polyfillIndexCapture('h(el)l\\1o', namedGroupsToIndices);

        expect(result).to.equal('h((?=([\\s\\S]*))el)l\\1o');
        expect(namedGroupsToIndices).to.deep.equal({});
    });

    it('should correctly transform a pattern with two numbered capturing groups and escaped backreference', () => {
        const namedGroupsToIndices = {};

        const result = polyfillIndexCapture(
            'h(e(l))l\\\\2o',
            namedGroupsToIndices,
        );

        expect(result).to.equal('h((?=([\\s\\S]*))e((?=([\\s\\S]*))l))l\\\\2o');
        expect(namedGroupsToIndices).to.deep.equal({});
    });

    it('should correctly transform a pattern with two adjacent numbered capturing groups', () => {
        const namedGroupsToIndices = {};

        const result = polyfillIndexCapture('h(el)(l)o', namedGroupsToIndices);

        expect(result).to.equal('h((?=([\\s\\S]*))el)((?=([\\s\\S]*))l)o');
        expect(namedGroupsToIndices).to.deep.equal({});
    });

    it('should correctly transform a pattern with two adjacent numbered capturing groups and backreferences', () => {
        const namedGroupsToIndices = {};

        const result = polyfillIndexCapture(
            'h(el)(l)o\\1and\\2',
            namedGroupsToIndices,
        );

        expect(result).to.equal(
            'h((?=([\\s\\S]*))el)((?=([\\s\\S]*))l)o\\1and\\3',
        );
        expect(namedGroupsToIndices).to.deep.equal({});
    });

    it('should correctly transform a pattern with two numbered capturing groups, one immediately following a backreference', () => {
        const namedGroupsToIndices = {};

        const result = polyfillIndexCapture(
            'he(l)\\1(o)',
            namedGroupsToIndices,
        );

        expect(result).to.equal('he((?=([\\s\\S]*))l)\\1((?=([\\s\\S]*))o)');
        expect(namedGroupsToIndices).to.deep.equal({});
    });

    it('should correctly transform a pattern with three adjacent numbered capturing groups and backreferences', () => {
        const namedGroupsToIndices = {};

        const result = polyfillIndexCapture(
            'h(el)(l)(o)\\1and\\2then\\3',
            namedGroupsToIndices,
        );

        expect(result).to.equal(
            'h((?=([\\s\\S]*))el)((?=([\\s\\S]*))l)((?=([\\s\\S]*))o)\\1and\\3then\\5',
        );
        expect(namedGroupsToIndices).to.deep.equal({});
    });

    it('should correctly transform a pattern with two numbered capturing groups, one nested inside the other', () => {
        const namedGroupsToIndices = {};

        const result = polyfillIndexCapture('h(e(l))lo', namedGroupsToIndices);

        expect(result).to.equal('h((?=([\\s\\S]*))e((?=([\\s\\S]*))l))lo');
        expect(namedGroupsToIndices).to.deep.equal({});
    });

    it('should correctly transform a pattern with two numbered capturing groups, one nested immediately inside the other and backreferences', () => {
        const namedGroupsToIndices = {};

        const result = polyfillIndexCapture(
            '(h)((e)l)lo \\1 and \\2 and \\3',
            namedGroupsToIndices,
        );

        expect(result).to.equal(
            '((?=([\\s\\S]*))h)((?=([\\s\\S]*))((?=([\\s\\S]*))e)l)lo \\1 and \\3 and \\5',
        );
        expect(namedGroupsToIndices).to.deep.equal({});
    });

    it('should correctly transform a pattern with three numbered capturing groups, one nested inside the other and backreferences', () => {
        const namedGroupsToIndices = {};

        const result = polyfillIndexCapture(
            '(h)(e(l))lo \\1 and \\2 and \\3',
            namedGroupsToIndices,
        );

        expect(result).to.equal(
            '((?=([\\s\\S]*))h)((?=([\\s\\S]*))e((?=([\\s\\S]*))l))lo \\1 and \\3 and \\5',
        );
        expect(namedGroupsToIndices).to.deep.equal({});
    });

    it('should correctly transform a pattern with one named capturing group', () => {
        const namedGroupsToIndices = {};

        const result = polyfillIndexCapture(
            'h(?<myGroup>el)lo',
            namedGroupsToIndices,
        );

        expect(result).to.equal('h(?<myGroup>(?=([\\s\\S]*))el)lo');
        expect(namedGroupsToIndices).to.deep.equal({ myGroup: 1 });
    });

    it('should correctly transform a pattern with two adjacent named capturing groups', () => {
        const namedGroupsToIndices = {};

        const result = polyfillIndexCapture(
            'h(?<myGroup>el)(?<yourGroup>l)o',
            namedGroupsToIndices,
        );

        expect(result).to.equal(
            'h(?<myGroup>(?=([\\s\\S]*))el)(?<yourGroup>(?=([\\s\\S]*))l)o',
        );
        expect(namedGroupsToIndices).to.deep.equal({
            myGroup: 1,
            yourGroup: 2,
        });
    });

    it('should correctly transform a pattern with two named capturing groups, one nested inside the other', () => {
        const namedGroupsToIndices = {};

        const result = polyfillIndexCapture(
            'h(?<myGroup>e(?<yourGroup>l))lo',
            namedGroupsToIndices,
        );

        expect(result).to.equal(
            'h(?<myGroup>(?=([\\s\\S]*))e(?<yourGroup>(?=([\\s\\S]*))l))lo',
        );
        expect(namedGroupsToIndices).to.deep.equal({
            myGroup: 1,
            yourGroup: 2,
        });
    });

    it('should correctly not transform escaped groups and backreferences', () => {
        const namedGroupsToIndices = {};

        const result = polyfillIndexCapture(
            'h\\(?<myGroup>e\\(l))lo \\\\2',
            namedGroupsToIndices,
        );

        expect(result).to.equal('h\\(?<myGroup>e\\(l))lo \\\\2');
        expect(namedGroupsToIndices).to.deep.equal({});
    });
});
