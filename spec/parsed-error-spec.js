'use strict';

const ParsedError = require('../lib/parsed-error');

describe('ParsedError', () => {
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

            it('should have a fullStack property that matches the stack property', () => {
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

            it('should have a fullStack property that matches the stack property', () => {
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

            it('should have a fullStack property that contains two stacks', () => {
                expect(error.fullStack).toEqual(`${error.stack}\nCaused by: ${cause.stack}`);
            });
        });
    });
});
