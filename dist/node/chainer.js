(function() {
  var Chainer, URL_TESTER, URL_VALIDATOR, plus, toPromise, toQueryString,
    __slice = [].slice;

  URL_VALIDATOR = require('./grammar').URL_VALIDATOR;

  plus = require('./plus');

  toPromise = require('./helper-promise').toPromise;

  toQueryString = function(options) {
    var key, params, value, _ref;
    if (!options || options === {}) {
      return '';
    }
    params = [];
    _ref = options || {};
    for (key in _ref) {
      value = _ref[key];
      params.push("" + key + "=" + (encodeURIComponent(value)));
    }
    return "?" + (params.join('&'));
  };

  URL_TESTER = function(path) {
    var err;
    if (!URL_VALIDATOR.test(path)) {
      err = "BUG: Invalid Path. If this is actually a valid path then please update the URL_VALIDATOR. path=" + path;
      return console.warn(err);
    }
  };

  Chainer = function(request, _path, name, contextTree, fn) {
    var verbFunc, verbName, verbs, _fn;
    if (fn == null) {
      fn = function() {
        var args, separator;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (!args.length) {
          throw new Error('BUG! must be called with at least one argument');
        }
        if (name === 'compare') {
          separator = '...';
        } else {
          separator = '/';
        }
        return Chainer(request, "" + _path + "/" + (args.join(separator)), name, contextTree);
      };
    }
    verbs = {
      fetch: function(cb, config) {
        URL_TESTER(_path);
        return request('GET', "" + _path + (toQueryString(config)), null, {}, cb);
      },
      fetchAll: function(cb, config) {
        URL_TESTER(_path);
        return request('GET', "" + _path + (toQueryString(config)), null, {
          all: true
        }, cb);
      },
      read: function(cb, config) {
        URL_TESTER(_path);
        return request('GET', "" + _path + (toQueryString(config)), null, {
          raw: true
        }, cb);
      },
      readBinary: function(cb, config) {
        URL_TESTER(_path);
        return request('GET', "" + _path + (toQueryString(config)), null, {
          raw: true,
          isBase64: true
        }, cb);
      },
      remove: function(cb, config) {
        URL_TESTER(_path);
        return request('DELETE', _path, config, {
          isBoolean: true
        }, cb);
      },
      create: function(cb, config, isRaw) {
        URL_TESTER(_path);
        return request('POST', _path, config, {
          raw: isRaw
        }, cb);
      },
      update: function(cb, config) {
        URL_TESTER(_path);
        return request('PATCH', _path, config, null, cb);
      },
      add: function(cb, config) {
        URL_TESTER(_path);
        return request('PUT', _path, config, {
          isBoolean: true
        }, cb);
      },
      contains: function() {
        var args, cb;
        cb = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        URL_TESTER(_path);
        return request('GET', "" + _path + "/" + (args.join('/')), null, {
          isBoolean: true
        }, cb);
      }
    };
    if (name) {
      for (verbName in verbs) {
        verbFunc = verbs[verbName];
        fn[verbName] = toPromise(verbFunc);
      }
    }
    if (typeof fn === 'function' || typeof fn === 'object') {
      _fn = function(name) {
        delete fn[plus.camelize(name)];
        return Object.defineProperty(fn, plus.camelize(name), {
          configurable: true,
          enumerable: true,
          get: function() {
            return Chainer(request, "" + _path + "/" + name, name, contextTree[name]);
          }
        });
      };
      for (name in contextTree || {}) {
        _fn(name);
      }
    }
    return fn;
  };

  module.exports = Chainer;

}).call(this);
