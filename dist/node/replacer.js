(function() {
  var Chainer, OBJECT_MATCHER, Replacer, TREE_OPTIONS, plus, toPromise, _ref,
    __slice = [].slice;

  plus = require('./plus');

  toPromise = require('./helper-promise').toPromise;

  _ref = require('./grammar'), TREE_OPTIONS = _ref.TREE_OPTIONS, OBJECT_MATCHER = _ref.OBJECT_MATCHER;

  Chainer = require('./chainer');

  Replacer = (function() {
    function Replacer(_request) {
      this._request = _request;
    }

    Replacer.prototype.uncamelize = function(obj) {
      var i, key, o, value;
      if (Array.isArray(obj)) {
        return (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = obj.length; _i < _len; _i++) {
            i = obj[_i];
            _results.push(this.uncamelize(i));
          }
          return _results;
        }).call(this);
      } else if (obj === Object(obj)) {
        o = {};
        for (key in obj) {
          value = obj[key];
          o[plus.uncamelize(key)] = this.uncamelize(value);
        }
        return o;
      } else {
        return obj;
      }
    };

    Replacer.prototype.replace = function(o) {
      if (Array.isArray(o)) {
        return this._replaceArray(o);
      } else if (o === Object(o)) {
        return this._replaceObject(o);
      } else {
        return o;
      }
    };

    Replacer.prototype._replaceObject = function(orig) {
      var acc, context, k, key, re, url, value, _i, _len, _ref1;
      acc = {};
      for (key in orig) {
        value = orig[key];
        this._replaceKeyValue(acc, key, value);
      }
      url = acc.url;
      if (url) {
        Chainer(this._request, url, true, {}, acc);
      }
      for (key in OBJECT_MATCHER) {
        re = OBJECT_MATCHER[key];
        if (re.test(url)) {
          context = TREE_OPTIONS;
          _ref1 = key.split('.');
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            k = _ref1[_i];
            context = context[k];
          }
          Chainer(this._request, url, k, context, acc);
        }
      }
      return acc;
    };

    Replacer.prototype._replaceArray = function(orig) {
      var arr, item, key, value;
      arr = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = orig.length; _i < _len; _i++) {
          item = orig[_i];
          _results.push(this.replace(item));
        }
        return _results;
      }).call(this);
      for (key in orig) {
        value = orig[key];
        if (typeof key === 'string') {
          this._replaceKeyValue(arr, key, value);
        }
      }
      return arr;
    };

    Replacer.prototype._replaceKeyValue = function(acc, key, value) {
      var context, fn, k, newKey, re, _i, _key, _len, _ref1;
      if (/_url$/.test(key)) {
        if (/(\{[^\}]+\})/.test(value)) {
          fn = (function(_this) {
            return function() {
              var args, context, i, k, m, match, param, re, url, _i, _len, _ref1;
              args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
              url = value;
              i = 0;
              while (m = /(\{[^\}]+\})/.exec(url)) {
                match = m[1];
                if (i < args.length) {
                  param = args[i];
                  switch (match[1]) {
                    case '/':
                      param = "/" + param;
                      break;
                    case '?':
                      param = "?" + match.slice(2, -1) + "=" + param;
                  }
                } else {
                  param = '';
                  if (match[1] !== '/') {
                    throw new Error("BUG: Missing required parameter " + match);
                  }
                }
                url = url.replace(match, param);
                i++;
              }
              acc = {};
              Chainer(_this._request, url, true, {}, acc);
              for (key in OBJECT_MATCHER) {
                re = OBJECT_MATCHER[key];
                if (re.test(url)) {
                  context = TREE_OPTIONS;
                  _ref1 = key.split('.');
                  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                    k = _ref1[_i];
                    context = context[k];
                  }
                  Chainer(_this._request, url, k, context, acc);
                }
              }
              return acc;
            };
          })(this);
        } else {
          fn = (function(_this) {
            return function(cb) {
              var contentType, data, url, _ref1;
              url = value;
              if (/upload_url$/.test(key)) {
                _ref1 = args.slice(-2), contentType = _ref1[0], data = _ref1[1];
                return _this._request('POST', url, data, {
                  contentType: contentType,
                  raw: true
                }, cb);
              } else {
                return _this._request('GET', url, null, null, cb);
              }
            };
          })(this);
          fn = toPromise(fn);
          Chainer(this._request, value, true, {}, fn);
          for (_key in OBJECT_MATCHER) {
            re = OBJECT_MATCHER[_key];
            if (re.test(value)) {
              context = TREE_OPTIONS;
              _ref1 = _key.split('.');
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                k = _ref1[_i];
                context = context[k];
              }
              Chainer(this._request, value, k, context, fn);
            }
          }
        }
        fn.url = value;
        newKey = key.substring(0, key.length - '_url'.length);
        return acc[plus.camelize(newKey)] = fn;
      } else if (/_at$/.test(key)) {
        return acc[plus.camelize(key)] = new Date(value);
      } else if (typeof acc[plus.camelize(key)] === 'function') {

      } else {
        return acc[plus.camelize(key)] = this.replace(value);
      }
    };

    return Replacer;

  })();

  module.exports = Replacer;

}).call(this);
