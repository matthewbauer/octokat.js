(function() {
  var Chainer, OBJECT_MATCHER, Octokat, Replacer, Request, TREE_OPTIONS, plus, toPromise, _ref;

  plus = require('./plus');

  _ref = require('./grammar'), TREE_OPTIONS = _ref.TREE_OPTIONS, OBJECT_MATCHER = _ref.OBJECT_MATCHER;

  Chainer = require('./chainer');

  Replacer = require('./replacer');

  Request = require('./request');

  toPromise = require('./helper-promise').toPromise;

  Octokat = function(clientOptions, obj) {
    var context, k, key, re, replacer, request, _i, _len, _ref1, _request;
    if (clientOptions == null) {
      clientOptions = {};
    }
    if (obj == null) {
      obj = {};
    }
    _request = Request(clientOptions);
    request = function(method, path, data, options, cb) {
      var replacer, _ref1;
      if (options == null) {
        options = {
          raw: false,
          isBase64: false,
          isBoolean: false,
          all: false
        };
      }
      replacer = new Replacer(request);
      if (data && !(typeof global !== "undefined" && global !== null ? (_ref1 = global['Buffer']) != null ? _ref1.isBuffer(data) : void 0 : void 0)) {
        data = replacer.uncamelize(data);
      }
      return _request(method, path, data, options, function(err, val) {
        var context, k, key, re, url, _i, _len, _ref2;
        if (err) {
          return cb(err);
        }
        if (options.raw) {
          return cb(null, val);
        }
        obj = replacer.replace(val);
        url = obj.url || path;
        for (key in OBJECT_MATCHER) {
          re = OBJECT_MATCHER[key];
          if (re.test(url)) {
            context = TREE_OPTIONS;
            _ref2 = key.split('.');
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              k = _ref2[_i];
              context = context[k];
            }
            Chainer(request, url, k, context, obj);
          }
        }
        if (options.all && obj.nextPage) {
          return obj.nextPage.fetchAll().then(function(more) {
            obj = obj.concat(more);
            return cb(null, obj);
          });
        } else {
          return cb(null, obj);
        }
      });
    };
    if (obj.url) {
      replacer = new Replacer(request);
      obj = replacer.replace(obj);
      Chainer(request, obj.url, true, {}, obj);
      for (key in OBJECT_MATCHER) {
        re = OBJECT_MATCHER[key];
        if (re.test(obj.url)) {
          context = TREE_OPTIONS;
          _ref1 = key.split('.');
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            k = _ref1[_i];
            context = context[k];
          }
          Chainer(request, obj.url, k, context, obj);
        }
      }
    } else {
      Chainer(request, '', null, TREE_OPTIONS, obj);
    }
    obj.me = obj.user;
    obj.status = toPromise(function(cb) {
      return request('GET', 'https://status.github.com/api/status.json', null, null, cb);
    });
    obj.status.api = toPromise(function(cb) {
      return request('GET', 'https://status.github.com/api.json', null, null, cb);
    });
    obj.status.lastMessage = toPromise(function(cb) {
      return request('GET', 'https://status.github.com/api/last-message.json', null, null, cb);
    });
    obj.status.messages = toPromise(function(cb) {
      return request('GET', 'https://status.github.com/api/messages.json', null, null, cb);
    });
    return obj;
  };

  module.exports = Octokat;

}).call(this);
