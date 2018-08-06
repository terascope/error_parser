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
        this._parsed = true;
        this._info = _.get(options, 'info', {});
        this._statusCode = _.get(options, 'statusCode');
        this._userError = _.get(options, 'userError');
        this._cause = _.get(options, 'cause');
    }

    get cause() {
        return this._cause || this._error;
    }

    get causes() {
        const causes = [];

        const format = (err, minimal) => {
            if (minimal || err.userError) {
                return `${err.name}: ${err.message}`;
            }
            return err.stack;
        };

        const add = (err, _minimal) => {
            if (!err) return;
            const minimal = _minimal || err.userError;
            if (err) causes.push(format(err, minimal));
            if (err.cause) add(err.cause, minimal);
        };

        add(this.cause, this.userError);

        return causes;
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

    toString() {
        const toMinimal = err => `${err.name}: ${err.message}`;
        const toStack = err => err.stack;
        let fullStack = this.userError ? toMinimal(this) : toStack(this);

        const buildStack = (error, _minimal) => {
            const minimal = _minimal || error.userError;
            if (minimal) {
                fullStack += `, caused by, ${toMinimal(error)}`;
            } else {
                fullStack += `\nCaused by: ${toStack(error)}`;
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

    toJSON() {
        if (this.userError) {
            return {
                info: this.info,
                name: this.name,
                message: this.message,
                statusCode: this.statusCode,
                causes: this.causes,
            };
        }

        return {
            info: this.info,
            name: this.name,
            message: this.message,
            stack: this.stack,
            statusCode: this.statusCode,
            causes: this.causes,
        };
    }
}

module.exports = ParsedError;
