(function() {
  var DEFAULT_HEADER, ETagResponse, Request, ajax, base64encode, userAgent;

  base64encode = require('./helper-base64');

  DEFAULT_HEADER = require('./grammar').DEFAULT_HEADER;

  if (typeof window === "undefined" || window === null) {
    userAgent = 'octokat.js';
  }

  ajax = function(options, cb) {
    var XMLHttpRequest, name, req, value, xhr, _ref;
    if (typeof window !== "undefined" && window !== null) {
      XMLHttpRequest = window.XMLHttpRequest;
    } else {
      req = require;
      XMLHttpRequest = req('xmlhttprequest').XMLHttpRequest;
    }
    xhr = new XMLHttpRequest();
    xhr.dataType = options.dataType;
    if (typeof xhr.overrideMimeType === "function") {
      xhr.overrideMimeType(options.mimeType);
    }
    xhr.open(options.type, options.url);
    if (options.data && options.type !== 'GET') {
      xhr.setRequestHeader('Content-Type', options.contentType);
    }
    _ref = options.headers;
    for (name in _ref) {
      value = _ref[name];
      xhr.setRequestHeader(name, value);
    }
    xhr.onreadystatechange = function() {
      var _name, _ref1;
      if (4 === xhr.readyState) {
        if ((_ref1 = options.statusCode) != null) {
          if (typeof _ref1[_name = xhr.status] === "function") {
            _ref1[_name]();
          }
        }
        if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 || xhr.status === 302) {
          return cb(null, xhr);
        } else {
          return cb(xhr);
        }
      }
    };
    return xhr.send(options.data);
  };

  ETagResponse = (function() {
    function ETagResponse(eTag, data, status) {
      this.eTag = eTag;
      this.data = data;
      this.status = status;
    }

    return ETagResponse;

  })();

  Request = function(clientOptions) {
    var _cachedETags, _listeners;
    if (clientOptions == null) {
      clientOptions = {};
    }
    if (clientOptions.rootURL == null) {
      clientOptions.rootURL = 'https://api.github.com';
    }
    if (clientOptions.useETags == null) {
      clientOptions.useETags = true;
    }
    if (clientOptions.usePostInsteadOfPatch == null) {
      clientOptions.usePostInsteadOfPatch = false;
    }
    _listeners = [];
    _cachedETags = {};
    return function(method, path, data, options, cb) {
      var ajaxConfig, auth, headers, mimeType;
      if (options == null) {
        options = {
          raw: false,
          isBase64: false,
          isBoolean: false,
          contentType: 'application/json'
        };
      }
      if (options == null) {
        options = {};
      }
      if (options.raw == null) {
        options.raw = false;
      }
      if (options.isBase64 == null) {
        options.isBase64 = false;
      }
      if (options.isBoolean == null) {
        options.isBoolean = false;
      }
      if (options.contentType == null) {
        options.contentType = 'application/json';
      }
      if (method === 'PATCH' && clientOptions.usePostInsteadOfPatch) {
        method = 'POST';
      }
      if (!/^http/.test(path)) {
        path = "" + clientOptions.rootURL + path;
      }
      mimeType = void 0;
      if (options.isBase64) {
        mimeType = 'text/plain; charset=x-user-defined';
      }
      headers = {
        'Accept': clientOptions.acceptHeader || DEFAULT_HEADER(path)
      };
      if (options.raw) {
        headers['Accept'] = 'application/vnd.github.raw';
      }
      if (userAgent) {
        headers['User-Agent'] = userAgent;
      }
      if (("" + method + " " + path) in _cachedETags) {
        headers['If-None-Match'] = _cachedETags["" + method + " " + path].eTag;
      } else {
        headers['If-Modified-Since'] = 'Thu, 01 Jan 1970 00:00:00 GMT';
      }
      if (clientOptions.token || (clientOptions.username && clientOptions.password)) {
        if (clientOptions.token) {
          auth = "token " + clientOptions.token;
        } else {
          auth = 'Basic ' + base64encode("" + clientOptions.username + ":" + clientOptions.password);
        }
        headers['Authorization'] = auth;
      }
      ajaxConfig = {
        url: path,
        type: method,
        contentType: options.contentType,
        mimeType: mimeType,
        headers: headers,
        processData: false,
        data: !options.raw && data && JSON.stringify(data) || data,
        dataType: !options.raw ? 'json' : void 0
      };
      if (options.isBoolean) {
        ajaxConfig.statusCode = {
          204: (function(_this) {
            return function() {
              return cb(null, true);
            };
          })(this),
          404: (function(_this) {
            return function() {
              return cb(null, false);
            };
          })(this)
        };
      }
      return ajax(ajaxConfig, function(err, val) {
        var converted, discard, eTag, eTagResponse, href, i, jqXHR, json, links, listener, part, rateLimit, rateLimitRemaining, rel, _i, _j, _k, _len, _len1, _ref, _ref1, _ref2;
        jqXHR = err || val;
        rateLimit = parseFloat(jqXHR.getResponseHeader('X-RateLimit-Limit'));
        rateLimitRemaining = parseFloat(jqXHR.getResponseHeader('X-RateLimit-Remaining'));
        for (_i = 0, _len = _listeners.length; _i < _len; _i++) {
          listener = _listeners[_i];
          listener(rateLimitRemaining, rateLimit, method, path, data, options);
        }
        if (!err) {
          if (jqXHR.status === 304) {
            if (clientOptions.useETags && _cachedETags["" + method + " " + path]) {
              eTagResponse = _cachedETags["" + method + " " + path];
              return cb(null, eTagResponse.data, eTagResponse.status, jqXHR);
            } else {
              return cb(null, jqXHR.responseText, status, jqXHR);
            }
          } else if (jqXHR.status === 204 && options.isBoolean) {

          } else if (jqXHR.status === 302) {
            return cb(null, jqXHR.getResponseHeader('Location'));
          } else {
            if (jqXHR.responseText && ajaxConfig.dataType === 'json') {
              data = JSON.parse(jqXHR.responseText);
              links = jqXHR.getResponseHeader('Link');
              _ref = (links != null ? links.split(',') : void 0) || [];
              for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                part = _ref[_j];
                _ref1 = part.match(/<([^>]+)>;\ rel="([^"]+)"/), discard = _ref1[0], href = _ref1[1], rel = _ref1[2];
                data["" + rel + "_page_url"] = href;
              }
            } else {
              data = jqXHR.responseText;
            }
            if (method === 'GET' && options.isBase64) {
              converted = '';
              for (i = _k = 0, _ref2 = data.length; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
                converted += String.fromCharCode(data.charCodeAt(i) & 0xff);
              }
              data = converted;
            }
            if (method === 'GET' && jqXHR.getResponseHeader('ETag') && clientOptions.useETags) {
              eTag = jqXHR.getResponseHeader('ETag');
              _cachedETags["" + method + " " + path] = new ETagResponse(eTag, data, jqXHR.status);
            }
            return cb(null, data, jqXHR.status, jqXHR);
          }
        } else {
          if (options.isBoolean && jqXHR.status === 404) {

          } else {
            err = new Error(jqXHR.responseText);
            err.status = jqXHR.status;
            if (jqXHR.getResponseHeader('Content-Type') === 'application/json; charset=utf-8') {
              if (jqXHR.responseText) {
                json = JSON.parse(jqXHR.responseText);
              } else {
                json = '';
              }
              err.json = json;
            }
            return cb(err);
          }
        }
      });
    };
  };

  module.exports = Request;

}).call(this);
