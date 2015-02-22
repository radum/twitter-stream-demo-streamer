'use strict';

var to_bool = function(s) {
    return s && !!s.match(/^(true|t|yes|y|1)$/i);
};

module.exports = {
    VERBOSE: to_bool(process.env.VERBOSE) || true
}
