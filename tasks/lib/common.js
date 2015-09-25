'use strict';

require('./check-deps');

var chalk = require('chalk'),
    inquirer = require('inquirer');

var CommonUtil = {};

CommonUtil.header = function(grunt, msg, color) {
  msg = color ? chalk[color](msg) : msg;
  var line = Array(msg.length + 1).join('-');
  line = color ? chalk[color](line) : line;

  grunt.log.subhead(msg);
  grunt.log.writeln(line);
};

CommonUtil.createPrompt = function(input, options) {
  options = options || {};

  var prompt = {
    name: input.key,
    message: input.label,
    type: 'input'
  };

  if(input.description) {
    prompt.message += ' [' + input.description + ']';
  }

  // Required
  if(input.required) {
    prompt.message = prompt.message + '*';
    if(options.validateRequired) {
      prompt.validate = function(item) {
        return !!item;
      };
    }
  }

  // Select type
  if(input.type === 'select') {
    prompt.type = 'list';
    if(input.input_options) {
      prompt.choices = input.input_options.map(function(choice) {
        return {
          name: choice.label,
          value: choice.value
        };
      });
      if(!input.required || !options.validateRequired) {
        prompt.choices.unshift({
          name: '(none)',
          value: ''
        });
      }
    }

  } else if(input.type === 'dictionary') {
    // A dictionary prompt.
    prompt.message += '\n  - Enter \'key=value\' pairs separated by \'&\'.\n  - To use \'=\' or \'&\' in a key or value, precede with \'\\\'.';

  } else if(input.type === 'datetime') {
    prompt.message += ' ⌚ ';

  } else if(input.type === 'boolean') {
    prompt.message += ' ☯ ';
  }

  prompt.message = prompt.message += ':';

  if(input.default) {
    prompt.default = input.default;
  }

  return prompt;
};

CommonUtil.promptFields = function(inputs, options, cb) {
  if(arguments.length === 2) {
    cb = options;
    options = {};
  }

  if(!('validateRequired' in options)) {
    options.validateRequired = true;
  }

  // Loop through, keeping track of where we are
  // in the input list. This is so we can modify
  // the inputs in-place, if necessary.
  var i = 0,
      limit = inputs.length;

  var results = {};

  function doPrompt() {
    if(i === limit) {
      return cb(null, results);
    }

    var input = inputs[i];
    var prompt = CommonUtil.createPrompt(input, options);

    var progress = function(results, cb) { cb(); };

    prompt.before = input.before || progress;
    prompt.after = input.after || progress;

    var next = function() {
      i++;
      doPrompt();
    };

    prompt.before(results, function(skip) {
      if(skip) {
        return next();
      }
      inquirer.prompt(prompt, function(res) {
        results[prompt.name] = res[prompt.name];
        prompt.after(results, next);
      });
    });
  }

  doPrompt();
};

module.exports = CommonUtil;
