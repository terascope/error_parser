'use strict';

const _ = require('lodash');
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
            this._cause = message;
        }

        this.name = _.get(options, 'name', 'ParsedError');
        this._info = _.get(options, 'info', {});
        this.statusCode = _.get(options, 'statusCode', 500);
        this._userError = _.get(options, 'userError', false);
        this._cause = _.get(options, 'cause', this._cause);
    }

    get cause() {
        return this._cause;
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

    get fullStack() {
        let fullStack = this.stack;

        const buildStack = (error) => {
            if (error.userError) {
                fullStack += `\nCaused by: ${error.toString()}`;
            } else {
                fullStack += `\nCaused by: ${error.stack}`;
            }
            if (error.cause) {
                buildStack(error.cause);
            }
        };

        if (this.cause) {
            buildStack(this.cause);
        }

        return fullStack;
    }
}

module.exports = ParsedError;
