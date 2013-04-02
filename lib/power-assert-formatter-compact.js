/**
 * power-assert.js - Empower your assertions
 *
 * https://github.com/twada/power-assert.js
 *
 * Copyright (c) 2013 Takuto Wada
 * Licensed under the MIT license.
 *   https://raw.github.com/twada/power-assert.js/master/MIT-LICENSE.txt
 */
(function (root, factory) {
    'use strict';

    if (typeof exports !== 'undefined') {
        var api = require('./power-assert-api');
        var events = require('./power-assert-event-bus');
        factory(exports, events, api);
    } else {
        factory(root._pa_, root._pa_.events, root._pa_);
    }

}(this, function (exports, events, api) {
    'use strict';

    var matrix = function (numRows, numCols, initial) {
        var mat = [], i, j, row;
        for(i = 0; i < numRows; i += 1) {
            row = [];
            for(j = 0; j < numCols; j += 1) {
                row[j] = initial;
            }
            mat[i] = row;
        }
        return mat;
    };

    var row = function (numCols, initial) {
        var row = [], j;
        for(j = 0; j < numCols; j += 1) {
            row[j] = initial;
        }
        return row;
    };

    var formatLines = function (data, line, offset, dumper) {
        if (data.length === 0) {
            return matrix(0, 0, ' ');
        }
        var buffers = matrix(data.length + offset, line.length, ' ');
        var indent = 0;
        var prev;
        data.forEach(function (cap) {
            var val = dumper(cap.value);
            if (typeof prev !== 'undefined' && prev.start <= cap.start + val.length) {
                indent += 1;
            }
            var bufOffset = indent + offset;
            for (var i = 0; i < bufOffset; i += 1) {
                buffers[i].splice(cap.start, 1, '|');
            }
            for (var i = 0; i < val.length; i += 1) {
                buffers[bufOffset].splice(cap.start + i, 1, val.charAt(i));
            }
            prev = cap;
        });
        return buffers;
    };

    var rightToLeft = function (a, b) {
        return b.start - a.start;
    };

    events.on('assert.fail', function (context) {
        var line = context.line,
            lineNumber = context.lineNumber,
            idents = context.idents,
            funcalls = context.funcalls;

        api.puts('# at line: ' + lineNumber);
        api.puts(line);
        var target = idents.concat(funcalls);
        target.sort(rightToLeft);
        formatLines(target, line, 1, api.dump).forEach(function (buffer) {
            api.puts(buffer.join(''));
        });
        api.puts('');
    });
}));