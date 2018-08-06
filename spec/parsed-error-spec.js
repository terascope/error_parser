'use strict';

const ParsedError = require('../lib/parsed-error');

describe('ParsedError', () => {
    describe('when constructed with nothing', () => {
        it('should a "Unknown Error Occurred" error', () => {
            expect(new ParsedError().toString()).toMatch('ParsedError: Unknown Error Occurred');
        });
    });

    describe('when it is not a user-error', () => {
        describe('when called with just a string', () => {
            let error;

            beforeAll(() => {
                error = new ParsedError('Bad news bears');
            });

            it('should have the default name', () => {
                expect(error.name).toEqual('ParsedError');
            });

            it('should contain the message in the stack', () => {
                expect(error.stack).toMatch('Bad news bears');
            });

            it('should have the correct message', () => {
                expect(error.message).toMatch('Bad news bears');
            });

            it('should not be a user error', () => {
                expect(error.statusCode).toEqual(500);
                expect(error.userError).toEqual(false);
            });

            it('should not have a cause', () => {
                expect(error.cause).toBeFalsy();
            });

            it('should have an empty object for info', () => {
                expect(error.info).toEqual({});
            });

            it('should convert into a string that equals the stack message', () => {
                expect(error.toString()).toEqual(error.stack);
            });

            it('should convert into JSON', () => {
                expect(error.toJSON()).toEqual({
                    info: error.info,
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                    statusCode: error.statusCode,
                    causes: []
                });
            });
        });

        describe('when called a string and options', () => {
            let error;

            beforeAll(() => {
                error = new ParsedError('Bad news bears', {
                    name: 'ExampleError',
                    info: {
                        example: true,
                    },
                });
            });

            it('should have the default name', () => {
                expect(error.name).toEqual('ExampleError');
            });

            it('should contain the message in the stack', () => {
                expect(error.stack).toMatch('Bad news bears');
            });

            it('should have the correct message', () => {
                expect(error.message).toMatch('Bad news bears');
            });

            it('should not be a user error', () => {
                expect(error.statusCode).toEqual(500);
                expect(error.userError).toEqual(false);
            });

            it('should not have a cause', () => {
                expect(error.cause).toBeFalsy();
            });

            it('should contain the info properties', () => {
                expect(error.info).toEqual({ example: true });
            });

            it('should convert into a string that equals the stack message', () => {
                expect(error.toString()).toEqual(error.stack);
            });

            it('should convert into JSON', () => {
                expect(error.toJSON()).toEqual({
                    info: error.info,
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                    statusCode: error.statusCode,
                    causes: []
                });
            });
        });

        describe('when a called with a cause', () => {
            let error;
            let cause;

            beforeAll(() => {
                cause = new ParsedError('Hello there!', {
                    info: {
                        example: 'hello',
                        other: true,
                    }
                });

                error = new ParsedError('Bad news bears', {
                    cause,
                    info: {
                        example: 'hi',
                        stuff: true
                    }
                });
            });

            it('should have the default name', () => {
                expect(error.name).toEqual('ParsedError');
            });

            it('should contain the message in the stack', () => {
                expect(error.stack).toMatch('Bad news bears');
            });

            it('should have the correct message', () => {
                expect(error.message).toMatch('Bad news bears');
            });

            it('should not be a user error', () => {
                expect(error.statusCode).toEqual(500);
                expect(error.userError).toEqual(false);
            });

            it('should have a cause', () => {
                expect(error.cause.message).toEqual(cause.message);
            });

            it('should contain the info properties', () => {
                expect(error.info).toEqual({
                    example: 'hi',
                    stuff: true,
                    other: true,
                });
            });

            it('should convert into a string that contains two stacks', () => {
                expect(error.toString()).toEqual(`${error.stack}\nCaused by: ${cause.stack}`);
            });

            it('should convert into JSON', () => {
                expect(error.toJSON()).toEqual({
                    info: error.info,
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                    statusCode: error.statusCode,
                    causes: [
                        cause.stack,
                    ]
                });
            });
        });

        describe('when a called with a user error cause', () => {
            let error;
            let cause;
            let cause2;

            beforeAll(() => {
                cause = new ParsedError('Hello there!', {
                    info: {
                        example: 'hello',
                        other: true,
                    }
                });

                cause2 = new ParsedError('Howdy there!', {
                    userError: true,
                    cause
                });

                error = new ParsedError('Bad news bears', {
                    cause: cause2,
                    info: {
                        example: 'hi',
                        stuff: true
                    }
                });
            });

            it('should have the default name', () => {
                expect(error.name).toEqual('ParsedError');
            });

            it('should contain the message in the stack', () => {
                expect(error.stack).toMatch('Bad news bears');
            });

            it('should have the correct message', () => {
                expect(error.message).toMatch('Bad news bears');
            });

            it('should not be a user error', () => {
                expect(error.statusCode).toEqual(500);
                expect(error.userError).toEqual(false);
            });

            it('should have a user error cause', () => {
                expect(error.cause.message).toEqual(cause2.message);
                expect(error.cause.statusCode).toEqual(400);
                expect(error.cause.userError).toEqual(true);
            });

            it('should have a nested non-user error cause', () => {
                expect(error.cause.cause.message).toEqual(cause.message);
                expect(error.cause.cause.statusCode).toEqual(500);
                expect(error.cause.cause.userError).toEqual(false);
            });

            it('should contain the info properties', () => {
                expect(error.info).toEqual({
                    example: 'hi',
                    stuff: true,
                    other: true,
                });
            });

            it('should convert into a string contains one stack and a toString error', () => {
                expect(error.toString()).toEqual(`${error.stack}, caused by, ${cause2.name}: ${cause2.message}, caused by, ${cause.name}: ${cause.message}`);
            });

            it('should convert into JSON', () => {
                expect(error.toJSON()).toEqual({
                    info: error.info,
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                    statusCode: error.statusCode,
                    causes: [
                        `${cause2.name}: ${cause2.message}`,
                        `${cause.name}: ${cause.message}`,
                    ]
                });
            });
        });
    });

    describe('when it is a user-error', () => {
        describe('when called with a status code', () => {
            let error;

            beforeAll(() => {
                error = new ParsedError('Bad news bears', {
                    statusCode: 422,
                });
            });

            it('should have the default name', () => {
                expect(error.name).toEqual('ParsedError');
            });

            it('should contain the message in the stack', () => {
                expect(error.stack).toMatch('Bad news bears');
            });

            it('should have the correct message', () => {
                expect(error.message).toMatch('Bad news bears');
            });

            it('should be a user error', () => {
                expect(error.statusCode).toEqual(422);
                expect(error.userError).toEqual(true);
            });

            it('should not have a cause', () => {
                expect(error.cause).toBeFalsy();
            });

            it('should have an empty object for info', () => {
                expect(error.info).toEqual({});
            });

            it('should convert into a string that equals error.toString()', () => {
                expect(error.toString()).toEqual(`${error.name}: ${error.message}`);
            });

            it('should convert into JSON', () => {
                expect(error.toJSON()).toEqual({
                    info: error.info,
                    name: error.name,
                    message: error.message,
                    statusCode: error.statusCode,
                    causes: []
                });
            });
        });

        describe('when a called with a non-user error cause', () => {
            let error;
            let cause;

            beforeAll(() => {
                cause = new ParsedError('Hello there!', {
                    info: {
                        example: 'hello',
                        other: true,
                    }
                });

                error = new ParsedError('Bad news bears', {
                    userError: true,
                    cause,
                    info: {
                        example: 'hi',
                        stuff: true
                    }
                });
            });

            it('should have the default name', () => {
                expect(error.name).toEqual('ParsedError');
            });

            it('should contain the message in the stack', () => {
                expect(error.stack).toMatch('Bad news bears');
            });

            it('should have the correct message', () => {
                expect(error.message).toMatch('Bad news bears');
            });

            it('should be a user error', () => {
                expect(error.statusCode).toEqual(400);
                expect(error.userError).toEqual(true);
            });

            it('should not have a user error cause', () => {
                expect(error.cause.statusCode).toEqual(500);
                expect(error.cause.userError).toEqual(false);
            });

            it('should have a cause', () => {
                expect(error.cause.message).toEqual(cause.message);
            });

            it('should contain the info properties', () => {
                expect(error.info).toEqual({
                    example: 'hi',
                    stuff: true,
                    other: true,
                });
            });

            it('should convert into a string that contains just the error messages', () => {
                expect(error.toString()).toEqual(`${error.name}: ${error.message}, caused by, ${cause.name}: ${cause.message}`);
            });

            it('should convert into JSON', () => {
                expect(error.toJSON()).toEqual({
                    info: error.info,
                    name: error.name,
                    message: error.message,
                    statusCode: error.statusCode,
                    causes: [
                        `${cause.name}: ${cause.message}`,
                    ]
                });
            });
        });
    });
});
