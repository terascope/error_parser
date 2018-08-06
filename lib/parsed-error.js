'use strict';

const _ = require('lodash');
const { STATUS_CODES } = require('http');
const parseErrorMsg = require('./parse-error-msg');

class ParsedError extends Error {
    /**
     * Create a Parsed Error object
     * @param {(string|Error)} message an error message, this message will be parsed
     * @param {object} [options]
     * @param {(string|Error|object)} [options.cause] an error to inherit context from
     * @param {string} [options.name] defaults to "ParsedError"
     * @param {object} [options.info] any additional public error info
     * @param {number} [options.statusCode] an HTTP status code
     * @param {boolean} [options.userError] an indication to expose minimal error information
     */
    constructor(message, options) {
        super(parseErrorMsg(message));

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        if (_.isError(message)) {
            this._error = message;
        }

        this.name = _.get(options, 'name', 'ParsedError');
        this._info = _.get(options, 'info', {});
        this._statusCode = _.get(options, 'statusCode');
        this._userError = _.get(options, 'userError');
        this._cause = _.get(options, 'cause');
    }

    get cause() {
        return this._cause || this._error;
    }

    get info() {
        const info = [];

        const buildInfo = (error) => {
            if (error._info) {
                info.unshift(error._info);
            }

            if (error.cause) {
                buildInfo(error.cause);
            }
        };

        buildInfo(this);

        return Object.assign({}, ...info);
    }

    get userError() {
        return this._userError || this._statusCode < 500;
    }

    get statusCode() {
        if (STATUS_CODES[this._statusCode]) return this._statusCode;
        if (this._userError) return 400;
        return 500;
    }

    get fullStack() {
        let fullStack = this.userError ? this.toString() : this.stack;

        const buildStack = (error, _minimal) => {
            const minimal = _minimal || error.userError;
            if (minimal) {
                fullStack += `, caused by: ${error.toString()}`;
            } else {
                fullStack += `\nCaused by: ${error.stack}`;
            }
            if (error.cause) {
                buildStack(error.cause, minimal);
            }
        };

        if (this.cause) {
            buildStack(this.cause, this.userError);
        }

        return fullStack;
    }
}

module.exports = ParsedError;
