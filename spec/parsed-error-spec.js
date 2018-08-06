'use strict';

const ParsedError = require('../lib/parsed-error');

describe('ParsedError', () => {
    describe('when constructed with nothing', () => {
        it('should a "Unknown Error Occurred" error', () => {
            expect(new ParsedError().toString()).toEqual('ParsedError: Unknown Error Occurred');
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

            it('should have fullStack property that equals the stack message', () => {
                expect(error.fullStack).toEqual(error.stack);
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

            it('should have fullStack property that equals the stack message', () => {
                expect(error.fullStack).toEqual(error.stack);
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

            it('should have a stack property that contains two stacks', () => {
                expect(error.fullStack).toEqual(`${error.stack}\nCaused by: ${cause.stack}`);
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
                    cause,
                    info: {
                        example: 'howdy',
                    }
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

            it('should have a fullStack property that contains one stack and a toString error', () => {
                expect(error.fullStack).toEqual(`${error.stack}, caused by: ${cause2.toString()}, caused by: ${cause.toString()}`);
            });
        });
    });

    describe('when it is a user-error', () => {
        describe('when called with just a string', () => {
            let error;

            beforeAll(() => {
                error = new ParsedError('Bad news bears', { userError: true });
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

            it('should not have a cause', () => {
                expect(error.cause).toBeFalsy();
            });

            it('should have an empty object for info', () => {
                expect(error.info).toEqual({});
            });

            it('should have fullStack property that equals error.toString()', () => {
                expect(error.fullStack).toEqual(error.toString());
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

            it('should have a fullStack property that containg just the error messages', () => {
                expect(error.fullStack).toEqual(`${error.toString()}, caused by: ${cause.toString()}`);
            });
        });
    });
});
