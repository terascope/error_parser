'use strict';

const _ = require('lodash');

// Convert special case errors into a human readable error msg
function parseErrorMsg(err) {
    if (!err) {
        return 'Unknown Error Occurred';
    }

    if (err.toJSON) {
        if (_.get(err, 'body.error.type') === 'index_not_found_exception') {
            return `error: index_not_found_exception, could not find index: ${err.body.error.index}`;
        }
        if (_.get(err, 'body.error.type') === 'search_phase_execution_exception') {
            const cause = _.get(err, 'body.error.root_cause[0]', {});
            return `error: ${cause.type} ${cause.reason} on index: ${cause.index}`;
        }
        const esError = err.toJSON();
        if (esError.msg) {
            return esError.msg;
        }

        return `Unknown ES Error Format ${JSON.stringify(err)}`;
    }

    if (err.response) {
        return err.response;
    }

    // in a hdfs error it can return the entire data set so we make sure to only take up to 5k chars
    return _.truncate(err, { length: 5000 });
}

module.exports = parseErrorMsg;
