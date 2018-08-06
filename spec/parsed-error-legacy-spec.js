'use strict';

const ParsedError = require('..');

describe('ParsedError (legacy)', () => {
    it('can parse regular errors', () => {
        const message = 'i am an error';
        const error = new Error(message);

        const parsedError = new ParsedError(error);

        expect(parsedError.message).toEqual(message);
        expect(parsedError.cause.stack).toEqual(error.stack);
    });

    it('can handle other error responses or return error as it', () => {
        const responseError = { response: 'i am an error response' };
        const other = 'i return as is';

        expect(new ParsedError(responseError).message).toEqual(responseError.response);
        expect(new ParsedError(other).message).toEqual(other);
    });

    it('can handle elasticsearch errors', () => {
        const msg = 'i am a elasticsearch error';
        const errorData = {
            toJSON() { return { msg }; }
        };

        expect(new ParsedError(errorData).message).toEqual(msg);
    });

    it('can return better error messages for index not found errors', () => {
        const msg = 'i am a elasticsearch error';
        const errorData = {
            toJSON() { return { msg }; },
            body: {
                error: {
                    type: 'index_not_found_exception',
                    index: 'someIndex'
                }
            }
        };
        const expectedErrorMsg = `error: index_not_found_exception, could not find index: ${errorData.body.error.index}`;
        expect(new ParsedError(errorData).message).toEqual(expectedErrorMsg);
    });

    it('can return better error messages unknown elastic search errors', () => {
        const errorData = {
            toJSON() { return { idk: true }; },
            body: {
                error: {
                    type: 'idk_error_found',
                    index: 'some_error_idk'
                }
            }
        };
        const expectedErrorMsg = `Unknown ES Error Format ${JSON.stringify(errorData)}`;
        expect(new ParsedError(errorData).message).toEqual(expectedErrorMsg);
    });

    it('can return better error messages for search errors', () => {
        const msg = 'i am a elasticsearch error';
        const cause = {
            type: 'errorType',
            index: 'someIndex',
            reason: 'justBecause'
        };
        const errorData = {
            toJSON() { return { msg }; },
            body: {
                error: {
                    type: 'search_phase_execution_exception',
                    root_cause: [cause]
                }
            }
        };
        const expectedErrorMsg = `error: ${cause.type} ${cause.reason} on index: ${cause.index}`;
        expect(new ParsedError(errorData).message).toEqual(expectedErrorMsg);
    });

    it('will truncate error messages to 5k length', () => {
        const msg = 'i am a elasticsearch error';
        let longErrorMsg = '';

        while (longErrorMsg.length < 6000) {
            longErrorMsg += 'a';
        }

        const shortError = new ParsedError(msg);
        expect(shortError.message).toEqual(msg);
        expect(shortError.message.length).toEqual(msg.length);

        const longError = new ParsedError(longErrorMsg);
        const expected = `${longErrorMsg.substring(0, 5000 - 3)}...`;

        expect(longError.message).toEqual(expected);
        expect(longError.message.length).toEqual(5000);
    });
});
