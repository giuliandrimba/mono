(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var u = 'undefined', o = 'object';
(function (klass){
  o === typeof exports ? module.exports = klass : 
  o === typeof Package && Package.meteor ? WaysFlow = klass : 
  this.WaysFlow = klass;
})(
  _module(
    u !== typeof Happens ? Happens : require('happens'),
    u !== typeof WaysFluid ? WaysFluid : require('./fluid')
  )
);


function _module(Happens, Fluid) {

  'use strict';

  function Flow(routes, mode) {
    Happens(this);

    this.routes = routes;
    this.mode = mode;

    this.deads = [];
    this.actives = [];
    this.pendings = [];
    this.status = 'free'
  }

  Flow.prototype.run = function(url, route) {
    var flu, self = this;

    if( this.status == 'busy')
      this.actives.splice(-1, 1);

    this.emit('status:busy');

    this.deads = [];
    this.pendings = [];

    flu = new Fluid(route, url);
    this.filter_pendings(flu);
    this.filter_deads();

    this.status = 'busy';
    if (this.mode === 'run+destroy') {
      this.run_pendings(function() {
        self.destroy_deads(function() {
          self.status = 'free';
          self.emit('status:free', self.mode);
        });
      });
    }
    else if (this.mode === 'destroy+run') {
      this.destroy_deads(function() {
        self.run_pendings(function() {
          self.status = 'free';
          self.emit('status:free', self.mode);
        });
      });
    }
  };

  Flow.prototype.find_dependency = function(parent) {
    var route, flu;

    flu = find(this.actives, function(f) {
      return f.url === parent.dependency;
    });
    if(flu != null) return flu;
    
    route = find(this.routes, function(r) {
      return r.matcher.test(parent.route.dependency);
    });

    if(route != null)
      return new Fluid(route, parent.dependency);

    return null;
  };

  Flow.prototype.filter_pendings = function(parent) {
    var err, flu, route, dep;

    this.pendings.unshift(parent);
    if (parent.dependency == null)
      return;

    if ((flu = this.find_dependency(parent)) != null)
      return this.filter_pendings(flu);

    route = parent.route.pattern;
    dep = parent.dependency
    err = "Dependency '" + dep + "' not found for route '" + route + "'";

    throw new Error(err);
  };

  Flow.prototype.filter_deads = function() {
    var flu, is_pending, i, len;

    for (i = 0, len = this.actives.length; i < len; i++) {
      
      flu = this.actives[i];
      is_pending = find(this.pendings, function(f) {
        return f.url === flu.url;
      });

      if (!is_pending) {
        this.deads.push(flu);
      }
    }
  };

  Flow.prototype.run_pendings = function(done) {
    var flu, is_active, self = this;

    if (this.pendings.length === 0) return done();

    flu = this.pendings.shift();
    is_active = find(this.actives, function(f) {
      return f.url === flu.url;
    });

    if (is_active)
      return this.run_pendings(done);

    this.actives.push(flu);
    this.emit('run:pending', flu.url);

    flu.run(function() {
      self.run_pendings(done);
    });
  };

  Flow.prototype.destroy_deads = function(done) {
    var flu, self = this;

    if (this.deads.length === 0) return done();

    flu = this.deads.pop();
    this.actives = reject(this.actives, function(f) {
      return f.url === flu.url;
    });

    flu.destroy(function() {
      self.destroy_deads(done);
    });
  };

  function find(arr, filter) {
    for (var item, i = 0, len = arr.length; i < len; i++) {
      if (filter(item = arr[i])) {
        return item;
      }
    }
  };

  function reject(arr, filter) {
    for (var item, copy = [], i = 0, len = arr.length; i < len; i++) {
      if (!filter(item = arr[i])) {
        copy.push(item);
      }
    }
    return copy;
  };

  return Flow;
};
},{"./fluid":2,"happens":5}],2:[function(require,module,exports){
var u = 'undefined', o = 'object';
(function (klass){
  o === typeof exports ? module.exports = klass : 
  o === typeof Package && Package.meteor ? WaysFluid = klass : 
  this.WaysFluid = klass;
})(_module());

function _module () {

  'use strict';

  function Fluid(route, url) {
    this.route = route;
    this.url = url;

    if(route.dependency)
      this.dependency = route.computed_dependency(url);
  }

  Fluid.prototype.run = function(done) {
    this.req = this.route.run(this.url, done);
  };

  Fluid.prototype.destroy = function(done){
    if(this.req) this.route.destroy(this.req, done);
  };

  return Fluid;
};
},{}],3:[function(require,module,exports){
var u = 'undefined', o = 'object';
(function (klass){
  o === typeof exports ? module.exports = klass : 
  o === typeof Package && Package.meteor ? WaysWay = klass : 
  this.WaysWay = klass;
})(_module());

function _module() {
  'use strict';

  var _params_regex = {
    named: /:\w+/g,
    splat: /\*\w+/g,
    optional: /\/(?:\:|\*)(\w+)\?/g
  };

  function Way(pattern, runner, destroyer, dependency) {

    this.matcher = null;
    this.pattern = pattern;
    this.runner = runner;
    this.destroyer = destroyer;
    this.dependency = dependency;

    var _params_regex = {
      named: /:\w+/g,
      splat: /\*\w+/g,
      optional: /\/(\:|\*)(\w+)\?/g
    };

    if (pattern === '*') {
      this.matcher = /.*/;
    } else {
      this.matcher = pattern.replace(_params_regex.optional, '(?:\/)?$1$2?');
      this.matcher = this.matcher.replace(_params_regex.named, '([^\/]+)');
      this.matcher = this.matcher.replace(_params_regex.splat, '(.*?)');
      this.matcher = new RegExp("^" + this.matcher + "$", 'm');
    }
  };

  Way.prototype.extract_params = function(url) {
    var name, names, params, vals, i, len;

    names = this.pattern.match(/(?::|\*)(\w+)/g);
    if (names == null) return {};

    vals = url.match(this.matcher);
    params = {};
    for (i = 0, len = names.length; i < len; i++) {
      name = names[i];
      params[name.substr(1)] = vals[i+1];
    }

    return params;
  };

  Way.prototype.rewrite_pattern = function(pattern, url) {
    var key, value, reg, params;

    params = this.extract_params(url);
    for (key in params) {
      value = params[key];
      reg = new RegExp("[\:\*]+" + key, 'g');
      pattern = pattern.replace(reg, value);
    }
    return pattern;
  };

  Way.prototype.computed_dependency = function(url) {
    return this.rewrite_pattern(this.dependency, url);
  };

  Way.prototype.run = function(url, done) {
    var req = {
      url: url,
      pattern: this.pattern,
      params: this.extract_params(url)
    };
    this.runner(req, done);
    return req;
  };

  Way.prototype.destroy = function(req, done) {
    this.destroyer(req, done);
  };

  return Way;
};
},{}],4:[function(require,module,exports){
var u = 'undefined', o = 'object';

(function (klass){
  o === typeof exports ? module.exports = klass : 
  u !== typeof Meteor ? Ways = klass : 
  this.Ways = klass;
})(
  _module.apply(null, [
    u !== typeof Happens? Happens : require('happens'),
    u !== typeof WaysWay ? WaysWay : require('./way'),
    u !== typeof WaysFlow ? WaysFlow : require('./flow'),
    u !== typeof Meteor && Meteor.isClient ? WaysAddressBar : 
    u !== typeof Meteor ? null : require('ways-addressbar')
  ])
);


function _module (Happens, Way, Flow, AddresssBar) {
  'use strict';

  // Config
  var flow = null;
  var mode = null;
  var plugin = null;
  var routes = [];

  var current_pathname = null;

  Happens(Ways);

  /**
   * Sets up a new route
   * @param {String} pattern      Pattern string
   * @param {Function} runner     Route's action runner
   * @param {Function} destroyer  Optional, Route's action destroyer (flow mode)
   * @param {String} dependency   Optional, specifies a dependency by pattern
   */
  function Ways(pattern, runner, destroyer, dependency){

    if(flow && arguments.length < 3)
      throw new Error('In `flow` mode you must to pass at least 3 args.');
    
    var route = new Way(pattern, runner, destroyer, dependency);
    routes.push(route);

    return route;
  }

  Ways.flow = function (m){
    routes = [];
    if((mode = m) != null)
      flow = new Flow(routes, mode);
  };

  Ways.use = function(plug){
    plugin = new plug;
    plugin.on('url:change', plugin_url_change);
  };

  Ways.pathname = function(){
    if(plugin)
      return plugin.pathname();
    else
      return current_pathname;
  };

  Ways.go = function(url, title, state){
    if(plugin)
      plugin.push(url, title, state);
    else
      dispatch(url);
  };

  Ways.go.silent = function(url, title, state){
    if(plugin)
      plugin.replace(url, title, state);
  };

  Ways.reset = function(){
    if(plugin)
      plugin.off('url:change', plugin_url_change)

    flow = null;
    mode = null;
    plugin = null;
    routes = [];

    current_pathname = null;
  };
  
  Ways.addressbar = AddresssBar || {
    error: 'addressbar plugin can be used only in the client'
  };

  function plugin_url_change(url){
    dispatch(plugin.pathname());
  }

  function dispatch(url) {
    var i, route, url = '/' + url.replace(/^[\/]+|[\/]+$/mg, '');
  
    for(i in routes)
      if((route = routes[i]).matcher.test(url)){
        Ways.emit("url:change", current_pathname = url);
        return (flow ? flow.run(url, route) : route.run(url));
      }

    throw new Error("Route not found for url '"+ url +"'");
  };

  return Ways;
};
},{"./flow":1,"./way":3,"happens":5,"ways-addressbar":8}],5:[function(require,module,exports){
(function (global, factory) {
  "object" === typeof exports ? module.exports = factory() :
  "function" === typeof define && define.amd ? define(factory) :
  global.Happens = factory();
}(this, function () {

  'use strict'

  /**
   * Module constructor
   * @param  {Object} target Target object to extends methods and properties into
   * @return {Object}        Target after with extended methods and properties
   */
  function Happens(target){
    var nu = this instanceof Happens;
    if(target){
      if(!nu)
        for(var prop in Happens.prototype)
          target[prop] = Happens.prototype[prop];
      else
        throw new Error("You can't pass a target when instantiating with the `new` keyword");
    }
    else if(!nu)
      return new Happens
  };

  /**
   * Initializes event
   * @param  {String} event Event name to initialize
   * @return {Array}        Initialized event pool
   */
  Happens.prototype.__init = function(event) {
    var tmp = this.__listeners || (this.__listeners = []);
    return tmp[event] || (tmp[event] = []);
  };

  /**
   * Adds listener
   * @param  {String}   event Event name
   * @param  {Function} fn    Event handler
   */
  Happens.prototype.on = function(event, fn) {
    validate(fn);
    this.__init(event).push(fn);
  };

  /**
   * Removes listener
   * @param  {String}   event Event name
   * @param  {Function} fn    Event handler
   */
  Happens.prototype.off = function(event, fn) {
    var pool = this.__init(event);
    pool.splice(pool.indexOf(fn), 1);
  };

  /**
   * Add listener the fires once and auto-removes itself
   * @param  {String}   event Event name
   * @param  {Function} fn    Event handler
   */
  Happens.prototype.once = function(event, fn) {
    validate(fn);
    var self = this, wrapper = function() {
      self.off(event, wrapper);
      fn.apply(this, arguments);
    };
    this.on(event, wrapper );
  };

  /**
   * Emit some event
   * @param  {String} event Event name -- subsequent params after `event` will
   * be passed along to the event's handlers
   */
  Happens.prototype.emit = function(event /*, arg1, arg2 */ ) {
    var i, pool = this.__init(event).slice(0);
    for(i in pool)
      pool[i].apply(this, [].slice.call(arguments, 1));
  };

  /**
   * Validates if a function exists and is an instanceof Function, and throws
   * an error if needed
   * @param  {Function} fn Function to validate
   */
  function validate(fn) {
    if(!(fn && fn instanceof Function))
      throw new Error(fn + ' is not a Function');
  }

  return Happens;
}));
},{}],6:[function(require,module,exports){
var u = 'undefined', o = 'object';
(function (klass){
  o === typeof exports ? module.exports = klass : 
  o === typeof Package && Package.meteor ? WaysAddressBarHash = klass : 
  this.WaysAddressBarHash = klass;
})(
  _module.apply(null, [
    u !== typeof Happens ? Happens : require('happens')
  ])
);

function _module (Happens){
  'use strict';

  function Hash(){

    Happens(this);

    this.history = [];
    this.history.state = null;

    var self = this;
    var hash = window.location.hash;
    var pathname = window.location.pathname;

    if(hash === '')
      if(pathname.length > 1)
        window.location.href = '/#'+ pathname;
      else
        window.location.href = '#/';

    window.attachEvent('onhashchange', function(){
      self.emit('url:change', self.pathname())
    }, false);
  }

  Hash.prototype.pathname = function (){
    return window.location.hash;
  };

  Hash.prototype.push = function(url, title, state){
    this.history.push(this.history.state = state);
    window.location.hash = url;
    if(title) document.title = title;
    this.emit('url:change', this.pathname());
  };

  Hash.prototype.replace = function(url, title, state){
    this.history[this.history.length-1] = this.history.state = state;
    if(title) document.title = title;
    window.location.hash.replace(url);
  };

  return Hash;
}
},{"happens":5}],7:[function(require,module,exports){
var u = 'undefined', o = 'object';
(function (klass){
  o === typeof exports ? module.exports = klass : 
  o === typeof Package && Package.meteor ? WaysAddressBarHistory = klass : 
  this.WaysAddressBarHistory = klass;
})(
  _module.apply(null, [
    u !== typeof Happens ? Happens : require('happens')
  ])
);

function _module(Happens){
 'use strict';

  function History(){

    Happens(this);

    this.history = window.history;

    var self = this;
    var popped = false;
    var initial = this.pathname();
    var hash = window.location.hash || null;

    if(hash && hash.length)
      this.replace(window.location.hash.substr(1));

    window.addEventListener('popstate', function(){
      // skips first pop if present
      if(initial == self.pathname() && !popped)
        return popped = true;

      self.emit('url:change', self.pathname());
    }, false);
  }

  History.prototype.pathname = function(){
    return window.location.pathname;
  }

  History.prototype.push = function(url, title, state){
    window.history.pushState(state, title, url);
    if(title) document.title = title;
    this.emit('url:change', window.location.pathname);
  }

  History.prototype.replace = function(url, title, state){
    window.history.replaceState(state, title, url);
    if(title) document.title = title;
  };

  return History;
}
},{"happens":5}],8:[function(require,module,exports){
var u = 'undefined', o = 'object';
(function (klass){
  o === typeof exports ? module.exports = klass : 
  o === typeof Package && Package.meteor ? WaysAddressBar = klass : 
  this.WaysAddressBar = klass;
})(
  _module.apply(null, [
    u !== typeof Happens ? Happens : require('happens'),
    u !== typeof WaysAddressBarHash ? WaysAddressBarHash : require('./hash'),
    u !== typeof WaysAddressBarHistory ? WaysAddressBarHistory : require('./history')
  ])
);

function _module(Happens, Hash, History){
 'use strict';

  function AddressBar(){

    Happens(this);

    var self = this;
    var use_history_api = !!(window && window.history && window.history.pushState);

    this.api = new (use_history_api ? History : Hash);

    this.api.on('url:change', function(pathname){
      self.emit('url:change', pathname);
    });

    this.history = this.api.history;
  };

  AddressBar.prototype.pathname = function(){
    return this.api.pathname();
  };

  AddressBar.prototype.push = function(url, title, state){
    this.api.push(url, title, state);
  };

  AddressBar.prototype.replace = function(url, title, state){
    this.api.replace(url, title, state);
  };

  return AddressBar;
}
},{"./hash":6,"./history":7,"happens":5}],9:[function(require,module,exports){
"use strict";

var _routes = require("scripts/shared/routes");

var routes = _interopRequireWildcard(_routes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

document.addEventListener('DOMContentLoaded', function () {
	routes.init();
});

},{"scripts/shared/routes":10}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;

var _layout = require("scripts/views/layout");

var layout = _interopRequireWildcard(_layout);

var _intro = require("scripts/views/intro");

var intro = _interopRequireWildcard(_intro);

var _monkey = require("scripts/views/monkey");

var monkey = _interopRequireWildcard(_monkey);

var _calendar = require("scripts/views/calendar");

var calendar = _interopRequireWildcard(_calendar);

var _ways = require("ways");

var _ways2 = _interopRequireDefault(_ways);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function init() {
  (0, _ways2.default)("/", layout.intro, layout.outro);
  (0, _ways2.default)("/intro", intro.intro, intro.outro, "/");
  (0, _ways2.default)("/monkey", monkey.intro, monkey.outro, "/");
  (0, _ways2.default)("/calendar", calendar.intro, calendar.outro, "/");

  _ways2.default.go("/");
}

},{"scripts/views/calendar":11,"scripts/views/intro":12,"scripts/views/layout":13,"scripts/views/monkey":14,"ways":4}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.intro = intro;
exports.outro = outro;
function intro() {}

function outro() {}

},{}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.intro = intro;
exports.outro = outro;
function intro() {}

function outro() {}

},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.intro = intro;
exports.outro = outro;
function intro(req, done) {
  console.log("init");
}

function outro(req, done) {}

},{}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.intro = intro;
exports.outro = outro;
function intro() {}

function outro() {}

},{}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvd2F5cy9saWIvZmxvdy5qcyIsIm5vZGVfbW9kdWxlcy93YXlzL2xpYi9mbHVpZC5qcyIsIm5vZGVfbW9kdWxlcy93YXlzL2xpYi93YXkuanMiLCJub2RlX21vZHVsZXMvd2F5cy9saWIvd2F5cy5qcyIsIm5vZGVfbW9kdWxlcy93YXlzL25vZGVfbW9kdWxlcy9oYXBwZW5zL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3dheXMvbm9kZV9tb2R1bGVzL3dheXMtYWRkcmVzc2Jhci9saWIvaGFzaC5qcyIsIm5vZGVfbW9kdWxlcy93YXlzL25vZGVfbW9kdWxlcy93YXlzLWFkZHJlc3NiYXIvbGliL2hpc3RvcnkuanMiLCJub2RlX21vZHVsZXMvd2F5cy9ub2RlX21vZHVsZXMvd2F5cy1hZGRyZXNzYmFyL2xpYi9pbmRleC5qcyIsInNyYy9zY3JpcHRzL2FwcC5qcyIsInNyYy9zY3JpcHRzL3NoYXJlZC9yb3V0ZXMuanMiLCJzcmMvc2NyaXB0cy92aWV3cy9jYWxlbmRhci5qcyIsInNyYy9zY3JpcHRzL3ZpZXdzL2ludHJvLmpzIiwic3JjL3NjcmlwdHMvdmlld3MvbGF5b3V0LmpzIiwic3JjL3NjcmlwdHMvdmlld3MvbW9ua2V5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdDQTs7SUFBWTs7OztBQUVaLFNBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFlBQVU7QUFDdkQsUUFBTyxJQUFQLEdBRHVEO0NBQVYsQ0FBOUM7Ozs7Ozs7O1FDSWdCOztBQU5oQjs7SUFBWTs7QUFDWjs7SUFBWTs7QUFDWjs7SUFBWTs7QUFDWjs7SUFBWTs7QUFDWjs7Ozs7Ozs7QUFFTyxTQUFTLElBQVQsR0FBZ0I7QUFDckIsc0JBQUssR0FBTCxFQUFVLE9BQU8sS0FBUCxFQUFjLE9BQU8sS0FBUCxDQUF4QixDQURxQjtBQUVyQixzQkFBSyxRQUFMLEVBQWUsTUFBTSxLQUFOLEVBQWEsTUFBTSxLQUFOLEVBQWEsR0FBekMsRUFGcUI7QUFHckIsc0JBQUssU0FBTCxFQUFnQixPQUFPLEtBQVAsRUFBYyxPQUFPLEtBQVAsRUFBYyxHQUE1QyxFQUhxQjtBQUlyQixzQkFBSyxXQUFMLEVBQWtCLFNBQVMsS0FBVCxFQUFnQixTQUFTLEtBQVQsRUFBZ0IsR0FBbEQsRUFKcUI7O0FBTXJCLGlCQUFLLEVBQUwsQ0FBUSxHQUFSLEVBTnFCO0NBQWhCOzs7Ozs7OztRQ05TO1FBSUE7QUFKVCxTQUFTLEtBQVQsR0FBaUIsRUFBakI7O0FBSUEsU0FBUyxLQUFULEdBQWlCLEVBQWpCOzs7Ozs7OztRQ0pTO1FBSUE7QUFKVCxTQUFTLEtBQVQsR0FBaUIsRUFBakI7O0FBSUEsU0FBUyxLQUFULEdBQWlCLEVBQWpCOzs7Ozs7OztRQ0pTO1FBSUE7QUFKVCxTQUFTLEtBQVQsQ0FBZSxHQUFmLEVBQW9CLElBQXBCLEVBQTBCO0FBQy9CLFVBQVEsR0FBUixDQUFZLE1BQVosRUFEK0I7Q0FBMUI7O0FBSUEsU0FBUyxLQUFULENBQWUsR0FBZixFQUFvQixJQUFwQixFQUEwQixFQUExQjs7Ozs7Ozs7UUNKUztRQUlBO0FBSlQsU0FBUyxLQUFULEdBQWlCLEVBQWpCOztBQUlBLFNBQVMsS0FBVCxHQUFpQixFQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgdSA9ICd1bmRlZmluZWQnLCBvID0gJ29iamVjdCc7XG4oZnVuY3Rpb24gKGtsYXNzKXtcbiAgbyA9PT0gdHlwZW9mIGV4cG9ydHMgPyBtb2R1bGUuZXhwb3J0cyA9IGtsYXNzIDogXG4gIG8gPT09IHR5cGVvZiBQYWNrYWdlICYmIFBhY2thZ2UubWV0ZW9yID8gV2F5c0Zsb3cgPSBrbGFzcyA6IFxuICB0aGlzLldheXNGbG93ID0ga2xhc3M7XG59KShcbiAgX21vZHVsZShcbiAgICB1ICE9PSB0eXBlb2YgSGFwcGVucyA/IEhhcHBlbnMgOiByZXF1aXJlKCdoYXBwZW5zJyksXG4gICAgdSAhPT0gdHlwZW9mIFdheXNGbHVpZCA/IFdheXNGbHVpZCA6IHJlcXVpcmUoJy4vZmx1aWQnKVxuICApXG4pO1xuXG5cbmZ1bmN0aW9uIF9tb2R1bGUoSGFwcGVucywgRmx1aWQpIHtcblxuICAndXNlIHN0cmljdCc7XG5cbiAgZnVuY3Rpb24gRmxvdyhyb3V0ZXMsIG1vZGUpIHtcbiAgICBIYXBwZW5zKHRoaXMpO1xuXG4gICAgdGhpcy5yb3V0ZXMgPSByb3V0ZXM7XG4gICAgdGhpcy5tb2RlID0gbW9kZTtcblxuICAgIHRoaXMuZGVhZHMgPSBbXTtcbiAgICB0aGlzLmFjdGl2ZXMgPSBbXTtcbiAgICB0aGlzLnBlbmRpbmdzID0gW107XG4gICAgdGhpcy5zdGF0dXMgPSAnZnJlZSdcbiAgfVxuXG4gIEZsb3cucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uKHVybCwgcm91dGUpIHtcbiAgICB2YXIgZmx1LCBzZWxmID0gdGhpcztcblxuICAgIGlmKCB0aGlzLnN0YXR1cyA9PSAnYnVzeScpXG4gICAgICB0aGlzLmFjdGl2ZXMuc3BsaWNlKC0xLCAxKTtcblxuICAgIHRoaXMuZW1pdCgnc3RhdHVzOmJ1c3knKTtcblxuICAgIHRoaXMuZGVhZHMgPSBbXTtcbiAgICB0aGlzLnBlbmRpbmdzID0gW107XG5cbiAgICBmbHUgPSBuZXcgRmx1aWQocm91dGUsIHVybCk7XG4gICAgdGhpcy5maWx0ZXJfcGVuZGluZ3MoZmx1KTtcbiAgICB0aGlzLmZpbHRlcl9kZWFkcygpO1xuXG4gICAgdGhpcy5zdGF0dXMgPSAnYnVzeSc7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gJ3J1bitkZXN0cm95Jykge1xuICAgICAgdGhpcy5ydW5fcGVuZGluZ3MoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuZGVzdHJveV9kZWFkcyhmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLnN0YXR1cyA9ICdmcmVlJztcbiAgICAgICAgICBzZWxmLmVtaXQoJ3N0YXR1czpmcmVlJywgc2VsZi5tb2RlKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5tb2RlID09PSAnZGVzdHJveStydW4nKSB7XG4gICAgICB0aGlzLmRlc3Ryb3lfZGVhZHMoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYucnVuX3BlbmRpbmdzKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuc3RhdHVzID0gJ2ZyZWUnO1xuICAgICAgICAgIHNlbGYuZW1pdCgnc3RhdHVzOmZyZWUnLCBzZWxmLm1vZGUpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBGbG93LnByb3RvdHlwZS5maW5kX2RlcGVuZGVuY3kgPSBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICB2YXIgcm91dGUsIGZsdTtcblxuICAgIGZsdSA9IGZpbmQodGhpcy5hY3RpdmVzLCBmdW5jdGlvbihmKSB7XG4gICAgICByZXR1cm4gZi51cmwgPT09IHBhcmVudC5kZXBlbmRlbmN5O1xuICAgIH0pO1xuICAgIGlmKGZsdSAhPSBudWxsKSByZXR1cm4gZmx1O1xuICAgIFxuICAgIHJvdXRlID0gZmluZCh0aGlzLnJvdXRlcywgZnVuY3Rpb24ocikge1xuICAgICAgcmV0dXJuIHIubWF0Y2hlci50ZXN0KHBhcmVudC5yb3V0ZS5kZXBlbmRlbmN5KTtcbiAgICB9KTtcblxuICAgIGlmKHJvdXRlICE9IG51bGwpXG4gICAgICByZXR1cm4gbmV3IEZsdWlkKHJvdXRlLCBwYXJlbnQuZGVwZW5kZW5jeSk7XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBGbG93LnByb3RvdHlwZS5maWx0ZXJfcGVuZGluZ3MgPSBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICB2YXIgZXJyLCBmbHUsIHJvdXRlLCBkZXA7XG5cbiAgICB0aGlzLnBlbmRpbmdzLnVuc2hpZnQocGFyZW50KTtcbiAgICBpZiAocGFyZW50LmRlcGVuZGVuY3kgPT0gbnVsbClcbiAgICAgIHJldHVybjtcblxuICAgIGlmICgoZmx1ID0gdGhpcy5maW5kX2RlcGVuZGVuY3kocGFyZW50KSkgIT0gbnVsbClcbiAgICAgIHJldHVybiB0aGlzLmZpbHRlcl9wZW5kaW5ncyhmbHUpO1xuXG4gICAgcm91dGUgPSBwYXJlbnQucm91dGUucGF0dGVybjtcbiAgICBkZXAgPSBwYXJlbnQuZGVwZW5kZW5jeVxuICAgIGVyciA9IFwiRGVwZW5kZW5jeSAnXCIgKyBkZXAgKyBcIicgbm90IGZvdW5kIGZvciByb3V0ZSAnXCIgKyByb3V0ZSArIFwiJ1wiO1xuXG4gICAgdGhyb3cgbmV3IEVycm9yKGVycik7XG4gIH07XG5cbiAgRmxvdy5wcm90b3R5cGUuZmlsdGVyX2RlYWRzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZsdSwgaXNfcGVuZGluZywgaSwgbGVuO1xuXG4gICAgZm9yIChpID0gMCwgbGVuID0gdGhpcy5hY3RpdmVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBcbiAgICAgIGZsdSA9IHRoaXMuYWN0aXZlc1tpXTtcbiAgICAgIGlzX3BlbmRpbmcgPSBmaW5kKHRoaXMucGVuZGluZ3MsIGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgcmV0dXJuIGYudXJsID09PSBmbHUudXJsO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICghaXNfcGVuZGluZykge1xuICAgICAgICB0aGlzLmRlYWRzLnB1c2goZmx1KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgRmxvdy5wcm90b3R5cGUucnVuX3BlbmRpbmdzID0gZnVuY3Rpb24oZG9uZSkge1xuICAgIHZhciBmbHUsIGlzX2FjdGl2ZSwgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5wZW5kaW5ncy5sZW5ndGggPT09IDApIHJldHVybiBkb25lKCk7XG5cbiAgICBmbHUgPSB0aGlzLnBlbmRpbmdzLnNoaWZ0KCk7XG4gICAgaXNfYWN0aXZlID0gZmluZCh0aGlzLmFjdGl2ZXMsIGZ1bmN0aW9uKGYpIHtcbiAgICAgIHJldHVybiBmLnVybCA9PT0gZmx1LnVybDtcbiAgICB9KTtcblxuICAgIGlmIChpc19hY3RpdmUpXG4gICAgICByZXR1cm4gdGhpcy5ydW5fcGVuZGluZ3MoZG9uZSk7XG5cbiAgICB0aGlzLmFjdGl2ZXMucHVzaChmbHUpO1xuICAgIHRoaXMuZW1pdCgncnVuOnBlbmRpbmcnLCBmbHUudXJsKTtcblxuICAgIGZsdS5ydW4oZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLnJ1bl9wZW5kaW5ncyhkb25lKTtcbiAgICB9KTtcbiAgfTtcblxuICBGbG93LnByb3RvdHlwZS5kZXN0cm95X2RlYWRzID0gZnVuY3Rpb24oZG9uZSkge1xuICAgIHZhciBmbHUsIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuZGVhZHMubGVuZ3RoID09PSAwKSByZXR1cm4gZG9uZSgpO1xuXG4gICAgZmx1ID0gdGhpcy5kZWFkcy5wb3AoKTtcbiAgICB0aGlzLmFjdGl2ZXMgPSByZWplY3QodGhpcy5hY3RpdmVzLCBmdW5jdGlvbihmKSB7XG4gICAgICByZXR1cm4gZi51cmwgPT09IGZsdS51cmw7XG4gICAgfSk7XG5cbiAgICBmbHUuZGVzdHJveShmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuZGVzdHJveV9kZWFkcyhkb25lKTtcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBmaW5kKGFyciwgZmlsdGVyKSB7XG4gICAgZm9yICh2YXIgaXRlbSwgaSA9IDAsIGxlbiA9IGFyci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKGZpbHRlcihpdGVtID0gYXJyW2ldKSkge1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gcmVqZWN0KGFyciwgZmlsdGVyKSB7XG4gICAgZm9yICh2YXIgaXRlbSwgY29weSA9IFtdLCBpID0gMCwgbGVuID0gYXJyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAoIWZpbHRlcihpdGVtID0gYXJyW2ldKSkge1xuICAgICAgICBjb3B5LnB1c2goaXRlbSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb3B5O1xuICB9O1xuXG4gIHJldHVybiBGbG93O1xufTsiLCJ2YXIgdSA9ICd1bmRlZmluZWQnLCBvID0gJ29iamVjdCc7XG4oZnVuY3Rpb24gKGtsYXNzKXtcbiAgbyA9PT0gdHlwZW9mIGV4cG9ydHMgPyBtb2R1bGUuZXhwb3J0cyA9IGtsYXNzIDogXG4gIG8gPT09IHR5cGVvZiBQYWNrYWdlICYmIFBhY2thZ2UubWV0ZW9yID8gV2F5c0ZsdWlkID0ga2xhc3MgOiBcbiAgdGhpcy5XYXlzRmx1aWQgPSBrbGFzcztcbn0pKF9tb2R1bGUoKSk7XG5cbmZ1bmN0aW9uIF9tb2R1bGUgKCkge1xuXG4gICd1c2Ugc3RyaWN0JztcblxuICBmdW5jdGlvbiBGbHVpZChyb3V0ZSwgdXJsKSB7XG4gICAgdGhpcy5yb3V0ZSA9IHJvdXRlO1xuICAgIHRoaXMudXJsID0gdXJsO1xuXG4gICAgaWYocm91dGUuZGVwZW5kZW5jeSlcbiAgICAgIHRoaXMuZGVwZW5kZW5jeSA9IHJvdXRlLmNvbXB1dGVkX2RlcGVuZGVuY3kodXJsKTtcbiAgfVxuXG4gIEZsdWlkLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbihkb25lKSB7XG4gICAgdGhpcy5yZXEgPSB0aGlzLnJvdXRlLnJ1bih0aGlzLnVybCwgZG9uZSk7XG4gIH07XG5cbiAgRmx1aWQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihkb25lKXtcbiAgICBpZih0aGlzLnJlcSkgdGhpcy5yb3V0ZS5kZXN0cm95KHRoaXMucmVxLCBkb25lKTtcbiAgfTtcblxuICByZXR1cm4gRmx1aWQ7XG59OyIsInZhciB1ID0gJ3VuZGVmaW5lZCcsIG8gPSAnb2JqZWN0JztcbihmdW5jdGlvbiAoa2xhc3Mpe1xuICBvID09PSB0eXBlb2YgZXhwb3J0cyA/IG1vZHVsZS5leHBvcnRzID0ga2xhc3MgOiBcbiAgbyA9PT0gdHlwZW9mIFBhY2thZ2UgJiYgUGFja2FnZS5tZXRlb3IgPyBXYXlzV2F5ID0ga2xhc3MgOiBcbiAgdGhpcy5XYXlzV2F5ID0ga2xhc3M7XG59KShfbW9kdWxlKCkpO1xuXG5mdW5jdGlvbiBfbW9kdWxlKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIF9wYXJhbXNfcmVnZXggPSB7XG4gICAgbmFtZWQ6IC86XFx3Ky9nLFxuICAgIHNwbGF0OiAvXFwqXFx3Ky9nLFxuICAgIG9wdGlvbmFsOiAvXFwvKD86XFw6fFxcKikoXFx3KylcXD8vZ1xuICB9O1xuXG4gIGZ1bmN0aW9uIFdheShwYXR0ZXJuLCBydW5uZXIsIGRlc3Ryb3llciwgZGVwZW5kZW5jeSkge1xuXG4gICAgdGhpcy5tYXRjaGVyID0gbnVsbDtcbiAgICB0aGlzLnBhdHRlcm4gPSBwYXR0ZXJuO1xuICAgIHRoaXMucnVubmVyID0gcnVubmVyO1xuICAgIHRoaXMuZGVzdHJveWVyID0gZGVzdHJveWVyO1xuICAgIHRoaXMuZGVwZW5kZW5jeSA9IGRlcGVuZGVuY3k7XG5cbiAgICB2YXIgX3BhcmFtc19yZWdleCA9IHtcbiAgICAgIG5hbWVkOiAvOlxcdysvZyxcbiAgICAgIHNwbGF0OiAvXFwqXFx3Ky9nLFxuICAgICAgb3B0aW9uYWw6IC9cXC8oXFw6fFxcKikoXFx3KylcXD8vZ1xuICAgIH07XG5cbiAgICBpZiAocGF0dGVybiA9PT0gJyonKSB7XG4gICAgICB0aGlzLm1hdGNoZXIgPSAvLiovO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1hdGNoZXIgPSBwYXR0ZXJuLnJlcGxhY2UoX3BhcmFtc19yZWdleC5vcHRpb25hbCwgJyg/OlxcLyk/JDEkMj8nKTtcbiAgICAgIHRoaXMubWF0Y2hlciA9IHRoaXMubWF0Y2hlci5yZXBsYWNlKF9wYXJhbXNfcmVnZXgubmFtZWQsICcoW15cXC9dKyknKTtcbiAgICAgIHRoaXMubWF0Y2hlciA9IHRoaXMubWF0Y2hlci5yZXBsYWNlKF9wYXJhbXNfcmVnZXguc3BsYXQsICcoLio/KScpO1xuICAgICAgdGhpcy5tYXRjaGVyID0gbmV3IFJlZ0V4cChcIl5cIiArIHRoaXMubWF0Y2hlciArIFwiJFwiLCAnbScpO1xuICAgIH1cbiAgfTtcblxuICBXYXkucHJvdG90eXBlLmV4dHJhY3RfcGFyYW1zID0gZnVuY3Rpb24odXJsKSB7XG4gICAgdmFyIG5hbWUsIG5hbWVzLCBwYXJhbXMsIHZhbHMsIGksIGxlbjtcblxuICAgIG5hbWVzID0gdGhpcy5wYXR0ZXJuLm1hdGNoKC8oPzo6fFxcKikoXFx3KykvZyk7XG4gICAgaWYgKG5hbWVzID09IG51bGwpIHJldHVybiB7fTtcblxuICAgIHZhbHMgPSB1cmwubWF0Y2godGhpcy5tYXRjaGVyKTtcbiAgICBwYXJhbXMgPSB7fTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSBuYW1lcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgbmFtZSA9IG5hbWVzW2ldO1xuICAgICAgcGFyYW1zW25hbWUuc3Vic3RyKDEpXSA9IHZhbHNbaSsxXTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyYW1zO1xuICB9O1xuXG4gIFdheS5wcm90b3R5cGUucmV3cml0ZV9wYXR0ZXJuID0gZnVuY3Rpb24ocGF0dGVybiwgdXJsKSB7XG4gICAgdmFyIGtleSwgdmFsdWUsIHJlZywgcGFyYW1zO1xuXG4gICAgcGFyYW1zID0gdGhpcy5leHRyYWN0X3BhcmFtcyh1cmwpO1xuICAgIGZvciAoa2V5IGluIHBhcmFtcykge1xuICAgICAgdmFsdWUgPSBwYXJhbXNba2V5XTtcbiAgICAgIHJlZyA9IG5ldyBSZWdFeHAoXCJbXFw6XFwqXStcIiArIGtleSwgJ2cnKTtcbiAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnJlcGxhY2UocmVnLCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBwYXR0ZXJuO1xuICB9O1xuXG4gIFdheS5wcm90b3R5cGUuY29tcHV0ZWRfZGVwZW5kZW5jeSA9IGZ1bmN0aW9uKHVybCkge1xuICAgIHJldHVybiB0aGlzLnJld3JpdGVfcGF0dGVybih0aGlzLmRlcGVuZGVuY3ksIHVybCk7XG4gIH07XG5cbiAgV2F5LnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbih1cmwsIGRvbmUpIHtcbiAgICB2YXIgcmVxID0ge1xuICAgICAgdXJsOiB1cmwsXG4gICAgICBwYXR0ZXJuOiB0aGlzLnBhdHRlcm4sXG4gICAgICBwYXJhbXM6IHRoaXMuZXh0cmFjdF9wYXJhbXModXJsKVxuICAgIH07XG4gICAgdGhpcy5ydW5uZXIocmVxLCBkb25lKTtcbiAgICByZXR1cm4gcmVxO1xuICB9O1xuXG4gIFdheS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKHJlcSwgZG9uZSkge1xuICAgIHRoaXMuZGVzdHJveWVyKHJlcSwgZG9uZSk7XG4gIH07XG5cbiAgcmV0dXJuIFdheTtcbn07IiwidmFyIHUgPSAndW5kZWZpbmVkJywgbyA9ICdvYmplY3QnO1xuXG4oZnVuY3Rpb24gKGtsYXNzKXtcbiAgbyA9PT0gdHlwZW9mIGV4cG9ydHMgPyBtb2R1bGUuZXhwb3J0cyA9IGtsYXNzIDogXG4gIHUgIT09IHR5cGVvZiBNZXRlb3IgPyBXYXlzID0ga2xhc3MgOiBcbiAgdGhpcy5XYXlzID0ga2xhc3M7XG59KShcbiAgX21vZHVsZS5hcHBseShudWxsLCBbXG4gICAgdSAhPT0gdHlwZW9mIEhhcHBlbnM/IEhhcHBlbnMgOiByZXF1aXJlKCdoYXBwZW5zJyksXG4gICAgdSAhPT0gdHlwZW9mIFdheXNXYXkgPyBXYXlzV2F5IDogcmVxdWlyZSgnLi93YXknKSxcbiAgICB1ICE9PSB0eXBlb2YgV2F5c0Zsb3cgPyBXYXlzRmxvdyA6IHJlcXVpcmUoJy4vZmxvdycpLFxuICAgIHUgIT09IHR5cGVvZiBNZXRlb3IgJiYgTWV0ZW9yLmlzQ2xpZW50ID8gV2F5c0FkZHJlc3NCYXIgOiBcbiAgICB1ICE9PSB0eXBlb2YgTWV0ZW9yID8gbnVsbCA6IHJlcXVpcmUoJ3dheXMtYWRkcmVzc2JhcicpXG4gIF0pXG4pO1xuXG5cbmZ1bmN0aW9uIF9tb2R1bGUgKEhhcHBlbnMsIFdheSwgRmxvdywgQWRkcmVzc3NCYXIpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIENvbmZpZ1xuICB2YXIgZmxvdyA9IG51bGw7XG4gIHZhciBtb2RlID0gbnVsbDtcbiAgdmFyIHBsdWdpbiA9IG51bGw7XG4gIHZhciByb3V0ZXMgPSBbXTtcblxuICB2YXIgY3VycmVudF9wYXRobmFtZSA9IG51bGw7XG5cbiAgSGFwcGVucyhXYXlzKTtcblxuICAvKipcbiAgICogU2V0cyB1cCBhIG5ldyByb3V0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0dGVybiAgICAgIFBhdHRlcm4gc3RyaW5nXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IHJ1bm5lciAgICAgUm91dGUncyBhY3Rpb24gcnVubmVyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGRlc3Ryb3llciAgT3B0aW9uYWwsIFJvdXRlJ3MgYWN0aW9uIGRlc3Ryb3llciAoZmxvdyBtb2RlKVxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGVwZW5kZW5jeSAgIE9wdGlvbmFsLCBzcGVjaWZpZXMgYSBkZXBlbmRlbmN5IGJ5IHBhdHRlcm5cbiAgICovXG4gIGZ1bmN0aW9uIFdheXMocGF0dGVybiwgcnVubmVyLCBkZXN0cm95ZXIsIGRlcGVuZGVuY3kpe1xuXG4gICAgaWYoZmxvdyAmJiBhcmd1bWVudHMubGVuZ3RoIDwgMylcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW4gYGZsb3dgIG1vZGUgeW91IG11c3QgdG8gcGFzcyBhdCBsZWFzdCAzIGFyZ3MuJyk7XG4gICAgXG4gICAgdmFyIHJvdXRlID0gbmV3IFdheShwYXR0ZXJuLCBydW5uZXIsIGRlc3Ryb3llciwgZGVwZW5kZW5jeSk7XG4gICAgcm91dGVzLnB1c2gocm91dGUpO1xuXG4gICAgcmV0dXJuIHJvdXRlO1xuICB9XG5cbiAgV2F5cy5mbG93ID0gZnVuY3Rpb24gKG0pe1xuICAgIHJvdXRlcyA9IFtdO1xuICAgIGlmKChtb2RlID0gbSkgIT0gbnVsbClcbiAgICAgIGZsb3cgPSBuZXcgRmxvdyhyb3V0ZXMsIG1vZGUpO1xuICB9O1xuXG4gIFdheXMudXNlID0gZnVuY3Rpb24ocGx1Zyl7XG4gICAgcGx1Z2luID0gbmV3IHBsdWc7XG4gICAgcGx1Z2luLm9uKCd1cmw6Y2hhbmdlJywgcGx1Z2luX3VybF9jaGFuZ2UpO1xuICB9O1xuXG4gIFdheXMucGF0aG5hbWUgPSBmdW5jdGlvbigpe1xuICAgIGlmKHBsdWdpbilcbiAgICAgIHJldHVybiBwbHVnaW4ucGF0aG5hbWUoKTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gY3VycmVudF9wYXRobmFtZTtcbiAgfTtcblxuICBXYXlzLmdvID0gZnVuY3Rpb24odXJsLCB0aXRsZSwgc3RhdGUpe1xuICAgIGlmKHBsdWdpbilcbiAgICAgIHBsdWdpbi5wdXNoKHVybCwgdGl0bGUsIHN0YXRlKTtcbiAgICBlbHNlXG4gICAgICBkaXNwYXRjaCh1cmwpO1xuICB9O1xuXG4gIFdheXMuZ28uc2lsZW50ID0gZnVuY3Rpb24odXJsLCB0aXRsZSwgc3RhdGUpe1xuICAgIGlmKHBsdWdpbilcbiAgICAgIHBsdWdpbi5yZXBsYWNlKHVybCwgdGl0bGUsIHN0YXRlKTtcbiAgfTtcblxuICBXYXlzLnJlc2V0ID0gZnVuY3Rpb24oKXtcbiAgICBpZihwbHVnaW4pXG4gICAgICBwbHVnaW4ub2ZmKCd1cmw6Y2hhbmdlJywgcGx1Z2luX3VybF9jaGFuZ2UpXG5cbiAgICBmbG93ID0gbnVsbDtcbiAgICBtb2RlID0gbnVsbDtcbiAgICBwbHVnaW4gPSBudWxsO1xuICAgIHJvdXRlcyA9IFtdO1xuXG4gICAgY3VycmVudF9wYXRobmFtZSA9IG51bGw7XG4gIH07XG4gIFxuICBXYXlzLmFkZHJlc3NiYXIgPSBBZGRyZXNzc0JhciB8fCB7XG4gICAgZXJyb3I6ICdhZGRyZXNzYmFyIHBsdWdpbiBjYW4gYmUgdXNlZCBvbmx5IGluIHRoZSBjbGllbnQnXG4gIH07XG5cbiAgZnVuY3Rpb24gcGx1Z2luX3VybF9jaGFuZ2UodXJsKXtcbiAgICBkaXNwYXRjaChwbHVnaW4ucGF0aG5hbWUoKSk7XG4gIH1cblxuICBmdW5jdGlvbiBkaXNwYXRjaCh1cmwpIHtcbiAgICB2YXIgaSwgcm91dGUsIHVybCA9ICcvJyArIHVybC5yZXBsYWNlKC9eW1xcL10rfFtcXC9dKyQvbWcsICcnKTtcbiAgXG4gICAgZm9yKGkgaW4gcm91dGVzKVxuICAgICAgaWYoKHJvdXRlID0gcm91dGVzW2ldKS5tYXRjaGVyLnRlc3QodXJsKSl7XG4gICAgICAgIFdheXMuZW1pdChcInVybDpjaGFuZ2VcIiwgY3VycmVudF9wYXRobmFtZSA9IHVybCk7XG4gICAgICAgIHJldHVybiAoZmxvdyA/IGZsb3cucnVuKHVybCwgcm91dGUpIDogcm91dGUucnVuKHVybCkpO1xuICAgICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiUm91dGUgbm90IGZvdW5kIGZvciB1cmwgJ1wiKyB1cmwgK1wiJ1wiKTtcbiAgfTtcblxuICByZXR1cm4gV2F5cztcbn07IiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgXCJvYmplY3RcIiA9PT0gdHlwZW9mIGV4cG9ydHMgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG4gIFwiZnVuY3Rpb25cIiA9PT0gdHlwZW9mIGRlZmluZSAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgZ2xvYmFsLkhhcHBlbnMgPSBmYWN0b3J5KCk7XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcblxuICAndXNlIHN0cmljdCdcblxuICAvKipcbiAgICogTW9kdWxlIGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge09iamVjdH0gdGFyZ2V0IFRhcmdldCBvYmplY3QgdG8gZXh0ZW5kcyBtZXRob2RzIGFuZCBwcm9wZXJ0aWVzIGludG9cbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgVGFyZ2V0IGFmdGVyIHdpdGggZXh0ZW5kZWQgbWV0aG9kcyBhbmQgcHJvcGVydGllc1xuICAgKi9cbiAgZnVuY3Rpb24gSGFwcGVucyh0YXJnZXQpe1xuICAgIHZhciBudSA9IHRoaXMgaW5zdGFuY2VvZiBIYXBwZW5zO1xuICAgIGlmKHRhcmdldCl7XG4gICAgICBpZighbnUpXG4gICAgICAgIGZvcih2YXIgcHJvcCBpbiBIYXBwZW5zLnByb3RvdHlwZSlcbiAgICAgICAgICB0YXJnZXRbcHJvcF0gPSBIYXBwZW5zLnByb3RvdHlwZVtwcm9wXTtcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IGNhbid0IHBhc3MgYSB0YXJnZXQgd2hlbiBpbnN0YW50aWF0aW5nIHdpdGggdGhlIGBuZXdgIGtleXdvcmRcIik7XG4gICAgfVxuICAgIGVsc2UgaWYoIW51KVxuICAgICAgcmV0dXJuIG5ldyBIYXBwZW5zXG4gIH07XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGV2ZW50XG4gICAqIEBwYXJhbSAge1N0cmluZ30gZXZlbnQgRXZlbnQgbmFtZSB0byBpbml0aWFsaXplXG4gICAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgSW5pdGlhbGl6ZWQgZXZlbnQgcG9vbFxuICAgKi9cbiAgSGFwcGVucy5wcm90b3R5cGUuX19pbml0ID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgdG1wID0gdGhpcy5fX2xpc3RlbmVycyB8fCAodGhpcy5fX2xpc3RlbmVycyA9IFtdKTtcbiAgICByZXR1cm4gdG1wW2V2ZW50XSB8fCAodG1wW2V2ZW50XSA9IFtdKTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkcyBsaXN0ZW5lclxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgZXZlbnQgRXZlbnQgbmFtZVxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gZm4gICAgRXZlbnQgaGFuZGxlclxuICAgKi9cbiAgSGFwcGVucy5wcm90b3R5cGUub24gPSBmdW5jdGlvbihldmVudCwgZm4pIHtcbiAgICB2YWxpZGF0ZShmbik7XG4gICAgdGhpcy5fX2luaXQoZXZlbnQpLnB1c2goZm4pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGxpc3RlbmVyXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICBldmVudCBFdmVudCBuYW1lXG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBmbiAgICBFdmVudCBoYW5kbGVyXG4gICAqL1xuICBIYXBwZW5zLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbihldmVudCwgZm4pIHtcbiAgICB2YXIgcG9vbCA9IHRoaXMuX19pbml0KGV2ZW50KTtcbiAgICBwb29sLnNwbGljZShwb29sLmluZGV4T2YoZm4pLCAxKTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkIGxpc3RlbmVyIHRoZSBmaXJlcyBvbmNlIGFuZCBhdXRvLXJlbW92ZXMgaXRzZWxmXG4gICAqIEBwYXJhbSAge1N0cmluZ30gICBldmVudCBFdmVudCBuYW1lXG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBmbiAgICBFdmVudCBoYW5kbGVyXG4gICAqL1xuICBIYXBwZW5zLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKSB7XG4gICAgdmFsaWRhdGUoZm4pO1xuICAgIHZhciBzZWxmID0gdGhpcywgd3JhcHBlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5vZmYoZXZlbnQsIHdyYXBwZXIpO1xuICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICAgIHRoaXMub24oZXZlbnQsIHdyYXBwZXIgKTtcbiAgfTtcblxuICAvKipcbiAgICogRW1pdCBzb21lIGV2ZW50XG4gICAqIEBwYXJhbSAge1N0cmluZ30gZXZlbnQgRXZlbnQgbmFtZSAtLSBzdWJzZXF1ZW50IHBhcmFtcyBhZnRlciBgZXZlbnRgIHdpbGxcbiAgICogYmUgcGFzc2VkIGFsb25nIHRvIHRoZSBldmVudCdzIGhhbmRsZXJzXG4gICAqL1xuICBIYXBwZW5zLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQgLyosIGFyZzEsIGFyZzIgKi8gKSB7XG4gICAgdmFyIGksIHBvb2wgPSB0aGlzLl9faW5pdChldmVudCkuc2xpY2UoMCk7XG4gICAgZm9yKGkgaW4gcG9vbClcbiAgICAgIHBvb2xbaV0uYXBwbHkodGhpcywgW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgfTtcblxuICAvKipcbiAgICogVmFsaWRhdGVzIGlmIGEgZnVuY3Rpb24gZXhpc3RzIGFuZCBpcyBhbiBpbnN0YW5jZW9mIEZ1bmN0aW9uLCBhbmQgdGhyb3dzXG4gICAqIGFuIGVycm9yIGlmIG5lZWRlZFxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gdmFsaWRhdGVcbiAgICovXG4gIGZ1bmN0aW9uIHZhbGlkYXRlKGZuKSB7XG4gICAgaWYoIShmbiAmJiBmbiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihmbiArICcgaXMgbm90IGEgRnVuY3Rpb24nKTtcbiAgfVxuXG4gIHJldHVybiBIYXBwZW5zO1xufSkpOyIsInZhciB1ID0gJ3VuZGVmaW5lZCcsIG8gPSAnb2JqZWN0JztcbihmdW5jdGlvbiAoa2xhc3Mpe1xuICBvID09PSB0eXBlb2YgZXhwb3J0cyA/IG1vZHVsZS5leHBvcnRzID0ga2xhc3MgOiBcbiAgbyA9PT0gdHlwZW9mIFBhY2thZ2UgJiYgUGFja2FnZS5tZXRlb3IgPyBXYXlzQWRkcmVzc0Jhckhhc2ggPSBrbGFzcyA6IFxuICB0aGlzLldheXNBZGRyZXNzQmFySGFzaCA9IGtsYXNzO1xufSkoXG4gIF9tb2R1bGUuYXBwbHkobnVsbCwgW1xuICAgIHUgIT09IHR5cGVvZiBIYXBwZW5zID8gSGFwcGVucyA6IHJlcXVpcmUoJ2hhcHBlbnMnKVxuICBdKVxuKTtcblxuZnVuY3Rpb24gX21vZHVsZSAoSGFwcGVucyl7XG4gICd1c2Ugc3RyaWN0JztcblxuICBmdW5jdGlvbiBIYXNoKCl7XG5cbiAgICBIYXBwZW5zKHRoaXMpO1xuXG4gICAgdGhpcy5oaXN0b3J5ID0gW107XG4gICAgdGhpcy5oaXN0b3J5LnN0YXRlID0gbnVsbDtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIHZhciBwYXRobmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcblxuICAgIGlmKGhhc2ggPT09ICcnKVxuICAgICAgaWYocGF0aG5hbWUubGVuZ3RoID4gMSlcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnLyMnKyBwYXRobmFtZTtcbiAgICAgIGVsc2VcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnIy8nO1xuXG4gICAgd2luZG93LmF0dGFjaEV2ZW50KCdvbmhhc2hjaGFuZ2UnLCBmdW5jdGlvbigpe1xuICAgICAgc2VsZi5lbWl0KCd1cmw6Y2hhbmdlJywgc2VsZi5wYXRobmFtZSgpKVxuICAgIH0sIGZhbHNlKTtcbiAgfVxuXG4gIEhhc2gucHJvdG90eXBlLnBhdGhuYW1lID0gZnVuY3Rpb24gKCl7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICB9O1xuXG4gIEhhc2gucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbih1cmwsIHRpdGxlLCBzdGF0ZSl7XG4gICAgdGhpcy5oaXN0b3J5LnB1c2godGhpcy5oaXN0b3J5LnN0YXRlID0gc3RhdGUpO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gdXJsO1xuICAgIGlmKHRpdGxlKSBkb2N1bWVudC50aXRsZSA9IHRpdGxlO1xuICAgIHRoaXMuZW1pdCgndXJsOmNoYW5nZScsIHRoaXMucGF0aG5hbWUoKSk7XG4gIH07XG5cbiAgSGFzaC5wcm90b3R5cGUucmVwbGFjZSA9IGZ1bmN0aW9uKHVybCwgdGl0bGUsIHN0YXRlKXtcbiAgICB0aGlzLmhpc3RvcnlbdGhpcy5oaXN0b3J5Lmxlbmd0aC0xXSA9IHRoaXMuaGlzdG9yeS5zdGF0ZSA9IHN0YXRlO1xuICAgIGlmKHRpdGxlKSBkb2N1bWVudC50aXRsZSA9IHRpdGxlO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UodXJsKTtcbiAgfTtcblxuICByZXR1cm4gSGFzaDtcbn0iLCJ2YXIgdSA9ICd1bmRlZmluZWQnLCBvID0gJ29iamVjdCc7XG4oZnVuY3Rpb24gKGtsYXNzKXtcbiAgbyA9PT0gdHlwZW9mIGV4cG9ydHMgPyBtb2R1bGUuZXhwb3J0cyA9IGtsYXNzIDogXG4gIG8gPT09IHR5cGVvZiBQYWNrYWdlICYmIFBhY2thZ2UubWV0ZW9yID8gV2F5c0FkZHJlc3NCYXJIaXN0b3J5ID0ga2xhc3MgOiBcbiAgdGhpcy5XYXlzQWRkcmVzc0Jhckhpc3RvcnkgPSBrbGFzcztcbn0pKFxuICBfbW9kdWxlLmFwcGx5KG51bGwsIFtcbiAgICB1ICE9PSB0eXBlb2YgSGFwcGVucyA/IEhhcHBlbnMgOiByZXF1aXJlKCdoYXBwZW5zJylcbiAgXSlcbik7XG5cbmZ1bmN0aW9uIF9tb2R1bGUoSGFwcGVucyl7XG4gJ3VzZSBzdHJpY3QnO1xuXG4gIGZ1bmN0aW9uIEhpc3RvcnkoKXtcblxuICAgIEhhcHBlbnModGhpcyk7XG5cbiAgICB0aGlzLmhpc3RvcnkgPSB3aW5kb3cuaGlzdG9yeTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcG9wcGVkID0gZmFsc2U7XG4gICAgdmFyIGluaXRpYWwgPSB0aGlzLnBhdGhuYW1lKCk7XG4gICAgdmFyIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaCB8fCBudWxsO1xuXG4gICAgaWYoaGFzaCAmJiBoYXNoLmxlbmd0aClcbiAgICAgIHRoaXMucmVwbGFjZSh3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSkpO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgZnVuY3Rpb24oKXtcbiAgICAgIC8vIHNraXBzIGZpcnN0IHBvcCBpZiBwcmVzZW50XG4gICAgICBpZihpbml0aWFsID09IHNlbGYucGF0aG5hbWUoKSAmJiAhcG9wcGVkKVxuICAgICAgICByZXR1cm4gcG9wcGVkID0gdHJ1ZTtcblxuICAgICAgc2VsZi5lbWl0KCd1cmw6Y2hhbmdlJywgc2VsZi5wYXRobmFtZSgpKTtcbiAgICB9LCBmYWxzZSk7XG4gIH1cblxuICBIaXN0b3J5LnByb3RvdHlwZS5wYXRobmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgfVxuXG4gIEhpc3RvcnkucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbih1cmwsIHRpdGxlLCBzdGF0ZSl7XG4gICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHN0YXRlLCB0aXRsZSwgdXJsKTtcbiAgICBpZih0aXRsZSkgZG9jdW1lbnQudGl0bGUgPSB0aXRsZTtcbiAgICB0aGlzLmVtaXQoJ3VybDpjaGFuZ2UnLCB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpO1xuICB9XG5cbiAgSGlzdG9yeS5wcm90b3R5cGUucmVwbGFjZSA9IGZ1bmN0aW9uKHVybCwgdGl0bGUsIHN0YXRlKXtcbiAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoc3RhdGUsIHRpdGxlLCB1cmwpO1xuICAgIGlmKHRpdGxlKSBkb2N1bWVudC50aXRsZSA9IHRpdGxlO1xuICB9O1xuXG4gIHJldHVybiBIaXN0b3J5O1xufSIsInZhciB1ID0gJ3VuZGVmaW5lZCcsIG8gPSAnb2JqZWN0JztcbihmdW5jdGlvbiAoa2xhc3Mpe1xuICBvID09PSB0eXBlb2YgZXhwb3J0cyA/IG1vZHVsZS5leHBvcnRzID0ga2xhc3MgOiBcbiAgbyA9PT0gdHlwZW9mIFBhY2thZ2UgJiYgUGFja2FnZS5tZXRlb3IgPyBXYXlzQWRkcmVzc0JhciA9IGtsYXNzIDogXG4gIHRoaXMuV2F5c0FkZHJlc3NCYXIgPSBrbGFzcztcbn0pKFxuICBfbW9kdWxlLmFwcGx5KG51bGwsIFtcbiAgICB1ICE9PSB0eXBlb2YgSGFwcGVucyA/IEhhcHBlbnMgOiByZXF1aXJlKCdoYXBwZW5zJyksXG4gICAgdSAhPT0gdHlwZW9mIFdheXNBZGRyZXNzQmFySGFzaCA/IFdheXNBZGRyZXNzQmFySGFzaCA6IHJlcXVpcmUoJy4vaGFzaCcpLFxuICAgIHUgIT09IHR5cGVvZiBXYXlzQWRkcmVzc0Jhckhpc3RvcnkgPyBXYXlzQWRkcmVzc0Jhckhpc3RvcnkgOiByZXF1aXJlKCcuL2hpc3RvcnknKVxuICBdKVxuKTtcblxuZnVuY3Rpb24gX21vZHVsZShIYXBwZW5zLCBIYXNoLCBIaXN0b3J5KXtcbiAndXNlIHN0cmljdCc7XG5cbiAgZnVuY3Rpb24gQWRkcmVzc0Jhcigpe1xuXG4gICAgSGFwcGVucyh0aGlzKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgdXNlX2hpc3RvcnlfYXBpID0gISEod2luZG93ICYmIHdpbmRvdy5oaXN0b3J5ICYmIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSk7XG5cbiAgICB0aGlzLmFwaSA9IG5ldyAodXNlX2hpc3RvcnlfYXBpID8gSGlzdG9yeSA6IEhhc2gpO1xuXG4gICAgdGhpcy5hcGkub24oJ3VybDpjaGFuZ2UnLCBmdW5jdGlvbihwYXRobmFtZSl7XG4gICAgICBzZWxmLmVtaXQoJ3VybDpjaGFuZ2UnLCBwYXRobmFtZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmhpc3RvcnkgPSB0aGlzLmFwaS5oaXN0b3J5O1xuICB9O1xuXG4gIEFkZHJlc3NCYXIucHJvdG90eXBlLnBhdGhuYW1lID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5hcGkucGF0aG5hbWUoKTtcbiAgfTtcblxuICBBZGRyZXNzQmFyLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24odXJsLCB0aXRsZSwgc3RhdGUpe1xuICAgIHRoaXMuYXBpLnB1c2godXJsLCB0aXRsZSwgc3RhdGUpO1xuICB9O1xuXG4gIEFkZHJlc3NCYXIucHJvdG90eXBlLnJlcGxhY2UgPSBmdW5jdGlvbih1cmwsIHRpdGxlLCBzdGF0ZSl7XG4gICAgdGhpcy5hcGkucmVwbGFjZSh1cmwsIHRpdGxlLCBzdGF0ZSk7XG4gIH07XG5cbiAgcmV0dXJuIEFkZHJlc3NCYXI7XG59IiwiaW1wb3J0ICogYXMgcm91dGVzIGZyb20gXCJzY3JpcHRzL3NoYXJlZC9yb3V0ZXNcIlxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKXtcblx0cm91dGVzLmluaXQoKVxufSk7IiwiaW1wb3J0ICogYXMgbGF5b3V0IGZyb20gXCJzY3JpcHRzL3ZpZXdzL2xheW91dFwiO1xuaW1wb3J0ICogYXMgaW50cm8gZnJvbSBcInNjcmlwdHMvdmlld3MvaW50cm9cIjtcbmltcG9ydCAqIGFzIG1vbmtleSBmcm9tIFwic2NyaXB0cy92aWV3cy9tb25rZXlcIjtcbmltcG9ydCAqIGFzIGNhbGVuZGFyIGZyb20gXCJzY3JpcHRzL3ZpZXdzL2NhbGVuZGFyXCI7XG5pbXBvcnQgd2F5cyBmcm9tIFwid2F5c1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5pdCgpIHtcbiAgd2F5cyhcIi9cIiwgbGF5b3V0LmludHJvLCBsYXlvdXQub3V0cm8pO1xuICB3YXlzKFwiL2ludHJvXCIsIGludHJvLmludHJvLCBpbnRyby5vdXRybywgXCIvXCIpO1xuICB3YXlzKFwiL21vbmtleVwiLCBtb25rZXkuaW50cm8sIG1vbmtleS5vdXRybywgXCIvXCIpO1xuICB3YXlzKFwiL2NhbGVuZGFyXCIsIGNhbGVuZGFyLmludHJvLCBjYWxlbmRhci5vdXRybywgXCIvXCIpO1xuXG4gIHdheXMuZ28oXCIvXCIpXG59IiwiZXhwb3J0IGZ1bmN0aW9uIGludHJvKCkge1xuXHRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG91dHJvKCkge1xuXHRcbn0iLCJleHBvcnQgZnVuY3Rpb24gaW50cm8oKSB7XG5cdFxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3V0cm8oKSB7XG5cdFxufSIsImV4cG9ydCBmdW5jdGlvbiBpbnRybyhyZXEsIGRvbmUpIHtcbiAgY29uc29sZS5sb2coXCJpbml0XCIpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvdXRybyhyZXEsIGRvbmUpIHtcblx0XG59IiwiZXhwb3J0IGZ1bmN0aW9uIGludHJvKCkge1xuXHRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG91dHJvKCkge1xuXHRcbn0iXX0=
