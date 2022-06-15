/*
 * PCREmu - PCRE emulation for JavaScript.
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/pcremu/
 *
 * Released under the MIT license
 * https://github.com/asmblah/pcremu/raw/master/MIT-LICENSE.txt
 */

import emulator from '../../../../src';
import { expect } from 'chai';

describe('ReactPHP real example match integration', () => {
    let pattern: string;

    describe('request line regex', () => {
        beforeEach(function () {
            // Taken from ReactPHP: https://github.com/reactphp/http/blob/9c2d98f1f5b590082faa1a74aba5549cd0107977/src/Io/RequestHeaderParser.php#L133.
            pattern =
                '^(?<method>[^ ]+) (?<target>[^ ]+) HTTP/(?<version>\\d\\.\\d)';
        });

        describe('in optimised mode', () => {
            it('should be able to match a valid request line', () => {
                const matcher = emulator.compile(pattern);

                const match = matcher.matchOne(
                    'OPTIONS /path/to/my_resource.shtml HTTP/1.1'
                );

                expect(match).not.to.be.null;
                expect(match?.getCaptureCount()).to.equal(4);
                expect(match?.getNumberedCaptures()).to.deep.equal([
                    'OPTIONS /path/to/my_resource.shtml HTTP/1.1',
                    'OPTIONS',
                    '/path/to/my_resource.shtml',
                    '1.1',
                ]);
            });
        });

        describe('in unoptimised mode', () => {
            it('should be able to match a valid request line', () => {
                const matcher = emulator.compile(pattern, {
                    optimise: false,
                });

                const match = matcher.matchOne(
                    'OPTIONS /path/to/my_resource.shtml HTTP/1.1'
                );

                expect(match).not.to.be.null;
                expect(match?.getCaptureCount()).to.equal(4);
                expect(match?.getNumberedCaptures()).to.deep.equal([
                    'OPTIONS /path/to/my_resource.shtml HTTP/1.1',
                    'OPTIONS',
                    '/path/to/my_resource.shtml',
                    '1.1',
                ]);
            });
        });
    });

    describe('request header regex', () => {
        beforeEach(function () {
            // Taken from ReactPHP:https://github.com/reactphp/http/blob/9c2d98f1f5b590082faa1a74aba5549cd0107977/src/Io/RequestHeaderParser.php#L144.
            pattern =
                '^([^()<>@,;:\\\\\\"/\\[\\]?={}\\x01-\\x20\\x7F]++):[\\x20\\x09]*+((?:[\\x20\\x09]*+[\\x21-\\x7E\\x80-\\xFF]++)*+)[\\x20\\x09]*+[\\r]?+\\n';
        });

        describe('in optimised mode', () => {
            it('should be able to match a simple valid header', () => {
                const matcher = emulator.compile(pattern);

                const match = matcher.matchOne('X-My-Header: my-value\n');

                expect(match).not.to.be.null;
                expect(match?.getCaptureCount()).to.equal(3);
                expect(match?.getNumberedCaptures()).to.deep.equal([
                    'X-My-Header: my-value\n',
                    'X-My-Header',
                    'my-value',
                ]);
            });
        });

        describe('in unoptimised mode', () => {
            it('should be able to match a simple valid header', () => {
                const matcher = emulator.compile(pattern, {
                    optimise: false,
                });

                const match = matcher.matchOne('X-My-Header: my-value\n');

                expect(match).not.to.be.null;
                expect(match?.getCaptureCount()).to.equal(3);
                expect(match?.getNumberedCaptures()).to.deep.equal([
                    'X-My-Header: my-value\n',
                    'X-My-Header',
                    'my-value',
                ]);
            });
        });
    });
});
