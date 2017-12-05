'use strict';

const _ = require('lodash');

module.exports = function parseError(err) {
    if (err.toJSON) {
        if (_.get(err, 'body.error.type') === 'index_not_found_exception') {
            return `error: index_not_found_exception, could not find index: ${err.body.error.index}`
        }
        if (_.get(err, 'body.error.type') === 'search_phase_execution_exception') {
            const cause = _.get(err, 'body.error.root_cause[0]', {});
            return `error: ${cause.type} ${cause.reason} on index: ${cause.index}`
        }
        const esError = err.toJSON();
        if (esError.msg) {
            return esError.msg;
        }
        else {
            return "Unknown ES Error Format " + JSON.stringify(err);
        }
    }
    if (err.stack) {
        return err.stack
    }
    if (err.response){
        return err.response;
    }
    // in a hdfs error it can return the entire data set so we make sure to only take up to 5k chars
    return err.length >= 5000 ? `${err.slice(0,5000)} ...` : err;
};