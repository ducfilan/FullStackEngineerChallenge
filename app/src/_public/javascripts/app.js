(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
},{}],2:[function(require,module,exports){
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty;
},{}],3:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],4:[function(require,module,exports){
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
},{}],5:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],6:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":5}],7:[function(require,module,exports){
(function(root, factory) {

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = factory(root, exports);
    }
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], function(exports) {
      root.Lockr = factory(root, exports);
    });
  } else {
    root.Lockr = factory(root, {});
  }

}(this, function(root, Lockr) {
  'use strict';

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/)
    {
      var len = this.length >>> 0;

      var from = Number(arguments[1]) || 0;
      from = (from < 0)
      ? Math.ceil(from)
      : Math.floor(from);
      if (from < 0)
        from += len;

      for (; from < len; from++)
      {
        if (from in this &&
            this[from] === elt)
          return from;
      }
      return -1;
    };
  }

  Lockr.prefix = "";

  Lockr._getPrefixedKey = function(key, options) {
    options = options || {};

    if (options.noPrefix) {
      return key;
    } else {
      return this.prefix + key;
    }

  };

  Lockr.set = function (key, value, options) {
    var query_key = this._getPrefixedKey(key, options);

    try {
      localStorage.setItem(query_key, JSON.stringify({"data": value}));
    } catch (e) {
      if (console) console.warn("Lockr didn't successfully save the '{"+ key +": "+ value +"}' pair, because the localStorage is full.");
    }
  };

  Lockr.get = function (key, missing, options) {
    var query_key = this._getPrefixedKey(key, options),
        value;

    try {
      value = JSON.parse(localStorage.getItem(query_key));
    } catch (e) {
            if(localStorage[query_key]) {
              value = {data: localStorage.getItem(query_key)};
            } else{
                value = null;
            }
    }
    
    if(!value) {
      return missing;
    }
    else if (typeof value === 'object' && typeof value.data !== 'undefined') {
      return value.data;
    }
  };

  Lockr.sadd = function(key, value, options) {
    var query_key = this._getPrefixedKey(key, options),
        json;

    var values = Lockr.smembers(key);

    if (values.indexOf(value) > -1) {
      return null;
    }

    try {
      values.push(value);
      json = JSON.stringify({"data": values});
      localStorage.setItem(query_key, json);
    } catch (e) {
      console.log(e);
      if (console) console.warn("Lockr didn't successfully add the "+ value +" to "+ key +" set, because the localStorage is full.");
    }
  };

  Lockr.smembers = function(key, options) {
    var query_key = this._getPrefixedKey(key, options),
        value;

    try {
      value = JSON.parse(localStorage.getItem(query_key));
    } catch (e) {
      value = null;
    }
    
    return (value && value.data) ? value.data : [];
  };

  Lockr.sismember = function(key, value, options) {
    return Lockr.smembers(key).indexOf(value) > -1;
  };

  Lockr.keys = function() {
    var keys = [];
    var allKeys = Object.keys(localStorage);

    if (Lockr.prefix.length === 0) {
      return allKeys;
    }

    allKeys.forEach(function (key) {
      if (key.indexOf(Lockr.prefix) !== -1) {
        keys.push(key.replace(Lockr.prefix, ''));
      }
    });

    return keys;
  };

  Lockr.getAll = function (includeKeys) {
    var keys = Lockr.keys();

    if (includeKeys) {
      return keys.reduce(function (accum, key) {
        var tempObj = {};
        tempObj[key] = Lockr.get(key);
        accum.push(tempObj);
        return accum;
      }, []);
    }

    return keys.map(function (key) {
      return Lockr.get(key);
    });
  };

  Lockr.srem = function(key, value, options) {
    var query_key = this._getPrefixedKey(key, options),
        json,
        index;

    var values = Lockr.smembers(key, value);

    index = values.indexOf(value);

    if (index > -1)
      values.splice(index, 1);

    json = JSON.stringify({"data": values});

    try {
      localStorage.setItem(query_key, json);
    } catch (e) {
      if (console) console.warn("Lockr couldn't remove the "+ value +" from the set "+ key);
    }
  };

  Lockr.rm =  function (key) {
    var queryKey = this._getPrefixedKey(key);
    
    localStorage.removeItem(queryKey);
  };

  Lockr.flush = function () {
    if (Lockr.prefix.length) {
      Lockr.keys().forEach(function(key) {
        localStorage.removeItem(Lockr._getPrefixedKey(key));
      });
    } else {
      localStorage.clear();
    }
  };
  return Lockr;

}));

},{}],8:[function(require,module,exports){
/*!
* sweetalert2 v9.8.2
* Released under the MIT License.
*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Sweetalert2 = factory());
}(this, function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  var consolePrefix = 'SweetAlert2:';
  /**
   * Filter the unique values into a new array
   * @param arr
   */

  var uniqueArray = function uniqueArray(arr) {
    var result = [];

    for (var i = 0; i < arr.length; i++) {
      if (result.indexOf(arr[i]) === -1) {
        result.push(arr[i]);
      }
    }

    return result;
  };
  /**
   * Capitalize the first letter of a string
   * @param str
   */

  var capitalizeFirstLetter = function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  /**
   * Returns the array ob object values (Object.values isn't supported in IE11)
   * @param obj
   */

  var objectValues = function objectValues(obj) {
    return Object.keys(obj).map(function (key) {
      return obj[key];
    });
  };
  /**
   * Convert NodeList to Array
   * @param nodeList
   */

  var toArray = function toArray(nodeList) {
    return Array.prototype.slice.call(nodeList);
  };
  /**
   * Standardise console warnings
   * @param message
   */

  var warn = function warn(message) {
    console.warn("".concat(consolePrefix, " ").concat(message));
  };
  /**
   * Standardise console errors
   * @param message
   */

  var error = function error(message) {
    console.error("".concat(consolePrefix, " ").concat(message));
  };
  /**
   * Private global state for `warnOnce`
   * @type {Array}
   * @private
   */

  var previousWarnOnceMessages = [];
  /**
   * Show a console warning, but only if it hasn't already been shown
   * @param message
   */

  var warnOnce = function warnOnce(message) {
    if (!(previousWarnOnceMessages.indexOf(message) !== -1)) {
      previousWarnOnceMessages.push(message);
      warn(message);
    }
  };
  /**
   * Show a one-time console warning about deprecated params/methods
   */

  var warnAboutDepreation = function warnAboutDepreation(deprecatedParam, useInstead) {
    warnOnce("\"".concat(deprecatedParam, "\" is deprecated and will be removed in the next major release. Please use \"").concat(useInstead, "\" instead."));
  };
  /**
   * If `arg` is a function, call it (with no arguments or context) and return the result.
   * Otherwise, just pass the value through
   * @param arg
   */

  var callIfFunction = function callIfFunction(arg) {
    return typeof arg === 'function' ? arg() : arg;
  };
  var isPromise = function isPromise(arg) {
    return arg && Promise.resolve(arg) === arg;
  };

  var DismissReason = Object.freeze({
    cancel: 'cancel',
    backdrop: 'backdrop',
    close: 'close',
    esc: 'esc',
    timer: 'timer'
  });

  var isJqueryElement = function isJqueryElement(elem) {
    return _typeof(elem) === 'object' && elem.jquery;
  };

  var isElement = function isElement(elem) {
    return elem instanceof Element || isJqueryElement(elem);
  };

  var argsToParams = function argsToParams(args) {
    var params = {};

    if (_typeof(args[0]) === 'object' && !isElement(args[0])) {
      _extends(params, args[0]);
    } else {
      ['title', 'html', 'icon'].forEach(function (name, index) {
        var arg = args[index];

        if (typeof arg === 'string' || isElement(arg)) {
          params[name] = arg;
        } else if (arg !== undefined) {
          error("Unexpected type of ".concat(name, "! Expected \"string\" or \"Element\", got ").concat(_typeof(arg)));
        }
      });
    }

    return params;
  };

  var swalPrefix = 'swal2-';
  var prefix = function prefix(items) {
    var result = {};

    for (var i in items) {
      result[items[i]] = swalPrefix + items[i];
    }

    return result;
  };
  var swalClasses = prefix(['container', 'shown', 'height-auto', 'iosfix', 'popup', 'modal', 'no-backdrop', 'no-transition', 'toast', 'toast-shown', 'toast-column', 'show', 'hide', 'close', 'title', 'header', 'content', 'html-container', 'actions', 'confirm', 'cancel', 'footer', 'icon', 'icon-content', 'image', 'input', 'file', 'range', 'select', 'radio', 'checkbox', 'label', 'textarea', 'inputerror', 'validation-message', 'progress-steps', 'active-progress-step', 'progress-step', 'progress-step-line', 'loading', 'styled', 'top', 'top-start', 'top-end', 'top-left', 'top-right', 'center', 'center-start', 'center-end', 'center-left', 'center-right', 'bottom', 'bottom-start', 'bottom-end', 'bottom-left', 'bottom-right', 'grow-row', 'grow-column', 'grow-fullscreen', 'rtl', 'timer-progress-bar', 'scrollbar-measure', 'icon-success', 'icon-warning', 'icon-info', 'icon-question', 'icon-error']);
  var iconTypes = prefix(['success', 'warning', 'info', 'question', 'error']);

  var getContainer = function getContainer() {
    return document.body.querySelector(".".concat(swalClasses.container));
  };
  var elementBySelector = function elementBySelector(selectorString) {
    var container = getContainer();
    return container ? container.querySelector(selectorString) : null;
  };

  var elementByClass = function elementByClass(className) {
    return elementBySelector(".".concat(className));
  };

  var getPopup = function getPopup() {
    return elementByClass(swalClasses.popup);
  };
  var getIcons = function getIcons() {
    var popup = getPopup();
    return toArray(popup.querySelectorAll(".".concat(swalClasses.icon)));
  };
  var getIcon = function getIcon() {
    var visibleIcon = getIcons().filter(function (icon) {
      return isVisible(icon);
    });
    return visibleIcon.length ? visibleIcon[0] : null;
  };
  var getTitle = function getTitle() {
    return elementByClass(swalClasses.title);
  };
  var getContent = function getContent() {
    return elementByClass(swalClasses.content);
  };
  var getHtmlContainer = function getHtmlContainer() {
    return elementByClass(swalClasses['html-container']);
  };
  var getImage = function getImage() {
    return elementByClass(swalClasses.image);
  };
  var getProgressSteps = function getProgressSteps() {
    return elementByClass(swalClasses['progress-steps']);
  };
  var getValidationMessage = function getValidationMessage() {
    return elementByClass(swalClasses['validation-message']);
  };
  var getConfirmButton = function getConfirmButton() {
    return elementBySelector(".".concat(swalClasses.actions, " .").concat(swalClasses.confirm));
  };
  var getCancelButton = function getCancelButton() {
    return elementBySelector(".".concat(swalClasses.actions, " .").concat(swalClasses.cancel));
  };
  var getActions = function getActions() {
    return elementByClass(swalClasses.actions);
  };
  var getHeader = function getHeader() {
    return elementByClass(swalClasses.header);
  };
  var getFooter = function getFooter() {
    return elementByClass(swalClasses.footer);
  };
  var getTimerProgressBar = function getTimerProgressBar() {
    return elementByClass(swalClasses['timer-progress-bar']);
  };
  var getCloseButton = function getCloseButton() {
    return elementByClass(swalClasses.close);
  }; // https://github.com/jkup/focusable/blob/master/index.js

  var focusable = "\n  a[href],\n  area[href],\n  input:not([disabled]),\n  select:not([disabled]),\n  textarea:not([disabled]),\n  button:not([disabled]),\n  iframe,\n  object,\n  embed,\n  [tabindex=\"0\"],\n  [contenteditable],\n  audio[controls],\n  video[controls],\n  summary\n";
  var getFocusableElements = function getFocusableElements() {
    var focusableElementsWithTabindex = toArray(getPopup().querySelectorAll('[tabindex]:not([tabindex="-1"]):not([tabindex="0"])')) // sort according to tabindex
    .sort(function (a, b) {
      a = parseInt(a.getAttribute('tabindex'));
      b = parseInt(b.getAttribute('tabindex'));

      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      }

      return 0;
    });
    var otherFocusableElements = toArray(getPopup().querySelectorAll(focusable)).filter(function (el) {
      return el.getAttribute('tabindex') !== '-1';
    });
    return uniqueArray(focusableElementsWithTabindex.concat(otherFocusableElements)).filter(function (el) {
      return isVisible(el);
    });
  };
  var isModal = function isModal() {
    return !isToast() && !document.body.classList.contains(swalClasses['no-backdrop']);
  };
  var isToast = function isToast() {
    return document.body.classList.contains(swalClasses['toast-shown']);
  };
  var isLoading = function isLoading() {
    return getPopup().hasAttribute('data-loading');
  };

  var states = {
    previousBodyPadding: null
  };
  var hasClass = function hasClass(elem, className) {
    if (!className) {
      return false;
    }

    var classList = className.split(/\s+/);

    for (var i = 0; i < classList.length; i++) {
      if (!elem.classList.contains(classList[i])) {
        return false;
      }
    }

    return true;
  };

  var removeCustomClasses = function removeCustomClasses(elem, params) {
    toArray(elem.classList).forEach(function (className) {
      if (!(objectValues(swalClasses).indexOf(className) !== -1) && !(objectValues(iconTypes).indexOf(className) !== -1) && !(objectValues(params.showClass).indexOf(className) !== -1)) {
        elem.classList.remove(className);
      }
    });
  };

  var applyCustomClass = function applyCustomClass(elem, params, className) {
    removeCustomClasses(elem, params);

    if (params.customClass && params.customClass[className]) {
      if (typeof params.customClass[className] !== 'string' && !params.customClass[className].forEach) {
        return warn("Invalid type of customClass.".concat(className, "! Expected string or iterable object, got \"").concat(_typeof(params.customClass[className]), "\""));
      }

      addClass(elem, params.customClass[className]);
    }
  };
  function getInput(content, inputType) {
    if (!inputType) {
      return null;
    }

    switch (inputType) {
      case 'select':
      case 'textarea':
      case 'file':
        return getChildByClass(content, swalClasses[inputType]);

      case 'checkbox':
        return content.querySelector(".".concat(swalClasses.checkbox, " input"));

      case 'radio':
        return content.querySelector(".".concat(swalClasses.radio, " input:checked")) || content.querySelector(".".concat(swalClasses.radio, " input:first-child"));

      case 'range':
        return content.querySelector(".".concat(swalClasses.range, " input"));

      default:
        return getChildByClass(content, swalClasses.input);
    }
  }
  var focusInput = function focusInput(input) {
    input.focus(); // place cursor at end of text in text input

    if (input.type !== 'file') {
      // http://stackoverflow.com/a/2345915
      var val = input.value;
      input.value = '';
      input.value = val;
    }
  };
  var toggleClass = function toggleClass(target, classList, condition) {
    if (!target || !classList) {
      return;
    }

    if (typeof classList === 'string') {
      classList = classList.split(/\s+/).filter(Boolean);
    }

    classList.forEach(function (className) {
      if (target.forEach) {
        target.forEach(function (elem) {
          condition ? elem.classList.add(className) : elem.classList.remove(className);
        });
      } else {
        condition ? target.classList.add(className) : target.classList.remove(className);
      }
    });
  };
  var addClass = function addClass(target, classList) {
    toggleClass(target, classList, true);
  };
  var removeClass = function removeClass(target, classList) {
    toggleClass(target, classList, false);
  };
  var getChildByClass = function getChildByClass(elem, className) {
    for (var i = 0; i < elem.childNodes.length; i++) {
      if (hasClass(elem.childNodes[i], className)) {
        return elem.childNodes[i];
      }
    }
  };
  var applyNumericalStyle = function applyNumericalStyle(elem, property, value) {
    if (value || parseInt(value) === 0) {
      elem.style[property] = typeof value === 'number' ? "".concat(value, "px") : value;
    } else {
      elem.style.removeProperty(property);
    }
  };
  var show = function show(elem) {
    var display = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'flex';
    elem.style.opacity = '';
    elem.style.display = display;
  };
  var hide = function hide(elem) {
    elem.style.opacity = '';
    elem.style.display = 'none';
  };
  var toggle = function toggle(elem, condition, display) {
    condition ? show(elem, display) : hide(elem);
  }; // borrowed from jquery $(elem).is(':visible') implementation

  var isVisible = function isVisible(elem) {
    return !!(elem && (elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length));
  };
  /* istanbul ignore next */

  var isScrollable = function isScrollable(elem) {
    return !!(elem.scrollHeight > elem.clientHeight);
  }; // borrowed from https://stackoverflow.com/a/46352119

  var hasCssAnimation = function hasCssAnimation(elem) {
    var style = window.getComputedStyle(elem);
    var animDuration = parseFloat(style.getPropertyValue('animation-duration') || '0');
    var transDuration = parseFloat(style.getPropertyValue('transition-duration') || '0');
    return animDuration > 0 || transDuration > 0;
  };
  var contains = function contains(haystack, needle) {
    if (typeof haystack.contains === 'function') {
      return haystack.contains(needle);
    }
  };
  var animateTimerProgressBar = function animateTimerProgressBar(timer) {
    var reset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var timerProgressBar = getTimerProgressBar();

    if (isVisible(timerProgressBar)) {
      if (reset) {
        timerProgressBar.style.transition = 'none';
        timerProgressBar.style.width = '100%';
      }

      setTimeout(function () {
        timerProgressBar.style.transition = "width ".concat(timer / 1000, "s linear");
        timerProgressBar.style.width = '0%';
      }, 10);
    }
  };
  var stopTimerProgressBar = function stopTimerProgressBar() {
    var timerProgressBar = getTimerProgressBar();
    var timerProgressBarWidth = parseInt(window.getComputedStyle(timerProgressBar).width);
    timerProgressBar.style.removeProperty('transition');
    timerProgressBar.style.width = '100%';
    var timerProgressBarFullWidth = parseInt(window.getComputedStyle(timerProgressBar).width);
    var timerProgressBarPercent = parseInt(timerProgressBarWidth / timerProgressBarFullWidth * 100);
    timerProgressBar.style.removeProperty('transition');
    timerProgressBar.style.width = "".concat(timerProgressBarPercent, "%");
  };

  // Detect Node env
  var isNodeEnv = function isNodeEnv() {
    return typeof window === 'undefined' || typeof document === 'undefined';
  };

  var sweetHTML = "\n <div aria-labelledby=\"".concat(swalClasses.title, "\" aria-describedby=\"").concat(swalClasses.content, "\" class=\"").concat(swalClasses.popup, "\" tabindex=\"-1\">\n   <div class=\"").concat(swalClasses.header, "\">\n     <ul class=\"").concat(swalClasses['progress-steps'], "\"></ul>\n     <div class=\"").concat(swalClasses.icon, " ").concat(iconTypes.error, "\"></div>\n     <div class=\"").concat(swalClasses.icon, " ").concat(iconTypes.question, "\"></div>\n     <div class=\"").concat(swalClasses.icon, " ").concat(iconTypes.warning, "\"></div>\n     <div class=\"").concat(swalClasses.icon, " ").concat(iconTypes.info, "\"></div>\n     <div class=\"").concat(swalClasses.icon, " ").concat(iconTypes.success, "\"></div>\n     <img class=\"").concat(swalClasses.image, "\" />\n     <h2 class=\"").concat(swalClasses.title, "\" id=\"").concat(swalClasses.title, "\"></h2>\n     <button type=\"button\" class=\"").concat(swalClasses.close, "\"></button>\n   </div>\n   <div class=\"").concat(swalClasses.content, "\">\n     <div id=\"").concat(swalClasses.content, "\" class=\"").concat(swalClasses['html-container'], "\"></div>\n     <input class=\"").concat(swalClasses.input, "\" />\n     <input type=\"file\" class=\"").concat(swalClasses.file, "\" />\n     <div class=\"").concat(swalClasses.range, "\">\n       <input type=\"range\" />\n       <output></output>\n     </div>\n     <select class=\"").concat(swalClasses.select, "\"></select>\n     <div class=\"").concat(swalClasses.radio, "\"></div>\n     <label for=\"").concat(swalClasses.checkbox, "\" class=\"").concat(swalClasses.checkbox, "\">\n       <input type=\"checkbox\" />\n       <span class=\"").concat(swalClasses.label, "\"></span>\n     </label>\n     <textarea class=\"").concat(swalClasses.textarea, "\"></textarea>\n     <div class=\"").concat(swalClasses['validation-message'], "\" id=\"").concat(swalClasses['validation-message'], "\"></div>\n   </div>\n   <div class=\"").concat(swalClasses.actions, "\">\n     <button type=\"button\" class=\"").concat(swalClasses.confirm, "\">OK</button>\n     <button type=\"button\" class=\"").concat(swalClasses.cancel, "\">Cancel</button>\n   </div>\n   <div class=\"").concat(swalClasses.footer, "\"></div>\n   <div class=\"").concat(swalClasses['timer-progress-bar'], "\"></div>\n </div>\n").replace(/(^|\n)\s*/g, '');

  var resetOldContainer = function resetOldContainer() {
    var oldContainer = getContainer();

    if (!oldContainer) {
      return false;
    }

    oldContainer.parentNode.removeChild(oldContainer);
    removeClass([document.documentElement, document.body], [swalClasses['no-backdrop'], swalClasses['toast-shown'], swalClasses['has-column']]);
    return true;
  };

  var oldInputVal; // IE11 workaround, see #1109 for details

  var resetValidationMessage = function resetValidationMessage(e) {
    if (Swal.isVisible() && oldInputVal !== e.target.value) {
      Swal.resetValidationMessage();
    }

    oldInputVal = e.target.value;
  };

  var addInputChangeListeners = function addInputChangeListeners() {
    var content = getContent();
    var input = getChildByClass(content, swalClasses.input);
    var file = getChildByClass(content, swalClasses.file);
    var range = content.querySelector(".".concat(swalClasses.range, " input"));
    var rangeOutput = content.querySelector(".".concat(swalClasses.range, " output"));
    var select = getChildByClass(content, swalClasses.select);
    var checkbox = content.querySelector(".".concat(swalClasses.checkbox, " input"));
    var textarea = getChildByClass(content, swalClasses.textarea);
    input.oninput = resetValidationMessage;
    file.onchange = resetValidationMessage;
    select.onchange = resetValidationMessage;
    checkbox.onchange = resetValidationMessage;
    textarea.oninput = resetValidationMessage;

    range.oninput = function (e) {
      resetValidationMessage(e);
      rangeOutput.value = range.value;
    };

    range.onchange = function (e) {
      resetValidationMessage(e);
      range.nextSibling.value = range.value;
    };
  };

  var getTarget = function getTarget(target) {
    return typeof target === 'string' ? document.querySelector(target) : target;
  };

  var setupAccessibility = function setupAccessibility(params) {
    var popup = getPopup();
    popup.setAttribute('role', params.toast ? 'alert' : 'dialog');
    popup.setAttribute('aria-live', params.toast ? 'polite' : 'assertive');

    if (!params.toast) {
      popup.setAttribute('aria-modal', 'true');
    }
  };

  var setupRTL = function setupRTL(targetElement) {
    if (window.getComputedStyle(targetElement).direction === 'rtl') {
      addClass(getContainer(), swalClasses.rtl);
    }
  };
  /*
   * Add modal + backdrop to DOM
   */


  var init = function init(params) {
    // Clean up the old popup container if it exists
    var oldContainerExisted = resetOldContainer();
    /* istanbul ignore if */

    if (isNodeEnv()) {
      error('SweetAlert2 requires document to initialize');
      return;
    }

    var container = document.createElement('div');
    container.className = swalClasses.container;

    if (oldContainerExisted) {
      addClass(container, swalClasses['no-transition']);
    }

    container.innerHTML = sweetHTML;
    var targetElement = getTarget(params.target);
    targetElement.appendChild(container);
    setupAccessibility(params);
    setupRTL(targetElement);
    addInputChangeListeners();
  };

  var parseHtmlToContainer = function parseHtmlToContainer(param, target) {
    // DOM element
    if (param instanceof HTMLElement) {
      target.appendChild(param); // Object
    } else if (_typeof(param) === 'object') {
      handleObject(param, target); // Plain string
    } else if (param) {
      target.innerHTML = param;
    }
  };

  var handleObject = function handleObject(param, target) {
    // JQuery element(s)
    if (param.jquery) {
      handleJqueryElem(target, param); // For other objects use their string representation
    } else {
      target.innerHTML = param.toString();
    }
  };

  var handleJqueryElem = function handleJqueryElem(target, elem) {
    target.innerHTML = '';

    if (0 in elem) {
      for (var i = 0; i in elem; i++) {
        target.appendChild(elem[i].cloneNode(true));
      }
    } else {
      target.appendChild(elem.cloneNode(true));
    }
  };

  var animationEndEvent = function () {
    // Prevent run in Node env

    /* istanbul ignore if */
    if (isNodeEnv()) {
      return false;
    }

    var testEl = document.createElement('div');
    var transEndEventNames = {
      WebkitAnimation: 'webkitAnimationEnd',
      OAnimation: 'oAnimationEnd oanimationend',
      animation: 'animationend'
    };

    for (var i in transEndEventNames) {
      if (Object.prototype.hasOwnProperty.call(transEndEventNames, i) && typeof testEl.style[i] !== 'undefined') {
        return transEndEventNames[i];
      }
    }

    return false;
  }();

  // https://github.com/twbs/bootstrap/blob/master/js/src/modal.js

  var measureScrollbar = function measureScrollbar() {
    var scrollDiv = document.createElement('div');
    scrollDiv.className = swalClasses['scrollbar-measure'];
    document.body.appendChild(scrollDiv);
    var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
  };

  var renderActions = function renderActions(instance, params) {
    var actions = getActions();
    var confirmButton = getConfirmButton();
    var cancelButton = getCancelButton(); // Actions (buttons) wrapper

    if (!params.showConfirmButton && !params.showCancelButton) {
      hide(actions);
    } // Custom class


    applyCustomClass(actions, params, 'actions'); // Render confirm button

    renderButton(confirmButton, 'confirm', params); // render Cancel Button

    renderButton(cancelButton, 'cancel', params);

    if (params.buttonsStyling) {
      handleButtonsStyling(confirmButton, cancelButton, params);
    } else {
      removeClass([confirmButton, cancelButton], swalClasses.styled);
      confirmButton.style.backgroundColor = confirmButton.style.borderLeftColor = confirmButton.style.borderRightColor = '';
      cancelButton.style.backgroundColor = cancelButton.style.borderLeftColor = cancelButton.style.borderRightColor = '';
    }

    if (params.reverseButtons) {
      confirmButton.parentNode.insertBefore(cancelButton, confirmButton);
    }
  };

  function handleButtonsStyling(confirmButton, cancelButton, params) {
    addClass([confirmButton, cancelButton], swalClasses.styled); // Buttons background colors

    if (params.confirmButtonColor) {
      confirmButton.style.backgroundColor = params.confirmButtonColor;
    }

    if (params.cancelButtonColor) {
      cancelButton.style.backgroundColor = params.cancelButtonColor;
    } // Loading state


    var confirmButtonBackgroundColor = window.getComputedStyle(confirmButton).getPropertyValue('background-color');
    confirmButton.style.borderLeftColor = confirmButtonBackgroundColor;
    confirmButton.style.borderRightColor = confirmButtonBackgroundColor;
  }

  function renderButton(button, buttonType, params) {
    toggle(button, params["show".concat(capitalizeFirstLetter(buttonType), "Button")], 'inline-block');
    button.innerHTML = params["".concat(buttonType, "ButtonText")]; // Set caption text

    button.setAttribute('aria-label', params["".concat(buttonType, "ButtonAriaLabel")]); // ARIA label
    // Add buttons custom classes

    button.className = swalClasses[buttonType];
    applyCustomClass(button, params, "".concat(buttonType, "Button"));
    addClass(button, params["".concat(buttonType, "ButtonClass")]);
  }

  function handleBackdropParam(container, backdrop) {
    if (typeof backdrop === 'string') {
      container.style.background = backdrop;
    } else if (!backdrop) {
      addClass([document.documentElement, document.body], swalClasses['no-backdrop']);
    }
  }

  function handlePositionParam(container, position) {
    if (position in swalClasses) {
      addClass(container, swalClasses[position]);
    } else {
      warn('The "position" parameter is not valid, defaulting to "center"');
      addClass(container, swalClasses.center);
    }
  }

  function handleGrowParam(container, grow) {
    if (grow && typeof grow === 'string') {
      var growClass = "grow-".concat(grow);

      if (growClass in swalClasses) {
        addClass(container, swalClasses[growClass]);
      }
    }
  }

  var renderContainer = function renderContainer(instance, params) {
    var container = getContainer();

    if (!container) {
      return;
    }

    handleBackdropParam(container, params.backdrop);

    if (!params.backdrop && params.allowOutsideClick) {
      warn('"allowOutsideClick" parameter requires `backdrop` parameter to be set to `true`');
    }

    handlePositionParam(container, params.position);
    handleGrowParam(container, params.grow); // Custom class

    applyCustomClass(container, params, 'container'); // Set queue step attribute for getQueueStep() method

    var queueStep = document.body.getAttribute('data-swal2-queue-step');

    if (queueStep) {
      container.setAttribute('data-queue-step', queueStep);
      document.body.removeAttribute('data-swal2-queue-step');
    }
  };

  /**
   * This module containts `WeakMap`s for each effectively-"private  property" that a `Swal` has.
   * For example, to set the private property "foo" of `this` to "bar", you can `privateProps.foo.set(this, 'bar')`
   * This is the approach that Babel will probably take to implement private methods/fields
   *   https://github.com/tc39/proposal-private-methods
   *   https://github.com/babel/babel/pull/7555
   * Once we have the changes from that PR in Babel, and our core class fits reasonable in *one module*
   *   then we can use that language feature.
   */
  var privateProps = {
    promise: new WeakMap(),
    innerParams: new WeakMap(),
    domCache: new WeakMap()
  };

  var inputTypes = ['input', 'file', 'range', 'select', 'radio', 'checkbox', 'textarea'];
  var renderInput = function renderInput(instance, params) {
    var content = getContent();
    var innerParams = privateProps.innerParams.get(instance);
    var rerender = !innerParams || params.input !== innerParams.input;
    inputTypes.forEach(function (inputType) {
      var inputClass = swalClasses[inputType];
      var inputContainer = getChildByClass(content, inputClass); // set attributes

      setAttributes(inputType, params.inputAttributes); // set class

      inputContainer.className = inputClass;

      if (rerender) {
        hide(inputContainer);
      }
    });

    if (params.input) {
      if (rerender) {
        showInput(params);
      } // set custom class


      setCustomClass(params);
    }
  };

  var showInput = function showInput(params) {
    if (!renderInputType[params.input]) {
      return error("Unexpected type of input! Expected \"text\", \"email\", \"password\", \"number\", \"tel\", \"select\", \"radio\", \"checkbox\", \"textarea\", \"file\" or \"url\", got \"".concat(params.input, "\""));
    }

    var inputContainer = getInputContainer(params.input);
    var input = renderInputType[params.input](inputContainer, params);
    show(input); // input autofocus

    setTimeout(function () {
      focusInput(input);
    });
  };

  var removeAttributes = function removeAttributes(input) {
    for (var i = 0; i < input.attributes.length; i++) {
      var attrName = input.attributes[i].name;

      if (!(['type', 'value', 'style'].indexOf(attrName) !== -1)) {
        input.removeAttribute(attrName);
      }
    }
  };

  var setAttributes = function setAttributes(inputType, inputAttributes) {
    var input = getInput(getContent(), inputType);

    if (!input) {
      return;
    }

    removeAttributes(input);

    for (var attr in inputAttributes) {
      // Do not set a placeholder for <input type="range">
      // it'll crash Edge, #1298
      if (inputType === 'range' && attr === 'placeholder') {
        continue;
      }

      input.setAttribute(attr, inputAttributes[attr]);
    }
  };

  var setCustomClass = function setCustomClass(params) {
    var inputContainer = getInputContainer(params.input);

    if (params.customClass) {
      addClass(inputContainer, params.customClass.input);
    }
  };

  var setInputPlaceholder = function setInputPlaceholder(input, params) {
    if (!input.placeholder || params.inputPlaceholder) {
      input.placeholder = params.inputPlaceholder;
    }
  };

  var getInputContainer = function getInputContainer(inputType) {
    var inputClass = swalClasses[inputType] ? swalClasses[inputType] : swalClasses.input;
    return getChildByClass(getContent(), inputClass);
  };

  var renderInputType = {};

  renderInputType.text = renderInputType.email = renderInputType.password = renderInputType.number = renderInputType.tel = renderInputType.url = function (input, params) {
    if (typeof params.inputValue === 'string' || typeof params.inputValue === 'number') {
      input.value = params.inputValue;
    } else if (!isPromise(params.inputValue)) {
      warn("Unexpected type of inputValue! Expected \"string\", \"number\" or \"Promise\", got \"".concat(_typeof(params.inputValue), "\""));
    }

    setInputPlaceholder(input, params);
    input.type = params.input;
    return input;
  };

  renderInputType.file = function (input, params) {
    setInputPlaceholder(input, params);
    return input;
  };

  renderInputType.range = function (range, params) {
    var rangeInput = range.querySelector('input');
    var rangeOutput = range.querySelector('output');
    rangeInput.value = params.inputValue;
    rangeInput.type = params.input;
    rangeOutput.value = params.inputValue;
    return range;
  };

  renderInputType.select = function (select, params) {
    select.innerHTML = '';

    if (params.inputPlaceholder) {
      var placeholder = document.createElement('option');
      placeholder.innerHTML = params.inputPlaceholder;
      placeholder.value = '';
      placeholder.disabled = true;
      placeholder.selected = true;
      select.appendChild(placeholder);
    }

    return select;
  };

  renderInputType.radio = function (radio) {
    radio.innerHTML = '';
    return radio;
  };

  renderInputType.checkbox = function (checkboxContainer, params) {
    var checkbox = getInput(getContent(), 'checkbox');
    checkbox.value = 1;
    checkbox.id = swalClasses.checkbox;
    checkbox.checked = Boolean(params.inputValue);
    var label = checkboxContainer.querySelector('span');
    label.innerHTML = params.inputPlaceholder;
    return checkboxContainer;
  };

  renderInputType.textarea = function (textarea, params) {
    textarea.value = params.inputValue;
    setInputPlaceholder(textarea, params);

    if ('MutationObserver' in window) {
      // #1699
      var initialPopupWidth = parseInt(window.getComputedStyle(getPopup()).width);
      var popupPadding = parseInt(window.getComputedStyle(getPopup()).paddingLeft) + parseInt(window.getComputedStyle(getPopup()).paddingRight);

      var outputsize = function outputsize() {
        var contentWidth = textarea.offsetWidth + popupPadding;

        if (contentWidth > initialPopupWidth) {
          getPopup().style.width = "".concat(contentWidth, "px");
        } else {
          getPopup().style.width = null;
        }
      };

      new MutationObserver(outputsize).observe(textarea, {
        attributes: true,
        attributeFilter: ['style']
      });
    }

    return textarea;
  };

  var renderContent = function renderContent(instance, params) {
    var content = getContent().querySelector("#".concat(swalClasses.content)); // Content as HTML

    if (params.html) {
      parseHtmlToContainer(params.html, content);
      show(content, 'block'); // Content as plain text
    } else if (params.text) {
      content.textContent = params.text;
      show(content, 'block'); // No content
    } else {
      hide(content);
    }

    renderInput(instance, params); // Custom class

    applyCustomClass(getContent(), params, 'content');
  };

  var renderFooter = function renderFooter(instance, params) {
    var footer = getFooter();
    toggle(footer, params.footer);

    if (params.footer) {
      parseHtmlToContainer(params.footer, footer);
    } // Custom class


    applyCustomClass(footer, params, 'footer');
  };

  var renderCloseButton = function renderCloseButton(instance, params) {
    var closeButton = getCloseButton();
    closeButton.innerHTML = params.closeButtonHtml; // Custom class

    applyCustomClass(closeButton, params, 'closeButton');
    toggle(closeButton, params.showCloseButton);
    closeButton.setAttribute('aria-label', params.closeButtonAriaLabel);
  };

  var renderIcon = function renderIcon(instance, params) {
    var innerParams = privateProps.innerParams.get(instance); // if the give icon already rendered, apply the custom class without re-rendering the icon

    if (innerParams && params.icon === innerParams.icon && getIcon()) {
      applyCustomClass(getIcon(), params, 'icon');
      return;
    }

    hideAllIcons();

    if (!params.icon) {
      return;
    }

    if (Object.keys(iconTypes).indexOf(params.icon) !== -1) {
      var icon = elementBySelector(".".concat(swalClasses.icon, ".").concat(iconTypes[params.icon]));
      show(icon); // Custom or default content

      setContent(icon, params);
      adjustSuccessIconBackgoundColor(); // Custom class

      applyCustomClass(icon, params, 'icon'); // Animate icon

      addClass(icon, params.showClass.icon);
    } else {
      error("Unknown icon! Expected \"success\", \"error\", \"warning\", \"info\" or \"question\", got \"".concat(params.icon, "\""));
    }
  };

  var hideAllIcons = function hideAllIcons() {
    var icons = getIcons();

    for (var i = 0; i < icons.length; i++) {
      hide(icons[i]);
    }
  }; // Adjust success icon background color to match the popup background color


  var adjustSuccessIconBackgoundColor = function adjustSuccessIconBackgoundColor() {
    var popup = getPopup();
    var popupBackgroundColor = window.getComputedStyle(popup).getPropertyValue('background-color');
    var successIconParts = popup.querySelectorAll('[class^=swal2-success-circular-line], .swal2-success-fix');

    for (var i = 0; i < successIconParts.length; i++) {
      successIconParts[i].style.backgroundColor = popupBackgroundColor;
    }
  };

  var setContent = function setContent(icon, params) {
    icon.innerHTML = '';

    if (params.iconHtml) {
      icon.innerHTML = iconContent(params.iconHtml);
    } else if (params.icon === 'success') {
      icon.innerHTML = "\n      <div class=\"swal2-success-circular-line-left\"></div>\n      <span class=\"swal2-success-line-tip\"></span> <span class=\"swal2-success-line-long\"></span>\n      <div class=\"swal2-success-ring\"></div> <div class=\"swal2-success-fix\"></div>\n      <div class=\"swal2-success-circular-line-right\"></div>\n    ";
    } else if (params.icon === 'error') {
      icon.innerHTML = "\n      <span class=\"swal2-x-mark\">\n        <span class=\"swal2-x-mark-line-left\"></span>\n        <span class=\"swal2-x-mark-line-right\"></span>\n      </span>\n    ";
    } else {
      var defaultIconHtml = {
        question: '?',
        warning: '!',
        info: 'i'
      };
      icon.innerHTML = iconContent(defaultIconHtml[params.icon]);
    }
  };

  var iconContent = function iconContent(content) {
    return "<div class=\"".concat(swalClasses['icon-content'], "\">").concat(content, "</div>");
  };

  var renderImage = function renderImage(instance, params) {
    var image = getImage();

    if (!params.imageUrl) {
      return hide(image);
    }

    show(image); // Src, alt

    image.setAttribute('src', params.imageUrl);
    image.setAttribute('alt', params.imageAlt); // Width, height

    applyNumericalStyle(image, 'width', params.imageWidth);
    applyNumericalStyle(image, 'height', params.imageHeight); // Class

    image.className = swalClasses.image;
    applyCustomClass(image, params, 'image');
  };

  var currentSteps = [];
  /*
   * Global function for chaining sweetAlert popups
   */

  var queue = function queue(steps) {
    var Swal = this;
    currentSteps = steps;

    var resetAndResolve = function resetAndResolve(resolve, value) {
      currentSteps = [];
      resolve(value);
    };

    var queueResult = [];
    return new Promise(function (resolve) {
      (function step(i, callback) {
        if (i < currentSteps.length) {
          document.body.setAttribute('data-swal2-queue-step', i);
          Swal.fire(currentSteps[i]).then(function (result) {
            if (typeof result.value !== 'undefined') {
              queueResult.push(result.value);
              step(i + 1, callback);
            } else {
              resetAndResolve(resolve, {
                dismiss: result.dismiss
              });
            }
          });
        } else {
          resetAndResolve(resolve, {
            value: queueResult
          });
        }
      })(0);
    });
  };
  /*
   * Global function for getting the index of current popup in queue
   */

  var getQueueStep = function getQueueStep() {
    return getContainer().getAttribute('data-queue-step');
  };
  /*
   * Global function for inserting a popup to the queue
   */

  var insertQueueStep = function insertQueueStep(step, index) {
    if (index && index < currentSteps.length) {
      return currentSteps.splice(index, 0, step);
    }

    return currentSteps.push(step);
  };
  /*
   * Global function for deleting a popup from the queue
   */

  var deleteQueueStep = function deleteQueueStep(index) {
    if (typeof currentSteps[index] !== 'undefined') {
      currentSteps.splice(index, 1);
    }
  };

  var createStepElement = function createStepElement(step) {
    var stepEl = document.createElement('li');
    addClass(stepEl, swalClasses['progress-step']);
    stepEl.innerHTML = step;
    return stepEl;
  };

  var createLineElement = function createLineElement(params) {
    var lineEl = document.createElement('li');
    addClass(lineEl, swalClasses['progress-step-line']);

    if (params.progressStepsDistance) {
      lineEl.style.width = params.progressStepsDistance;
    }

    return lineEl;
  };

  var renderProgressSteps = function renderProgressSteps(instance, params) {
    var progressStepsContainer = getProgressSteps();

    if (!params.progressSteps || params.progressSteps.length === 0) {
      return hide(progressStepsContainer);
    }

    show(progressStepsContainer);
    progressStepsContainer.innerHTML = '';
    var currentProgressStep = parseInt(params.currentProgressStep === undefined ? getQueueStep() : params.currentProgressStep);

    if (currentProgressStep >= params.progressSteps.length) {
      warn('Invalid currentProgressStep parameter, it should be less than progressSteps.length ' + '(currentProgressStep like JS arrays starts from 0)');
    }

    params.progressSteps.forEach(function (step, index) {
      var stepEl = createStepElement(step);
      progressStepsContainer.appendChild(stepEl);

      if (index === currentProgressStep) {
        addClass(stepEl, swalClasses['active-progress-step']);
      }

      if (index !== params.progressSteps.length - 1) {
        var lineEl = createLineElement(step);
        progressStepsContainer.appendChild(lineEl);
      }
    });
  };

  var renderTitle = function renderTitle(instance, params) {
    var title = getTitle();
    toggle(title, params.title || params.titleText);

    if (params.title) {
      parseHtmlToContainer(params.title, title);
    }

    if (params.titleText) {
      title.innerText = params.titleText;
    } // Custom class


    applyCustomClass(title, params, 'title');
  };

  var renderHeader = function renderHeader(instance, params) {
    var header = getHeader(); // Custom class

    applyCustomClass(header, params, 'header'); // Progress steps

    renderProgressSteps(instance, params); // Icon

    renderIcon(instance, params); // Image

    renderImage(instance, params); // Title

    renderTitle(instance, params); // Close button

    renderCloseButton(instance, params);
  };

  var renderPopup = function renderPopup(instance, params) {
    var popup = getPopup(); // Width

    applyNumericalStyle(popup, 'width', params.width); // Padding

    applyNumericalStyle(popup, 'padding', params.padding); // Background

    if (params.background) {
      popup.style.background = params.background;
    } // Classes


    addClasses(popup, params);
  };

  var addClasses = function addClasses(popup, params) {
    // Default Class + showClass when updating Swal.update({})
    popup.className = "".concat(swalClasses.popup, " ").concat(isVisible(popup) ? params.showClass.popup : '');

    if (params.toast) {
      addClass([document.documentElement, document.body], swalClasses['toast-shown']);
      addClass(popup, swalClasses.toast);
    } else {
      addClass(popup, swalClasses.modal);
    } // Custom class


    applyCustomClass(popup, params, 'popup');

    if (typeof params.customClass === 'string') {
      addClass(popup, params.customClass);
    } // Icon class (#1842)


    if (params.icon) {
      addClass(popup, swalClasses["icon-".concat(params.icon)]);
    }
  };

  var render = function render(instance, params) {
    renderPopup(instance, params);
    renderContainer(instance, params);
    renderHeader(instance, params);
    renderContent(instance, params);
    renderActions(instance, params);
    renderFooter(instance, params);

    if (typeof params.onRender === 'function') {
      params.onRender(getPopup());
    }
  };

  /*
   * Global function to determine if SweetAlert2 popup is shown
   */

  var isVisible$1 = function isVisible$$1() {
    return isVisible(getPopup());
  };
  /*
   * Global function to click 'Confirm' button
   */

  var clickConfirm = function clickConfirm() {
    return getConfirmButton() && getConfirmButton().click();
  };
  /*
   * Global function to click 'Cancel' button
   */

  var clickCancel = function clickCancel() {
    return getCancelButton() && getCancelButton().click();
  };

  function fire() {
    var Swal = this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _construct(Swal, args);
  }

  /**
   * Returns an extended version of `Swal` containing `params` as defaults.
   * Useful for reusing Swal configuration.
   *
   * For example:
   *
   * Before:
   * const textPromptOptions = { input: 'text', showCancelButton: true }
   * const {value: firstName} = await Swal.fire({ ...textPromptOptions, title: 'What is your first name?' })
   * const {value: lastName} = await Swal.fire({ ...textPromptOptions, title: 'What is your last name?' })
   *
   * After:
   * const TextPrompt = Swal.mixin({ input: 'text', showCancelButton: true })
   * const {value: firstName} = await TextPrompt('What is your first name?')
   * const {value: lastName} = await TextPrompt('What is your last name?')
   *
   * @param mixinParams
   */
  function mixin(mixinParams) {
    var MixinSwal =
    /*#__PURE__*/
    function (_this) {
      _inherits(MixinSwal, _this);

      function MixinSwal() {
        _classCallCheck(this, MixinSwal);

        return _possibleConstructorReturn(this, _getPrototypeOf(MixinSwal).apply(this, arguments));
      }

      _createClass(MixinSwal, [{
        key: "_main",
        value: function _main(params) {
          return _get(_getPrototypeOf(MixinSwal.prototype), "_main", this).call(this, _extends({}, mixinParams, params));
        }
      }]);

      return MixinSwal;
    }(this);

    return MixinSwal;
  }

  /**
   * Show spinner instead of Confirm button
   */

  var showLoading = function showLoading() {
    var popup = getPopup();

    if (!popup) {
      Swal.fire();
    }

    popup = getPopup();
    var actions = getActions();
    var confirmButton = getConfirmButton();
    show(actions);
    show(confirmButton, 'inline-block');
    addClass([popup, actions], swalClasses.loading);
    confirmButton.disabled = true;
    popup.setAttribute('data-loading', true);
    popup.setAttribute('aria-busy', true);
    popup.focus();
  };

  var RESTORE_FOCUS_TIMEOUT = 100;

  var globalState = {};

  var focusPreviousActiveElement = function focusPreviousActiveElement() {
    if (globalState.previousActiveElement && globalState.previousActiveElement.focus) {
      globalState.previousActiveElement.focus();
      globalState.previousActiveElement = null;
    } else if (document.body) {
      document.body.focus();
    }
  }; // Restore previous active (focused) element


  var restoreActiveElement = function restoreActiveElement() {
    return new Promise(function (resolve) {
      var x = window.scrollX;
      var y = window.scrollY;
      globalState.restoreFocusTimeout = setTimeout(function () {
        focusPreviousActiveElement();
        resolve();
      }, RESTORE_FOCUS_TIMEOUT); // issues/900

      /* istanbul ignore if */

      if (typeof x !== 'undefined' && typeof y !== 'undefined') {
        // IE doesn't have scrollX/scrollY support
        window.scrollTo(x, y);
      }
    });
  };

  /**
   * If `timer` parameter is set, returns number of milliseconds of timer remained.
   * Otherwise, returns undefined.
   */

  var getTimerLeft = function getTimerLeft() {
    return globalState.timeout && globalState.timeout.getTimerLeft();
  };
  /**
   * Stop timer. Returns number of milliseconds of timer remained.
   * If `timer` parameter isn't set, returns undefined.
   */

  var stopTimer = function stopTimer() {
    if (globalState.timeout) {
      stopTimerProgressBar();
      return globalState.timeout.stop();
    }
  };
  /**
   * Resume timer. Returns number of milliseconds of timer remained.
   * If `timer` parameter isn't set, returns undefined.
   */

  var resumeTimer = function resumeTimer() {
    if (globalState.timeout) {
      var remaining = globalState.timeout.start();
      animateTimerProgressBar(remaining);
      return remaining;
    }
  };
  /**
   * Resume timer. Returns number of milliseconds of timer remained.
   * If `timer` parameter isn't set, returns undefined.
   */

  var toggleTimer = function toggleTimer() {
    var timer = globalState.timeout;
    return timer && (timer.running ? stopTimer() : resumeTimer());
  };
  /**
   * Increase timer. Returns number of milliseconds of an updated timer.
   * If `timer` parameter isn't set, returns undefined.
   */

  var increaseTimer = function increaseTimer(n) {
    if (globalState.timeout) {
      var remaining = globalState.timeout.increase(n);
      animateTimerProgressBar(remaining, true);
      return remaining;
    }
  };
  /**
   * Check if timer is running. Returns true if timer is running
   * or false if timer is paused or stopped.
   * If `timer` parameter isn't set, returns undefined
   */

  var isTimerRunning = function isTimerRunning() {
    return globalState.timeout && globalState.timeout.isRunning();
  };

  var defaultParams = {
    title: '',
    titleText: '',
    text: '',
    html: '',
    footer: '',
    icon: undefined,
    iconHtml: undefined,
    toast: false,
    animation: true,
    showClass: {
      popup: 'swal2-show',
      backdrop: 'swal2-backdrop-show',
      icon: 'swal2-icon-show'
    },
    hideClass: {
      popup: 'swal2-hide',
      backdrop: 'swal2-backdrop-hide',
      icon: 'swal2-icon-hide'
    },
    customClass: undefined,
    target: 'body',
    backdrop: true,
    heightAuto: true,
    allowOutsideClick: true,
    allowEscapeKey: true,
    allowEnterKey: true,
    stopKeydownPropagation: true,
    keydownListenerCapture: false,
    showConfirmButton: true,
    showCancelButton: false,
    preConfirm: undefined,
    confirmButtonText: 'OK',
    confirmButtonAriaLabel: '',
    confirmButtonColor: undefined,
    cancelButtonText: 'Cancel',
    cancelButtonAriaLabel: '',
    cancelButtonColor: undefined,
    buttonsStyling: true,
    reverseButtons: false,
    focusConfirm: true,
    focusCancel: false,
    showCloseButton: false,
    closeButtonHtml: '&times;',
    closeButtonAriaLabel: 'Close this dialog',
    showLoaderOnConfirm: false,
    imageUrl: undefined,
    imageWidth: undefined,
    imageHeight: undefined,
    imageAlt: '',
    timer: undefined,
    timerProgressBar: false,
    width: undefined,
    padding: undefined,
    background: undefined,
    input: undefined,
    inputPlaceholder: '',
    inputValue: '',
    inputOptions: {},
    inputAutoTrim: true,
    inputAttributes: {},
    inputValidator: undefined,
    validationMessage: undefined,
    grow: false,
    position: 'center',
    progressSteps: [],
    currentProgressStep: undefined,
    progressStepsDistance: undefined,
    onBeforeOpen: undefined,
    onOpen: undefined,
    onRender: undefined,
    onClose: undefined,
    onAfterClose: undefined,
    onDestroy: undefined,
    scrollbarPadding: true
  };
  var updatableParams = ['title', 'titleText', 'text', 'html', 'icon', 'customClass', 'allowOutsideClick', 'allowEscapeKey', 'showConfirmButton', 'showCancelButton', 'confirmButtonText', 'confirmButtonAriaLabel', 'confirmButtonColor', 'cancelButtonText', 'cancelButtonAriaLabel', 'cancelButtonColor', 'buttonsStyling', 'reverseButtons', 'imageUrl', 'imageWidth', 'imageHeight', 'imageAlt', 'progressSteps', 'currentProgressStep'];
  var deprecatedParams = {
    animation: 'showClass" and "hideClass'
  };
  var toastIncompatibleParams = ['allowOutsideClick', 'allowEnterKey', 'backdrop', 'focusConfirm', 'focusCancel', 'heightAuto', 'keydownListenerCapture'];
  /**
   * Is valid parameter
   * @param {String} paramName
   */

  var isValidParameter = function isValidParameter(paramName) {
    return Object.prototype.hasOwnProperty.call(defaultParams, paramName);
  };
  /**
   * Is valid parameter for Swal.update() method
   * @param {String} paramName
   */

  var isUpdatableParameter = function isUpdatableParameter(paramName) {
    return updatableParams.indexOf(paramName) !== -1;
  };
  /**
   * Is deprecated parameter
   * @param {String} paramName
   */

  var isDeprecatedParameter = function isDeprecatedParameter(paramName) {
    return deprecatedParams[paramName];
  };

  var checkIfParamIsValid = function checkIfParamIsValid(param) {
    if (!isValidParameter(param)) {
      warn("Unknown parameter \"".concat(param, "\""));
    }
  };

  var checkIfToastParamIsValid = function checkIfToastParamIsValid(param) {
    if (toastIncompatibleParams.indexOf(param) !== -1) {
      warn("The parameter \"".concat(param, "\" is incompatible with toasts"));
    }
  };

  var checkIfParamIsDeprecated = function checkIfParamIsDeprecated(param) {
    if (isDeprecatedParameter(param)) {
      warnAboutDepreation(param, isDeprecatedParameter(param));
    }
  };
  /**
   * Show relevant warnings for given params
   *
   * @param params
   */


  var showWarningsForParams = function showWarningsForParams(params) {
    for (var param in params) {
      checkIfParamIsValid(param);

      if (params.toast) {
        checkIfToastParamIsValid(param);
      }

      checkIfParamIsDeprecated(param);
    }
  };



  var staticMethods = /*#__PURE__*/Object.freeze({
    isValidParameter: isValidParameter,
    isUpdatableParameter: isUpdatableParameter,
    isDeprecatedParameter: isDeprecatedParameter,
    argsToParams: argsToParams,
    isVisible: isVisible$1,
    clickConfirm: clickConfirm,
    clickCancel: clickCancel,
    getContainer: getContainer,
    getPopup: getPopup,
    getTitle: getTitle,
    getContent: getContent,
    getHtmlContainer: getHtmlContainer,
    getImage: getImage,
    getIcon: getIcon,
    getIcons: getIcons,
    getCloseButton: getCloseButton,
    getActions: getActions,
    getConfirmButton: getConfirmButton,
    getCancelButton: getCancelButton,
    getHeader: getHeader,
    getFooter: getFooter,
    getTimerProgressBar: getTimerProgressBar,
    getFocusableElements: getFocusableElements,
    getValidationMessage: getValidationMessage,
    isLoading: isLoading,
    fire: fire,
    mixin: mixin,
    queue: queue,
    getQueueStep: getQueueStep,
    insertQueueStep: insertQueueStep,
    deleteQueueStep: deleteQueueStep,
    showLoading: showLoading,
    enableLoading: showLoading,
    getTimerLeft: getTimerLeft,
    stopTimer: stopTimer,
    resumeTimer: resumeTimer,
    toggleTimer: toggleTimer,
    increaseTimer: increaseTimer,
    isTimerRunning: isTimerRunning
  });

  /**
   * Enables buttons and hide loader.
   */

  function hideLoading() {
    // do nothing if popup is closed
    var innerParams = privateProps.innerParams.get(this);

    if (!innerParams) {
      return;
    }

    var domCache = privateProps.domCache.get(this);

    if (!innerParams.showConfirmButton) {
      hide(domCache.confirmButton);

      if (!innerParams.showCancelButton) {
        hide(domCache.actions);
      }
    }

    removeClass([domCache.popup, domCache.actions], swalClasses.loading);
    domCache.popup.removeAttribute('aria-busy');
    domCache.popup.removeAttribute('data-loading');
    domCache.confirmButton.disabled = false;
    domCache.cancelButton.disabled = false;
  }

  function getInput$1(instance) {
    var innerParams = privateProps.innerParams.get(instance || this);
    var domCache = privateProps.domCache.get(instance || this);

    if (!domCache) {
      return null;
    }

    return getInput(domCache.content, innerParams.input);
  }

  var fixScrollbar = function fixScrollbar() {
    // for queues, do not do this more than once
    if (states.previousBodyPadding !== null) {
      return;
    } // if the body has overflow


    if (document.body.scrollHeight > window.innerHeight) {
      // add padding so the content doesn't shift after removal of scrollbar
      states.previousBodyPadding = parseInt(window.getComputedStyle(document.body).getPropertyValue('padding-right'));
      document.body.style.paddingRight = "".concat(states.previousBodyPadding + measureScrollbar(), "px");
    }
  };
  var undoScrollbar = function undoScrollbar() {
    if (states.previousBodyPadding !== null) {
      document.body.style.paddingRight = "".concat(states.previousBodyPadding, "px");
      states.previousBodyPadding = null;
    }
  };

  /* istanbul ignore file */

  var iOSfix = function iOSfix() {
    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

    if (iOS && !hasClass(document.body, swalClasses.iosfix)) {
      var offset = document.body.scrollTop;
      document.body.style.top = "".concat(offset * -1, "px");
      addClass(document.body, swalClasses.iosfix);
      lockBodyScroll();
    }
  };

  var lockBodyScroll = function lockBodyScroll() {
    // #1246
    var container = getContainer();
    var preventTouchMove;

    container.ontouchstart = function (e) {
      preventTouchMove = e.target === container || !isScrollable(container) && e.target.tagName !== 'INPUT' // #1603
      ;
    };

    container.ontouchmove = function (e) {
      if (preventTouchMove) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
  };

  var undoIOSfix = function undoIOSfix() {
    if (hasClass(document.body, swalClasses.iosfix)) {
      var offset = parseInt(document.body.style.top, 10);
      removeClass(document.body, swalClasses.iosfix);
      document.body.style.top = '';
      document.body.scrollTop = offset * -1;
    }
  };

  /* istanbul ignore file */

  var isIE11 = function isIE11() {
    return !!window.MSInputMethodContext && !!document.documentMode;
  }; // Fix IE11 centering sweetalert2/issues/933


  var fixVerticalPositionIE = function fixVerticalPositionIE() {
    var container = getContainer();
    var popup = getPopup();
    container.style.removeProperty('align-items');

    if (popup.offsetTop < 0) {
      container.style.alignItems = 'flex-start';
    }
  };

  var IEfix = function IEfix() {
    if (typeof window !== 'undefined' && isIE11()) {
      fixVerticalPositionIE();
      window.addEventListener('resize', fixVerticalPositionIE);
    }
  };
  var undoIEfix = function undoIEfix() {
    if (typeof window !== 'undefined' && isIE11()) {
      window.removeEventListener('resize', fixVerticalPositionIE);
    }
  };

  // Adding aria-hidden="true" to elements outside of the active modal dialog ensures that
  // elements not within the active modal dialog will not be surfaced if a user opens a screen
  // reader’s list of elements (headings, form controls, landmarks, etc.) in the document.

  var setAriaHidden = function setAriaHidden() {
    var bodyChildren = toArray(document.body.children);
    bodyChildren.forEach(function (el) {
      if (el === getContainer() || contains(el, getContainer())) {
        return;
      }

      if (el.hasAttribute('aria-hidden')) {
        el.setAttribute('data-previous-aria-hidden', el.getAttribute('aria-hidden'));
      }

      el.setAttribute('aria-hidden', 'true');
    });
  };
  var unsetAriaHidden = function unsetAriaHidden() {
    var bodyChildren = toArray(document.body.children);
    bodyChildren.forEach(function (el) {
      if (el.hasAttribute('data-previous-aria-hidden')) {
        el.setAttribute('aria-hidden', el.getAttribute('data-previous-aria-hidden'));
        el.removeAttribute('data-previous-aria-hidden');
      } else {
        el.removeAttribute('aria-hidden');
      }
    });
  };

  /**
   * This module containts `WeakMap`s for each effectively-"private  property" that a `Swal` has.
   * For example, to set the private property "foo" of `this` to "bar", you can `privateProps.foo.set(this, 'bar')`
   * This is the approach that Babel will probably take to implement private methods/fields
   *   https://github.com/tc39/proposal-private-methods
   *   https://github.com/babel/babel/pull/7555
   * Once we have the changes from that PR in Babel, and our core class fits reasonable in *one module*
   *   then we can use that language feature.
   */
  var privateMethods = {
    swalPromiseResolve: new WeakMap()
  };

  /*
   * Instance method to close sweetAlert
   */

  function removePopupAndResetState(instance, container, isToast$$1, onAfterClose) {
    if (isToast$$1) {
      triggerOnAfterCloseAndDispose(instance, onAfterClose);
    } else {
      restoreActiveElement().then(function () {
        return triggerOnAfterCloseAndDispose(instance, onAfterClose);
      });
      globalState.keydownTarget.removeEventListener('keydown', globalState.keydownHandler, {
        capture: globalState.keydownListenerCapture
      });
      globalState.keydownHandlerAdded = false;
    }

    if (container.parentNode && !document.body.getAttribute('data-swal2-queue-step')) {
      container.parentNode.removeChild(container);
    }

    if (isModal()) {
      undoScrollbar();
      undoIOSfix();
      undoIEfix();
      unsetAriaHidden();
    }

    removeBodyClasses();
  }

  function removeBodyClasses() {
    removeClass([document.documentElement, document.body], [swalClasses.shown, swalClasses['height-auto'], swalClasses['no-backdrop'], swalClasses['toast-shown'], swalClasses['toast-column']]);
  }

  function close(resolveValue) {
    var popup = getPopup();

    if (!popup) {
      return;
    }

    var innerParams = privateProps.innerParams.get(this);

    if (!innerParams || hasClass(popup, innerParams.hideClass.popup)) {
      return;
    }

    var swalPromiseResolve = privateMethods.swalPromiseResolve.get(this);
    removeClass(popup, innerParams.showClass.popup);
    addClass(popup, innerParams.hideClass.popup);
    var backdrop = getContainer();
    removeClass(backdrop, innerParams.showClass.backdrop);
    addClass(backdrop, innerParams.hideClass.backdrop);
    handlePopupAnimation(this, popup, innerParams); // Resolve Swal promise

    swalPromiseResolve(resolveValue || {});
  }

  var handlePopupAnimation = function handlePopupAnimation(instance, popup, innerParams) {
    var container = getContainer(); // If animation is supported, animate

    var animationIsSupported = animationEndEvent && hasCssAnimation(popup);
    var onClose = innerParams.onClose,
        onAfterClose = innerParams.onAfterClose;

    if (onClose !== null && typeof onClose === 'function') {
      onClose(popup);
    }

    if (animationIsSupported) {
      animatePopup(instance, popup, container, onAfterClose);
    } else {
      // Otherwise, remove immediately
      removePopupAndResetState(instance, container, isToast(), onAfterClose);
    }
  };

  var animatePopup = function animatePopup(instance, popup, container, onAfterClose) {
    globalState.swalCloseEventFinishedCallback = removePopupAndResetState.bind(null, instance, container, isToast(), onAfterClose);
    popup.addEventListener(animationEndEvent, function (e) {
      if (e.target === popup) {
        globalState.swalCloseEventFinishedCallback();
        delete globalState.swalCloseEventFinishedCallback;
      }
    });
  };

  var triggerOnAfterCloseAndDispose = function triggerOnAfterCloseAndDispose(instance, onAfterClose) {
    setTimeout(function () {
      if (typeof onAfterClose === 'function') {
        onAfterClose();
      }

      instance._destroy();
    });
  };

  function setButtonsDisabled(instance, buttons, disabled) {
    var domCache = privateProps.domCache.get(instance);
    buttons.forEach(function (button) {
      domCache[button].disabled = disabled;
    });
  }

  function setInputDisabled(input, disabled) {
    if (!input) {
      return false;
    }

    if (input.type === 'radio') {
      var radiosContainer = input.parentNode.parentNode;
      var radios = radiosContainer.querySelectorAll('input');

      for (var i = 0; i < radios.length; i++) {
        radios[i].disabled = disabled;
      }
    } else {
      input.disabled = disabled;
    }
  }

  function enableButtons() {
    setButtonsDisabled(this, ['confirmButton', 'cancelButton'], false);
  }
  function disableButtons() {
    setButtonsDisabled(this, ['confirmButton', 'cancelButton'], true);
  }
  function enableInput() {
    return setInputDisabled(this.getInput(), false);
  }
  function disableInput() {
    return setInputDisabled(this.getInput(), true);
  }

  function showValidationMessage(error) {
    var domCache = privateProps.domCache.get(this);
    domCache.validationMessage.innerHTML = error;
    var popupComputedStyle = window.getComputedStyle(domCache.popup);
    domCache.validationMessage.style.marginLeft = "-".concat(popupComputedStyle.getPropertyValue('padding-left'));
    domCache.validationMessage.style.marginRight = "-".concat(popupComputedStyle.getPropertyValue('padding-right'));
    show(domCache.validationMessage);
    var input = this.getInput();

    if (input) {
      input.setAttribute('aria-invalid', true);
      input.setAttribute('aria-describedBy', swalClasses['validation-message']);
      focusInput(input);
      addClass(input, swalClasses.inputerror);
    }
  } // Hide block with validation message

  function resetValidationMessage$1() {
    var domCache = privateProps.domCache.get(this);

    if (domCache.validationMessage) {
      hide(domCache.validationMessage);
    }

    var input = this.getInput();

    if (input) {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedBy');
      removeClass(input, swalClasses.inputerror);
    }
  }

  function getProgressSteps$1() {
    var domCache = privateProps.domCache.get(this);
    return domCache.progressSteps;
  }

  var Timer =
  /*#__PURE__*/
  function () {
    function Timer(callback, delay) {
      _classCallCheck(this, Timer);

      this.callback = callback;
      this.remaining = delay;
      this.running = false;
      this.start();
    }

    _createClass(Timer, [{
      key: "start",
      value: function start() {
        if (!this.running) {
          this.running = true;
          this.started = new Date();
          this.id = setTimeout(this.callback, this.remaining);
        }

        return this.remaining;
      }
    }, {
      key: "stop",
      value: function stop() {
        if (this.running) {
          this.running = false;
          clearTimeout(this.id);
          this.remaining -= new Date() - this.started;
        }

        return this.remaining;
      }
    }, {
      key: "increase",
      value: function increase(n) {
        var running = this.running;

        if (running) {
          this.stop();
        }

        this.remaining += n;

        if (running) {
          this.start();
        }

        return this.remaining;
      }
    }, {
      key: "getTimerLeft",
      value: function getTimerLeft() {
        if (this.running) {
          this.stop();
          this.start();
        }

        return this.remaining;
      }
    }, {
      key: "isRunning",
      value: function isRunning() {
        return this.running;
      }
    }]);

    return Timer;
  }();

  var defaultInputValidators = {
    email: function email(string, validationMessage) {
      return /^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9-]{2,24}$/.test(string) ? Promise.resolve() : Promise.resolve(validationMessage || 'Invalid email address');
    },
    url: function url(string, validationMessage) {
      // taken from https://stackoverflow.com/a/3809435 with a small change from #1306
      return /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,63}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/.test(string) ? Promise.resolve() : Promise.resolve(validationMessage || 'Invalid URL');
    }
  };

  function setDefaultInputValidators(params) {
    // Use default `inputValidator` for supported input types if not provided
    if (!params.inputValidator) {
      Object.keys(defaultInputValidators).forEach(function (key) {
        if (params.input === key) {
          params.inputValidator = defaultInputValidators[key];
        }
      });
    }
  }

  function validateCustomTargetElement(params) {
    // Determine if the custom target element is valid
    if (!params.target || typeof params.target === 'string' && !document.querySelector(params.target) || typeof params.target !== 'string' && !params.target.appendChild) {
      warn('Target parameter is not valid, defaulting to "body"');
      params.target = 'body';
    }
  }
  /**
   * Set type, text and actions on popup
   *
   * @param params
   * @returns {boolean}
   */


  function setParameters(params) {
    setDefaultInputValidators(params); // showLoaderOnConfirm && preConfirm

    if (params.showLoaderOnConfirm && !params.preConfirm) {
      warn('showLoaderOnConfirm is set to true, but preConfirm is not defined.\n' + 'showLoaderOnConfirm should be used together with preConfirm, see usage example:\n' + 'https://sweetalert2.github.io/#ajax-request');
    } // params.animation will be actually used in renderPopup.js
    // but in case when params.animation is a function, we need to call that function
    // before popup (re)initialization, so it'll be possible to check Swal.isVisible()
    // inside the params.animation function


    params.animation = callIfFunction(params.animation);
    validateCustomTargetElement(params); // Replace newlines with <br> in title

    if (typeof params.title === 'string') {
      params.title = params.title.split('\n').join('<br />');
    }

    init(params);
  }

  /**
   * Open popup, add necessary classes and styles, fix scrollbar
   *
   * @param {Array} params
   */

  var openPopup = function openPopup(params) {
    var container = getContainer();
    var popup = getPopup();

    if (typeof params.onBeforeOpen === 'function') {
      params.onBeforeOpen(popup);
    }

    addClasses$1(container, popup, params); // scrolling is 'hidden' until animation is done, after that 'auto'

    setScrollingVisibility(container, popup);

    if (isModal()) {
      fixScrollContainer(container, params.scrollbarPadding);
    }

    if (!isToast() && !globalState.previousActiveElement) {
      globalState.previousActiveElement = document.activeElement;
    }

    if (typeof params.onOpen === 'function') {
      setTimeout(function () {
        return params.onOpen(popup);
      });
    }

    removeClass(container, swalClasses['no-transition']);
  };

  function swalOpenAnimationFinished(event) {
    var popup = getPopup();

    if (event.target !== popup) {
      return;
    }

    var container = getContainer();
    popup.removeEventListener(animationEndEvent, swalOpenAnimationFinished);
    container.style.overflowY = 'auto';
  }

  var setScrollingVisibility = function setScrollingVisibility(container, popup) {
    if (animationEndEvent && hasCssAnimation(popup)) {
      container.style.overflowY = 'hidden';
      popup.addEventListener(animationEndEvent, swalOpenAnimationFinished);
    } else {
      container.style.overflowY = 'auto';
    }
  };

  var fixScrollContainer = function fixScrollContainer(container, scrollbarPadding) {
    iOSfix();
    IEfix();
    setAriaHidden();

    if (scrollbarPadding) {
      fixScrollbar();
    } // sweetalert2/issues/1247


    setTimeout(function () {
      container.scrollTop = 0;
    });
  };

  var addClasses$1 = function addClasses(container, popup, params) {
    addClass(container, params.showClass.backdrop);
    show(popup); // Animate popup right after showing it

    addClass(popup, params.showClass.popup);
    addClass([document.documentElement, document.body], swalClasses.shown);

    if (params.heightAuto && params.backdrop && !params.toast) {
      addClass([document.documentElement, document.body], swalClasses['height-auto']);
    }
  };

  var handleInputOptionsAndValue = function handleInputOptionsAndValue(instance, params) {
    if (params.input === 'select' || params.input === 'radio') {
      handleInputOptions(instance, params);
    } else if (['text', 'email', 'number', 'tel', 'textarea'].indexOf(params.input) !== -1 && isPromise(params.inputValue)) {
      handleInputValue(instance, params);
    }
  };
  var getInputValue = function getInputValue(instance, innerParams) {
    var input = instance.getInput();

    if (!input) {
      return null;
    }

    switch (innerParams.input) {
      case 'checkbox':
        return getCheckboxValue(input);

      case 'radio':
        return getRadioValue(input);

      case 'file':
        return getFileValue(input);

      default:
        return innerParams.inputAutoTrim ? input.value.trim() : input.value;
    }
  };

  var getCheckboxValue = function getCheckboxValue(input) {
    return input.checked ? 1 : 0;
  };

  var getRadioValue = function getRadioValue(input) {
    return input.checked ? input.value : null;
  };

  var getFileValue = function getFileValue(input) {
    return input.files.length ? input.getAttribute('multiple') !== null ? input.files : input.files[0] : null;
  };

  var handleInputOptions = function handleInputOptions(instance, params) {
    var content = getContent();

    var processInputOptions = function processInputOptions(inputOptions) {
      return populateInputOptions[params.input](content, formatInputOptions(inputOptions), params);
    };

    if (isPromise(params.inputOptions)) {
      showLoading();
      params.inputOptions.then(function (inputOptions) {
        instance.hideLoading();
        processInputOptions(inputOptions);
      });
    } else if (_typeof(params.inputOptions) === 'object') {
      processInputOptions(params.inputOptions);
    } else {
      error("Unexpected type of inputOptions! Expected object, Map or Promise, got ".concat(_typeof(params.inputOptions)));
    }
  };

  var handleInputValue = function handleInputValue(instance, params) {
    var input = instance.getInput();
    hide(input);
    params.inputValue.then(function (inputValue) {
      input.value = params.input === 'number' ? parseFloat(inputValue) || 0 : "".concat(inputValue);
      show(input);
      input.focus();
      instance.hideLoading();
    })["catch"](function (err) {
      error("Error in inputValue promise: ".concat(err));
      input.value = '';
      show(input);
      input.focus();
      instance.hideLoading();
    });
  };

  var populateInputOptions = {
    select: function select(content, inputOptions, params) {
      var select = getChildByClass(content, swalClasses.select);
      inputOptions.forEach(function (inputOption) {
        var optionValue = inputOption[0];
        var optionLabel = inputOption[1];
        var option = document.createElement('option');
        option.value = optionValue;
        option.innerHTML = optionLabel;

        if (params.inputValue.toString() === optionValue.toString()) {
          option.selected = true;
        }

        select.appendChild(option);
      });
      select.focus();
    },
    radio: function radio(content, inputOptions, params) {
      var radio = getChildByClass(content, swalClasses.radio);
      inputOptions.forEach(function (inputOption) {
        var radioValue = inputOption[0];
        var radioLabel = inputOption[1];
        var radioInput = document.createElement('input');
        var radioLabelElement = document.createElement('label');
        radioInput.type = 'radio';
        radioInput.name = swalClasses.radio;
        radioInput.value = radioValue;

        if (params.inputValue.toString() === radioValue.toString()) {
          radioInput.checked = true;
        }

        var label = document.createElement('span');
        label.innerHTML = radioLabel;
        label.className = swalClasses.label;
        radioLabelElement.appendChild(radioInput);
        radioLabelElement.appendChild(label);
        radio.appendChild(radioLabelElement);
      });
      var radios = radio.querySelectorAll('input');

      if (radios.length) {
        radios[0].focus();
      }
    }
  };
  /**
   * Converts `inputOptions` into an array of `[value, label]`s
   * @param inputOptions
   */

  var formatInputOptions = function formatInputOptions(inputOptions) {
    var result = [];

    if (typeof Map !== 'undefined' && inputOptions instanceof Map) {
      inputOptions.forEach(function (value, key) {
        result.push([key, value]);
      });
    } else {
      Object.keys(inputOptions).forEach(function (key) {
        result.push([key, inputOptions[key]]);
      });
    }

    return result;
  };

  var handleConfirmButtonClick = function handleConfirmButtonClick(instance, innerParams) {
    instance.disableButtons();

    if (innerParams.input) {
      handleConfirmWithInput(instance, innerParams);
    } else {
      confirm(instance, innerParams, true);
    }
  };
  var handleCancelButtonClick = function handleCancelButtonClick(instance, dismissWith) {
    instance.disableButtons();
    dismissWith(DismissReason.cancel);
  };

  var handleConfirmWithInput = function handleConfirmWithInput(instance, innerParams) {
    var inputValue = getInputValue(instance, innerParams);

    if (innerParams.inputValidator) {
      instance.disableInput();
      var validationPromise = Promise.resolve().then(function () {
        return innerParams.inputValidator(inputValue, innerParams.validationMessage);
      });
      validationPromise.then(function (validationMessage) {
        instance.enableButtons();
        instance.enableInput();

        if (validationMessage) {
          instance.showValidationMessage(validationMessage);
        } else {
          confirm(instance, innerParams, inputValue);
        }
      });
    } else if (!instance.getInput().checkValidity()) {
      instance.enableButtons();
      instance.showValidationMessage(innerParams.validationMessage);
    } else {
      confirm(instance, innerParams, inputValue);
    }
  };

  var succeedWith = function succeedWith(instance, value) {
    instance.closePopup({
      value: value
    });
  };

  var confirm = function confirm(instance, innerParams, value) {
    if (innerParams.showLoaderOnConfirm) {
      showLoading(); // TODO: make showLoading an *instance* method
    }

    if (innerParams.preConfirm) {
      instance.resetValidationMessage();
      var preConfirmPromise = Promise.resolve().then(function () {
        return innerParams.preConfirm(value, innerParams.validationMessage);
      });
      preConfirmPromise.then(function (preConfirmValue) {
        if (isVisible(getValidationMessage()) || preConfirmValue === false) {
          instance.hideLoading();
        } else {
          succeedWith(instance, typeof preConfirmValue === 'undefined' ? value : preConfirmValue);
        }
      });
    } else {
      succeedWith(instance, value);
    }
  };

  var addKeydownHandler = function addKeydownHandler(instance, globalState, innerParams, dismissWith) {
    if (globalState.keydownTarget && globalState.keydownHandlerAdded) {
      globalState.keydownTarget.removeEventListener('keydown', globalState.keydownHandler, {
        capture: globalState.keydownListenerCapture
      });
      globalState.keydownHandlerAdded = false;
    }

    if (!innerParams.toast) {
      globalState.keydownHandler = function (e) {
        return keydownHandler(instance, e, dismissWith);
      };

      globalState.keydownTarget = innerParams.keydownListenerCapture ? window : getPopup();
      globalState.keydownListenerCapture = innerParams.keydownListenerCapture;
      globalState.keydownTarget.addEventListener('keydown', globalState.keydownHandler, {
        capture: globalState.keydownListenerCapture
      });
      globalState.keydownHandlerAdded = true;
    }
  }; // Focus handling

  var setFocus = function setFocus(innerParams, index, increment) {
    var focusableElements = getFocusableElements(); // search for visible elements and select the next possible match

    for (var i = 0; i < focusableElements.length; i++) {
      index = index + increment; // rollover to first item

      if (index === focusableElements.length) {
        index = 0; // go to last item
      } else if (index === -1) {
        index = focusableElements.length - 1;
      }

      return focusableElements[index].focus();
    } // no visible focusable elements, focus the popup


    getPopup().focus();
  };
  var arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Left', 'Right', 'Up', 'Down' // IE11
  ];
  var escKeys = ['Escape', 'Esc' // IE11
  ];

  var keydownHandler = function keydownHandler(instance, e, dismissWith) {
    var innerParams = privateProps.innerParams.get(instance);

    if (innerParams.stopKeydownPropagation) {
      e.stopPropagation();
    } // ENTER


    if (e.key === 'Enter') {
      handleEnter(instance, e, innerParams); // TAB
    } else if (e.key === 'Tab') {
      handleTab(e, innerParams); // ARROWS - switch focus between buttons
    } else if (arrowKeys.indexOf(e.key) !== -1) {
      handleArrows(); // ESC
    } else if (escKeys.indexOf(e.key) !== -1) {
      handleEsc(e, innerParams, dismissWith);
    }
  };

  var handleEnter = function handleEnter(instance, e, innerParams) {
    // #720 #721
    if (e.isComposing) {
      return;
    }

    if (e.target && instance.getInput() && e.target.outerHTML === instance.getInput().outerHTML) {
      if (['textarea', 'file'].indexOf(innerParams.input) !== -1) {
        return; // do not submit
      }

      clickConfirm();
      e.preventDefault();
    }
  };

  var handleTab = function handleTab(e, innerParams) {
    var targetElement = e.target;
    var focusableElements = getFocusableElements();
    var btnIndex = -1;

    for (var i = 0; i < focusableElements.length; i++) {
      if (targetElement === focusableElements[i]) {
        btnIndex = i;
        break;
      }
    }

    if (!e.shiftKey) {
      // Cycle to the next button
      setFocus(innerParams, btnIndex, 1);
    } else {
      // Cycle to the prev button
      setFocus(innerParams, btnIndex, -1);
    }

    e.stopPropagation();
    e.preventDefault();
  };

  var handleArrows = function handleArrows() {
    var confirmButton = getConfirmButton();
    var cancelButton = getCancelButton(); // focus Cancel button if Confirm button is currently focused

    if (document.activeElement === confirmButton && isVisible(cancelButton)) {
      cancelButton.focus(); // and vice versa
    } else if (document.activeElement === cancelButton && isVisible(confirmButton)) {
      confirmButton.focus();
    }
  };

  var handleEsc = function handleEsc(e, innerParams, dismissWith) {
    if (callIfFunction(innerParams.allowEscapeKey)) {
      e.preventDefault();
      dismissWith(DismissReason.esc);
    }
  };

  var handlePopupClick = function handlePopupClick(instance, domCache, dismissWith) {
    var innerParams = privateProps.innerParams.get(instance);

    if (innerParams.toast) {
      handleToastClick(instance, domCache, dismissWith);
    } else {
      // Ignore click events that had mousedown on the popup but mouseup on the container
      // This can happen when the user drags a slider
      handleModalMousedown(domCache); // Ignore click events that had mousedown on the container but mouseup on the popup

      handleContainerMousedown(domCache);
      handleModalClick(instance, domCache, dismissWith);
    }
  };

  var handleToastClick = function handleToastClick(instance, domCache, dismissWith) {
    // Closing toast by internal click
    domCache.popup.onclick = function () {
      var innerParams = privateProps.innerParams.get(instance);

      if (innerParams.showConfirmButton || innerParams.showCancelButton || innerParams.showCloseButton || innerParams.input) {
        return;
      }

      dismissWith(DismissReason.close);
    };
  };

  var ignoreOutsideClick = false;

  var handleModalMousedown = function handleModalMousedown(domCache) {
    domCache.popup.onmousedown = function () {
      domCache.container.onmouseup = function (e) {
        domCache.container.onmouseup = undefined; // We only check if the mouseup target is the container because usually it doesn't
        // have any other direct children aside of the popup

        if (e.target === domCache.container) {
          ignoreOutsideClick = true;
        }
      };
    };
  };

  var handleContainerMousedown = function handleContainerMousedown(domCache) {
    domCache.container.onmousedown = function () {
      domCache.popup.onmouseup = function (e) {
        domCache.popup.onmouseup = undefined; // We also need to check if the mouseup target is a child of the popup

        if (e.target === domCache.popup || domCache.popup.contains(e.target)) {
          ignoreOutsideClick = true;
        }
      };
    };
  };

  var handleModalClick = function handleModalClick(instance, domCache, dismissWith) {
    domCache.container.onclick = function (e) {
      var innerParams = privateProps.innerParams.get(instance);

      if (ignoreOutsideClick) {
        ignoreOutsideClick = false;
        return;
      }

      if (e.target === domCache.container && callIfFunction(innerParams.allowOutsideClick)) {
        dismissWith(DismissReason.backdrop);
      }
    };
  };

  function _main(userParams) {
    showWarningsForParams(userParams);

    if (globalState.currentInstance) {
      globalState.currentInstance._destroy();
    }

    globalState.currentInstance = this;
    var innerParams = prepareParams(userParams);
    setParameters(innerParams);
    Object.freeze(innerParams); // clear the previous timer

    if (globalState.timeout) {
      globalState.timeout.stop();
      delete globalState.timeout;
    } // clear the restore focus timeout


    clearTimeout(globalState.restoreFocusTimeout);
    var domCache = populateDomCache(this);
    render(this, innerParams);
    privateProps.innerParams.set(this, innerParams);
    return swalPromise(this, domCache, innerParams);
  }

  var prepareParams = function prepareParams(userParams) {
    var showClass = _extends({}, defaultParams.showClass, userParams.showClass);

    var hideClass = _extends({}, defaultParams.hideClass, userParams.hideClass);

    var params = _extends({}, defaultParams, userParams);

    params.showClass = showClass;
    params.hideClass = hideClass; // @deprecated

    if (userParams.animation === false) {
      params.showClass = {
        popup: '',
        backdrop: 'swal2-backdrop-show swal2-noanimation'
      };
      params.hideClass = {};
    }

    return params;
  };

  var swalPromise = function swalPromise(instance, domCache, innerParams) {
    return new Promise(function (resolve) {
      // functions to handle all closings/dismissals
      var dismissWith = function dismissWith(dismiss) {
        instance.closePopup({
          dismiss: dismiss
        });
      };

      privateMethods.swalPromiseResolve.set(instance, resolve);
      setupTimer(globalState, innerParams, dismissWith);

      domCache.confirmButton.onclick = function () {
        return handleConfirmButtonClick(instance, innerParams);
      };

      domCache.cancelButton.onclick = function () {
        return handleCancelButtonClick(instance, dismissWith);
      };

      domCache.closeButton.onclick = function () {
        return dismissWith(DismissReason.close);
      };

      handlePopupClick(instance, domCache, dismissWith);
      addKeydownHandler(instance, globalState, innerParams, dismissWith);

      if (innerParams.toast && (innerParams.input || innerParams.footer || innerParams.showCloseButton)) {
        addClass(document.body, swalClasses['toast-column']);
      } else {
        removeClass(document.body, swalClasses['toast-column']);
      }

      handleInputOptionsAndValue(instance, innerParams);
      openPopup(innerParams);
      initFocus(domCache, innerParams); // Scroll container to top on open (#1247)

      domCache.container.scrollTop = 0;
    });
  };

  var populateDomCache = function populateDomCache(instance) {
    var domCache = {
      popup: getPopup(),
      container: getContainer(),
      content: getContent(),
      actions: getActions(),
      confirmButton: getConfirmButton(),
      cancelButton: getCancelButton(),
      closeButton: getCloseButton(),
      validationMessage: getValidationMessage(),
      progressSteps: getProgressSteps()
    };
    privateProps.domCache.set(instance, domCache);
    return domCache;
  };

  var setupTimer = function setupTimer(globalState$$1, innerParams, dismissWith) {
    var timerProgressBar = getTimerProgressBar();
    hide(timerProgressBar);

    if (innerParams.timer) {
      globalState$$1.timeout = new Timer(function () {
        dismissWith('timer');
        delete globalState$$1.timeout;
      }, innerParams.timer);

      if (innerParams.timerProgressBar) {
        show(timerProgressBar);
        setTimeout(function () {
          if (globalState$$1.timeout.running) {
            // timer can be already stopped at this point
            animateTimerProgressBar(innerParams.timer);
          }
        });
      }
    }
  };

  var initFocus = function initFocus(domCache, innerParams) {
    if (innerParams.toast) {
      return;
    }

    if (!callIfFunction(innerParams.allowEnterKey)) {
      return blurActiveElement();
    }

    if (innerParams.focusCancel && isVisible(domCache.cancelButton)) {
      return domCache.cancelButton.focus();
    }

    if (innerParams.focusConfirm && isVisible(domCache.confirmButton)) {
      return domCache.confirmButton.focus();
    }

    setFocus(innerParams, -1, 1);
  };

  var blurActiveElement = function blurActiveElement() {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  };

  /**
   * Updates popup parameters.
   */

  function update(params) {
    var popup = getPopup();
    var innerParams = privateProps.innerParams.get(this);

    if (!popup || hasClass(popup, innerParams.hideClass.popup)) {
      return warn("You're trying to update the closed or closing popup, that won't work. Use the update() method in preConfirm parameter or show a new popup.");
    }

    var validUpdatableParams = {}; // assign valid params from `params` to `defaults`

    Object.keys(params).forEach(function (param) {
      if (Swal.isUpdatableParameter(param)) {
        validUpdatableParams[param] = params[param];
      } else {
        warn("Invalid parameter to update: \"".concat(param, "\". Updatable params are listed here: https://github.com/sweetalert2/sweetalert2/blob/master/src/utils/params.js"));
      }
    });

    var updatedParams = _extends({}, innerParams, validUpdatableParams);

    render(this, updatedParams);
    privateProps.innerParams.set(this, updatedParams);
    Object.defineProperties(this, {
      params: {
        value: _extends({}, this.params, params),
        writable: false,
        enumerable: true
      }
    });
  }

  function _destroy() {
    var domCache = privateProps.domCache.get(this);
    var innerParams = privateProps.innerParams.get(this);

    if (!innerParams) {
      return; // This instance has already been destroyed
    } // Check if there is another Swal closing


    if (domCache.popup && globalState.swalCloseEventFinishedCallback) {
      globalState.swalCloseEventFinishedCallback();
      delete globalState.swalCloseEventFinishedCallback;
    } // Check if there is a swal disposal defer timer


    if (globalState.deferDisposalTimer) {
      clearTimeout(globalState.deferDisposalTimer);
      delete globalState.deferDisposalTimer;
    }

    if (typeof innerParams.onDestroy === 'function') {
      innerParams.onDestroy();
    }

    disposeSwal(this);
  }

  var disposeSwal = function disposeSwal(instance) {
    // Unset this.params so GC will dispose it (#1569)
    delete instance.params; // Unset globalState props so GC will dispose globalState (#1569)

    delete globalState.keydownHandler;
    delete globalState.keydownTarget; // Unset WeakMaps so GC will be able to dispose them (#1569)

    unsetWeakMaps(privateProps);
    unsetWeakMaps(privateMethods);
  };

  var unsetWeakMaps = function unsetWeakMaps(obj) {
    for (var i in obj) {
      obj[i] = new WeakMap();
    }
  };



  var instanceMethods = /*#__PURE__*/Object.freeze({
    hideLoading: hideLoading,
    disableLoading: hideLoading,
    getInput: getInput$1,
    close: close,
    closePopup: close,
    closeModal: close,
    closeToast: close,
    enableButtons: enableButtons,
    disableButtons: disableButtons,
    enableInput: enableInput,
    disableInput: disableInput,
    showValidationMessage: showValidationMessage,
    resetValidationMessage: resetValidationMessage$1,
    getProgressSteps: getProgressSteps$1,
    _main: _main,
    update: update,
    _destroy: _destroy
  });

  var currentInstance; // SweetAlert constructor

  function SweetAlert() {
    // Prevent run in Node env

    /* istanbul ignore if */
    if (typeof window === 'undefined') {
      return;
    } // Check for the existence of Promise

    /* istanbul ignore if */


    if (typeof Promise === 'undefined') {
      error('This package requires a Promise library, please include a shim to enable it in this browser (See: https://github.com/sweetalert2/sweetalert2/wiki/Migration-from-SweetAlert-to-SweetAlert2#1-ie-support)');
    }

    currentInstance = this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var outerParams = Object.freeze(this.constructor.argsToParams(args));
    Object.defineProperties(this, {
      params: {
        value: outerParams,
        writable: false,
        enumerable: true,
        configurable: true
      }
    });

    var promise = this._main(this.params);

    privateProps.promise.set(this, promise);
  } // `catch` cannot be the name of a module export, so we define our thenable methods here instead


  SweetAlert.prototype.then = function (onFulfilled) {
    var promise = privateProps.promise.get(this);
    return promise.then(onFulfilled);
  };

  SweetAlert.prototype["finally"] = function (onFinally) {
    var promise = privateProps.promise.get(this);
    return promise["finally"](onFinally);
  }; // Assign instance methods from src/instanceMethods/*.js to prototype


  _extends(SweetAlert.prototype, instanceMethods); // Assign static methods from src/staticMethods/*.js to constructor


  _extends(SweetAlert, staticMethods); // Proxy to instance methods to constructor, for now, for backwards compatibility


  Object.keys(instanceMethods).forEach(function (key) {
    SweetAlert[key] = function () {
      if (currentInstance) {
        var _currentInstance;

        return (_currentInstance = currentInstance)[key].apply(_currentInstance, arguments);
      }
    };
  });
  SweetAlert.DismissReason = DismissReason;
  SweetAlert.version = '9.8.2';

  var Swal = SweetAlert;
  Swal["default"] = Swal;

  return Swal;

}));
if (typeof this !== 'undefined' && this.Sweetalert2){  this.swal = this.sweetAlert = this.Swal = this.SweetAlert = this.Sweetalert2}

"undefined"!=typeof document&&function(e,t){var n=e.createElement("style");if(e.getElementsByTagName("head")[0].appendChild(n),n.styleSheet)n.styleSheet.disabled||(n.styleSheet.cssText=t);else try{n.innerHTML=t}catch(e){n.innerText=t}}(document,".swal2-popup.swal2-toast{flex-direction:row;align-items:center;width:auto;padding:.625em;overflow-y:hidden;background:#fff;box-shadow:0 0 .625em #d9d9d9}.swal2-popup.swal2-toast .swal2-header{flex-direction:row}.swal2-popup.swal2-toast .swal2-title{flex-grow:1;justify-content:flex-start;margin:0 .6em;font-size:1em}.swal2-popup.swal2-toast .swal2-footer{margin:.5em 0 0;padding:.5em 0 0;font-size:.8em}.swal2-popup.swal2-toast .swal2-close{position:static;width:.8em;height:.8em;line-height:.8}.swal2-popup.swal2-toast .swal2-content{justify-content:flex-start;font-size:1em}.swal2-popup.swal2-toast .swal2-icon{width:2em;min-width:2em;height:2em;margin:0}.swal2-popup.swal2-toast .swal2-icon .swal2-icon-content{display:flex;align-items:center;font-size:1.8em;font-weight:700}@media all and (-ms-high-contrast:none),(-ms-high-contrast:active){.swal2-popup.swal2-toast .swal2-icon .swal2-icon-content{font-size:.25em}}.swal2-popup.swal2-toast .swal2-icon.swal2-success .swal2-success-ring{width:2em;height:2em}.swal2-popup.swal2-toast .swal2-icon.swal2-error [class^=swal2-x-mark-line]{top:.875em;width:1.375em}.swal2-popup.swal2-toast .swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=left]{left:.3125em}.swal2-popup.swal2-toast .swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=right]{right:.3125em}.swal2-popup.swal2-toast .swal2-actions{flex-basis:auto!important;width:auto;height:auto;margin:0 .3125em}.swal2-popup.swal2-toast .swal2-styled{margin:0 .3125em;padding:.3125em .625em;font-size:1em}.swal2-popup.swal2-toast .swal2-styled:focus{box-shadow:0 0 0 1px #fff,0 0 0 3px rgba(50,100,150,.4)}.swal2-popup.swal2-toast .swal2-success{border-color:#a5dc86}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-circular-line]{position:absolute;width:1.6em;height:3em;transform:rotate(45deg);border-radius:50%}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-circular-line][class$=left]{top:-.8em;left:-.5em;transform:rotate(-45deg);transform-origin:2em 2em;border-radius:4em 0 0 4em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-circular-line][class$=right]{top:-.25em;left:.9375em;transform-origin:0 1.5em;border-radius:0 4em 4em 0}.swal2-popup.swal2-toast .swal2-success .swal2-success-ring{width:2em;height:2em}.swal2-popup.swal2-toast .swal2-success .swal2-success-fix{top:0;left:.4375em;width:.4375em;height:2.6875em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-line]{height:.3125em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-line][class$=tip]{top:1.125em;left:.1875em;width:.75em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-line][class$=long]{top:.9375em;right:.1875em;width:1.375em}.swal2-popup.swal2-toast .swal2-success.swal2-icon-show .swal2-success-line-tip{-webkit-animation:swal2-toast-animate-success-line-tip .75s;animation:swal2-toast-animate-success-line-tip .75s}.swal2-popup.swal2-toast .swal2-success.swal2-icon-show .swal2-success-line-long{-webkit-animation:swal2-toast-animate-success-line-long .75s;animation:swal2-toast-animate-success-line-long .75s}.swal2-popup.swal2-toast.swal2-show{-webkit-animation:swal2-toast-show .5s;animation:swal2-toast-show .5s}.swal2-popup.swal2-toast.swal2-hide{-webkit-animation:swal2-toast-hide .1s forwards;animation:swal2-toast-hide .1s forwards}.swal2-container{display:flex;position:fixed;z-index:1060;top:0;right:0;bottom:0;left:0;flex-direction:row;align-items:center;justify-content:center;padding:.625em;overflow-x:hidden;transition:background-color .1s;-webkit-overflow-scrolling:touch}.swal2-container.swal2-backdrop-show{background:rgba(0,0,0,.4)}.swal2-container.swal2-backdrop-hide{background:0 0!important}.swal2-container.swal2-top{align-items:flex-start}.swal2-container.swal2-top-left,.swal2-container.swal2-top-start{align-items:flex-start;justify-content:flex-start}.swal2-container.swal2-top-end,.swal2-container.swal2-top-right{align-items:flex-start;justify-content:flex-end}.swal2-container.swal2-center{align-items:center}.swal2-container.swal2-center-left,.swal2-container.swal2-center-start{align-items:center;justify-content:flex-start}.swal2-container.swal2-center-end,.swal2-container.swal2-center-right{align-items:center;justify-content:flex-end}.swal2-container.swal2-bottom{align-items:flex-end}.swal2-container.swal2-bottom-left,.swal2-container.swal2-bottom-start{align-items:flex-end;justify-content:flex-start}.swal2-container.swal2-bottom-end,.swal2-container.swal2-bottom-right{align-items:flex-end;justify-content:flex-end}.swal2-container.swal2-bottom-end>:first-child,.swal2-container.swal2-bottom-left>:first-child,.swal2-container.swal2-bottom-right>:first-child,.swal2-container.swal2-bottom-start>:first-child,.swal2-container.swal2-bottom>:first-child{margin-top:auto}.swal2-container.swal2-grow-fullscreen>.swal2-modal{display:flex!important;flex:1;align-self:stretch;justify-content:center}.swal2-container.swal2-grow-row>.swal2-modal{display:flex!important;flex:1;align-content:center;justify-content:center}.swal2-container.swal2-grow-column{flex:1;flex-direction:column}.swal2-container.swal2-grow-column.swal2-bottom,.swal2-container.swal2-grow-column.swal2-center,.swal2-container.swal2-grow-column.swal2-top{align-items:center}.swal2-container.swal2-grow-column.swal2-bottom-left,.swal2-container.swal2-grow-column.swal2-bottom-start,.swal2-container.swal2-grow-column.swal2-center-left,.swal2-container.swal2-grow-column.swal2-center-start,.swal2-container.swal2-grow-column.swal2-top-left,.swal2-container.swal2-grow-column.swal2-top-start{align-items:flex-start}.swal2-container.swal2-grow-column.swal2-bottom-end,.swal2-container.swal2-grow-column.swal2-bottom-right,.swal2-container.swal2-grow-column.swal2-center-end,.swal2-container.swal2-grow-column.swal2-center-right,.swal2-container.swal2-grow-column.swal2-top-end,.swal2-container.swal2-grow-column.swal2-top-right{align-items:flex-end}.swal2-container.swal2-grow-column>.swal2-modal{display:flex!important;flex:1;align-content:center;justify-content:center}.swal2-container.swal2-no-transition{transition:none!important}.swal2-container:not(.swal2-top):not(.swal2-top-start):not(.swal2-top-end):not(.swal2-top-left):not(.swal2-top-right):not(.swal2-center-start):not(.swal2-center-end):not(.swal2-center-left):not(.swal2-center-right):not(.swal2-bottom):not(.swal2-bottom-start):not(.swal2-bottom-end):not(.swal2-bottom-left):not(.swal2-bottom-right):not(.swal2-grow-fullscreen)>.swal2-modal{margin:auto}@media all and (-ms-high-contrast:none),(-ms-high-contrast:active){.swal2-container .swal2-modal{margin:0!important}}.swal2-popup{display:none;position:relative;box-sizing:border-box;flex-direction:column;justify-content:center;width:32em;max-width:100%;padding:1.25em;border:none;border-radius:.3125em;background:#fff;font-family:inherit;font-size:1rem}.swal2-popup:focus{outline:0}.swal2-popup.swal2-loading{overflow-y:hidden}.swal2-header{display:flex;flex-direction:column;align-items:center}.swal2-title{position:relative;max-width:100%;margin:0 0 .4em;padding:0;color:#595959;font-size:1.875em;font-weight:600;text-align:center;text-transform:none;word-wrap:break-word}.swal2-actions{display:flex;z-index:1;flex-wrap:wrap;align-items:center;justify-content:center;width:100%;margin:1.25em auto 0}.swal2-actions:not(.swal2-loading) .swal2-styled[disabled]{opacity:.4}.swal2-actions:not(.swal2-loading) .swal2-styled:hover{background-image:linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1))}.swal2-actions:not(.swal2-loading) .swal2-styled:active{background-image:linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2))}.swal2-actions.swal2-loading .swal2-styled.swal2-confirm{box-sizing:border-box;width:2.5em;height:2.5em;margin:.46875em;padding:0;-webkit-animation:swal2-rotate-loading 1.5s linear 0s infinite normal;animation:swal2-rotate-loading 1.5s linear 0s infinite normal;border:.25em solid transparent;border-radius:100%;border-color:transparent;background-color:transparent!important;color:transparent;cursor:default;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.swal2-actions.swal2-loading .swal2-styled.swal2-cancel{margin-right:30px;margin-left:30px}.swal2-actions.swal2-loading :not(.swal2-styled).swal2-confirm::after{content:\"\";display:inline-block;width:15px;height:15px;margin-left:5px;-webkit-animation:swal2-rotate-loading 1.5s linear 0s infinite normal;animation:swal2-rotate-loading 1.5s linear 0s infinite normal;border:3px solid #999;border-radius:50%;border-right-color:transparent;box-shadow:1px 1px 1px #fff}.swal2-styled{margin:.3125em;padding:.625em 2em;box-shadow:none;font-weight:500}.swal2-styled:not([disabled]){cursor:pointer}.swal2-styled.swal2-confirm{border:0;border-radius:.25em;background:initial;background-color:#3085d6;color:#fff;font-size:1.0625em}.swal2-styled.swal2-cancel{border:0;border-radius:.25em;background:initial;background-color:#aaa;color:#fff;font-size:1.0625em}.swal2-styled:focus{outline:0;box-shadow:0 0 0 1px #fff,0 0 0 3px rgba(50,100,150,.4)}.swal2-styled::-moz-focus-inner{border:0}.swal2-footer{justify-content:center;margin:1.25em 0 0;padding:1em 0 0;border-top:1px solid #eee;color:#545454;font-size:1em}.swal2-timer-progress-bar{position:absolute;bottom:0;left:0;width:100%;height:.25em;background:rgba(0,0,0,.2)}.swal2-image{max-width:100%;margin:1.25em auto}.swal2-close{position:absolute;z-index:2;top:0;right:0;justify-content:center;width:1.2em;height:1.2em;padding:0;overflow:hidden;transition:color .1s ease-out;border:none;border-radius:0;outline:initial;background:0 0;color:#ccc;font-family:serif;font-size:2.5em;line-height:1.2;cursor:pointer}.swal2-close:hover{transform:none;background:0 0;color:#f27474}.swal2-close::-moz-focus-inner{border:0}.swal2-content{z-index:1;justify-content:center;margin:0;padding:0;color:#545454;font-size:1.125em;font-weight:400;line-height:normal;text-align:center;word-wrap:break-word}.swal2-checkbox,.swal2-file,.swal2-input,.swal2-radio,.swal2-select,.swal2-textarea{margin:1em auto}.swal2-file,.swal2-input,.swal2-textarea{box-sizing:border-box;width:100%;transition:border-color .3s,box-shadow .3s;border:1px solid #d9d9d9;border-radius:.1875em;background:inherit;box-shadow:inset 0 1px 1px rgba(0,0,0,.06);color:inherit;font-size:1.125em}.swal2-file.swal2-inputerror,.swal2-input.swal2-inputerror,.swal2-textarea.swal2-inputerror{border-color:#f27474!important;box-shadow:0 0 2px #f27474!important}.swal2-file:focus,.swal2-input:focus,.swal2-textarea:focus{border:1px solid #b4dbed;outline:0;box-shadow:0 0 3px #c4e6f5}.swal2-file::-webkit-input-placeholder,.swal2-input::-webkit-input-placeholder,.swal2-textarea::-webkit-input-placeholder{color:#ccc}.swal2-file::-moz-placeholder,.swal2-input::-moz-placeholder,.swal2-textarea::-moz-placeholder{color:#ccc}.swal2-file:-ms-input-placeholder,.swal2-input:-ms-input-placeholder,.swal2-textarea:-ms-input-placeholder{color:#ccc}.swal2-file::-ms-input-placeholder,.swal2-input::-ms-input-placeholder,.swal2-textarea::-ms-input-placeholder{color:#ccc}.swal2-file::placeholder,.swal2-input::placeholder,.swal2-textarea::placeholder{color:#ccc}.swal2-range{margin:1em auto;background:#fff}.swal2-range input{width:80%}.swal2-range output{width:20%;color:inherit;font-weight:600;text-align:center}.swal2-range input,.swal2-range output{height:2.625em;padding:0;font-size:1.125em;line-height:2.625em}.swal2-input{height:2.625em;padding:0 .75em}.swal2-input[type=number]{max-width:10em}.swal2-file{background:inherit;font-size:1.125em}.swal2-textarea{height:6.75em;padding:.75em}.swal2-select{min-width:50%;max-width:100%;padding:.375em .625em;background:inherit;color:inherit;font-size:1.125em}.swal2-checkbox,.swal2-radio{align-items:center;justify-content:center;background:#fff;color:inherit}.swal2-checkbox label,.swal2-radio label{margin:0 .6em;font-size:1.125em}.swal2-checkbox input,.swal2-radio input{margin:0 .4em}.swal2-validation-message{display:none;align-items:center;justify-content:center;padding:.625em;overflow:hidden;background:#f0f0f0;color:#666;font-size:1em;font-weight:300}.swal2-validation-message::before{content:\"!\";display:inline-block;width:1.5em;min-width:1.5em;height:1.5em;margin:0 .625em;border-radius:50%;background-color:#f27474;color:#fff;font-weight:600;line-height:1.5em;text-align:center}.swal2-icon{position:relative;box-sizing:content-box;justify-content:center;width:5em;height:5em;margin:1.25em auto 1.875em;border:.25em solid transparent;border-radius:50%;font-family:inherit;line-height:5em;cursor:default;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.swal2-icon .swal2-icon-content{display:flex;align-items:center;font-size:3.75em}.swal2-icon.swal2-error{border-color:#f27474;color:#f27474}.swal2-icon.swal2-error .swal2-x-mark{position:relative;flex-grow:1}.swal2-icon.swal2-error [class^=swal2-x-mark-line]{display:block;position:absolute;top:2.3125em;width:2.9375em;height:.3125em;border-radius:.125em;background-color:#f27474}.swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=left]{left:1.0625em;transform:rotate(45deg)}.swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=right]{right:1em;transform:rotate(-45deg)}.swal2-icon.swal2-error.swal2-icon-show{-webkit-animation:swal2-animate-error-icon .5s;animation:swal2-animate-error-icon .5s}.swal2-icon.swal2-error.swal2-icon-show .swal2-x-mark{-webkit-animation:swal2-animate-error-x-mark .5s;animation:swal2-animate-error-x-mark .5s}.swal2-icon.swal2-warning{border-color:#facea8;color:#f8bb86}.swal2-icon.swal2-info{border-color:#9de0f6;color:#3fc3ee}.swal2-icon.swal2-question{border-color:#c9dae1;color:#87adbd}.swal2-icon.swal2-success{border-color:#a5dc86;color:#a5dc86}.swal2-icon.swal2-success [class^=swal2-success-circular-line]{position:absolute;width:3.75em;height:7.5em;transform:rotate(45deg);border-radius:50%}.swal2-icon.swal2-success [class^=swal2-success-circular-line][class$=left]{top:-.4375em;left:-2.0635em;transform:rotate(-45deg);transform-origin:3.75em 3.75em;border-radius:7.5em 0 0 7.5em}.swal2-icon.swal2-success [class^=swal2-success-circular-line][class$=right]{top:-.6875em;left:1.875em;transform:rotate(-45deg);transform-origin:0 3.75em;border-radius:0 7.5em 7.5em 0}.swal2-icon.swal2-success .swal2-success-ring{position:absolute;z-index:2;top:-.25em;left:-.25em;box-sizing:content-box;width:100%;height:100%;border:.25em solid rgba(165,220,134,.3);border-radius:50%}.swal2-icon.swal2-success .swal2-success-fix{position:absolute;z-index:1;top:.5em;left:1.625em;width:.4375em;height:5.625em;transform:rotate(-45deg)}.swal2-icon.swal2-success [class^=swal2-success-line]{display:block;position:absolute;z-index:2;height:.3125em;border-radius:.125em;background-color:#a5dc86}.swal2-icon.swal2-success [class^=swal2-success-line][class$=tip]{top:2.875em;left:.8125em;width:1.5625em;transform:rotate(45deg)}.swal2-icon.swal2-success [class^=swal2-success-line][class$=long]{top:2.375em;right:.5em;width:2.9375em;transform:rotate(-45deg)}.swal2-icon.swal2-success.swal2-icon-show .swal2-success-line-tip{-webkit-animation:swal2-animate-success-line-tip .75s;animation:swal2-animate-success-line-tip .75s}.swal2-icon.swal2-success.swal2-icon-show .swal2-success-line-long{-webkit-animation:swal2-animate-success-line-long .75s;animation:swal2-animate-success-line-long .75s}.swal2-icon.swal2-success.swal2-icon-show .swal2-success-circular-line-right{-webkit-animation:swal2-rotate-success-circular-line 4.25s ease-in;animation:swal2-rotate-success-circular-line 4.25s ease-in}.swal2-progress-steps{align-items:center;margin:0 0 1.25em;padding:0;background:inherit;font-weight:600}.swal2-progress-steps li{display:inline-block;position:relative}.swal2-progress-steps .swal2-progress-step{z-index:20;width:2em;height:2em;border-radius:2em;background:#3085d6;color:#fff;line-height:2em;text-align:center}.swal2-progress-steps .swal2-progress-step.swal2-active-progress-step{background:#3085d6}.swal2-progress-steps .swal2-progress-step.swal2-active-progress-step~.swal2-progress-step{background:#add8e6;color:#fff}.swal2-progress-steps .swal2-progress-step.swal2-active-progress-step~.swal2-progress-step-line{background:#add8e6}.swal2-progress-steps .swal2-progress-step-line{z-index:10;width:2.5em;height:.4em;margin:0 -1px;background:#3085d6}[class^=swal2]{-webkit-tap-highlight-color:transparent}.swal2-show{-webkit-animation:swal2-show .3s;animation:swal2-show .3s}.swal2-hide{-webkit-animation:swal2-hide .15s forwards;animation:swal2-hide .15s forwards}.swal2-noanimation{transition:none}.swal2-scrollbar-measure{position:absolute;top:-9999px;width:50px;height:50px;overflow:scroll}.swal2-rtl .swal2-close{right:auto;left:0}.swal2-rtl .swal2-timer-progress-bar{right:0;left:auto}@supports (-ms-accelerator:true){.swal2-range input{width:100%!important}.swal2-range output{display:none}}@media all and (-ms-high-contrast:none),(-ms-high-contrast:active){.swal2-range input{width:100%!important}.swal2-range output{display:none}}@-moz-document url-prefix(){.swal2-close:focus{outline:2px solid rgba(50,100,150,.4)}}@-webkit-keyframes swal2-toast-show{0%{transform:translateY(-.625em) rotateZ(2deg)}33%{transform:translateY(0) rotateZ(-2deg)}66%{transform:translateY(.3125em) rotateZ(2deg)}100%{transform:translateY(0) rotateZ(0)}}@keyframes swal2-toast-show{0%{transform:translateY(-.625em) rotateZ(2deg)}33%{transform:translateY(0) rotateZ(-2deg)}66%{transform:translateY(.3125em) rotateZ(2deg)}100%{transform:translateY(0) rotateZ(0)}}@-webkit-keyframes swal2-toast-hide{100%{transform:rotateZ(1deg);opacity:0}}@keyframes swal2-toast-hide{100%{transform:rotateZ(1deg);opacity:0}}@-webkit-keyframes swal2-toast-animate-success-line-tip{0%{top:.5625em;left:.0625em;width:0}54%{top:.125em;left:.125em;width:0}70%{top:.625em;left:-.25em;width:1.625em}84%{top:1.0625em;left:.75em;width:.5em}100%{top:1.125em;left:.1875em;width:.75em}}@keyframes swal2-toast-animate-success-line-tip{0%{top:.5625em;left:.0625em;width:0}54%{top:.125em;left:.125em;width:0}70%{top:.625em;left:-.25em;width:1.625em}84%{top:1.0625em;left:.75em;width:.5em}100%{top:1.125em;left:.1875em;width:.75em}}@-webkit-keyframes swal2-toast-animate-success-line-long{0%{top:1.625em;right:1.375em;width:0}65%{top:1.25em;right:.9375em;width:0}84%{top:.9375em;right:0;width:1.125em}100%{top:.9375em;right:.1875em;width:1.375em}}@keyframes swal2-toast-animate-success-line-long{0%{top:1.625em;right:1.375em;width:0}65%{top:1.25em;right:.9375em;width:0}84%{top:.9375em;right:0;width:1.125em}100%{top:.9375em;right:.1875em;width:1.375em}}@-webkit-keyframes swal2-show{0%{transform:scale(.7)}45%{transform:scale(1.05)}80%{transform:scale(.95)}100%{transform:scale(1)}}@keyframes swal2-show{0%{transform:scale(.7)}45%{transform:scale(1.05)}80%{transform:scale(.95)}100%{transform:scale(1)}}@-webkit-keyframes swal2-hide{0%{transform:scale(1);opacity:1}100%{transform:scale(.5);opacity:0}}@keyframes swal2-hide{0%{transform:scale(1);opacity:1}100%{transform:scale(.5);opacity:0}}@-webkit-keyframes swal2-animate-success-line-tip{0%{top:1.1875em;left:.0625em;width:0}54%{top:1.0625em;left:.125em;width:0}70%{top:2.1875em;left:-.375em;width:3.125em}84%{top:3em;left:1.3125em;width:1.0625em}100%{top:2.8125em;left:.8125em;width:1.5625em}}@keyframes swal2-animate-success-line-tip{0%{top:1.1875em;left:.0625em;width:0}54%{top:1.0625em;left:.125em;width:0}70%{top:2.1875em;left:-.375em;width:3.125em}84%{top:3em;left:1.3125em;width:1.0625em}100%{top:2.8125em;left:.8125em;width:1.5625em}}@-webkit-keyframes swal2-animate-success-line-long{0%{top:3.375em;right:2.875em;width:0}65%{top:3.375em;right:2.875em;width:0}84%{top:2.1875em;right:0;width:3.4375em}100%{top:2.375em;right:.5em;width:2.9375em}}@keyframes swal2-animate-success-line-long{0%{top:3.375em;right:2.875em;width:0}65%{top:3.375em;right:2.875em;width:0}84%{top:2.1875em;right:0;width:3.4375em}100%{top:2.375em;right:.5em;width:2.9375em}}@-webkit-keyframes swal2-rotate-success-circular-line{0%{transform:rotate(-45deg)}5%{transform:rotate(-45deg)}12%{transform:rotate(-405deg)}100%{transform:rotate(-405deg)}}@keyframes swal2-rotate-success-circular-line{0%{transform:rotate(-45deg)}5%{transform:rotate(-45deg)}12%{transform:rotate(-405deg)}100%{transform:rotate(-405deg)}}@-webkit-keyframes swal2-animate-error-x-mark{0%{margin-top:1.625em;transform:scale(.4);opacity:0}50%{margin-top:1.625em;transform:scale(.4);opacity:0}80%{margin-top:-.375em;transform:scale(1.15)}100%{margin-top:0;transform:scale(1);opacity:1}}@keyframes swal2-animate-error-x-mark{0%{margin-top:1.625em;transform:scale(.4);opacity:0}50%{margin-top:1.625em;transform:scale(.4);opacity:0}80%{margin-top:-.375em;transform:scale(1.15)}100%{margin-top:0;transform:scale(1);opacity:1}}@-webkit-keyframes swal2-animate-error-icon{0%{transform:rotateX(100deg);opacity:0}100%{transform:rotateX(0);opacity:1}}@keyframes swal2-animate-error-icon{0%{transform:rotateX(100deg);opacity:0}100%{transform:rotateX(0);opacity:1}}@-webkit-keyframes swal2-rotate-loading{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes swal2-rotate-loading{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}body.swal2-shown:not(.swal2-no-backdrop):not(.swal2-toast-shown){overflow:hidden}body.swal2-height-auto{height:auto!important}body.swal2-no-backdrop .swal2-container{top:auto;right:auto;bottom:auto;left:auto;max-width:calc(100% - .625em * 2);background-color:transparent!important}body.swal2-no-backdrop .swal2-container>.swal2-modal{box-shadow:0 0 10px rgba(0,0,0,.4)}body.swal2-no-backdrop .swal2-container.swal2-top{top:0;left:50%;transform:translateX(-50%)}body.swal2-no-backdrop .swal2-container.swal2-top-left,body.swal2-no-backdrop .swal2-container.swal2-top-start{top:0;left:0}body.swal2-no-backdrop .swal2-container.swal2-top-end,body.swal2-no-backdrop .swal2-container.swal2-top-right{top:0;right:0}body.swal2-no-backdrop .swal2-container.swal2-center{top:50%;left:50%;transform:translate(-50%,-50%)}body.swal2-no-backdrop .swal2-container.swal2-center-left,body.swal2-no-backdrop .swal2-container.swal2-center-start{top:50%;left:0;transform:translateY(-50%)}body.swal2-no-backdrop .swal2-container.swal2-center-end,body.swal2-no-backdrop .swal2-container.swal2-center-right{top:50%;right:0;transform:translateY(-50%)}body.swal2-no-backdrop .swal2-container.swal2-bottom{bottom:0;left:50%;transform:translateX(-50%)}body.swal2-no-backdrop .swal2-container.swal2-bottom-left,body.swal2-no-backdrop .swal2-container.swal2-bottom-start{bottom:0;left:0}body.swal2-no-backdrop .swal2-container.swal2-bottom-end,body.swal2-no-backdrop .swal2-container.swal2-bottom-right{right:0;bottom:0}@media print{body.swal2-shown:not(.swal2-no-backdrop):not(.swal2-toast-shown){overflow-y:scroll!important}body.swal2-shown:not(.swal2-no-backdrop):not(.swal2-toast-shown)>[aria-hidden=true]{display:none}body.swal2-shown:not(.swal2-no-backdrop):not(.swal2-toast-shown) .swal2-container{position:static!important}}body.swal2-toast-shown .swal2-container{background-color:transparent}body.swal2-toast-shown .swal2-container.swal2-top{top:0;right:auto;bottom:auto;left:50%;transform:translateX(-50%)}body.swal2-toast-shown .swal2-container.swal2-top-end,body.swal2-toast-shown .swal2-container.swal2-top-right{top:0;right:0;bottom:auto;left:auto}body.swal2-toast-shown .swal2-container.swal2-top-left,body.swal2-toast-shown .swal2-container.swal2-top-start{top:0;right:auto;bottom:auto;left:0}body.swal2-toast-shown .swal2-container.swal2-center-left,body.swal2-toast-shown .swal2-container.swal2-center-start{top:50%;right:auto;bottom:auto;left:0;transform:translateY(-50%)}body.swal2-toast-shown .swal2-container.swal2-center{top:50%;right:auto;bottom:auto;left:50%;transform:translate(-50%,-50%)}body.swal2-toast-shown .swal2-container.swal2-center-end,body.swal2-toast-shown .swal2-container.swal2-center-right{top:50%;right:0;bottom:auto;left:auto;transform:translateY(-50%)}body.swal2-toast-shown .swal2-container.swal2-bottom-left,body.swal2-toast-shown .swal2-container.swal2-bottom-start{top:auto;right:auto;bottom:0;left:0}body.swal2-toast-shown .swal2-container.swal2-bottom{top:auto;right:auto;bottom:0;left:50%;transform:translateX(-50%)}body.swal2-toast-shown .swal2-container.swal2-bottom-end,body.swal2-toast-shown .swal2-container.swal2-bottom-right{top:auto;right:0;bottom:0;left:auto}body.swal2-toast-column .swal2-toast{flex-direction:column;align-items:stretch}body.swal2-toast-column .swal2-toast .swal2-actions{flex:1;align-self:stretch;height:2.2em;margin-top:.3125em}body.swal2-toast-column .swal2-toast .swal2-loading{justify-content:center}body.swal2-toast-column .swal2-toast .swal2-input{height:2em;margin:.3125em auto;font-size:1em}body.swal2-toast-column .swal2-toast .swal2-validation-message{font-size:1em}");
},{}],9:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

function pug_attr(t, e, n, r) {
  if (!1 === e || null == e || !e && ("class" === t || "style" === t)) return "";
  if (!0 === e) return " " + (r ? t : t + '="' + t + '"');
  var f = (0, _typeof2["default"])(e);
  return "object" !== f && "function" !== f || "function" != typeof e.toJSON || (e = e.toJSON()), "string" == typeof e || (e = JSON.stringify(e), n || -1 === e.indexOf('"')) ? (n && (e = pug_escape(e)), " " + t + '="' + e + '"') : " " + t + "='" + e.replace(/'/g, "&#39;") + "'";
}

function pug_classes(s, r) {
  return Array.isArray(s) ? pug_classes_array(s, r) : s && "object" == (0, _typeof2["default"])(s) ? pug_classes_object(s) : s || "";
}

function pug_classes_array(r, a) {
  for (var s, e = "", u = "", c = Array.isArray(a), g = 0; g < r.length; g++) {
    (s = pug_classes(r[g])) && (c && a[g] && (s = pug_escape(s)), e = e + u + s, u = " ");
  }

  return e;
}

function pug_classes_object(r) {
  var a = "",
      n = "";

  for (var o in r) {
    o && r[o] && pug_has_own_property.call(r, o) && (a = a + n + o, n = " ");
  }

  return a;
}

function pug_escape(e) {
  var a = "" + e,
      t = pug_match_html.exec(a);
  if (!t) return e;
  var r,
      c,
      n,
      s = "";

  for (r = t.index, c = 0; r < a.length; r++) {
    switch (a.charCodeAt(r)) {
      case 34:
        n = "&quot;";
        break;

      case 38:
        n = "&amp;";
        break;

      case 60:
        n = "&lt;";
        break;

      case 62:
        n = "&gt;";
        break;

      default:
        continue;
    }

    c !== r && (s += a.substring(c, r)), c = r + 1, s += n;
  }

  return c !== r ? s + a.substring(c, r) : s;
}

var pug_has_own_property = Object.prototype.hasOwnProperty;
var pug_match_html = /["&<>]/;

function employeesTable(locals) {
  var pug_html = "",
      pug_mixins = {},
      pug_interp;
  ;
  var locals_for_with = locals || {};
  (function (Math, currentPage, defaultLimit, users, usersCount) {
    pug_html = pug_html + "<table class=\"table is-fullwidth is-striped is-hoverable\"><thead><tr><th>Employee code</th><th>Image</th><th>Name</th><th>Email</th><th class=\"has-text-centered\">Action</th></tr></thead><tbody>"; // iterate users

    ;
    (function () {
      var $$obj = users;

      if ('number' == typeof $$obj.length) {
        for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
          var employee = $$obj[pug_index0];
          pug_html = pug_html + "<tr><td class=\"is-narrow\">" + pug_escape(null == (pug_interp = employee.employeeCode) ? "" : pug_interp) + "</td><td class=\"is-narrow\"><div class=\"image is-48x48\"><img" + (" class=\"is-rounded\"" + pug_attr("src", employee.imageUrl, true, false)) + "/></div></td><td><a class=\"table-employees--employee-name\" href=\"#\">" + pug_escape(null == (pug_interp = employee.name) ? "" : pug_interp) + "</a></td><td class=\"table-employees--employee-email\">" + pug_escape(null == (pug_interp = employee.email) ? "" : pug_interp) + "</td><td class=\"is-narrow table-employees--actions\"><button class=\"button is-primary is-rounded is-uppercase table-employees--require-review-button\"><span class=\"icon\"><svg aria-hidden=\"true\" focusable=\"false\" data-prefix=\"fas\" data-icon=\"pen\" class=\"svg-inline--fa fa-pen fa-w-16\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path fill=\"currentColor\" d=\"M290.74 93.24l128.02 128.02-277.99 277.99-114.14 12.6C11.35 513.54-1.56 500.62.14 485.34l12.7-114.22 277.9-277.88zm207.2-19.06l-60.11-60.11c-18.75-18.75-49.16-18.75-67.91 0l-56.55 56.55 128.02 128.02 56.55-56.55c18.75-18.76 18.75-49.16 0-67.91z\"></path></svg></span><span>Require review</span></button><button" + (" class=\"button is-danger is-rounded is-uppercase table-employees--button-delete\"" + pug_attr("data-id", employee._id, true, false)) + "><span>Delete</span></button></td></tr>";
        }
      } else {
        var $$l = 0;

        for (var pug_index0 in $$obj) {
          $$l++;
          var employee = $$obj[pug_index0];
          pug_html = pug_html + "<tr><td class=\"is-narrow\">" + pug_escape(null == (pug_interp = employee.employeeCode) ? "" : pug_interp) + "</td><td class=\"is-narrow\"><div class=\"image is-48x48\"><img" + (" class=\"is-rounded\"" + pug_attr("src", employee.imageUrl, true, false)) + "/></div></td><td><a class=\"table-employees--employee-name\" href=\"#\">" + pug_escape(null == (pug_interp = employee.name) ? "" : pug_interp) + "</a></td><td class=\"table-employees--employee-email\">" + pug_escape(null == (pug_interp = employee.email) ? "" : pug_interp) + "</td><td class=\"is-narrow table-employees--actions\"><button class=\"button is-primary is-rounded is-uppercase table-employees--require-review-button\"><span class=\"icon\"><svg aria-hidden=\"true\" focusable=\"false\" data-prefix=\"fas\" data-icon=\"pen\" class=\"svg-inline--fa fa-pen fa-w-16\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path fill=\"currentColor\" d=\"M290.74 93.24l128.02 128.02-277.99 277.99-114.14 12.6C11.35 513.54-1.56 500.62.14 485.34l12.7-114.22 277.9-277.88zm207.2-19.06l-60.11-60.11c-18.75-18.75-49.16-18.75-67.91 0l-56.55 56.55 128.02 128.02 56.55-56.55c18.75-18.76 18.75-49.16 0-67.91z\"></path></svg></span><span>Require review</span></button><button" + (" class=\"button is-danger is-rounded is-uppercase table-employees--button-delete\"" + pug_attr("data-id", employee._id, true, false)) + "><span>Delete</span></button></td></tr>";
        }
      }
    }).call(this);
    pug_html = pug_html + "</tbody></table>";
    var pageCount = Math.ceil(usersCount / defaultLimit);
    pug_html = pug_html + "<nav class=\"pagination is-rounded\" role=\"navigation\"><a class=\"pagination-previous\">Previous</a><a class=\"pagination-next\">Next page</a><ul class=\"pagination-list\">";

    for (var i = 1; i <= pageCount; i++) {
      pug_html = pug_html + "<li><a" + pug_attr("class", pug_classes(["pagination-link ".concat(i === currentPage ? 'is-current' : '')], [true]), false, false) + ">" + pug_escape(null == (pug_interp = i) ? "" : pug_interp) + "</a></li>";
    }

    pug_html = pug_html + "</ul></nav>";
  }).call(this, "Math" in locals_for_with ? locals_for_with.Math : typeof Math !== "undefined" ? Math : undefined, "currentPage" in locals_for_with ? locals_for_with.currentPage : typeof currentPage !== "undefined" ? currentPage : undefined, "defaultLimit" in locals_for_with ? locals_for_with.defaultLimit : typeof defaultLimit !== "undefined" ? defaultLimit : undefined, "users" in locals_for_with ? locals_for_with.users : typeof users !== "undefined" ? users : undefined, "usersCount" in locals_for_with ? locals_for_with.usersCount : typeof usersCount !== "undefined" ? usersCount : undefined);
  ;
  return pug_html;
}

var _default = employeesTable;
exports["default"] = _default;

},{"@babel/runtime/helpers/interopRequireDefault":3,"@babel/runtime/helpers/typeof":4}],10:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

function pug_attr(t, e, n, r) {
  if (!1 === e || null == e || !e && ("class" === t || "style" === t)) return "";
  if (!0 === e) return " " + (r ? t : t + '="' + t + '"');
  var f = (0, _typeof2["default"])(e);
  return "object" !== f && "function" !== f || "function" != typeof e.toJSON || (e = e.toJSON()), "string" == typeof e || (e = JSON.stringify(e), n || -1 === e.indexOf('"')) ? (n && (e = pug_escape(e)), " " + t + '="' + e + '"') : " " + t + "='" + e.replace(/'/g, "&#39;") + "'";
}

function pug_classes(s, r) {
  return Array.isArray(s) ? pug_classes_array(s, r) : s && "object" == (0, _typeof2["default"])(s) ? pug_classes_object(s) : s || "";
}

function pug_classes_array(r, a) {
  for (var s, e = "", u = "", c = Array.isArray(a), g = 0; g < r.length; g++) {
    (s = pug_classes(r[g])) && (c && a[g] && (s = pug_escape(s)), e = e + u + s, u = " ");
  }

  return e;
}

function pug_classes_object(r) {
  var a = "",
      n = "";

  for (var o in r) {
    o && r[o] && pug_has_own_property.call(r, o) && (a = a + n + o, n = " ");
  }

  return a;
}

function pug_escape(e) {
  var a = "" + e,
      t = pug_match_html.exec(a);
  if (!t) return e;
  var r,
      c,
      n,
      s = "";

  for (r = t.index, c = 0; r < a.length; r++) {
    switch (a.charCodeAt(r)) {
      case 34:
        n = "&quot;";
        break;

      case 38:
        n = "&amp;";
        break;

      case 60:
        n = "&lt;";
        break;

      case 62:
        n = "&gt;";
        break;

      default:
        continue;
    }

    c !== r && (s += a.substring(c, r)), c = r + 1, s += n;
  }

  return c !== r ? s + a.substring(c, r) : s;
}

var pug_has_own_property = Object.prototype.hasOwnProperty;
var pug_match_html = /["&<>]/;

function reviewBoardsTable(locals) {
  var pug_html = "",
      pug_mixins = {},
      pug_interp;
  ;
  var locals_for_with = locals || {};
  (function (Date, Math, currentPage, defaultLimit, reviewBoards, reviewBoardsCount) {
    pug_html = pug_html + "<table class=\"table is-fullwidth is-striped is-hoverable\"><thead><tr><th>Title</th><th>Description</th><th>Due date</th><th>Review factors</th></tr></thead><tbody>"; // iterate reviewBoards

    ;
    (function () {
      var $$obj = reviewBoards;

      if ('number' == typeof $$obj.length) {
        for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
          var reviewBoard = $$obj[pug_index0];
          pug_html = pug_html + "<tr><td>" + pug_escape(null == (pug_interp = reviewBoard.title) ? "" : pug_interp) + "</td><td><p>" + pug_escape(null == (pug_interp = reviewBoard.description) ? "" : pug_interp) + "</p></td><td>" + pug_escape(null == (pug_interp = new Date(reviewBoard.dueDate).toLocaleDateString()) ? "" : pug_interp) + "</td><td>" + pug_escape(null == (pug_interp = reviewBoard.reviewFactors) ? "" : pug_interp) + "</td></tr>";
        }
      } else {
        var $$l = 0;

        for (var pug_index0 in $$obj) {
          $$l++;
          var reviewBoard = $$obj[pug_index0];
          pug_html = pug_html + "<tr><td>" + pug_escape(null == (pug_interp = reviewBoard.title) ? "" : pug_interp) + "</td><td><p>" + pug_escape(null == (pug_interp = reviewBoard.description) ? "" : pug_interp) + "</p></td><td>" + pug_escape(null == (pug_interp = new Date(reviewBoard.dueDate).toLocaleDateString()) ? "" : pug_interp) + "</td><td>" + pug_escape(null == (pug_interp = reviewBoard.reviewFactors) ? "" : pug_interp) + "</td></tr>";
        }
      }
    }).call(this);
    pug_html = pug_html + "</tbody></table>";
    var pageCount = Math.ceil(reviewBoardsCount / defaultLimit);
    pug_html = pug_html + "<nav class=\"pagination is-rounded\" role=\"navigation\"><a class=\"pagination-previous\">Previous</a><a class=\"pagination-next\">Next page</a><ul class=\"pagination-list\">";

    for (var i = 1; i <= pageCount; i++) {
      pug_html = pug_html + "<li><a" + pug_attr("class", pug_classes(["pagination-link ".concat(i === currentPage ? 'is-current' : '')], [true]), false, false) + ">" + pug_escape(null == (pug_interp = i) ? "" : pug_interp) + "</a></li>";
    }

    pug_html = pug_html + "</ul></nav>";
  }).call(this, "Date" in locals_for_with ? locals_for_with.Date : typeof Date !== "undefined" ? Date : undefined, "Math" in locals_for_with ? locals_for_with.Math : typeof Math !== "undefined" ? Math : undefined, "currentPage" in locals_for_with ? locals_for_with.currentPage : typeof currentPage !== "undefined" ? currentPage : undefined, "defaultLimit" in locals_for_with ? locals_for_with.defaultLimit : typeof defaultLimit !== "undefined" ? defaultLimit : undefined, "reviewBoards" in locals_for_with ? locals_for_with.reviewBoards : typeof reviewBoards !== "undefined" ? reviewBoards : undefined, "reviewBoardsCount" in locals_for_with ? locals_for_with.reviewBoardsCount : typeof reviewBoardsCount !== "undefined" ? reviewBoardsCount : undefined);
  ;
  return pug_html;
}

var _default = reviewBoardsTable;
exports["default"] = _default;

},{"@babel/runtime/helpers/interopRequireDefault":3,"@babel/runtime/helpers/typeof":4}],11:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

function pug_attr(t, e, n, r) {
  if (!1 === e || null == e || !e && ("class" === t || "style" === t)) return "";
  if (!0 === e) return " " + (r ? t : t + '="' + t + '"');
  var f = (0, _typeof2["default"])(e);
  return "object" !== f && "function" !== f || "function" != typeof e.toJSON || (e = e.toJSON()), "string" == typeof e || (e = JSON.stringify(e), n || -1 === e.indexOf('"')) ? (n && (e = pug_escape(e)), " " + t + '="' + e + '"') : " " + t + "='" + e.replace(/'/g, "&#39;") + "'";
}

function pug_classes(s, r) {
  return Array.isArray(s) ? pug_classes_array(s, r) : s && "object" == (0, _typeof2["default"])(s) ? pug_classes_object(s) : s || "";
}

function pug_classes_array(r, a) {
  for (var s, e = "", u = "", c = Array.isArray(a), g = 0; g < r.length; g++) {
    (s = pug_classes(r[g])) && (c && a[g] && (s = pug_escape(s)), e = e + u + s, u = " ");
  }

  return e;
}

function pug_classes_object(r) {
  var a = "",
      n = "";

  for (var o in r) {
    o && r[o] && pug_has_own_property.call(r, o) && (a = a + n + o, n = " ");
  }

  return a;
}

function pug_escape(e) {
  var a = "" + e,
      t = pug_match_html.exec(a);
  if (!t) return e;
  var r,
      c,
      n,
      s = "";

  for (r = t.index, c = 0; r < a.length; r++) {
    switch (a.charCodeAt(r)) {
      case 34:
        n = "&quot;";
        break;

      case 38:
        n = "&amp;";
        break;

      case 60:
        n = "&lt;";
        break;

      case 62:
        n = "&gt;";
        break;

      default:
        continue;
    }

    c !== r && (s += a.substring(c, r)), c = r + 1, s += n;
  }

  return c !== r ? s + a.substring(c, r) : s;
}

var pug_has_own_property = Object.prototype.hasOwnProperty;
var pug_match_html = /["&<>]/;

function reviewRequestsModal(locals) {
  var pug_html = "",
      pug_mixins = {},
      pug_interp;
  ;
  var locals_for_with = locals || {};
  (function (_id, reviewBoardInfo, reviewFactors, targetInfo) {
    pug_html = pug_html + "<div class=\"modal review-requests-modal--wrapper\"><div class=\"modal-background\"></div><div class=\"modal-card\"><header class=\"modal-card-head\"><p class=\"modal-card-title\">Review to <b>" + pug_escape(null == (pug_interp = targetInfo.name) ? "" : pug_interp) + "</b></p><button class=\"delete\"></button></header><section class=\"modal-card-body\"><form><input" + (" type=\"hidden\" name=\"reviewRequestId\"" + pug_attr("value", _id, true, false)) + "/><section class=\"hero is-primary\"><div class=\"hero-body\"><div class=\"container\"><h1 class=\"title\">" + pug_escape(null == (pug_interp = reviewBoardInfo.title) ? "" : pug_interp) + "</h1><h2 class=\"subtitle\">" + pug_escape(null == (pug_interp = reviewBoardInfo.description) ? "" : pug_interp) + "</h2></div></div></section>"; // iterate reviewFactors

    ;
    (function () {
      var $$obj = reviewFactors;

      if ('number' == typeof $$obj.length) {
        for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
          var reviewFactor = $$obj[pug_index0];
          pug_html = pug_html + "<div class=\"field\"><label class=\"label\">" + pug_escape(null == (pug_interp = reviewFactor.title) ? "" : pug_interp) + "</label><div class=\"control\"><" + reviewFactor.inputControl + (pug_attr("class", pug_classes([reviewFactor.inputControl], [true]), false, false) + pug_attr("name", "factor-".concat(reviewFactor._id), true, false)) + "></" + reviewFactor.inputControl + "></div></div>";
        }
      } else {
        var $$l = 0;

        for (var pug_index0 in $$obj) {
          $$l++;
          var reviewFactor = $$obj[pug_index0];
          pug_html = pug_html + "<div class=\"field\"><label class=\"label\">" + pug_escape(null == (pug_interp = reviewFactor.title) ? "" : pug_interp) + "</label><div class=\"control\"><" + reviewFactor.inputControl + (pug_attr("class", pug_classes([reviewFactor.inputControl], [true]), false, false) + pug_attr("name", "factor-".concat(reviewFactor._id), true, false)) + "></" + reviewFactor.inputControl + "></div></div>";
        }
      }
    }).call(this);
    pug_html = pug_html + "</form></section><footer class=\"modal-card-foot\"><button" + (" class=\"button is-success review-requests-modal--submit-button\"" + pug_attr("data-id", _id, true, false)) + ">Confirm Review</button></footer></div></div>";
  }).call(this, "_id" in locals_for_with ? locals_for_with._id : typeof _id !== "undefined" ? _id : undefined, "reviewBoardInfo" in locals_for_with ? locals_for_with.reviewBoardInfo : typeof reviewBoardInfo !== "undefined" ? reviewBoardInfo : undefined, "reviewFactors" in locals_for_with ? locals_for_with.reviewFactors : typeof reviewFactors !== "undefined" ? reviewFactors : undefined, "targetInfo" in locals_for_with ? locals_for_with.targetInfo : typeof targetInfo !== "undefined" ? targetInfo : undefined);
  ;
  return pug_html;
}

var _default = reviewRequestsModal;
exports["default"] = _default;

},{"@babel/runtime/helpers/interopRequireDefault":3,"@babel/runtime/helpers/typeof":4}],12:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

function pug_attr(t, e, n, r) {
  if (!1 === e || null == e || !e && ("class" === t || "style" === t)) return "";
  if (!0 === e) return " " + (r ? t : t + '="' + t + '"');
  var f = (0, _typeof2["default"])(e);
  return "object" !== f && "function" !== f || "function" != typeof e.toJSON || (e = e.toJSON()), "string" == typeof e || (e = JSON.stringify(e), n || -1 === e.indexOf('"')) ? (n && (e = pug_escape(e)), " " + t + '="' + e + '"') : " " + t + "='" + e.replace(/'/g, "&#39;") + "'";
}

function pug_classes(s, r) {
  return Array.isArray(s) ? pug_classes_array(s, r) : s && "object" == (0, _typeof2["default"])(s) ? pug_classes_object(s) : s || "";
}

function pug_classes_array(r, a) {
  for (var s, e = "", u = "", c = Array.isArray(a), g = 0; g < r.length; g++) {
    (s = pug_classes(r[g])) && (c && a[g] && (s = pug_escape(s)), e = e + u + s, u = " ");
  }

  return e;
}

function pug_classes_object(r) {
  var a = "",
      n = "";

  for (var o in r) {
    o && r[o] && pug_has_own_property.call(r, o) && (a = a + n + o, n = " ");
  }

  return a;
}

function pug_escape(e) {
  var a = "" + e,
      t = pug_match_html.exec(a);
  if (!t) return e;
  var r,
      c,
      n,
      s = "";

  for (r = t.index, c = 0; r < a.length; r++) {
    switch (a.charCodeAt(r)) {
      case 34:
        n = "&quot;";
        break;

      case 38:
        n = "&amp;";
        break;

      case 60:
        n = "&lt;";
        break;

      case 62:
        n = "&gt;";
        break;

      default:
        continue;
    }

    c !== r && (s += a.substring(c, r)), c = r + 1, s += n;
  }

  return c !== r ? s + a.substring(c, r) : s;
}

var pug_has_own_property = Object.prototype.hasOwnProperty;
var pug_match_html = /["&<>]/;

function reviewRequestsTable(locals) {
  var pug_html = "",
      pug_mixins = {},
      pug_interp;
  ;
  var locals_for_with = locals || {};
  (function (Date, Math, currentPage, defaultLimit, reviewRequests, usersCount) {
    pug_html = pug_html + "<table class=\"table is-fullwidth is-striped is-hoverable\"><thead><tr><th>Title</th><th>Image</th><th>Target employee</th><th>Email</th><th>Due date</th><th>Requester</th><th class=\"has-text-centered\">Action</th></tr></thead><tbody>"; // iterate reviewRequests

    ;
    (function () {
      var $$obj = reviewRequests;

      if ('number' == typeof $$obj.length) {
        for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
          var request = $$obj[pug_index0];
          pug_html = pug_html + "<tr><td class=\"is-hidden table-review-requests--review-request-id\">" + pug_escape(null == (pug_interp = request._id) ? "" : pug_interp) + "</td><td class=\"is-hidden table-review-requests--review-board\">" + pug_escape(null == (pug_interp = request.reviewBoard) ? "" : pug_interp) + "</td><td>" + pug_escape(null == (pug_interp = request.reviewBoardInfo.title) ? "" : pug_interp) + "</td><td class=\"is-narrow\"><div class=\"image is-48x48\"><img" + (" class=\"is-rounded\"" + pug_attr("src", request.targetInfo.imageUrl, true, false)) + "/></div></td><td class=\"is-narrow\"><a class=\"table-review-requests--target-name\" href=\"#\">" + pug_escape(null == (pug_interp = request.targetInfo.name) ? "" : pug_interp) + "</a></td><td class=\"is-narrow table-review-requests--target-email\">" + pug_escape(null == (pug_interp = request.targetEmail) ? "" : pug_interp) + "</td><td class=\"is-narrow table-review-requests--due-date\">" + pug_escape(null == (pug_interp = new Date(request.reviewBoardInfo.dueDate).toLocaleDateString()) ? "" : pug_interp) + "</td><td class=\"is-narrow table-review-requests--requester\">" + pug_escape(null == (pug_interp = request.requesterEmail) ? "" : pug_interp) + "</td><td class=\"is-narrow table-review-requests--actions\"><button class=\"button is-primary is-rounded is-uppercase table-review-requests--start-review-button\"><span class=\"icon\"><svg aria-hidden=\"true\" focusable=\"false\" data-prefix=\"fas\" data-icon=\"pen\" class=\"svg-inline--fa fa-pen fa-w-16\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path fill=\"currentColor\" d=\"M290.74 93.24l128.02 128.02-277.99 277.99-114.14 12.6C11.35 513.54-1.56 500.62.14 485.34l12.7-114.22 277.9-277.88zm207.2-19.06l-60.11-60.11c-18.75-18.75-49.16-18.75-67.91 0l-56.55 56.55 128.02 128.02 56.55-56.55c18.75-18.76 18.75-49.16 0-67.91z\"></path></svg></span><span>Start reviewing</span></button></td></tr>";
        }
      } else {
        var $$l = 0;

        for (var pug_index0 in $$obj) {
          $$l++;
          var request = $$obj[pug_index0];
          pug_html = pug_html + "<tr><td class=\"is-hidden table-review-requests--review-request-id\">" + pug_escape(null == (pug_interp = request._id) ? "" : pug_interp) + "</td><td class=\"is-hidden table-review-requests--review-board\">" + pug_escape(null == (pug_interp = request.reviewBoard) ? "" : pug_interp) + "</td><td>" + pug_escape(null == (pug_interp = request.reviewBoardInfo.title) ? "" : pug_interp) + "</td><td class=\"is-narrow\"><div class=\"image is-48x48\"><img" + (" class=\"is-rounded\"" + pug_attr("src", request.targetInfo.imageUrl, true, false)) + "/></div></td><td class=\"is-narrow\"><a class=\"table-review-requests--target-name\" href=\"#\">" + pug_escape(null == (pug_interp = request.targetInfo.name) ? "" : pug_interp) + "</a></td><td class=\"is-narrow table-review-requests--target-email\">" + pug_escape(null == (pug_interp = request.targetEmail) ? "" : pug_interp) + "</td><td class=\"is-narrow table-review-requests--due-date\">" + pug_escape(null == (pug_interp = new Date(request.reviewBoardInfo.dueDate).toLocaleDateString()) ? "" : pug_interp) + "</td><td class=\"is-narrow table-review-requests--requester\">" + pug_escape(null == (pug_interp = request.requesterEmail) ? "" : pug_interp) + "</td><td class=\"is-narrow table-review-requests--actions\"><button class=\"button is-primary is-rounded is-uppercase table-review-requests--start-review-button\"><span class=\"icon\"><svg aria-hidden=\"true\" focusable=\"false\" data-prefix=\"fas\" data-icon=\"pen\" class=\"svg-inline--fa fa-pen fa-w-16\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path fill=\"currentColor\" d=\"M290.74 93.24l128.02 128.02-277.99 277.99-114.14 12.6C11.35 513.54-1.56 500.62.14 485.34l12.7-114.22 277.9-277.88zm207.2-19.06l-60.11-60.11c-18.75-18.75-49.16-18.75-67.91 0l-56.55 56.55 128.02 128.02 56.55-56.55c18.75-18.76 18.75-49.16 0-67.91z\"></path></svg></span><span>Start reviewing</span></button></td></tr>";
        }
      }
    }).call(this);
    pug_html = pug_html + "</tbody></table>";
    var pageCount = Math.ceil(usersCount / defaultLimit);
    pug_html = pug_html + "<nav class=\"pagination is-rounded\" role=\"navigation\"><a class=\"pagination-previous\">Previous</a><a class=\"pagination-next\">Next page</a><ul class=\"pagination-list\">";

    for (var i = 1; i <= pageCount; i++) {
      pug_html = pug_html + "<li><a" + pug_attr("class", pug_classes(["pagination-link ".concat(i === currentPage ? 'is-current' : '')], [true]), false, false) + ">" + pug_escape(null == (pug_interp = i) ? "" : pug_interp) + "</a></li>";
    }

    pug_html = pug_html + "</ul></nav>";
  }).call(this, "Date" in locals_for_with ? locals_for_with.Date : typeof Date !== "undefined" ? Date : undefined, "Math" in locals_for_with ? locals_for_with.Math : typeof Math !== "undefined" ? Math : undefined, "currentPage" in locals_for_with ? locals_for_with.currentPage : typeof currentPage !== "undefined" ? currentPage : undefined, "defaultLimit" in locals_for_with ? locals_for_with.defaultLimit : typeof defaultLimit !== "undefined" ? defaultLimit : undefined, "reviewRequests" in locals_for_with ? locals_for_with.reviewRequests : typeof reviewRequests !== "undefined" ? reviewRequests : undefined, "usersCount" in locals_for_with ? locals_for_with.usersCount : typeof usersCount !== "undefined" ? usersCount : undefined);
  ;
  return pug_html;
}

var _default = reviewRequestsTable;
exports["default"] = _default;

},{"@babel/runtime/helpers/interopRequireDefault":3,"@babel/runtime/helpers/typeof":4}],13:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

function pug_attr(t, e, n, r) {
  if (!1 === e || null == e || !e && ("class" === t || "style" === t)) return "";
  if (!0 === e) return " " + (r ? t : t + '="' + t + '"');
  var f = (0, _typeof2["default"])(e);
  return "object" !== f && "function" !== f || "function" != typeof e.toJSON || (e = e.toJSON()), "string" == typeof e || (e = JSON.stringify(e), n || -1 === e.indexOf('"')) ? (n && (e = pug_escape(e)), " " + t + '="' + e + '"') : " " + t + "='" + e.replace(/'/g, "&#39;") + "'";
}

function pug_escape(e) {
  var a = "" + e,
      t = pug_match_html.exec(a);
  if (!t) return e;
  var r,
      c,
      n,
      s = "";

  for (r = t.index, c = 0; r < a.length; r++) {
    switch (a.charCodeAt(r)) {
      case 34:
        n = "&quot;";
        break;

      case 38:
        n = "&amp;";
        break;

      case 60:
        n = "&lt;";
        break;

      case 62:
        n = "&gt;";
        break;

      default:
        continue;
    }

    c !== r && (s += a.substring(c, r)), c = r + 1, s += n;
  }

  return c !== r ? s + a.substring(c, r) : s;
}

var pug_match_html = /["&<>]/;

function selectOptions(locals) {
  var pug_html = "",
      pug_mixins = {},
      pug_interp;
  ;
  var locals_for_with = locals || {};
  (function (options) {
    // iterate options
    ;
    (function () {
      var $$obj = options;

      if ('number' == typeof $$obj.length) {
        for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
          var option = $$obj[pug_index0];
          pug_html = pug_html + "<option" + pug_attr("value", option.value, true, false) + ">" + pug_escape(null == (pug_interp = option.text) ? "" : pug_interp) + "</option>";
        }
      } else {
        var $$l = 0;

        for (var pug_index0 in $$obj) {
          $$l++;
          var option = $$obj[pug_index0];
          pug_html = pug_html + "<option" + pug_attr("value", option.value, true, false) + ">" + pug_escape(null == (pug_interp = option.text) ? "" : pug_interp) + "</option>";
        }
      }
    }).call(this);
  }).call(this, "options" in locals_for_with ? locals_for_with.options : typeof options !== "undefined" ? options : undefined);
  ;
  return pug_html;
}

var _default = selectOptions;
exports["default"] = _default;

},{"@babel/runtime/helpers/interopRequireDefault":3,"@babel/runtime/helpers/typeof":4}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var DomManipulator = function () {
  // Polyfil Element.matches
  // https://developer.mozilla.org/en/docs/Web/API/Element/matches#Polyfill
  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function (s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i = matches.length;

      while (--i >= 0 && matches.item(i) !== this) {}

      return i > -1;
    };
  }

  var _getConditionalCallback = function _getConditionalCallback(selector, callback) {
    return function (e) {
      if (!e.target) return;
      if (!e.target.matches(selector) && !e.target.closest(selector)) return;
      callback.apply(this, arguments);
    };
  };

  var _openPage = function _openPage(fileName) {
    chrome.tabs.create({
      url: chrome.runtime.getURL("pages/".concat(fileName))
    });
  };

  return {
    displayPageData: function displayPageData(htmlString) {
      document.body.classList.add('fade');
      document.body.innerHTML = htmlString;
      document.body.classList.remove('fade');
    },
    addDynamicEventListener: function addDynamicEventListener(rootElement, eventType, selector, callback, options) {
      return rootElement.addEventListener(eventType, _getConditionalCallback(selector, callback), options);
    },
    openPage: _openPage,
    updatePageTitle: function updatePageTitle(i18nKey) {
      return document.title = "".concat(chrome.i18n.getMessage('appName'), " - ").concat(chrome.i18n.getMessage(i18nKey));
    },

    /**
     * @param {String} htmlString: HTML representing a single element
     * @return {Element}
     */
    htmlStringToHtmlNode: function htmlStringToHtmlNode(htmlString) {
      var template = document.createElement('template');
      template.innerHTML = htmlString.trim();
      return template.content.firstChild;
    },

    /**
     * @param {String} htmlString: HTML representing any number of sibling elements
     * @return {NodeList}
     */
    htmlStringToHtmlNodes: function htmlStringToHtmlNodes(htmlString) {
      var template = document.createElement('template');
      template.innerHTML = htmlString;
      return template.content.childNodes;
    },
    insertBefore: function insertBefore(newNode, referenceNode) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
  };
}();

var _default = DomManipulator;
exports["default"] = _default;

},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = {
  employees: 'users',
  reviewBoards: 'review-boards',
  reviewRequests: 'review-requests',
  reviewResults: 'review-results',
  logout: 'auth/logout'
};
exports["default"] = _default;

},{}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = {
  apiBaseUrl: 'http://localhost/api/v1/',
  defaultLimit: 15
};
exports["default"] = _default;

},{}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = {
  __prefix__: 'paypayreview.',
  token: 'token',
  user: 'user'
};
exports["default"] = _default;

},{}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = {
  login: '/login',
  home: '/',
  admin: {
    "default": '/admin',
    employees: '/admin/employees',
    reviewBoards: '/admin/reviews'
  }
};
exports["default"] = _default;

},{}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = {
  GET: 'GET',
  HEAD: 'HEAD',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  CONNECT: 'CONNECT',
  OPTIONS: 'OPTIONS',
  TRACE: 'TRACE',
  PATCH: 'PATCH'
};
exports["default"] = _default;

},{}],20:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _sweetalert = _interopRequireDefault(require("sweetalert2"));

var Toast = _sweetalert["default"].mixin({
  toast: true,
  position: 'top',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  onOpen: function onOpen(toast) {
    toast.addEventListener('mouseenter', _sweetalert["default"].stopTimer);
    toast.addEventListener('mouseleave', _sweetalert["default"].resumeTimer);
  }
});

var _default = {
  toastError: function toastError(message) {
    Toast.fire({
      icon: 'error',
      title: message
    });
  },
  toastSuccess: function toastSuccess(message) {
    Toast.fire({
      icon: 'success',
      title: message
    });
  },
  confirmDelete: function confirmDelete(callback) {
    _sweetalert["default"].fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then(function (result) {
      if (result.value) {
        callback();
      }
    });
  }
};
exports["default"] = _default;

},{"@babel/runtime/helpers/interopRequireDefault":3,"sweetalert2":8}],21:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _httpMethods = _interopRequireDefault(require("../../_global/enums/http-methods"));

var XhrFacade = function () {
  var _jwtToken;

  var _toFormData = function _toFormData(object) {
    return Object.keys(object).reduce(function (formData, key) {
      formData.append(key, (0, _typeof2["default"])(object[key]) === 'object' ? JSON.stringify(object[key]) : object[key]);
      return formData;
    }, new FormData());
  };

  var _makeXhrRequest = function _makeXhrRequest(method, url, data) {
    var isParseJSON = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.setRequestHeader('Authorization', "Bearer ".concat(_jwtToken));

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          return resolve(isParseJSON ? JSON.parse(xhr.response) : xhr.response);
        } else {
          reject(Error(isParseJSON ? JSON.parse(xhr.response).error : xhr.response));
        }
      };

      xhr.onerror = function () {
        reject(Error(isParseJSON ? JSON.parse(xhr.response).error : xhr.response));
      };

      if (!data) xhr.send();else xhr.send(data instanceof FormData ? data : _toFormData(data));
    });
  };

  return function (jwtToken) {
    _jwtToken = jwtToken;
    return {
      get: function get(url) {
        var isParseJSON = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        return _makeXhrRequest(_httpMethods["default"].GET, url, null, isParseJSON);
      },
      post: function post(url, data) {
        var isParseJSON = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        return _makeXhrRequest(_httpMethods["default"].POST, url, data, isParseJSON);
      },
      put: function put(url, data) {
        return _makeXhrRequest(_httpMethods["default"].PUT, url, data);
      },
      patch: function patch(url, data) {
        var isParseJSON = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        return _makeXhrRequest(_httpMethods["default"].PATCH, url, data, isParseJSON);
      },
      "delete": function _delete(url, data) {
        return _makeXhrRequest(_httpMethods["default"].DELETE, url, data);
      },
      renewToken: function renewToken(newJwtToken) {
        return _jwtToken = newJwtToken;
      }
    };
  };
}();

var _default = XhrFacade;
exports["default"] = _default;

},{"../../_global/enums/http-methods":19,"@babel/runtime/helpers/interopRequireDefault":3,"@babel/runtime/helpers/typeof":4}],22:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _login = _interopRequireDefault(require("./pages/login"));

var _home = _interopRequireDefault(require("./pages/home"));

var _employees = _interopRequireDefault(require("./pages/admin/employees"));

var _reviewBoards = _interopRequireDefault(require("./pages/admin/review-boards"));

var _commonActions = _interopRequireDefault(require("./pages/common-actions"));

},{"./pages/admin/employees":23,"./pages/admin/review-boards":24,"./pages/common-actions":25,"./pages/home":26,"./pages/login":27,"@babel/runtime/helpers/interopRequireDefault":3}],23:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _lockr = _interopRequireDefault(require("lockr"));

var _xhrFacade2 = _interopRequireDefault(require("../../_global/facades/xhr-facade"));

var _swalFacade = _interopRequireDefault(require("../../_global/facades/swal-facade"));

var _urls = _interopRequireDefault(require("../../_global/consts/urls"));

var _lockrKeys = _interopRequireDefault(require("../../_global/consts/lockr-keys"));

var _consts = _interopRequireDefault(require("../../_global/consts/consts"));

var _apis = _interopRequireDefault(require("../../_global/consts/apis"));

var _domManipulator = _interopRequireDefault(require("../../_global/common-modules/dom-manipulator"));

var _employeesTable = _interopRequireDefault(require("../../../content-scripts/_generated-components/employees-table"));

var _selectOptions = _interopRequireDefault(require("../../../content-scripts/_generated-components/select-options"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

_lockr["default"].prefix = _lockrKeys["default"].__prefix__;

var AdminEmployeesModule = function () {
  var _xhrFacade = (0, _xhrFacade2["default"])(_lockr["default"].get(_lockrKeys["default"].token));

  var _user = _lockr["default"].get(_lockrKeys["default"].user);

  var _currentPage = 1;

  var _addDynamicClickEventListener = function _addDynamicClickEventListener(targetSelector, callback) {
    _domManipulator["default"].addDynamicEventListener(document.body, 'click', targetSelector, callback);
  };

  var _registerDomEventHandler = function _registerDomEventHandler() {
    _addDynamicClickEventListener('.table-employees--button-delete', _deleteEmployee);

    _addDynamicClickEventListener('.table-employees--require-review-button', _openModal);

    _addDynamicClickEventListener('.requiring-review-modal--wrapper .modal-background, .requiring-review-modal--wrapper .delete', _closeModal);

    _addDynamicClickEventListener('.requiring-review-modal--wrapper .requiring-review-modal--submit-button', _requireReview);

    _addDynamicClickEventListener('.pagination-link', _goToNextPage);
  };

  var _deleteEmployee = function _deleteEmployee(e) {
    _swalFacade["default"].confirmDelete(
    /*#__PURE__*/
    (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee() {
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              e.target.closest('tr').remove();
              _context.next = 3;
              return _xhrFacade["delete"]("".concat(_consts["default"].apiBaseUrl).concat(_apis["default"].employees, "/").concat(e.target.dataset.id));

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    })));
  };

  var _openModal = function _openModal(e) {
    document.querySelector('.requiring-review-modal--wrapper .modal-card-title b').innerHTML = e.target.closest('tr').querySelector('.table-employees--employee-name').innerHTML;
    document.querySelector('.requiring-review-modal--wrapper [name=fromEmail]').value = e.target.closest('tr').querySelector('.table-employees--employee-email').innerHTML;
    document.querySelector('.requiring-review-modal--wrapper').classList.toggle('is-active');
  };

  var _closeModal = function _closeModal(e) {
    document.querySelector('.requiring-review-modal--wrapper').classList.toggle('is-active');
  };

  var _requireReview =
  /*#__PURE__*/
  function () {
    var _ref2 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee2(e) {
      var _ref3, insertedCount;

      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return _xhrFacade.put("".concat(_consts["default"].apiBaseUrl).concat(_apis["default"].reviewRequests), new FormData(document.querySelector('.requiring-review-modal--wrapper form')));

            case 3:
              _ref3 = _context2.sent;
              insertedCount = _ref3.insertedCount;

              _resetModalContent();

              _swalFacade["default"].toastSuccess("Successfully inserted ".concat(insertedCount, " review requests!"));

              _context2.next = 12;
              break;

            case 9:
              _context2.prev = 9;
              _context2.t0 = _context2["catch"](0);

              _swalFacade["default"].toastError('An unexpected error occured! Please try again later.');

            case 12:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 9]]);
    }));

    return function _requireReview(_x) {
      return _ref2.apply(this, arguments);
    };
  }();

  var _resetModalContent = function _resetModalContent() {
    document.querySelector('.requiring-review-modal--wrapper [name=fromEmail]').value = '';
    document.querySelector('.requiring-review-modal--wrapper [name=targetEmails]').value = '';
  };

  var _goToNextPage = function _goToNextPage(e) {
    _currentPage = parseInt(e.target.innerText);

    _renderEmployeesTable();
  };

  var _renderDynamicContent = function _renderDynamicContent() {
    _renderEmployeesTable();

    _renderReviewBoardsOptions();
  };

  var _renderEmployeesTable =
  /*#__PURE__*/
  function () {
    var _ref4 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee3() {
      var employees;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 3;
              return _xhrFacade.get("".concat(_consts["default"].apiBaseUrl).concat(_apis["default"].employees, "?skip=").concat((_currentPage - 1) * _consts["default"].defaultLimit, "&limit=").concat(_consts["default"].defaultLimit));

            case 3:
              employees = _context3.sent;
              document.querySelector('#table-employees').innerHTML = (0, _employeesTable["default"])(_objectSpread({}, employees, {
                defaultLimit: _consts["default"].defaultLimit,
                currentPage: _currentPage
              }));
              _context3.next = 10;
              break;

            case 7:
              _context3.prev = 7;
              _context3.t0 = _context3["catch"](0);

              _swalFacade["default"].toastError('An unexpected error occured! Please try again later.');

            case 10:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, null, [[0, 7]]);
    }));

    return function _renderEmployeesTable() {
      return _ref4.apply(this, arguments);
    };
  }();

  var _renderReviewBoardsOptions =
  /*#__PURE__*/
  function () {
    var _ref5 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee4() {
      var _ref6, reviewBoards;

      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              _context4.next = 3;
              return _xhrFacade.get("".concat(_consts["default"].apiBaseUrl).concat(_apis["default"].reviewBoards, "?skip=").concat((_currentPage - 1) * _consts["default"].defaultLimit, "&limit=").concat(_consts["default"].defaultLimit));

            case 3:
              _ref6 = _context4.sent;
              reviewBoards = _ref6.reviewBoards;
              document.querySelector('.requiring-review-modal--review-boards').innerHTML += (0, _selectOptions["default"])({
                options: reviewBoards.map(function (b) {
                  return {
                    value: b._id,
                    text: b.title
                  };
                })
              });
              _context4.next = 11;
              break;

            case 8:
              _context4.prev = 8;
              _context4.t0 = _context4["catch"](0);

              _swalFacade["default"].toastError('An unexpected error occured! Please try again later.');

            case 11:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, null, [[0, 8]]);
    }));

    return function _renderReviewBoardsOptions() {
      return _ref5.apply(this, arguments);
    };
  }();

  return {
    init: function init() {
      _renderDynamicContent();

      _registerDomEventHandler();
    }
  };
}();

if ([_urls["default"].admin["default"], _urls["default"].admin.employees].includes(window.location.pathname)) {
  AdminEmployeesModule.init();
}

},{"../../../content-scripts/_generated-components/employees-table":9,"../../../content-scripts/_generated-components/select-options":13,"../../_global/common-modules/dom-manipulator":14,"../../_global/consts/apis":15,"../../_global/consts/consts":16,"../../_global/consts/lockr-keys":17,"../../_global/consts/urls":18,"../../_global/facades/swal-facade":20,"../../_global/facades/xhr-facade":21,"@babel/runtime/helpers/asyncToGenerator":1,"@babel/runtime/helpers/defineProperty":2,"@babel/runtime/helpers/interopRequireDefault":3,"@babel/runtime/regenerator":6,"lockr":7}],24:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _lockr = _interopRequireDefault(require("lockr"));

var _xhrFacade2 = _interopRequireDefault(require("../../_global/facades/xhr-facade"));

var _urls = _interopRequireDefault(require("../../_global/consts/urls"));

var _lockrKeys = _interopRequireDefault(require("../../_global/consts/lockr-keys"));

var _consts = _interopRequireDefault(require("../../_global/consts/consts"));

var _apis = _interopRequireDefault(require("../../_global/consts/apis"));

var _domManipulator = _interopRequireDefault(require("../../_global/common-modules/dom-manipulator"));

var _reviewBoardsTable = _interopRequireDefault(require("../../_generated-components/review-boards-table"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

_lockr["default"].prefix = _lockrKeys["default"].__prefix__;

var AdminReviewBoardsModule = function () {
  var _xhrFacade = (0, _xhrFacade2["default"])(_lockr["default"].get(_lockrKeys["default"].token));

  var _user = _lockr["default"].get(_lockrKeys["default"].user);

  var _currentPage = 1;

  var _addDynamicClickEventListener = function _addDynamicClickEventListener(targetSelector, callback) {
    _domManipulator["default"].addDynamicEventListener(document.body, 'click', targetSelector, callback);
  };

  var _registerDomEventHandler = function _registerDomEventHandler() {};

  var _renderDynamicContent = function _renderDynamicContent() {
    _renderReviewBoardsTable();
  };

  var _renderReviewBoardsTable =
  /*#__PURE__*/
  function () {
    var _ref = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee() {
      var reviewBoards;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _xhrFacade.get("".concat(_consts["default"].apiBaseUrl).concat(_apis["default"].reviewBoards, "?skip=").concat((_currentPage - 1) * _consts["default"].defaultLimit, "&limit=").concat(_consts["default"].defaultLimit));

            case 2:
              reviewBoards = _context.sent;
              document.querySelector('#table-review-boards').innerHTML = (0, _reviewBoardsTable["default"])(_objectSpread({}, reviewBoards, {
                defaultLimit: _consts["default"].defaultLimit,
                currentPage: _currentPage
              }));

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function _renderReviewBoardsTable() {
      return _ref.apply(this, arguments);
    };
  }();

  return {
    init: function init() {
      _renderDynamicContent();

      _registerDomEventHandler();
    }
  };
}();

_urls["default"].admin.reviewBoards === window.location.pathname && AdminReviewBoardsModule.init();

},{"../../_generated-components/review-boards-table":10,"../../_global/common-modules/dom-manipulator":14,"../../_global/consts/apis":15,"../../_global/consts/consts":16,"../../_global/consts/lockr-keys":17,"../../_global/consts/urls":18,"../../_global/facades/xhr-facade":21,"@babel/runtime/helpers/asyncToGenerator":1,"@babel/runtime/helpers/defineProperty":2,"@babel/runtime/helpers/interopRequireDefault":3,"@babel/runtime/regenerator":6,"lockr":7}],25:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _lockr = _interopRequireDefault(require("lockr"));

var _domManipulator = _interopRequireDefault(require("../_global/common-modules/dom-manipulator"));

var _apis = _interopRequireDefault(require("../_global/consts/apis"));

var _consts = _interopRequireDefault(require("../_global/consts/consts"));

var _xhrFacade2 = _interopRequireDefault(require("../_global/facades/xhr-facade"));

var _lockrKeys = _interopRequireDefault(require("../_global/consts/lockr-keys"));

var _xhrFacade = (0, _xhrFacade2["default"])(_lockr["default"].get(_lockrKeys["default"].token));

_domManipulator["default"].addDynamicEventListener(document.body, 'click', '#button-logout',
/*#__PURE__*/
(0, _asyncToGenerator2["default"])(
/*#__PURE__*/
_regenerator["default"].mark(function _callee() {
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _lockr["default"].rm(_lockrKeys["default"].user);

          _lockr["default"].rm(_lockrKeys["default"].token);

          _context.next = 4;
          return _xhrFacade.get("".concat(_consts["default"].apiBaseUrl).concat(_apis["default"].logout), false);

        case 4:
          document.cookie = 'AuthToken= ; expires = Thu, 01 Jan 1970 00:00:00 GMT';
          window.location.replace('/login');

        case 6:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
})));

},{"../_global/common-modules/dom-manipulator":14,"../_global/consts/apis":15,"../_global/consts/consts":16,"../_global/consts/lockr-keys":17,"../_global/facades/xhr-facade":21,"@babel/runtime/helpers/asyncToGenerator":1,"@babel/runtime/helpers/interopRequireDefault":3,"@babel/runtime/regenerator":6,"lockr":7}],26:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _lockr = _interopRequireDefault(require("lockr"));

var _xhrFacade2 = _interopRequireDefault(require("../_global/facades/xhr-facade"));

var _swalFacade = _interopRequireDefault(require("../_global/facades/swal-facade"));

var _urls = _interopRequireDefault(require("../_global/consts/urls"));

var _lockrKeys = _interopRequireDefault(require("../_global/consts/lockr-keys"));

var _consts = _interopRequireDefault(require("../_global/consts/consts"));

var _apis = _interopRequireDefault(require("../_global/consts/apis"));

var _domManipulator = _interopRequireDefault(require("../_global/common-modules/dom-manipulator"));

var _reviewRequestsTable = _interopRequireDefault(require("../../content-scripts/_generated-components/review-requests-table"));

var _reviewRequestsModal = _interopRequireDefault(require("../../content-scripts/_generated-components/review-requests-modal"));

_lockr["default"].prefix = _lockrKeys["default"].__prefix__;

var HomeModule = function () {
  var _xhrFacade = (0, _xhrFacade2["default"])(_lockr["default"].get(_lockrKeys["default"].token));

  var _user = _lockr["default"].get(_lockrKeys["default"].user);

  var _currentPage = 1;

  var _reviewRequestsPending;

  var _reviewingRequestRow;

  var _addDynamicClickEventListener = function _addDynamicClickEventListener(targetSelector, callback) {
    _domManipulator["default"].addDynamicEventListener(document.body, 'click', targetSelector, callback);
  };

  var _registerDomEventHandler = function _registerDomEventHandler() {
    _addDynamicClickEventListener('.table-review-requests--start-review-button', _openModal);

    _addDynamicClickEventListener('.review-requests-modal--wrapper .modal-background, .review-requests-modal--wrapper .delete', _closeModal);

    _addDynamicClickEventListener('.review-requests-modal--wrapper .review-requests-modal--submit-button', _confirmReview);

    _addDynamicClickEventListener('#tabs--review-requests ul li a', _switchTab);
  };

  var _openModal = function _openModal(e) {
    _reviewingRequestRow = e.target.closest('tr');

    var reviewRequestId = _reviewingRequestRow.querySelector('.table-review-requests--review-request-id').innerText;

    var reviewRequest = _reviewRequestsPending.find(function (r) {
      return r._id === reviewRequestId;
    });

    document.querySelector('#review-requests-modal').innerHTML = (0, _reviewRequestsModal["default"])(reviewRequest);
    document.querySelector('.review-requests-modal--wrapper').classList.toggle('is-active');
  };

  var _closeModal = function _closeModal(e) {
    document.querySelector('.review-requests-modal--wrapper').classList.toggle('is-active');
  };

  var _confirmReview =
  /*#__PURE__*/
  function () {
    var _ref = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee(e) {
      var reviewRequestId;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              reviewRequestId = e.target.dataset.id; // TODO: Support transaction.

              _context.next = 4;
              return _xhrFacade.put("".concat(_consts["default"].apiBaseUrl).concat(_apis["default"].reviewResults), new FormData(document.querySelector('.review-requests-modal--wrapper form')));

            case 4:
              _context.next = 6;
              return _xhrFacade.patch("".concat(_consts["default"].apiBaseUrl).concat(_apis["default"].reviewRequests, "/").concat(reviewRequestId), {
                status: 1
              }, false);

            case 6:
              _moveRequestToHistory(_reviewingRequestRow);

              _swalFacade["default"].toastSuccess("Your review is saved!");

              _closeModal();

              _context.next = 14;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](0);

              _swalFacade["default"].toastError('An unexpected error occured! Please try again later.');

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 11]]);
    }));

    return function _confirmReview(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  var _switchTab = function _switchTab(e) {
    e.target.closest('.tabs').querySelectorAll('ul li').forEach(function (li) {
      return li.classList.remove('is-active');
    });
    e.target.parentElement.classList.add('is-active');
    document.querySelectorAll('.tabs--review-requests--content').forEach(function (c) {
      return c.classList.add('is-hidden');
    });
    document.querySelector(e.target.parentElement.dataset.targetselector).classList.remove('is-hidden');
  };

  var _moveRequestToHistory = function _moveRequestToHistory(item) {
    document.querySelector('#tabs-submited-history table tbody').appendChild(item.cloneNode(true));
    item.remove();
  };

  var _renderDynamicContent = function _renderDynamicContent() {
    _renderReviewRequestsTable();
  };

  var _renderReviewRequestsTable =
  /*#__PURE__*/
  function () {
    var _ref2 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee2() {
      var reviewRequests, reviewRequestsHistory;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return _xhrFacade.get("".concat(_consts["default"].apiBaseUrl).concat(_apis["default"].reviewRequests, "?skip=").concat((_currentPage - 1) * _consts["default"].defaultLimit, "&limit=").concat(_consts["default"].defaultLimit));

            case 3:
              reviewRequests = _context2.sent;
              _reviewRequestsPending = reviewRequests.reviewRequests.filter(function (r) {
                return r.status == 0;
              });
              reviewRequestsHistory = reviewRequests.reviewRequests.filter(function (r) {
                return r.status == 1;
              });
              document.querySelector('#tabs-review-requests').innerHTML = (0, _reviewRequestsTable["default"])({
                reviewRequests: _reviewRequestsPending,
                defaultLimit: _consts["default"].defaultLimit,
                currentPage: _currentPage
              });
              document.querySelector('#tabs-submited-history').innerHTML = (0, _reviewRequestsTable["default"])({
                reviewRequests: reviewRequestsHistory,
                defaultLimit: _consts["default"].defaultLimit,
                currentPage: _currentPage
              });
              _context2.next = 13;
              break;

            case 10:
              _context2.prev = 10;
              _context2.t0 = _context2["catch"](0);

              _swalFacade["default"].toastError('An unexpected error occured! Please try again later.');

            case 13:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 10]]);
    }));

    return function _renderReviewRequestsTable() {
      return _ref2.apply(this, arguments);
    };
  }();

  return {
    init: function init() {
      _renderDynamicContent();

      _registerDomEventHandler();
    }
  };
}();

window.location.pathname === _urls["default"].home && HomeModule.init();

},{"../../content-scripts/_generated-components/review-requests-modal":11,"../../content-scripts/_generated-components/review-requests-table":12,"../_global/common-modules/dom-manipulator":14,"../_global/consts/apis":15,"../_global/consts/consts":16,"../_global/consts/lockr-keys":17,"../_global/consts/urls":18,"../_global/facades/swal-facade":20,"../_global/facades/xhr-facade":21,"@babel/runtime/helpers/asyncToGenerator":1,"@babel/runtime/helpers/interopRequireDefault":3,"@babel/runtime/regenerator":6,"lockr":7}],27:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _lockr = _interopRequireDefault(require("lockr"));

var _domManipulator = _interopRequireDefault(require("../_global/common-modules/dom-manipulator"));

var _xhrFacade2 = _interopRequireDefault(require("../_global/facades/xhr-facade"));

var _swalFacade = _interopRequireDefault(require("../_global/facades/swal-facade"));

var _urls = _interopRequireDefault(require("../_global/consts/urls"));

var _lockrKeys = _interopRequireDefault(require("../_global/consts/lockr-keys"));

_lockr["default"].prefix = _lockrKeys["default"].__prefix__;

var LoginModule = function () {
  var _xhrFacade = (0, _xhrFacade2["default"])(_lockr["default"].get(_lockrKeys["default"].token));

  var _user = _lockr["default"].get(_lockrKeys["default"].user);

  var _addDynamicClickEventListener = function _addDynamicClickEventListener(targetSelector, callback) {
    _domManipulator["default"].addDynamicEventListener(document.body, 'click', targetSelector, callback);
  };

  var _registerDomEventHandler = function _registerDomEventHandler() {
    _addDynamicClickEventListener('.login-form--login-button', _login);
  };

  var _login =
  /*#__PURE__*/
  function () {
    var _ref = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee(e) {
      var email, password, user;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              e.preventDefault();
              email = e.target.closest('form').querySelector('.login-form--email').value;
              password = e.target.closest('form').querySelector('.login-form--password').value;
              _context.next = 6;
              return _xhrFacade.post(_urls["default"].login, {
                email: email,
                password: password
              });

            case 6:
              user = _context.sent;

              _lockr["default"].set(_lockrKeys["default"].user, user);

              _lockr["default"].set(_lockrKeys["default"].token, user.jwtToken);

              window.location.replace('/');
              _context.next = 17;
              break;

            case 12:
              _context.prev = 12;
              _context.t0 = _context["catch"](0);

              _lockr["default"].rm(_lockrKeys["default"].user);

              _lockr["default"].rm(_lockrKeys["default"].token);

              _swalFacade["default"].toastError(_context.t0.message);

            case 17:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 12]]);
    }));

    return function _login(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  return {
    init: function init() {
      _registerDomEventHandler();
    }
  };
}();

window.location.pathname === _urls["default"].login && LoginModule.init();

},{"../_global/common-modules/dom-manipulator":14,"../_global/consts/lockr-keys":17,"../_global/consts/urls":18,"../_global/facades/swal-facade":20,"../_global/facades/xhr-facade":21,"@babel/runtime/helpers/asyncToGenerator":1,"@babel/runtime/helpers/interopRequireDefault":3,"@babel/runtime/regenerator":6,"lockr":7}]},{},[22])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hc3luY1RvR2VuZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2YuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvbm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9yZWdlbmVyYXRvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Nrci9sb2Nrci5qcyIsIm5vZGVfbW9kdWxlcy9zd2VldGFsZXJ0Mi9kaXN0L3N3ZWV0YWxlcnQyLmFsbC5qcyIsInNyYy9jb250ZW50LXNjcmlwdHMvX2dlbmVyYXRlZC1jb21wb25lbnRzL2VtcGxveWVlcy10YWJsZS5qcyIsInNyYy9jb250ZW50LXNjcmlwdHMvX2dlbmVyYXRlZC1jb21wb25lbnRzL3Jldmlldy1ib2FyZHMtdGFibGUuanMiLCJzcmMvY29udGVudC1zY3JpcHRzL19nZW5lcmF0ZWQtY29tcG9uZW50cy9yZXZpZXctcmVxdWVzdHMtbW9kYWwuanMiLCJzcmMvY29udGVudC1zY3JpcHRzL19nZW5lcmF0ZWQtY29tcG9uZW50cy9yZXZpZXctcmVxdWVzdHMtdGFibGUuanMiLCJzcmMvY29udGVudC1zY3JpcHRzL19nZW5lcmF0ZWQtY29tcG9uZW50cy9zZWxlY3Qtb3B0aW9ucy5qcyIsInNyYy9jb250ZW50LXNjcmlwdHMvX2dsb2JhbC9jb21tb24tbW9kdWxlcy9kb20tbWFuaXB1bGF0b3IuanMiLCJzcmMvY29udGVudC1zY3JpcHRzL19nbG9iYWwvY29uc3RzL2FwaXMuanMiLCJzcmMvY29udGVudC1zY3JpcHRzL19nbG9iYWwvY29uc3RzL2NvbnN0cy5qcyIsInNyYy9jb250ZW50LXNjcmlwdHMvX2dsb2JhbC9jb25zdHMvbG9ja3Ita2V5cy5qcyIsInNyYy9jb250ZW50LXNjcmlwdHMvX2dsb2JhbC9jb25zdHMvdXJscy5qcyIsInNyYy9jb250ZW50LXNjcmlwdHMvX2dsb2JhbC9lbnVtcy9odHRwLW1ldGhvZHMuanMiLCJzcmMvY29udGVudC1zY3JpcHRzL19nbG9iYWwvZmFjYWRlcy9zd2FsLWZhY2FkZS5qcyIsInNyYy9jb250ZW50LXNjcmlwdHMvX2dsb2JhbC9mYWNhZGVzL3hoci1mYWNhZGUuanMiLCJzcmMvY29udGVudC1zY3JpcHRzL2FwcC5qcyIsInNyYy9jb250ZW50LXNjcmlwdHMvcGFnZXMvYWRtaW4vZW1wbG95ZWVzLmpzIiwic3JjL2NvbnRlbnQtc2NyaXB0cy9wYWdlcy9hZG1pbi9yZXZpZXctYm9hcmRzLmpzIiwic3JjL2NvbnRlbnQtc2NyaXB0cy9wYWdlcy9jb21tb24tYWN0aW9ucy5qcyIsInNyYy9jb250ZW50LXNjcmlwdHMvcGFnZXMvaG9tZS5qcyIsInNyYy9jb250ZW50LXNjcmlwdHMvcGFnZXMvbG9naW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdHRCQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QWFULGdDQUFNLEVBQU4sQ0FBUyxzQkFBVSxJQUFuQjs7QUFDQSxnQ0FBTSxFQUFOLENBQVMsc0JBQVUsS0FBbkI7O0FBRUEscUNBQVcsVUFBWCxDQUFzQixZQUFNLE9BQTVCOztBQWhCUztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUFIOztBQUFBLG9CQUFOLE1BQU07QUFBQTtBQUFBO0FBQUEsS0FBVjs7QUFvQkEsU0FBTztBQUNMLElBQUEsSUFBSSxFQUFFLGdCQUFNO0FBQ1YsTUFBQSx3QkFBd0I7QUFDekI7QUFISSxHQUFQO0FBS0QsQ0F0Q2lCLEVBQWxCOztBQXdDQSxNQUFNLENBQUMsUUFBUCxDQUFnQixRQUFoQixLQUE2QixpQkFBSyxLQUFsQyxJQUEyQyxXQUFXLENBQUMsSUFBWixFQUEzQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImZ1bmN0aW9uIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywga2V5LCBhcmcpIHtcbiAgdHJ5IHtcbiAgICB2YXIgaW5mbyA9IGdlbltrZXldKGFyZyk7XG4gICAgdmFyIHZhbHVlID0gaW5mby52YWx1ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZWplY3QoZXJyb3IpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChpbmZvLmRvbmUpIHtcbiAgICByZXNvbHZlKHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oX25leHQsIF90aHJvdyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2FzeW5jVG9HZW5lcmF0b3IoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBnZW4gPSBmbi5hcHBseShzZWxmLCBhcmdzKTtcblxuICAgICAgZnVuY3Rpb24gX25leHQodmFsdWUpIHtcbiAgICAgICAgYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBcIm5leHRcIiwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBfdGhyb3coZXJyKSB7XG4gICAgICAgIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywgXCJ0aHJvd1wiLCBlcnIpO1xuICAgICAgfVxuXG4gICAgICBfbmV4dCh1bmRlZmluZWQpO1xuICAgIH0pO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9hc3luY1RvR2VuZXJhdG9yOyIsImZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSBpbiBvYmopIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9ialtrZXldID0gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9kZWZpbmVQcm9wZXJ0eTsiLCJmdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikge1xuICByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDoge1xuICAgIFwiZGVmYXVsdFwiOiBvYmpcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0OyIsImZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gIFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjtcblxuICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmo7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBfdHlwZW9mKG9iaik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3R5cGVvZjsiLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnZhciBydW50aW1lID0gKGZ1bmN0aW9uIChleHBvcnRzKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBPcCA9IE9iamVjdC5wcm90b3R5cGU7XG4gIHZhciBoYXNPd24gPSBPcC5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHVuZGVmaW5lZDsgLy8gTW9yZSBjb21wcmVzc2libGUgdGhhbiB2b2lkIDAuXG4gIHZhciAkU3ltYm9sID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sIDoge307XG4gIHZhciBpdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuaXRlcmF0b3IgfHwgXCJAQGl0ZXJhdG9yXCI7XG4gIHZhciBhc3luY0l0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5hc3luY0l0ZXJhdG9yIHx8IFwiQEBhc3luY0l0ZXJhdG9yXCI7XG4gIHZhciB0b1N0cmluZ1RhZ1N5bWJvbCA9ICRTeW1ib2wudG9TdHJpbmdUYWcgfHwgXCJAQHRvU3RyaW5nVGFnXCI7XG5cbiAgZnVuY3Rpb24gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIC8vIElmIG91dGVyRm4gcHJvdmlkZWQgYW5kIG91dGVyRm4ucHJvdG90eXBlIGlzIGEgR2VuZXJhdG9yLCB0aGVuIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yLlxuICAgIHZhciBwcm90b0dlbmVyYXRvciA9IG91dGVyRm4gJiYgb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IgPyBvdXRlckZuIDogR2VuZXJhdG9yO1xuICAgIHZhciBnZW5lcmF0b3IgPSBPYmplY3QuY3JlYXRlKHByb3RvR2VuZXJhdG9yLnByb3RvdHlwZSk7XG4gICAgdmFyIGNvbnRleHQgPSBuZXcgQ29udGV4dCh0cnlMb2NzTGlzdCB8fCBbXSk7XG5cbiAgICAvLyBUaGUgLl9pbnZva2UgbWV0aG9kIHVuaWZpZXMgdGhlIGltcGxlbWVudGF0aW9ucyBvZiB0aGUgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzLlxuICAgIGdlbmVyYXRvci5faW52b2tlID0gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcblxuICAgIHJldHVybiBnZW5lcmF0b3I7XG4gIH1cbiAgZXhwb3J0cy53cmFwID0gd3JhcDtcblxuICAvLyBUcnkvY2F0Y2ggaGVscGVyIHRvIG1pbmltaXplIGRlb3B0aW1pemF0aW9ucy4gUmV0dXJucyBhIGNvbXBsZXRpb25cbiAgLy8gcmVjb3JkIGxpa2UgY29udGV4dC50cnlFbnRyaWVzW2ldLmNvbXBsZXRpb24uIFRoaXMgaW50ZXJmYWNlIGNvdWxkXG4gIC8vIGhhdmUgYmVlbiAoYW5kIHdhcyBwcmV2aW91c2x5KSBkZXNpZ25lZCB0byB0YWtlIGEgY2xvc3VyZSB0byBiZVxuICAvLyBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnRzLCBidXQgaW4gYWxsIHRoZSBjYXNlcyB3ZSBjYXJlIGFib3V0IHdlXG4gIC8vIGFscmVhZHkgaGF2ZSBhbiBleGlzdGluZyBtZXRob2Qgd2Ugd2FudCB0byBjYWxsLCBzbyB0aGVyZSdzIG5vIG5lZWRcbiAgLy8gdG8gY3JlYXRlIGEgbmV3IGZ1bmN0aW9uIG9iamVjdC4gV2UgY2FuIGV2ZW4gZ2V0IGF3YXkgd2l0aCBhc3N1bWluZ1xuICAvLyB0aGUgbWV0aG9kIHRha2VzIGV4YWN0bHkgb25lIGFyZ3VtZW50LCBzaW5jZSB0aGF0IGhhcHBlbnMgdG8gYmUgdHJ1ZVxuICAvLyBpbiBldmVyeSBjYXNlLCBzbyB3ZSBkb24ndCBoYXZlIHRvIHRvdWNoIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBUaGVcbiAgLy8gb25seSBhZGRpdGlvbmFsIGFsbG9jYXRpb24gcmVxdWlyZWQgaXMgdGhlIGNvbXBsZXRpb24gcmVjb3JkLCB3aGljaFxuICAvLyBoYXMgYSBzdGFibGUgc2hhcGUgYW5kIHNvIGhvcGVmdWxseSBzaG91bGQgYmUgY2hlYXAgdG8gYWxsb2NhdGUuXG4gIGZ1bmN0aW9uIHRyeUNhdGNoKGZuLCBvYmosIGFyZykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIm5vcm1hbFwiLCBhcmc6IGZuLmNhbGwob2JqLCBhcmcpIH07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcInRocm93XCIsIGFyZzogZXJyIH07XG4gICAgfVxuICB9XG5cbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkU3RhcnQgPSBcInN1c3BlbmRlZFN0YXJ0XCI7XG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkID0gXCJzdXNwZW5kZWRZaWVsZFwiO1xuICB2YXIgR2VuU3RhdGVFeGVjdXRpbmcgPSBcImV4ZWN1dGluZ1wiO1xuICB2YXIgR2VuU3RhdGVDb21wbGV0ZWQgPSBcImNvbXBsZXRlZFwiO1xuXG4gIC8vIFJldHVybmluZyB0aGlzIG9iamVjdCBmcm9tIHRoZSBpbm5lckZuIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXNcbiAgLy8gYnJlYWtpbmcgb3V0IG9mIHRoZSBkaXNwYXRjaCBzd2l0Y2ggc3RhdGVtZW50LlxuICB2YXIgQ29udGludWVTZW50aW5lbCA9IHt9O1xuXG4gIC8vIER1bW15IGNvbnN0cnVjdG9yIGZ1bmN0aW9ucyB0aGF0IHdlIHVzZSBhcyB0aGUgLmNvbnN0cnVjdG9yIGFuZFxuICAvLyAuY29uc3RydWN0b3IucHJvdG90eXBlIHByb3BlcnRpZXMgZm9yIGZ1bmN0aW9ucyB0aGF0IHJldHVybiBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0cy4gRm9yIGZ1bGwgc3BlYyBjb21wbGlhbmNlLCB5b3UgbWF5IHdpc2ggdG8gY29uZmlndXJlIHlvdXJcbiAgLy8gbWluaWZpZXIgbm90IHRvIG1hbmdsZSB0aGUgbmFtZXMgb2YgdGhlc2UgdHdvIGZ1bmN0aW9ucy5cbiAgZnVuY3Rpb24gR2VuZXJhdG9yKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb24oKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSgpIHt9XG5cbiAgLy8gVGhpcyBpcyBhIHBvbHlmaWxsIGZvciAlSXRlcmF0b3JQcm90b3R5cGUlIGZvciBlbnZpcm9ubWVudHMgdGhhdFxuICAvLyBkb24ndCBuYXRpdmVseSBzdXBwb3J0IGl0LlxuICB2YXIgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcbiAgSXRlcmF0b3JQcm90b3R5cGVbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcbiAgdmFyIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG8gJiYgZ2V0UHJvdG8oZ2V0UHJvdG8odmFsdWVzKFtdKSkpO1xuICBpZiAoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgJiZcbiAgICAgIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICE9PSBPcCAmJlxuICAgICAgaGFzT3duLmNhbGwoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUsIGl0ZXJhdG9yU3ltYm9sKSkge1xuICAgIC8vIFRoaXMgZW52aXJvbm1lbnQgaGFzIGEgbmF0aXZlICVJdGVyYXRvclByb3RvdHlwZSU7IHVzZSBpdCBpbnN0ZWFkXG4gICAgLy8gb2YgdGhlIHBvbHlmaWxsLlxuICAgIEl0ZXJhdG9yUHJvdG90eXBlID0gTmF0aXZlSXRlcmF0b3JQcm90b3R5cGU7XG4gIH1cblxuICB2YXIgR3AgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUgPVxuICAgIEdlbmVyYXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlKTtcbiAgR2VuZXJhdG9yRnVuY3Rpb24ucHJvdG90eXBlID0gR3AuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvbjtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGVbdG9TdHJpbmdUYWdTeW1ib2xdID1cbiAgICBHZW5lcmF0b3JGdW5jdGlvbi5kaXNwbGF5TmFtZSA9IFwiR2VuZXJhdG9yRnVuY3Rpb25cIjtcblxuICAvLyBIZWxwZXIgZm9yIGRlZmluaW5nIHRoZSAubmV4dCwgLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzIG9mIHRoZVxuICAvLyBJdGVyYXRvciBpbnRlcmZhY2UgaW4gdGVybXMgb2YgYSBzaW5nbGUgLl9pbnZva2UgbWV0aG9kLlxuICBmdW5jdGlvbiBkZWZpbmVJdGVyYXRvck1ldGhvZHMocHJvdG90eXBlKSB7XG4gICAgW1wibmV4dFwiLCBcInRocm93XCIsIFwicmV0dXJuXCJdLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICBwcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKGFyZykge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlKG1ldGhvZCwgYXJnKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24gPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICB2YXIgY3RvciA9IHR5cGVvZiBnZW5GdW4gPT09IFwiZnVuY3Rpb25cIiAmJiBnZW5GdW4uY29uc3RydWN0b3I7XG4gICAgcmV0dXJuIGN0b3JcbiAgICAgID8gY3RvciA9PT0gR2VuZXJhdG9yRnVuY3Rpb24gfHxcbiAgICAgICAgLy8gRm9yIHRoZSBuYXRpdmUgR2VuZXJhdG9yRnVuY3Rpb24gY29uc3RydWN0b3IsIHRoZSBiZXN0IHdlIGNhblxuICAgICAgICAvLyBkbyBpcyB0byBjaGVjayBpdHMgLm5hbWUgcHJvcGVydHkuXG4gICAgICAgIChjdG9yLmRpc3BsYXlOYW1lIHx8IGN0b3IubmFtZSkgPT09IFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICAgICAgOiBmYWxzZTtcbiAgfTtcblxuICBleHBvcnRzLm1hcmsgPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoZ2VuRnVuLCBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICAgIGlmICghKHRvU3RyaW5nVGFnU3ltYm9sIGluIGdlbkZ1bikpIHtcbiAgICAgICAgZ2VuRnVuW3RvU3RyaW5nVGFnU3ltYm9sXSA9IFwiR2VuZXJhdG9yRnVuY3Rpb25cIjtcbiAgICAgIH1cbiAgICB9XG4gICAgZ2VuRnVuLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoR3ApO1xuICAgIHJldHVybiBnZW5GdW47XG4gIH07XG5cbiAgLy8gV2l0aGluIHRoZSBib2R5IG9mIGFueSBhc3luYyBmdW5jdGlvbiwgYGF3YWl0IHhgIGlzIHRyYW5zZm9ybWVkIHRvXG4gIC8vIGB5aWVsZCByZWdlbmVyYXRvclJ1bnRpbWUuYXdyYXAoeClgLCBzbyB0aGF0IHRoZSBydW50aW1lIGNhbiB0ZXN0XG4gIC8vIGBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpYCB0byBkZXRlcm1pbmUgaWYgdGhlIHlpZWxkZWQgdmFsdWUgaXNcbiAgLy8gbWVhbnQgdG8gYmUgYXdhaXRlZC5cbiAgZXhwb3J0cy5hd3JhcCA9IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB7IF9fYXdhaXQ6IGFyZyB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIEFzeW5jSXRlcmF0b3IoZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChnZW5lcmF0b3JbbWV0aG9kXSwgZ2VuZXJhdG9yLCBhcmcpO1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgcmVqZWN0KHJlY29yZC5hcmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHZhciB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlICYmXG4gICAgICAgICAgICB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIikpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlLl9fYXdhaXQpLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIGludm9rZShcIm5leHRcIiwgdmFsdWUsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJ0aHJvd1wiLCBlcnIsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uKHVud3JhcHBlZCkge1xuICAgICAgICAgIC8vIFdoZW4gYSB5aWVsZGVkIFByb21pc2UgaXMgcmVzb2x2ZWQsIGl0cyBmaW5hbCB2YWx1ZSBiZWNvbWVzXG4gICAgICAgICAgLy8gdGhlIC52YWx1ZSBvZiB0aGUgUHJvbWlzZTx7dmFsdWUsZG9uZX0+IHJlc3VsdCBmb3IgdGhlXG4gICAgICAgICAgLy8gY3VycmVudCBpdGVyYXRpb24uXG4gICAgICAgICAgcmVzdWx0LnZhbHVlID0gdW53cmFwcGVkO1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAvLyBJZiBhIHJlamVjdGVkIFByb21pc2Ugd2FzIHlpZWxkZWQsIHRocm93IHRoZSByZWplY3Rpb24gYmFja1xuICAgICAgICAgIC8vIGludG8gdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgaGFuZGxlZCB0aGVyZS5cbiAgICAgICAgICByZXR1cm4gaW52b2tlKFwidGhyb3dcIiwgZXJyb3IsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcmV2aW91c1Byb21pc2U7XG5cbiAgICBmdW5jdGlvbiBlbnF1ZXVlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBmdW5jdGlvbiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcmV2aW91c1Byb21pc2UgPVxuICAgICAgICAvLyBJZiBlbnF1ZXVlIGhhcyBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gd2Ugd2FudCB0byB3YWl0IHVudGlsXG4gICAgICAgIC8vIGFsbCBwcmV2aW91cyBQcm9taXNlcyBoYXZlIGJlZW4gcmVzb2x2ZWQgYmVmb3JlIGNhbGxpbmcgaW52b2tlLFxuICAgICAgICAvLyBzbyB0aGF0IHJlc3VsdHMgYXJlIGFsd2F5cyBkZWxpdmVyZWQgaW4gdGhlIGNvcnJlY3Qgb3JkZXIuIElmXG4gICAgICAgIC8vIGVucXVldWUgaGFzIG5vdCBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gaXQgaXMgaW1wb3J0YW50IHRvXG4gICAgICAgIC8vIGNhbGwgaW52b2tlIGltbWVkaWF0ZWx5LCB3aXRob3V0IHdhaXRpbmcgb24gYSBjYWxsYmFjayB0byBmaXJlLFxuICAgICAgICAvLyBzbyB0aGF0IHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gaGFzIHRoZSBvcHBvcnR1bml0eSB0byBkb1xuICAgICAgICAvLyBhbnkgbmVjZXNzYXJ5IHNldHVwIGluIGEgcHJlZGljdGFibGUgd2F5LiBUaGlzIHByZWRpY3RhYmlsaXR5XG4gICAgICAgIC8vIGlzIHdoeSB0aGUgUHJvbWlzZSBjb25zdHJ1Y3RvciBzeW5jaHJvbm91c2x5IGludm9rZXMgaXRzXG4gICAgICAgIC8vIGV4ZWN1dG9yIGNhbGxiYWNrLCBhbmQgd2h5IGFzeW5jIGZ1bmN0aW9ucyBzeW5jaHJvbm91c2x5XG4gICAgICAgIC8vIGV4ZWN1dGUgY29kZSBiZWZvcmUgdGhlIGZpcnN0IGF3YWl0LiBTaW5jZSB3ZSBpbXBsZW1lbnQgc2ltcGxlXG4gICAgICAgIC8vIGFzeW5jIGZ1bmN0aW9ucyBpbiB0ZXJtcyBvZiBhc3luYyBnZW5lcmF0b3JzLCBpdCBpcyBlc3BlY2lhbGx5XG4gICAgICAgIC8vIGltcG9ydGFudCB0byBnZXQgdGhpcyByaWdodCwgZXZlbiB0aG91Z2ggaXQgcmVxdWlyZXMgY2FyZS5cbiAgICAgICAgcHJldmlvdXNQcm9taXNlID8gcHJldmlvdXNQcm9taXNlLnRoZW4oXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcsXG4gICAgICAgICAgLy8gQXZvaWQgcHJvcGFnYXRpbmcgZmFpbHVyZXMgdG8gUHJvbWlzZXMgcmV0dXJuZWQgYnkgbGF0ZXJcbiAgICAgICAgICAvLyBpbnZvY2F0aW9ucyBvZiB0aGUgaXRlcmF0b3IuXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmdcbiAgICAgICAgKSA6IGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCk7XG4gICAgfVxuXG4gICAgLy8gRGVmaW5lIHRoZSB1bmlmaWVkIGhlbHBlciBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIGltcGxlbWVudCAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIChzZWUgZGVmaW5lSXRlcmF0b3JNZXRob2RzKS5cbiAgICB0aGlzLl9pbnZva2UgPSBlbnF1ZXVlO1xuICB9XG5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEFzeW5jSXRlcmF0b3IucHJvdG90eXBlKTtcbiAgQXN5bmNJdGVyYXRvci5wcm90b3R5cGVbYXN5bmNJdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIGV4cG9ydHMuQXN5bmNJdGVyYXRvciA9IEFzeW5jSXRlcmF0b3I7XG5cbiAgLy8gTm90ZSB0aGF0IHNpbXBsZSBhc3luYyBmdW5jdGlvbnMgYXJlIGltcGxlbWVudGVkIG9uIHRvcCBvZlxuICAvLyBBc3luY0l0ZXJhdG9yIG9iamVjdHM7IHRoZXkganVzdCByZXR1cm4gYSBQcm9taXNlIGZvciB0aGUgdmFsdWUgb2ZcbiAgLy8gdGhlIGZpbmFsIHJlc3VsdCBwcm9kdWNlZCBieSB0aGUgaXRlcmF0b3IuXG4gIGV4cG9ydHMuYXN5bmMgPSBmdW5jdGlvbihpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIHZhciBpdGVyID0gbmV3IEFzeW5jSXRlcmF0b3IoXG4gICAgICB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KVxuICAgICk7XG5cbiAgICByZXR1cm4gZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uKG91dGVyRm4pXG4gICAgICA/IGl0ZXIgLy8gSWYgb3V0ZXJGbiBpcyBhIGdlbmVyYXRvciwgcmV0dXJuIHRoZSBmdWxsIGl0ZXJhdG9yLlxuICAgICAgOiBpdGVyLm5leHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQuZG9uZSA/IHJlc3VsdC52YWx1ZSA6IGl0ZXIubmV4dCgpO1xuICAgICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpIHtcbiAgICB2YXIgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZykge1xuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUV4ZWN1dGluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBydW5uaW5nXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlQ29tcGxldGVkKSB7XG4gICAgICAgIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJlIGZvcmdpdmluZywgcGVyIDI1LjMuMy4zLjMgb2YgdGhlIHNwZWM6XG4gICAgICAgIC8vIGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1nZW5lcmF0b3JyZXN1bWVcbiAgICAgICAgcmV0dXJuIGRvbmVSZXN1bHQoKTtcbiAgICAgIH1cblxuICAgICAgY29udGV4dC5tZXRob2QgPSBtZXRob2Q7XG4gICAgICBjb250ZXh0LmFyZyA9IGFyZztcblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gY29udGV4dC5kZWxlZ2F0ZTtcbiAgICAgICAgaWYgKGRlbGVnYXRlKSB7XG4gICAgICAgICAgdmFyIGRlbGVnYXRlUmVzdWx0ID0gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG4gICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQgPT09IENvbnRpbnVlU2VudGluZWwpIGNvbnRpbnVlO1xuICAgICAgICAgICAgcmV0dXJuIGRlbGVnYXRlUmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICAvLyBTZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgICAgIGNvbnRleHQuc2VudCA9IGNvbnRleHQuX3NlbnQgPSBjb250ZXh0LmFyZztcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQpIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgICB0aHJvdyBjb250ZXh0LmFyZztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKTtcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgY29udGV4dC5hYnJ1cHQoXCJyZXR1cm5cIiwgY29udGV4dC5hcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUV4ZWN1dGluZztcblxuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG4gICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIikge1xuICAgICAgICAgIC8vIElmIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZnJvbSBpbm5lckZuLCB3ZSBsZWF2ZSBzdGF0ZSA9PT1cbiAgICAgICAgICAvLyBHZW5TdGF0ZUV4ZWN1dGluZyBhbmQgbG9vcCBiYWNrIGZvciBhbm90aGVyIGludm9jYXRpb24uXG4gICAgICAgICAgc3RhdGUgPSBjb250ZXh0LmRvbmVcbiAgICAgICAgICAgID8gR2VuU3RhdGVDb21wbGV0ZWRcbiAgICAgICAgICAgIDogR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcblxuICAgICAgICAgIGlmIChyZWNvcmQuYXJnID09PSBDb250aW51ZVNlbnRpbmVsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHJlY29yZC5hcmcsXG4gICAgICAgICAgICBkb25lOiBjb250ZXh0LmRvbmVcbiAgICAgICAgICB9O1xuXG4gICAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgLy8gRGlzcGF0Y2ggdGhlIGV4Y2VwdGlvbiBieSBsb29waW5nIGJhY2sgYXJvdW5kIHRvIHRoZVxuICAgICAgICAgIC8vIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpIGNhbGwgYWJvdmUuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIENhbGwgZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdKGNvbnRleHQuYXJnKSBhbmQgaGFuZGxlIHRoZVxuICAvLyByZXN1bHQsIGVpdGhlciBieSByZXR1cm5pbmcgYSB7IHZhbHVlLCBkb25lIH0gcmVzdWx0IGZyb20gdGhlXG4gIC8vIGRlbGVnYXRlIGl0ZXJhdG9yLCBvciBieSBtb2RpZnlpbmcgY29udGV4dC5tZXRob2QgYW5kIGNvbnRleHQuYXJnLFxuICAvLyBzZXR0aW5nIGNvbnRleHQuZGVsZWdhdGUgdG8gbnVsbCwgYW5kIHJldHVybmluZyB0aGUgQ29udGludWVTZW50aW5lbC5cbiAgZnVuY3Rpb24gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCkge1xuICAgIHZhciBtZXRob2QgPSBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF07XG4gICAgaWYgKG1ldGhvZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBBIC50aHJvdyBvciAucmV0dXJuIHdoZW4gdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBubyAudGhyb3dcbiAgICAgIC8vIG1ldGhvZCBhbHdheXMgdGVybWluYXRlcyB0aGUgeWllbGQqIGxvb3AuXG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgLy8gTm90ZTogW1wicmV0dXJuXCJdIG11c3QgYmUgdXNlZCBmb3IgRVMzIHBhcnNpbmcgY29tcGF0aWJpbGl0eS5cbiAgICAgICAgaWYgKGRlbGVnYXRlLml0ZXJhdG9yW1wicmV0dXJuXCJdKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBhIHJldHVybiBtZXRob2QsIGdpdmUgaXQgYVxuICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgLy8gSWYgbWF5YmVJbnZva2VEZWxlZ2F0ZShjb250ZXh0KSBjaGFuZ2VkIGNvbnRleHQubWV0aG9kIGZyb21cbiAgICAgICAgICAgIC8vIFwicmV0dXJuXCIgdG8gXCJ0aHJvd1wiLCBsZXQgdGhhdCBvdmVycmlkZSB0aGUgVHlwZUVycm9yIGJlbG93LlxuICAgICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBcIlRoZSBpdGVyYXRvciBkb2VzIG5vdCBwcm92aWRlIGEgJ3Rocm93JyBtZXRob2RcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChtZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBjb250ZXh0LmFyZyk7XG5cbiAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcblxuICAgIGlmICghIGluZm8pIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFwiaXRlcmF0b3IgcmVzdWx0IGlzIG5vdCBhbiBvYmplY3RcIik7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgIC8vIEFzc2lnbiB0aGUgcmVzdWx0IG9mIHRoZSBmaW5pc2hlZCBkZWxlZ2F0ZSB0byB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyB2YXJpYWJsZSBzcGVjaWZpZWQgYnkgZGVsZWdhdGUucmVzdWx0TmFtZSAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG5cbiAgICAgIC8vIFJlc3VtZSBleGVjdXRpb24gYXQgdGhlIGRlc2lyZWQgbG9jYXRpb24gKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG5cbiAgICAgIC8vIElmIGNvbnRleHQubWV0aG9kIHdhcyBcInRocm93XCIgYnV0IHRoZSBkZWxlZ2F0ZSBoYW5kbGVkIHRoZVxuICAgICAgLy8gZXhjZXB0aW9uLCBsZXQgdGhlIG91dGVyIGdlbmVyYXRvciBwcm9jZWVkIG5vcm1hbGx5LiBJZlxuICAgICAgLy8gY29udGV4dC5tZXRob2Qgd2FzIFwibmV4dFwiLCBmb3JnZXQgY29udGV4dC5hcmcgc2luY2UgaXQgaGFzIGJlZW5cbiAgICAgIC8vIFwiY29uc3VtZWRcIiBieSB0aGUgZGVsZWdhdGUgaXRlcmF0b3IuIElmIGNvbnRleHQubWV0aG9kIHdhc1xuICAgICAgLy8gXCJyZXR1cm5cIiwgYWxsb3cgdGhlIG9yaWdpbmFsIC5yZXR1cm4gY2FsbCB0byBjb250aW51ZSBpbiB0aGVcbiAgICAgIC8vIG91dGVyIGdlbmVyYXRvci5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCAhPT0gXCJyZXR1cm5cIikge1xuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZS15aWVsZCB0aGUgcmVzdWx0IHJldHVybmVkIGJ5IHRoZSBkZWxlZ2F0ZSBtZXRob2QuXG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9XG5cbiAgICAvLyBUaGUgZGVsZWdhdGUgaXRlcmF0b3IgaXMgZmluaXNoZWQsIHNvIGZvcmdldCBpdCBhbmQgY29udGludWUgd2l0aFxuICAgIC8vIHRoZSBvdXRlciBnZW5lcmF0b3IuXG4gICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gIH1cblxuICAvLyBEZWZpbmUgR2VuZXJhdG9yLnByb3RvdHlwZS57bmV4dCx0aHJvdyxyZXR1cm59IGluIHRlcm1zIG9mIHRoZVxuICAvLyB1bmlmaWVkIC5faW52b2tlIGhlbHBlciBtZXRob2QuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCk7XG5cbiAgR3BbdG9TdHJpbmdUYWdTeW1ib2xdID0gXCJHZW5lcmF0b3JcIjtcblxuICAvLyBBIEdlbmVyYXRvciBzaG91bGQgYWx3YXlzIHJldHVybiBpdHNlbGYgYXMgdGhlIGl0ZXJhdG9yIG9iamVjdCB3aGVuIHRoZVxuICAvLyBAQGl0ZXJhdG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbiBpdC4gU29tZSBicm93c2VycycgaW1wbGVtZW50YXRpb25zIG9mIHRoZVxuICAvLyBpdGVyYXRvciBwcm90b3R5cGUgY2hhaW4gaW5jb3JyZWN0bHkgaW1wbGVtZW50IHRoaXMsIGNhdXNpbmcgdGhlIEdlbmVyYXRvclxuICAvLyBvYmplY3QgdG8gbm90IGJlIHJldHVybmVkIGZyb20gdGhpcyBjYWxsLiBUaGlzIGVuc3VyZXMgdGhhdCBkb2Vzbid0IGhhcHBlbi5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9pc3N1ZXMvMjc0IGZvciBtb3JlIGRldGFpbHMuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gIH1cblxuICBleHBvcnRzLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgZXhwb3J0cy52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbihza2lwVGVtcFJlc2V0KSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIC8vIFJlc2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgdGhpcy5zZW50ID0gdGhpcy5fc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuXG4gICAgICAgIGlmIChjYXVnaHQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhISBjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHRoaXMuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhpcyBzY3JpcHQgaXMgZXhlY3V0aW5nIGFzIGEgQ29tbW9uSlMgbW9kdWxlXG4gIC8vIG9yIG5vdCwgcmV0dXJuIHRoZSBydW50aW1lIG9iamVjdCBzbyB0aGF0IHdlIGNhbiBkZWNsYXJlIHRoZSB2YXJpYWJsZVxuICAvLyByZWdlbmVyYXRvclJ1bnRpbWUgaW4gdGhlIG91dGVyIHNjb3BlLCB3aGljaCBhbGxvd3MgdGhpcyBtb2R1bGUgdG8gYmVcbiAgLy8gaW5qZWN0ZWQgZWFzaWx5IGJ5IGBiaW4vcmVnZW5lcmF0b3IgLS1pbmNsdWRlLXJ1bnRpbWUgc2NyaXB0LmpzYC5cbiAgcmV0dXJuIGV4cG9ydHM7XG5cbn0oXG4gIC8vIElmIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZSwgdXNlIG1vZHVsZS5leHBvcnRzXG4gIC8vIGFzIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgbmFtZXNwYWNlLiBPdGhlcndpc2UgY3JlYXRlIGEgbmV3IGVtcHR5XG4gIC8vIG9iamVjdC4gRWl0aGVyIHdheSwgdGhlIHJlc3VsdGluZyBvYmplY3Qgd2lsbCBiZSB1c2VkIHRvIGluaXRpYWxpemVcbiAgLy8gdGhlIHJlZ2VuZXJhdG9yUnVudGltZSB2YXJpYWJsZSBhdCB0aGUgdG9wIG9mIHRoaXMgZmlsZS5cbiAgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiA/IG1vZHVsZS5leHBvcnRzIDoge31cbikpO1xuXG50cnkge1xuICByZWdlbmVyYXRvclJ1bnRpbWUgPSBydW50aW1lO1xufSBjYXRjaCAoYWNjaWRlbnRhbFN0cmljdE1vZGUpIHtcbiAgLy8gVGhpcyBtb2R1bGUgc2hvdWxkIG5vdCBiZSBydW5uaW5nIGluIHN0cmljdCBtb2RlLCBzbyB0aGUgYWJvdmVcbiAgLy8gYXNzaWdubWVudCBzaG91bGQgYWx3YXlzIHdvcmsgdW5sZXNzIHNvbWV0aGluZyBpcyBtaXNjb25maWd1cmVkLiBKdXN0XG4gIC8vIGluIGNhc2UgcnVudGltZS5qcyBhY2NpZGVudGFsbHkgcnVucyBpbiBzdHJpY3QgbW9kZSwgd2UgY2FuIGVzY2FwZVxuICAvLyBzdHJpY3QgbW9kZSB1c2luZyBhIGdsb2JhbCBGdW5jdGlvbiBjYWxsLiBUaGlzIGNvdWxkIGNvbmNlaXZhYmx5IGZhaWxcbiAgLy8gaWYgYSBDb250ZW50IFNlY3VyaXR5IFBvbGljeSBmb3JiaWRzIHVzaW5nIEZ1bmN0aW9uLCBidXQgaW4gdGhhdCBjYXNlXG4gIC8vIHRoZSBwcm9wZXIgc29sdXRpb24gaXMgdG8gZml4IHRoZSBhY2NpZGVudGFsIHN0cmljdCBtb2RlIHByb2JsZW0uIElmXG4gIC8vIHlvdSd2ZSBtaXNjb25maWd1cmVkIHlvdXIgYnVuZGxlciB0byBmb3JjZSBzdHJpY3QgbW9kZSBhbmQgYXBwbGllZCBhXG4gIC8vIENTUCB0byBmb3JiaWQgRnVuY3Rpb24sIGFuZCB5b3UncmUgbm90IHdpbGxpbmcgdG8gZml4IGVpdGhlciBvZiB0aG9zZVxuICAvLyBwcm9ibGVtcywgcGxlYXNlIGRldGFpbCB5b3VyIHVuaXF1ZSBwcmVkaWNhbWVudCBpbiBhIEdpdEh1YiBpc3N1ZS5cbiAgRnVuY3Rpb24oXCJyXCIsIFwicmVnZW5lcmF0b3JSdW50aW1lID0gclwiKShydW50aW1lKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJlZ2VuZXJhdG9yLXJ1bnRpbWVcIik7XG4iLCIoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdCwgZXhwb3J0cyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShbJ2V4cG9ydHMnXSwgZnVuY3Rpb24oZXhwb3J0cykge1xuICAgICAgcm9vdC5Mb2NrciA9IGZhY3Rvcnkocm9vdCwgZXhwb3J0cyk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5Mb2NrciA9IGZhY3Rvcnkocm9vdCwge30pO1xuICB9XG5cbn0odGhpcywgZnVuY3Rpb24ocm9vdCwgTG9ja3IpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uKGVsdCAvKiwgZnJvbSovKVxuICAgIHtcbiAgICAgIHZhciBsZW4gPSB0aGlzLmxlbmd0aCA+Pj4gMDtcblxuICAgICAgdmFyIGZyb20gPSBOdW1iZXIoYXJndW1lbnRzWzFdKSB8fCAwO1xuICAgICAgZnJvbSA9IChmcm9tIDwgMClcbiAgICAgID8gTWF0aC5jZWlsKGZyb20pXG4gICAgICA6IE1hdGguZmxvb3IoZnJvbSk7XG4gICAgICBpZiAoZnJvbSA8IDApXG4gICAgICAgIGZyb20gKz0gbGVuO1xuXG4gICAgICBmb3IgKDsgZnJvbSA8IGxlbjsgZnJvbSsrKVxuICAgICAge1xuICAgICAgICBpZiAoZnJvbSBpbiB0aGlzICYmXG4gICAgICAgICAgICB0aGlzW2Zyb21dID09PSBlbHQpXG4gICAgICAgICAgcmV0dXJuIGZyb207XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfVxuXG4gIExvY2tyLnByZWZpeCA9IFwiXCI7XG5cbiAgTG9ja3IuX2dldFByZWZpeGVkS2V5ID0gZnVuY3Rpb24oa2V5LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICBpZiAob3B0aW9ucy5ub1ByZWZpeCkge1xuICAgICAgcmV0dXJuIGtleTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucHJlZml4ICsga2V5O1xuICAgIH1cblxuICB9O1xuXG4gIExvY2tyLnNldCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBvcHRpb25zKSB7XG4gICAgdmFyIHF1ZXJ5X2tleSA9IHRoaXMuX2dldFByZWZpeGVkS2V5KGtleSwgb3B0aW9ucyk7XG5cbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0ocXVlcnlfa2V5LCBKU09OLnN0cmluZ2lmeSh7XCJkYXRhXCI6IHZhbHVlfSkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChjb25zb2xlKSBjb25zb2xlLndhcm4oXCJMb2NrciBkaWRuJ3Qgc3VjY2Vzc2Z1bGx5IHNhdmUgdGhlICd7XCIrIGtleSArXCI6IFwiKyB2YWx1ZSArXCJ9JyBwYWlyLCBiZWNhdXNlIHRoZSBsb2NhbFN0b3JhZ2UgaXMgZnVsbC5cIik7XG4gICAgfVxuICB9O1xuXG4gIExvY2tyLmdldCA9IGZ1bmN0aW9uIChrZXksIG1pc3NpbmcsIG9wdGlvbnMpIHtcbiAgICB2YXIgcXVlcnlfa2V5ID0gdGhpcy5fZ2V0UHJlZml4ZWRLZXkoa2V5LCBvcHRpb25zKSxcbiAgICAgICAgdmFsdWU7XG5cbiAgICB0cnkge1xuICAgICAgdmFsdWUgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKHF1ZXJ5X2tleSkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmKGxvY2FsU3RvcmFnZVtxdWVyeV9rZXldKSB7XG4gICAgICAgICAgICAgIHZhbHVlID0ge2RhdGE6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHF1ZXJ5X2tleSl9O1xuICAgICAgICAgICAgfSBlbHNle1xuICAgICAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIXZhbHVlKSB7XG4gICAgICByZXR1cm4gbWlzc2luZztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUuZGF0YSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiB2YWx1ZS5kYXRhO1xuICAgIH1cbiAgfTtcblxuICBMb2Nrci5zYWRkID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuICAgIHZhciBxdWVyeV9rZXkgPSB0aGlzLl9nZXRQcmVmaXhlZEtleShrZXksIG9wdGlvbnMpLFxuICAgICAgICBqc29uO1xuXG4gICAgdmFyIHZhbHVlcyA9IExvY2tyLnNtZW1iZXJzKGtleSk7XG5cbiAgICBpZiAodmFsdWVzLmluZGV4T2YodmFsdWUpID4gLTEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICB2YWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgICBqc29uID0gSlNPTi5zdHJpbmdpZnkoe1wiZGF0YVwiOiB2YWx1ZXN9KTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHF1ZXJ5X2tleSwganNvbik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICBpZiAoY29uc29sZSkgY29uc29sZS53YXJuKFwiTG9ja3IgZGlkbid0IHN1Y2Nlc3NmdWxseSBhZGQgdGhlIFwiKyB2YWx1ZSArXCIgdG8gXCIrIGtleSArXCIgc2V0LCBiZWNhdXNlIHRoZSBsb2NhbFN0b3JhZ2UgaXMgZnVsbC5cIik7XG4gICAgfVxuICB9O1xuXG4gIExvY2tyLnNtZW1iZXJzID0gZnVuY3Rpb24oa2V5LCBvcHRpb25zKSB7XG4gICAgdmFyIHF1ZXJ5X2tleSA9IHRoaXMuX2dldFByZWZpeGVkS2V5KGtleSwgb3B0aW9ucyksXG4gICAgICAgIHZhbHVlO1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhbHVlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShxdWVyeV9rZXkpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB2YWx1ZSA9IG51bGw7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiAodmFsdWUgJiYgdmFsdWUuZGF0YSkgPyB2YWx1ZS5kYXRhIDogW107XG4gIH07XG5cbiAgTG9ja3Iuc2lzbWVtYmVyID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuICAgIHJldHVybiBMb2Nrci5zbWVtYmVycyhrZXkpLmluZGV4T2YodmFsdWUpID4gLTE7XG4gIH07XG5cbiAgTG9ja3Iua2V5cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgdmFyIGFsbEtleXMgPSBPYmplY3Qua2V5cyhsb2NhbFN0b3JhZ2UpO1xuXG4gICAgaWYgKExvY2tyLnByZWZpeC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBhbGxLZXlzO1xuICAgIH1cblxuICAgIGFsbEtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBpZiAoa2V5LmluZGV4T2YoTG9ja3IucHJlZml4KSAhPT0gLTEpIHtcbiAgICAgICAga2V5cy5wdXNoKGtleS5yZXBsYWNlKExvY2tyLnByZWZpeCwgJycpKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBrZXlzO1xuICB9O1xuXG4gIExvY2tyLmdldEFsbCA9IGZ1bmN0aW9uIChpbmNsdWRlS2V5cykge1xuICAgIHZhciBrZXlzID0gTG9ja3Iua2V5cygpO1xuXG4gICAgaWYgKGluY2x1ZGVLZXlzKSB7XG4gICAgICByZXR1cm4ga2V5cy5yZWR1Y2UoZnVuY3Rpb24gKGFjY3VtLCBrZXkpIHtcbiAgICAgICAgdmFyIHRlbXBPYmogPSB7fTtcbiAgICAgICAgdGVtcE9ialtrZXldID0gTG9ja3IuZ2V0KGtleSk7XG4gICAgICAgIGFjY3VtLnB1c2godGVtcE9iaik7XG4gICAgICAgIHJldHVybiBhY2N1bTtcbiAgICAgIH0sIFtdKTtcbiAgICB9XG5cbiAgICByZXR1cm4ga2V5cy5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIExvY2tyLmdldChrZXkpO1xuICAgIH0pO1xuICB9O1xuXG4gIExvY2tyLnNyZW0gPSBmdW5jdGlvbihrZXksIHZhbHVlLCBvcHRpb25zKSB7XG4gICAgdmFyIHF1ZXJ5X2tleSA9IHRoaXMuX2dldFByZWZpeGVkS2V5KGtleSwgb3B0aW9ucyksXG4gICAgICAgIGpzb24sXG4gICAgICAgIGluZGV4O1xuXG4gICAgdmFyIHZhbHVlcyA9IExvY2tyLnNtZW1iZXJzKGtleSwgdmFsdWUpO1xuXG4gICAgaW5kZXggPSB2YWx1ZXMuaW5kZXhPZih2YWx1ZSk7XG5cbiAgICBpZiAoaW5kZXggPiAtMSlcbiAgICAgIHZhbHVlcy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAganNvbiA9IEpTT04uc3RyaW5naWZ5KHtcImRhdGFcIjogdmFsdWVzfSk7XG5cbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0ocXVlcnlfa2V5LCBqc29uKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoY29uc29sZSkgY29uc29sZS53YXJuKFwiTG9ja3IgY291bGRuJ3QgcmVtb3ZlIHRoZSBcIisgdmFsdWUgK1wiIGZyb20gdGhlIHNldCBcIisga2V5KTtcbiAgICB9XG4gIH07XG5cbiAgTG9ja3Iucm0gPSAgZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBxdWVyeUtleSA9IHRoaXMuX2dldFByZWZpeGVkS2V5KGtleSk7XG4gICAgXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0ocXVlcnlLZXkpO1xuICB9O1xuXG4gIExvY2tyLmZsdXNoID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChMb2Nrci5wcmVmaXgubGVuZ3RoKSB7XG4gICAgICBMb2Nrci5rZXlzKCkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oTG9ja3IuX2dldFByZWZpeGVkS2V5KGtleSkpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5jbGVhcigpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIExvY2tyO1xuXG59KSk7XG4iLCIvKiFcbiogc3dlZXRhbGVydDIgdjkuOC4yXG4qIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbiovXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG4gIChnbG9iYWwgPSBnbG9iYWwgfHwgc2VsZiwgZ2xvYmFsLlN3ZWV0YWxlcnQyID0gZmFjdG9yeSgpKTtcbn0odGhpcywgZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbiAgZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgICBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7XG5cbiAgICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHtcbiAgICAgIF90eXBlb2YgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JqO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgX3R5cGVvZiA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBfdHlwZW9mKG9iaik7XG4gIH1cblxuICBmdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gICAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgICBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICB9XG5cbiAgZnVuY3Rpb24gX2V4dGVuZHMoKSB7XG4gICAgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH07XG5cbiAgICByZXR1cm4gX2V4dGVuZHMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICAgIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTtcbiAgICB9XG5cbiAgICBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBzdWJDbGFzcyxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChzdXBlckNsYXNzKSBfc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpO1xuICB9XG5cbiAgZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHtcbiAgICBfZ2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3QuZ2V0UHJvdG90eXBlT2YgOiBmdW5jdGlvbiBfZ2V0UHJvdG90eXBlT2Yobykge1xuICAgICAgcmV0dXJuIG8uX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihvKTtcbiAgICB9O1xuICAgIHJldHVybiBfZ2V0UHJvdG90eXBlT2Yobyk7XG4gIH1cblxuICBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkge1xuICAgIF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkge1xuICAgICAgby5fX3Byb3RvX18gPSBwO1xuICAgICAgcmV0dXJuIG87XG4gICAgfTtcblxuICAgIHJldHVybiBfc2V0UHJvdG90eXBlT2YobywgcCk7XG4gIH1cblxuICBmdW5jdGlvbiBpc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSB7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcInVuZGVmaW5lZFwiIHx8ICFSZWZsZWN0LmNvbnN0cnVjdCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHR5cGVvZiBQcm94eSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdHJ1ZTtcblxuICAgIHRyeSB7XG4gICAgICBEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKFJlZmxlY3QuY29uc3RydWN0KERhdGUsIFtdLCBmdW5jdGlvbiAoKSB7fSkpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF9jb25zdHJ1Y3QoUGFyZW50LCBhcmdzLCBDbGFzcykge1xuICAgIGlmIChpc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSkge1xuICAgICAgX2NvbnN0cnVjdCA9IFJlZmxlY3QuY29uc3RydWN0O1xuICAgIH0gZWxzZSB7XG4gICAgICBfY29uc3RydWN0ID0gZnVuY3Rpb24gX2NvbnN0cnVjdChQYXJlbnQsIGFyZ3MsIENsYXNzKSB7XG4gICAgICAgIHZhciBhID0gW251bGxdO1xuICAgICAgICBhLnB1c2guYXBwbHkoYSwgYXJncyk7XG4gICAgICAgIHZhciBDb25zdHJ1Y3RvciA9IEZ1bmN0aW9uLmJpbmQuYXBwbHkoUGFyZW50LCBhKTtcbiAgICAgICAgdmFyIGluc3RhbmNlID0gbmV3IENvbnN0cnVjdG9yKCk7XG4gICAgICAgIGlmIChDbGFzcykgX3NldFByb3RvdHlwZU9mKGluc3RhbmNlLCBDbGFzcy5wcm90b3R5cGUpO1xuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBfY29uc3RydWN0LmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBmdW5jdGlvbiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpIHtcbiAgICBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7XG4gICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cblxuICBmdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7XG4gICAgaWYgKGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICByZXR1cm4gY2FsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9zdXBlclByb3BCYXNlKG9iamVjdCwgcHJvcGVydHkpIHtcbiAgICB3aGlsZSAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KSkge1xuICAgICAgb2JqZWN0ID0gX2dldFByb3RvdHlwZU9mKG9iamVjdCk7XG4gICAgICBpZiAob2JqZWN0ID09PSBudWxsKSBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG5cbiAgZnVuY3Rpb24gX2dldCh0YXJnZXQsIHByb3BlcnR5LCByZWNlaXZlcikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBSZWZsZWN0LmdldCkge1xuICAgICAgX2dldCA9IFJlZmxlY3QuZ2V0O1xuICAgIH0gZWxzZSB7XG4gICAgICBfZ2V0ID0gZnVuY3Rpb24gX2dldCh0YXJnZXQsIHByb3BlcnR5LCByZWNlaXZlcikge1xuICAgICAgICB2YXIgYmFzZSA9IF9zdXBlclByb3BCYXNlKHRhcmdldCwgcHJvcGVydHkpO1xuXG4gICAgICAgIGlmICghYmFzZSkgcmV0dXJuO1xuICAgICAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoYmFzZSwgcHJvcGVydHkpO1xuXG4gICAgICAgIGlmIChkZXNjLmdldCkge1xuICAgICAgICAgIHJldHVybiBkZXNjLmdldC5jYWxsKHJlY2VpdmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gX2dldCh0YXJnZXQsIHByb3BlcnR5LCByZWNlaXZlciB8fCB0YXJnZXQpO1xuICB9XG5cbiAgdmFyIGNvbnNvbGVQcmVmaXggPSAnU3dlZXRBbGVydDI6JztcbiAgLyoqXG4gICAqIEZpbHRlciB0aGUgdW5pcXVlIHZhbHVlcyBpbnRvIGEgbmV3IGFycmF5XG4gICAqIEBwYXJhbSBhcnJcbiAgICovXG5cbiAgdmFyIHVuaXF1ZUFycmF5ID0gZnVuY3Rpb24gdW5pcXVlQXJyYXkoYXJyKSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChyZXN1bHQuaW5kZXhPZihhcnJbaV0pID09PSAtMSkge1xuICAgICAgICByZXN1bHQucHVzaChhcnJbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIC8qKlxuICAgKiBDYXBpdGFsaXplIHRoZSBmaXJzdCBsZXR0ZXIgb2YgYSBzdHJpbmdcbiAgICogQHBhcmFtIHN0clxuICAgKi9cblxuICB2YXIgY2FwaXRhbGl6ZUZpcnN0TGV0dGVyID0gZnVuY3Rpb24gY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKHN0cikge1xuICAgIHJldHVybiBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhcnJheSBvYiBvYmplY3QgdmFsdWVzIChPYmplY3QudmFsdWVzIGlzbid0IHN1cHBvcnRlZCBpbiBJRTExKVxuICAgKiBAcGFyYW0gb2JqXG4gICAqL1xuXG4gIHZhciBvYmplY3RWYWx1ZXMgPSBmdW5jdGlvbiBvYmplY3RWYWx1ZXMob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBvYmpba2V5XTtcbiAgICB9KTtcbiAgfTtcbiAgLyoqXG4gICAqIENvbnZlcnQgTm9kZUxpc3QgdG8gQXJyYXlcbiAgICogQHBhcmFtIG5vZGVMaXN0XG4gICAqL1xuXG4gIHZhciB0b0FycmF5ID0gZnVuY3Rpb24gdG9BcnJheShub2RlTGlzdCkge1xuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChub2RlTGlzdCk7XG4gIH07XG4gIC8qKlxuICAgKiBTdGFuZGFyZGlzZSBjb25zb2xlIHdhcm5pbmdzXG4gICAqIEBwYXJhbSBtZXNzYWdlXG4gICAqL1xuXG4gIHZhciB3YXJuID0gZnVuY3Rpb24gd2FybihtZXNzYWdlKSB7XG4gICAgY29uc29sZS53YXJuKFwiXCIuY29uY2F0KGNvbnNvbGVQcmVmaXgsIFwiIFwiKS5jb25jYXQobWVzc2FnZSkpO1xuICB9O1xuICAvKipcbiAgICogU3RhbmRhcmRpc2UgY29uc29sZSBlcnJvcnNcbiAgICogQHBhcmFtIG1lc3NhZ2VcbiAgICovXG5cbiAgdmFyIGVycm9yID0gZnVuY3Rpb24gZXJyb3IobWVzc2FnZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJcIi5jb25jYXQoY29uc29sZVByZWZpeCwgXCIgXCIpLmNvbmNhdChtZXNzYWdlKSk7XG4gIH07XG4gIC8qKlxuICAgKiBQcml2YXRlIGdsb2JhbCBzdGF0ZSBmb3IgYHdhcm5PbmNlYFxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuXG4gIHZhciBwcmV2aW91c1dhcm5PbmNlTWVzc2FnZXMgPSBbXTtcbiAgLyoqXG4gICAqIFNob3cgYSBjb25zb2xlIHdhcm5pbmcsIGJ1dCBvbmx5IGlmIGl0IGhhc24ndCBhbHJlYWR5IGJlZW4gc2hvd25cbiAgICogQHBhcmFtIG1lc3NhZ2VcbiAgICovXG5cbiAgdmFyIHdhcm5PbmNlID0gZnVuY3Rpb24gd2Fybk9uY2UobWVzc2FnZSkge1xuICAgIGlmICghKHByZXZpb3VzV2Fybk9uY2VNZXNzYWdlcy5pbmRleE9mKG1lc3NhZ2UpICE9PSAtMSkpIHtcbiAgICAgIHByZXZpb3VzV2Fybk9uY2VNZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgd2FybihtZXNzYWdlKTtcbiAgICB9XG4gIH07XG4gIC8qKlxuICAgKiBTaG93IGEgb25lLXRpbWUgY29uc29sZSB3YXJuaW5nIGFib3V0IGRlcHJlY2F0ZWQgcGFyYW1zL21ldGhvZHNcbiAgICovXG5cbiAgdmFyIHdhcm5BYm91dERlcHJlYXRpb24gPSBmdW5jdGlvbiB3YXJuQWJvdXREZXByZWF0aW9uKGRlcHJlY2F0ZWRQYXJhbSwgdXNlSW5zdGVhZCkge1xuICAgIHdhcm5PbmNlKFwiXFxcIlwiLmNvbmNhdChkZXByZWNhdGVkUGFyYW0sIFwiXFxcIiBpcyBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIG5leHQgbWFqb3IgcmVsZWFzZS4gUGxlYXNlIHVzZSBcXFwiXCIpLmNvbmNhdCh1c2VJbnN0ZWFkLCBcIlxcXCIgaW5zdGVhZC5cIikpO1xuICB9O1xuICAvKipcbiAgICogSWYgYGFyZ2AgaXMgYSBmdW5jdGlvbiwgY2FsbCBpdCAod2l0aCBubyBhcmd1bWVudHMgb3IgY29udGV4dCkgYW5kIHJldHVybiB0aGUgcmVzdWx0LlxuICAgKiBPdGhlcndpc2UsIGp1c3QgcGFzcyB0aGUgdmFsdWUgdGhyb3VnaFxuICAgKiBAcGFyYW0gYXJnXG4gICAqL1xuXG4gIHZhciBjYWxsSWZGdW5jdGlvbiA9IGZ1bmN0aW9uIGNhbGxJZkZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nID8gYXJnKCkgOiBhcmc7XG4gIH07XG4gIHZhciBpc1Byb21pc2UgPSBmdW5jdGlvbiBpc1Byb21pc2UoYXJnKSB7XG4gICAgcmV0dXJuIGFyZyAmJiBQcm9taXNlLnJlc29sdmUoYXJnKSA9PT0gYXJnO1xuICB9O1xuXG4gIHZhciBEaXNtaXNzUmVhc29uID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgY2FuY2VsOiAnY2FuY2VsJyxcbiAgICBiYWNrZHJvcDogJ2JhY2tkcm9wJyxcbiAgICBjbG9zZTogJ2Nsb3NlJyxcbiAgICBlc2M6ICdlc2MnLFxuICAgIHRpbWVyOiAndGltZXInXG4gIH0pO1xuXG4gIHZhciBpc0pxdWVyeUVsZW1lbnQgPSBmdW5jdGlvbiBpc0pxdWVyeUVsZW1lbnQoZWxlbSkge1xuICAgIHJldHVybiBfdHlwZW9mKGVsZW0pID09PSAnb2JqZWN0JyAmJiBlbGVtLmpxdWVyeTtcbiAgfTtcblxuICB2YXIgaXNFbGVtZW50ID0gZnVuY3Rpb24gaXNFbGVtZW50KGVsZW0pIHtcbiAgICByZXR1cm4gZWxlbSBpbnN0YW5jZW9mIEVsZW1lbnQgfHwgaXNKcXVlcnlFbGVtZW50KGVsZW0pO1xuICB9O1xuXG4gIHZhciBhcmdzVG9QYXJhbXMgPSBmdW5jdGlvbiBhcmdzVG9QYXJhbXMoYXJncykge1xuICAgIHZhciBwYXJhbXMgPSB7fTtcblxuICAgIGlmIChfdHlwZW9mKGFyZ3NbMF0pID09PSAnb2JqZWN0JyAmJiAhaXNFbGVtZW50KGFyZ3NbMF0pKSB7XG4gICAgICBfZXh0ZW5kcyhwYXJhbXMsIGFyZ3NbMF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBbJ3RpdGxlJywgJ2h0bWwnLCAnaWNvbiddLmZvckVhY2goZnVuY3Rpb24gKG5hbWUsIGluZGV4KSB7XG4gICAgICAgIHZhciBhcmcgPSBhcmdzW2luZGV4XTtcblxuICAgICAgICBpZiAodHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHwgaXNFbGVtZW50KGFyZykpIHtcbiAgICAgICAgICBwYXJhbXNbbmFtZV0gPSBhcmc7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJnICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBlcnJvcihcIlVuZXhwZWN0ZWQgdHlwZSBvZiBcIi5jb25jYXQobmFtZSwgXCIhIEV4cGVjdGVkIFxcXCJzdHJpbmdcXFwiIG9yIFxcXCJFbGVtZW50XFxcIiwgZ290IFwiKS5jb25jYXQoX3R5cGVvZihhcmcpKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJhbXM7XG4gIH07XG5cbiAgdmFyIHN3YWxQcmVmaXggPSAnc3dhbDItJztcbiAgdmFyIHByZWZpeCA9IGZ1bmN0aW9uIHByZWZpeChpdGVtcykge1xuICAgIHZhciByZXN1bHQgPSB7fTtcblxuICAgIGZvciAodmFyIGkgaW4gaXRlbXMpIHtcbiAgICAgIHJlc3VsdFtpdGVtc1tpXV0gPSBzd2FsUHJlZml4ICsgaXRlbXNbaV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgdmFyIHN3YWxDbGFzc2VzID0gcHJlZml4KFsnY29udGFpbmVyJywgJ3Nob3duJywgJ2hlaWdodC1hdXRvJywgJ2lvc2ZpeCcsICdwb3B1cCcsICdtb2RhbCcsICduby1iYWNrZHJvcCcsICduby10cmFuc2l0aW9uJywgJ3RvYXN0JywgJ3RvYXN0LXNob3duJywgJ3RvYXN0LWNvbHVtbicsICdzaG93JywgJ2hpZGUnLCAnY2xvc2UnLCAndGl0bGUnLCAnaGVhZGVyJywgJ2NvbnRlbnQnLCAnaHRtbC1jb250YWluZXInLCAnYWN0aW9ucycsICdjb25maXJtJywgJ2NhbmNlbCcsICdmb290ZXInLCAnaWNvbicsICdpY29uLWNvbnRlbnQnLCAnaW1hZ2UnLCAnaW5wdXQnLCAnZmlsZScsICdyYW5nZScsICdzZWxlY3QnLCAncmFkaW8nLCAnY2hlY2tib3gnLCAnbGFiZWwnLCAndGV4dGFyZWEnLCAnaW5wdXRlcnJvcicsICd2YWxpZGF0aW9uLW1lc3NhZ2UnLCAncHJvZ3Jlc3Mtc3RlcHMnLCAnYWN0aXZlLXByb2dyZXNzLXN0ZXAnLCAncHJvZ3Jlc3Mtc3RlcCcsICdwcm9ncmVzcy1zdGVwLWxpbmUnLCAnbG9hZGluZycsICdzdHlsZWQnLCAndG9wJywgJ3RvcC1zdGFydCcsICd0b3AtZW5kJywgJ3RvcC1sZWZ0JywgJ3RvcC1yaWdodCcsICdjZW50ZXInLCAnY2VudGVyLXN0YXJ0JywgJ2NlbnRlci1lbmQnLCAnY2VudGVyLWxlZnQnLCAnY2VudGVyLXJpZ2h0JywgJ2JvdHRvbScsICdib3R0b20tc3RhcnQnLCAnYm90dG9tLWVuZCcsICdib3R0b20tbGVmdCcsICdib3R0b20tcmlnaHQnLCAnZ3Jvdy1yb3cnLCAnZ3Jvdy1jb2x1bW4nLCAnZ3Jvdy1mdWxsc2NyZWVuJywgJ3J0bCcsICd0aW1lci1wcm9ncmVzcy1iYXInLCAnc2Nyb2xsYmFyLW1lYXN1cmUnLCAnaWNvbi1zdWNjZXNzJywgJ2ljb24td2FybmluZycsICdpY29uLWluZm8nLCAnaWNvbi1xdWVzdGlvbicsICdpY29uLWVycm9yJ10pO1xuICB2YXIgaWNvblR5cGVzID0gcHJlZml4KFsnc3VjY2VzcycsICd3YXJuaW5nJywgJ2luZm8nLCAncXVlc3Rpb24nLCAnZXJyb3InXSk7XG5cbiAgdmFyIGdldENvbnRhaW5lciA9IGZ1bmN0aW9uIGdldENvbnRhaW5lcigpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yKFwiLlwiLmNvbmNhdChzd2FsQ2xhc3Nlcy5jb250YWluZXIpKTtcbiAgfTtcbiAgdmFyIGVsZW1lbnRCeVNlbGVjdG9yID0gZnVuY3Rpb24gZWxlbWVudEJ5U2VsZWN0b3Ioc2VsZWN0b3JTdHJpbmcpIHtcbiAgICB2YXIgY29udGFpbmVyID0gZ2V0Q29udGFpbmVyKCk7XG4gICAgcmV0dXJuIGNvbnRhaW5lciA/IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yU3RyaW5nKSA6IG51bGw7XG4gIH07XG5cbiAgdmFyIGVsZW1lbnRCeUNsYXNzID0gZnVuY3Rpb24gZWxlbWVudEJ5Q2xhc3MoY2xhc3NOYW1lKSB7XG4gICAgcmV0dXJuIGVsZW1lbnRCeVNlbGVjdG9yKFwiLlwiLmNvbmNhdChjbGFzc05hbWUpKTtcbiAgfTtcblxuICB2YXIgZ2V0UG9wdXAgPSBmdW5jdGlvbiBnZXRQb3B1cCgpIHtcbiAgICByZXR1cm4gZWxlbWVudEJ5Q2xhc3Moc3dhbENsYXNzZXMucG9wdXApO1xuICB9O1xuICB2YXIgZ2V0SWNvbnMgPSBmdW5jdGlvbiBnZXRJY29ucygpIHtcbiAgICB2YXIgcG9wdXAgPSBnZXRQb3B1cCgpO1xuICAgIHJldHVybiB0b0FycmF5KHBvcHVwLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuXCIuY29uY2F0KHN3YWxDbGFzc2VzLmljb24pKSk7XG4gIH07XG4gIHZhciBnZXRJY29uID0gZnVuY3Rpb24gZ2V0SWNvbigpIHtcbiAgICB2YXIgdmlzaWJsZUljb24gPSBnZXRJY29ucygpLmZpbHRlcihmdW5jdGlvbiAoaWNvbikge1xuICAgICAgcmV0dXJuIGlzVmlzaWJsZShpY29uKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdmlzaWJsZUljb24ubGVuZ3RoID8gdmlzaWJsZUljb25bMF0gOiBudWxsO1xuICB9O1xuICB2YXIgZ2V0VGl0bGUgPSBmdW5jdGlvbiBnZXRUaXRsZSgpIHtcbiAgICByZXR1cm4gZWxlbWVudEJ5Q2xhc3Moc3dhbENsYXNzZXMudGl0bGUpO1xuICB9O1xuICB2YXIgZ2V0Q29udGVudCA9IGZ1bmN0aW9uIGdldENvbnRlbnQoKSB7XG4gICAgcmV0dXJuIGVsZW1lbnRCeUNsYXNzKHN3YWxDbGFzc2VzLmNvbnRlbnQpO1xuICB9O1xuICB2YXIgZ2V0SHRtbENvbnRhaW5lciA9IGZ1bmN0aW9uIGdldEh0bWxDb250YWluZXIoKSB7XG4gICAgcmV0dXJuIGVsZW1lbnRCeUNsYXNzKHN3YWxDbGFzc2VzWydodG1sLWNvbnRhaW5lciddKTtcbiAgfTtcbiAgdmFyIGdldEltYWdlID0gZnVuY3Rpb24gZ2V0SW1hZ2UoKSB7XG4gICAgcmV0dXJuIGVsZW1lbnRCeUNsYXNzKHN3YWxDbGFzc2VzLmltYWdlKTtcbiAgfTtcbiAgdmFyIGdldFByb2dyZXNzU3RlcHMgPSBmdW5jdGlvbiBnZXRQcm9ncmVzc1N0ZXBzKCkge1xuICAgIHJldHVybiBlbGVtZW50QnlDbGFzcyhzd2FsQ2xhc3Nlc1sncHJvZ3Jlc3Mtc3RlcHMnXSk7XG4gIH07XG4gIHZhciBnZXRWYWxpZGF0aW9uTWVzc2FnZSA9IGZ1bmN0aW9uIGdldFZhbGlkYXRpb25NZXNzYWdlKCkge1xuICAgIHJldHVybiBlbGVtZW50QnlDbGFzcyhzd2FsQ2xhc3Nlc1sndmFsaWRhdGlvbi1tZXNzYWdlJ10pO1xuICB9O1xuICB2YXIgZ2V0Q29uZmlybUJ1dHRvbiA9IGZ1bmN0aW9uIGdldENvbmZpcm1CdXR0b24oKSB7XG4gICAgcmV0dXJuIGVsZW1lbnRCeVNlbGVjdG9yKFwiLlwiLmNvbmNhdChzd2FsQ2xhc3Nlcy5hY3Rpb25zLCBcIiAuXCIpLmNvbmNhdChzd2FsQ2xhc3Nlcy5jb25maXJtKSk7XG4gIH07XG4gIHZhciBnZXRDYW5jZWxCdXR0b24gPSBmdW5jdGlvbiBnZXRDYW5jZWxCdXR0b24oKSB7XG4gICAgcmV0dXJuIGVsZW1lbnRCeVNlbGVjdG9yKFwiLlwiLmNvbmNhdChzd2FsQ2xhc3Nlcy5hY3Rpb25zLCBcIiAuXCIpLmNvbmNhdChzd2FsQ2xhc3Nlcy5jYW5jZWwpKTtcbiAgfTtcbiAgdmFyIGdldEFjdGlvbnMgPSBmdW5jdGlvbiBnZXRBY3Rpb25zKCkge1xuICAgIHJldHVybiBlbGVtZW50QnlDbGFzcyhzd2FsQ2xhc3Nlcy5hY3Rpb25zKTtcbiAgfTtcbiAgdmFyIGdldEhlYWRlciA9IGZ1bmN0aW9uIGdldEhlYWRlcigpIHtcbiAgICByZXR1cm4gZWxlbWVudEJ5Q2xhc3Moc3dhbENsYXNzZXMuaGVhZGVyKTtcbiAgfTtcbiAgdmFyIGdldEZvb3RlciA9IGZ1bmN0aW9uIGdldEZvb3RlcigpIHtcbiAgICByZXR1cm4gZWxlbWVudEJ5Q2xhc3Moc3dhbENsYXNzZXMuZm9vdGVyKTtcbiAgfTtcbiAgdmFyIGdldFRpbWVyUHJvZ3Jlc3NCYXIgPSBmdW5jdGlvbiBnZXRUaW1lclByb2dyZXNzQmFyKCkge1xuICAgIHJldHVybiBlbGVtZW50QnlDbGFzcyhzd2FsQ2xhc3Nlc1sndGltZXItcHJvZ3Jlc3MtYmFyJ10pO1xuICB9O1xuICB2YXIgZ2V0Q2xvc2VCdXR0b24gPSBmdW5jdGlvbiBnZXRDbG9zZUJ1dHRvbigpIHtcbiAgICByZXR1cm4gZWxlbWVudEJ5Q2xhc3Moc3dhbENsYXNzZXMuY2xvc2UpO1xuICB9OyAvLyBodHRwczovL2dpdGh1Yi5jb20vamt1cC9mb2N1c2FibGUvYmxvYi9tYXN0ZXIvaW5kZXguanNcblxuICB2YXIgZm9jdXNhYmxlID0gXCJcXG4gIGFbaHJlZl0sXFxuICBhcmVhW2hyZWZdLFxcbiAgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLFxcbiAgc2VsZWN0Om5vdChbZGlzYWJsZWRdKSxcXG4gIHRleHRhcmVhOm5vdChbZGlzYWJsZWRdKSxcXG4gIGJ1dHRvbjpub3QoW2Rpc2FibGVkXSksXFxuICBpZnJhbWUsXFxuICBvYmplY3QsXFxuICBlbWJlZCxcXG4gIFt0YWJpbmRleD1cXFwiMFxcXCJdLFxcbiAgW2NvbnRlbnRlZGl0YWJsZV0sXFxuICBhdWRpb1tjb250cm9sc10sXFxuICB2aWRlb1tjb250cm9sc10sXFxuICBzdW1tYXJ5XFxuXCI7XG4gIHZhciBnZXRGb2N1c2FibGVFbGVtZW50cyA9IGZ1bmN0aW9uIGdldEZvY3VzYWJsZUVsZW1lbnRzKCkge1xuICAgIHZhciBmb2N1c2FibGVFbGVtZW50c1dpdGhUYWJpbmRleCA9IHRvQXJyYXkoZ2V0UG9wdXAoKS5xdWVyeVNlbGVjdG9yQWxsKCdbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXg9XCItMVwiXSk6bm90KFt0YWJpbmRleD1cIjBcIl0pJykpIC8vIHNvcnQgYWNjb3JkaW5nIHRvIHRhYmluZGV4XG4gICAgLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIGEgPSBwYXJzZUludChhLmdldEF0dHJpYnV0ZSgndGFiaW5kZXgnKSk7XG4gICAgICBiID0gcGFyc2VJbnQoYi5nZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JykpO1xuXG4gICAgICBpZiAoYSA+IGIpIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9IGVsc2UgaWYgKGEgPCBiKSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIDA7XG4gICAgfSk7XG4gICAgdmFyIG90aGVyRm9jdXNhYmxlRWxlbWVudHMgPSB0b0FycmF5KGdldFBvcHVwKCkucXVlcnlTZWxlY3RvckFsbChmb2N1c2FibGUpKS5maWx0ZXIoZnVuY3Rpb24gKGVsKSB7XG4gICAgICByZXR1cm4gZWwuZ2V0QXR0cmlidXRlKCd0YWJpbmRleCcpICE9PSAnLTEnO1xuICAgIH0pO1xuICAgIHJldHVybiB1bmlxdWVBcnJheShmb2N1c2FibGVFbGVtZW50c1dpdGhUYWJpbmRleC5jb25jYXQob3RoZXJGb2N1c2FibGVFbGVtZW50cykpLmZpbHRlcihmdW5jdGlvbiAoZWwpIHtcbiAgICAgIHJldHVybiBpc1Zpc2libGUoZWwpO1xuICAgIH0pO1xuICB9O1xuICB2YXIgaXNNb2RhbCA9IGZ1bmN0aW9uIGlzTW9kYWwoKSB7XG4gICAgcmV0dXJuICFpc1RvYXN0KCkgJiYgIWRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKHN3YWxDbGFzc2VzWyduby1iYWNrZHJvcCddKTtcbiAgfTtcbiAgdmFyIGlzVG9hc3QgPSBmdW5jdGlvbiBpc1RvYXN0KCkge1xuICAgIHJldHVybiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucyhzd2FsQ2xhc3Nlc1sndG9hc3Qtc2hvd24nXSk7XG4gIH07XG4gIHZhciBpc0xvYWRpbmcgPSBmdW5jdGlvbiBpc0xvYWRpbmcoKSB7XG4gICAgcmV0dXJuIGdldFBvcHVwKCkuaGFzQXR0cmlidXRlKCdkYXRhLWxvYWRpbmcnKTtcbiAgfTtcblxuICB2YXIgc3RhdGVzID0ge1xuICAgIHByZXZpb3VzQm9keVBhZGRpbmc6IG51bGxcbiAgfTtcbiAgdmFyIGhhc0NsYXNzID0gZnVuY3Rpb24gaGFzQ2xhc3MoZWxlbSwgY2xhc3NOYW1lKSB7XG4gICAgaWYgKCFjbGFzc05hbWUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgY2xhc3NMaXN0ID0gY2xhc3NOYW1lLnNwbGl0KC9cXHMrLyk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNsYXNzTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCFlbGVtLmNsYXNzTGlzdC5jb250YWlucyhjbGFzc0xpc3RbaV0pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICB2YXIgcmVtb3ZlQ3VzdG9tQ2xhc3NlcyA9IGZ1bmN0aW9uIHJlbW92ZUN1c3RvbUNsYXNzZXMoZWxlbSwgcGFyYW1zKSB7XG4gICAgdG9BcnJheShlbGVtLmNsYXNzTGlzdCkuZm9yRWFjaChmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG4gICAgICBpZiAoIShvYmplY3RWYWx1ZXMoc3dhbENsYXNzZXMpLmluZGV4T2YoY2xhc3NOYW1lKSAhPT0gLTEpICYmICEob2JqZWN0VmFsdWVzKGljb25UeXBlcykuaW5kZXhPZihjbGFzc05hbWUpICE9PSAtMSkgJiYgIShvYmplY3RWYWx1ZXMocGFyYW1zLnNob3dDbGFzcykuaW5kZXhPZihjbGFzc05hbWUpICE9PSAtMSkpIHtcbiAgICAgICAgZWxlbS5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIGFwcGx5Q3VzdG9tQ2xhc3MgPSBmdW5jdGlvbiBhcHBseUN1c3RvbUNsYXNzKGVsZW0sIHBhcmFtcywgY2xhc3NOYW1lKSB7XG4gICAgcmVtb3ZlQ3VzdG9tQ2xhc3NlcyhlbGVtLCBwYXJhbXMpO1xuXG4gICAgaWYgKHBhcmFtcy5jdXN0b21DbGFzcyAmJiBwYXJhbXMuY3VzdG9tQ2xhc3NbY2xhc3NOYW1lXSkge1xuICAgICAgaWYgKHR5cGVvZiBwYXJhbXMuY3VzdG9tQ2xhc3NbY2xhc3NOYW1lXSAhPT0gJ3N0cmluZycgJiYgIXBhcmFtcy5jdXN0b21DbGFzc1tjbGFzc05hbWVdLmZvckVhY2gpIHtcbiAgICAgICAgcmV0dXJuIHdhcm4oXCJJbnZhbGlkIHR5cGUgb2YgY3VzdG9tQ2xhc3MuXCIuY29uY2F0KGNsYXNzTmFtZSwgXCIhIEV4cGVjdGVkIHN0cmluZyBvciBpdGVyYWJsZSBvYmplY3QsIGdvdCBcXFwiXCIpLmNvbmNhdChfdHlwZW9mKHBhcmFtcy5jdXN0b21DbGFzc1tjbGFzc05hbWVdKSwgXCJcXFwiXCIpKTtcbiAgICAgIH1cblxuICAgICAgYWRkQ2xhc3MoZWxlbSwgcGFyYW1zLmN1c3RvbUNsYXNzW2NsYXNzTmFtZV0pO1xuICAgIH1cbiAgfTtcbiAgZnVuY3Rpb24gZ2V0SW5wdXQoY29udGVudCwgaW5wdXRUeXBlKSB7XG4gICAgaWYgKCFpbnB1dFR5cGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHN3aXRjaCAoaW5wdXRUeXBlKSB7XG4gICAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgY2FzZSAndGV4dGFyZWEnOlxuICAgICAgY2FzZSAnZmlsZSc6XG4gICAgICAgIHJldHVybiBnZXRDaGlsZEJ5Q2xhc3MoY29udGVudCwgc3dhbENsYXNzZXNbaW5wdXRUeXBlXSk7XG5cbiAgICAgIGNhc2UgJ2NoZWNrYm94JzpcbiAgICAgICAgcmV0dXJuIGNvbnRlbnQucXVlcnlTZWxlY3RvcihcIi5cIi5jb25jYXQoc3dhbENsYXNzZXMuY2hlY2tib3gsIFwiIGlucHV0XCIpKTtcblxuICAgICAgY2FzZSAncmFkaW8nOlxuICAgICAgICByZXR1cm4gY29udGVudC5xdWVyeVNlbGVjdG9yKFwiLlwiLmNvbmNhdChzd2FsQ2xhc3Nlcy5yYWRpbywgXCIgaW5wdXQ6Y2hlY2tlZFwiKSkgfHwgY29udGVudC5xdWVyeVNlbGVjdG9yKFwiLlwiLmNvbmNhdChzd2FsQ2xhc3Nlcy5yYWRpbywgXCIgaW5wdXQ6Zmlyc3QtY2hpbGRcIikpO1xuXG4gICAgICBjYXNlICdyYW5nZSc6XG4gICAgICAgIHJldHVybiBjb250ZW50LnF1ZXJ5U2VsZWN0b3IoXCIuXCIuY29uY2F0KHN3YWxDbGFzc2VzLnJhbmdlLCBcIiBpbnB1dFwiKSk7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBnZXRDaGlsZEJ5Q2xhc3MoY29udGVudCwgc3dhbENsYXNzZXMuaW5wdXQpO1xuICAgIH1cbiAgfVxuICB2YXIgZm9jdXNJbnB1dCA9IGZ1bmN0aW9uIGZvY3VzSW5wdXQoaW5wdXQpIHtcbiAgICBpbnB1dC5mb2N1cygpOyAvLyBwbGFjZSBjdXJzb3IgYXQgZW5kIG9mIHRleHQgaW4gdGV4dCBpbnB1dFxuXG4gICAgaWYgKGlucHV0LnR5cGUgIT09ICdmaWxlJykge1xuICAgICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjM0NTkxNVxuICAgICAgdmFyIHZhbCA9IGlucHV0LnZhbHVlO1xuICAgICAgaW5wdXQudmFsdWUgPSAnJztcbiAgICAgIGlucHV0LnZhbHVlID0gdmFsO1xuICAgIH1cbiAgfTtcbiAgdmFyIHRvZ2dsZUNsYXNzID0gZnVuY3Rpb24gdG9nZ2xlQ2xhc3ModGFyZ2V0LCBjbGFzc0xpc3QsIGNvbmRpdGlvbikge1xuICAgIGlmICghdGFyZ2V0IHx8ICFjbGFzc0xpc3QpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGNsYXNzTGlzdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNsYXNzTGlzdCA9IGNsYXNzTGlzdC5zcGxpdCgvXFxzKy8pLmZpbHRlcihCb29sZWFuKTtcbiAgICB9XG5cbiAgICBjbGFzc0xpc3QuZm9yRWFjaChmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG4gICAgICBpZiAodGFyZ2V0LmZvckVhY2gpIHtcbiAgICAgICAgdGFyZ2V0LmZvckVhY2goZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgICAgICBjb25kaXRpb24gPyBlbGVtLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKSA6IGVsZW0uY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbmRpdGlvbiA/IHRhcmdldC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSkgOiB0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICB2YXIgYWRkQ2xhc3MgPSBmdW5jdGlvbiBhZGRDbGFzcyh0YXJnZXQsIGNsYXNzTGlzdCkge1xuICAgIHRvZ2dsZUNsYXNzKHRhcmdldCwgY2xhc3NMaXN0LCB0cnVlKTtcbiAgfTtcbiAgdmFyIHJlbW92ZUNsYXNzID0gZnVuY3Rpb24gcmVtb3ZlQ2xhc3ModGFyZ2V0LCBjbGFzc0xpc3QpIHtcbiAgICB0b2dnbGVDbGFzcyh0YXJnZXQsIGNsYXNzTGlzdCwgZmFsc2UpO1xuICB9O1xuICB2YXIgZ2V0Q2hpbGRCeUNsYXNzID0gZnVuY3Rpb24gZ2V0Q2hpbGRCeUNsYXNzKGVsZW0sIGNsYXNzTmFtZSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbS5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoaGFzQ2xhc3MoZWxlbS5jaGlsZE5vZGVzW2ldLCBjbGFzc05hbWUpKSB7XG4gICAgICAgIHJldHVybiBlbGVtLmNoaWxkTm9kZXNbaV07XG4gICAgICB9XG4gICAgfVxuICB9O1xuICB2YXIgYXBwbHlOdW1lcmljYWxTdHlsZSA9IGZ1bmN0aW9uIGFwcGx5TnVtZXJpY2FsU3R5bGUoZWxlbSwgcHJvcGVydHksIHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlIHx8IHBhcnNlSW50KHZhbHVlKSA9PT0gMCkge1xuICAgICAgZWxlbS5zdHlsZVtwcm9wZXJ0eV0gPSB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInID8gXCJcIi5jb25jYXQodmFsdWUsIFwicHhcIikgOiB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbS5zdHlsZS5yZW1vdmVQcm9wZXJ0eShwcm9wZXJ0eSk7XG4gICAgfVxuICB9O1xuICB2YXIgc2hvdyA9IGZ1bmN0aW9uIHNob3coZWxlbSkge1xuICAgIHZhciBkaXNwbGF5ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnZmxleCc7XG4gICAgZWxlbS5zdHlsZS5vcGFjaXR5ID0gJyc7XG4gICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gZGlzcGxheTtcbiAgfTtcbiAgdmFyIGhpZGUgPSBmdW5jdGlvbiBoaWRlKGVsZW0pIHtcbiAgICBlbGVtLnN0eWxlLm9wYWNpdHkgPSAnJztcbiAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIH07XG4gIHZhciB0b2dnbGUgPSBmdW5jdGlvbiB0b2dnbGUoZWxlbSwgY29uZGl0aW9uLCBkaXNwbGF5KSB7XG4gICAgY29uZGl0aW9uID8gc2hvdyhlbGVtLCBkaXNwbGF5KSA6IGhpZGUoZWxlbSk7XG4gIH07IC8vIGJvcnJvd2VkIGZyb20ganF1ZXJ5ICQoZWxlbSkuaXMoJzp2aXNpYmxlJykgaW1wbGVtZW50YXRpb25cblxuICB2YXIgaXNWaXNpYmxlID0gZnVuY3Rpb24gaXNWaXNpYmxlKGVsZW0pIHtcbiAgICByZXR1cm4gISEoZWxlbSAmJiAoZWxlbS5vZmZzZXRXaWR0aCB8fCBlbGVtLm9mZnNldEhlaWdodCB8fCBlbGVtLmdldENsaWVudFJlY3RzKCkubGVuZ3RoKSk7XG4gIH07XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cbiAgdmFyIGlzU2Nyb2xsYWJsZSA9IGZ1bmN0aW9uIGlzU2Nyb2xsYWJsZShlbGVtKSB7XG4gICAgcmV0dXJuICEhKGVsZW0uc2Nyb2xsSGVpZ2h0ID4gZWxlbS5jbGllbnRIZWlnaHQpO1xuICB9OyAvLyBib3Jyb3dlZCBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS80NjM1MjExOVxuXG4gIHZhciBoYXNDc3NBbmltYXRpb24gPSBmdW5jdGlvbiBoYXNDc3NBbmltYXRpb24oZWxlbSkge1xuICAgIHZhciBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW0pO1xuICAgIHZhciBhbmltRHVyYXRpb24gPSBwYXJzZUZsb2F0KHN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ2FuaW1hdGlvbi1kdXJhdGlvbicpIHx8ICcwJyk7XG4gICAgdmFyIHRyYW5zRHVyYXRpb24gPSBwYXJzZUZsb2F0KHN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3RyYW5zaXRpb24tZHVyYXRpb24nKSB8fCAnMCcpO1xuICAgIHJldHVybiBhbmltRHVyYXRpb24gPiAwIHx8IHRyYW5zRHVyYXRpb24gPiAwO1xuICB9O1xuICB2YXIgY29udGFpbnMgPSBmdW5jdGlvbiBjb250YWlucyhoYXlzdGFjaywgbmVlZGxlKSB7XG4gICAgaWYgKHR5cGVvZiBoYXlzdGFjay5jb250YWlucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGhheXN0YWNrLmNvbnRhaW5zKG5lZWRsZSk7XG4gICAgfVxuICB9O1xuICB2YXIgYW5pbWF0ZVRpbWVyUHJvZ3Jlc3NCYXIgPSBmdW5jdGlvbiBhbmltYXRlVGltZXJQcm9ncmVzc0Jhcih0aW1lcikge1xuICAgIHZhciByZXNldCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG4gICAgdmFyIHRpbWVyUHJvZ3Jlc3NCYXIgPSBnZXRUaW1lclByb2dyZXNzQmFyKCk7XG5cbiAgICBpZiAoaXNWaXNpYmxlKHRpbWVyUHJvZ3Jlc3NCYXIpKSB7XG4gICAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgdGltZXJQcm9ncmVzc0Jhci5zdHlsZS50cmFuc2l0aW9uID0gJ25vbmUnO1xuICAgICAgICB0aW1lclByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgICAgfVxuXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGltZXJQcm9ncmVzc0Jhci5zdHlsZS50cmFuc2l0aW9uID0gXCJ3aWR0aCBcIi5jb25jYXQodGltZXIgLyAxMDAwLCBcInMgbGluZWFyXCIpO1xuICAgICAgICB0aW1lclByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gJzAlJztcbiAgICAgIH0sIDEwKTtcbiAgICB9XG4gIH07XG4gIHZhciBzdG9wVGltZXJQcm9ncmVzc0JhciA9IGZ1bmN0aW9uIHN0b3BUaW1lclByb2dyZXNzQmFyKCkge1xuICAgIHZhciB0aW1lclByb2dyZXNzQmFyID0gZ2V0VGltZXJQcm9ncmVzc0JhcigpO1xuICAgIHZhciB0aW1lclByb2dyZXNzQmFyV2lkdGggPSBwYXJzZUludCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aW1lclByb2dyZXNzQmFyKS53aWR0aCk7XG4gICAgdGltZXJQcm9ncmVzc0Jhci5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgndHJhbnNpdGlvbicpO1xuICAgIHRpbWVyUHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgdmFyIHRpbWVyUHJvZ3Jlc3NCYXJGdWxsV2lkdGggPSBwYXJzZUludCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aW1lclByb2dyZXNzQmFyKS53aWR0aCk7XG4gICAgdmFyIHRpbWVyUHJvZ3Jlc3NCYXJQZXJjZW50ID0gcGFyc2VJbnQodGltZXJQcm9ncmVzc0JhcldpZHRoIC8gdGltZXJQcm9ncmVzc0JhckZ1bGxXaWR0aCAqIDEwMCk7XG4gICAgdGltZXJQcm9ncmVzc0Jhci5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgndHJhbnNpdGlvbicpO1xuICAgIHRpbWVyUHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBcIlwiLmNvbmNhdCh0aW1lclByb2dyZXNzQmFyUGVyY2VudCwgXCIlXCIpO1xuICB9O1xuXG4gIC8vIERldGVjdCBOb2RlIGVudlxuICB2YXIgaXNOb2RlRW52ID0gZnVuY3Rpb24gaXNOb2RlRW52KCkge1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnO1xuICB9O1xuXG4gIHZhciBzd2VldEhUTUwgPSBcIlxcbiA8ZGl2IGFyaWEtbGFiZWxsZWRieT1cXFwiXCIuY29uY2F0KHN3YWxDbGFzc2VzLnRpdGxlLCBcIlxcXCIgYXJpYS1kZXNjcmliZWRieT1cXFwiXCIpLmNvbmNhdChzd2FsQ2xhc3Nlcy5jb250ZW50LCBcIlxcXCIgY2xhc3M9XFxcIlwiKS5jb25jYXQoc3dhbENsYXNzZXMucG9wdXAsIFwiXFxcIiB0YWJpbmRleD1cXFwiLTFcXFwiPlxcbiAgIDxkaXYgY2xhc3M9XFxcIlwiKS5jb25jYXQoc3dhbENsYXNzZXMuaGVhZGVyLCBcIlxcXCI+XFxuICAgICA8dWwgY2xhc3M9XFxcIlwiKS5jb25jYXQoc3dhbENsYXNzZXNbJ3Byb2dyZXNzLXN0ZXBzJ10sIFwiXFxcIj48L3VsPlxcbiAgICAgPGRpdiBjbGFzcz1cXFwiXCIpLmNvbmNhdChzd2FsQ2xhc3Nlcy5pY29uLCBcIiBcIikuY29uY2F0KGljb25UeXBlcy5lcnJvciwgXCJcXFwiPjwvZGl2PlxcbiAgICAgPGRpdiBjbGFzcz1cXFwiXCIpLmNvbmNhdChzd2FsQ2xhc3Nlcy5pY29uLCBcIiBcIikuY29uY2F0KGljb25UeXBlcy5xdWVzdGlvbiwgXCJcXFwiPjwvZGl2PlxcbiAgICAgPGRpdiBjbGFzcz1cXFwiXCIpLmNvbmNhdChzd2FsQ2xhc3Nlcy5pY29uLCBcIiBcIikuY29uY2F0KGljb25UeXBlcy53YXJuaW5nLCBcIlxcXCI+PC9kaXY+XFxuICAgICA8ZGl2IGNsYXNzPVxcXCJcIikuY29uY2F0KHN3YWxDbGFzc2VzLmljb24sIFwiIFwiKS5jb25jYXQoaWNvblR5cGVzLmluZm8sIFwiXFxcIj48L2Rpdj5cXG4gICAgIDxkaXYgY2xhc3M9XFxcIlwiKS5jb25jYXQoc3dhbENsYXNzZXMuaWNvbiwgXCIgXCIpLmNvbmNhdChpY29uVHlwZXMuc3VjY2VzcywgXCJcXFwiPjwvZGl2PlxcbiAgICAgPGltZyBjbGFzcz1cXFwiXCIpLmNvbmNhdChzd2FsQ2xhc3Nlcy5pbWFnZSwgXCJcXFwiIC8+XFxuICAgICA8aDIgY2xhc3M9XFxcIlwiKS5jb25jYXQoc3dhbENsYXNzZXMudGl0bGUsIFwiXFxcIiBpZD1cXFwiXCIpLmNvbmNhdChzd2FsQ2xhc3Nlcy50aXRsZSwgXCJcXFwiPjwvaDI+XFxuICAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcIlwiKS5jb25jYXQoc3dhbENsYXNzZXMuY2xvc2UsIFwiXFxcIj48L2J1dHRvbj5cXG4gICA8L2Rpdj5cXG4gICA8ZGl2IGNsYXNzPVxcXCJcIikuY29uY2F0KHN3YWxDbGFzc2VzLmNvbnRlbnQsIFwiXFxcIj5cXG4gICAgIDxkaXYgaWQ9XFxcIlwiKS5jb25jYXQoc3dhbENsYXNzZXMuY29udGVudCwgXCJcXFwiIGNsYXNzPVxcXCJcIikuY29uY2F0KHN3YWxDbGFzc2VzWydodG1sLWNvbnRhaW5lciddLCBcIlxcXCI+PC9kaXY+XFxuICAgICA8aW5wdXQgY2xhc3M9XFxcIlwiKS5jb25jYXQoc3dhbENsYXNzZXMuaW5wdXQsIFwiXFxcIiAvPlxcbiAgICAgPGlucHV0IHR5cGU9XFxcImZpbGVcXFwiIGNsYXNzPVxcXCJcIikuY29uY2F0KHN3YWxDbGFzc2VzLmZpbGUsIFwiXFxcIiAvPlxcbiAgICAgPGRpdiBjbGFzcz1cXFwiXCIpLmNvbmNhdChzd2FsQ2xhc3Nlcy5yYW5nZSwgXCJcXFwiPlxcbiAgICAgICA8aW5wdXQgdHlwZT1cXFwicmFuZ2VcXFwiIC8+XFxuICAgICAgIDxvdXRwdXQ+PC9vdXRwdXQ+XFxuICAgICA8L2Rpdj5cXG4gICAgIDxzZWxlY3QgY2xhc3M9XFxcIlwiKS5jb25jYXQoc3dhbENsYXNzZXMuc2VsZWN0LCBcIlxcXCI+PC9zZWxlY3Q+XFxuICAgICA8ZGl2IGNsYXNzPVxcXCJcIikuY29uY2F0KHN3YWxDbGFzc2VzLnJhZGlvLCBcIlxcXCI+PC9kaXY+XFxuICAgICA8bGFiZWwgZm9yPVxcXCJcIikuY29uY2F0KHN3YWxDbGFzc2VzLmNoZWNrYm94LCBcIlxcXCIgY2xhc3M9XFxcIlwiKS5jb25jYXQoc3dhbENsYXNzZXMuY2hlY2tib3gsIFwiXFxcIj5cXG4gICAgICAgPGlucHV0IHR5cGU9XFxcImNoZWNrYm94XFxcIiAvPlxcbiAgICAgICA8c3BhbiBjbGFzcz1cXFwiXCIpLmNvbmNhdChzd2FsQ2xhc3Nlcy5sYWJlbCwgXCJcXFwiPjwvc3Bhbj5cXG4gICAgIDwvbGFiZWw+XFxuICAgICA8dGV4dGFyZWEgY2xhc3M9XFxcIlwiKS5jb25jYXQoc3dhbENsYXNzZXMudGV4dGFyZWEsIFwiXFxcIj48L3RleHRhcmVhPlxcbiAgICAgPGRpdiBjbGFzcz1cXFwiXCIpLmNvbmNhdChzd2FsQ2xhc3Nlc1sndmFsaWRhdGlvbi1tZXNzYWdlJ10sIFwiXFxcIiBpZD1cXFwiXCIpLmNvbmNhdChzd2FsQ2xhc3Nlc1sndmFsaWRhdGlvbi1tZXNzYWdlJ10sIFwiXFxcIj48L2Rpdj5cXG4gICA8L2Rpdj5cXG4gICA8ZGl2IGNsYXNzPVxcXCJcIikuY29uY2F0KHN3YWxDbGFzc2VzLmFjdGlvbnMsIFwiXFxcIj5cXG4gICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiXCIpLmNvbmNhdChzd2FsQ2xhc3Nlcy5jb25maXJtLCBcIlxcXCI+T0s8L2J1dHRvbj5cXG4gICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiXCIpLmNvbmNhdChzd2FsQ2xhc3Nlcy5jYW5jZWwsIFwiXFxcIj5DYW5jZWw8L2J1dHRvbj5cXG4gICA8L2Rpdj5cXG4gICA8ZGl2IGNsYXNzPVxcXCJcIikuY29uY2F0KHN3YWxDbGFzc2VzLmZvb3RlciwgXCJcXFwiPjwvZGl2PlxcbiAgIDxkaXYgY2xhc3M9XFxcIlwiKS5jb25jYXQoc3dhbENsYXNzZXNbJ3RpbWVyLXByb2dyZXNzLWJhciddLCBcIlxcXCI+PC9kaXY+XFxuIDwvZGl2PlxcblwiKS5yZXBsYWNlKC8oXnxcXG4pXFxzKi9nLCAnJyk7XG5cbiAgdmFyIHJlc2V0T2xkQ29udGFpbmVyID0gZnVuY3Rpb24gcmVzZXRPbGRDb250YWluZXIoKSB7XG4gICAgdmFyIG9sZENvbnRhaW5lciA9IGdldENvbnRhaW5lcigpO1xuXG4gICAgaWYgKCFvbGRDb250YWluZXIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBvbGRDb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChvbGRDb250YWluZXIpO1xuICAgIHJlbW92ZUNsYXNzKFtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIGRvY3VtZW50LmJvZHldLCBbc3dhbENsYXNzZXNbJ25vLWJhY2tkcm9wJ10sIHN3YWxDbGFzc2VzWyd0b2FzdC1zaG93biddLCBzd2FsQ2xhc3Nlc1snaGFzLWNvbHVtbiddXSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgdmFyIG9sZElucHV0VmFsOyAvLyBJRTExIHdvcmthcm91bmQsIHNlZSAjMTEwOSBmb3IgZGV0YWlsc1xuXG4gIHZhciByZXNldFZhbGlkYXRpb25NZXNzYWdlID0gZnVuY3Rpb24gcmVzZXRWYWxpZGF0aW9uTWVzc2FnZShlKSB7XG4gICAgaWYgKFN3YWwuaXNWaXNpYmxlKCkgJiYgb2xkSW5wdXRWYWwgIT09IGUudGFyZ2V0LnZhbHVlKSB7XG4gICAgICBTd2FsLnJlc2V0VmFsaWRhdGlvbk1lc3NhZ2UoKTtcbiAgICB9XG5cbiAgICBvbGRJbnB1dFZhbCA9IGUudGFyZ2V0LnZhbHVlO1xuICB9O1xuXG4gIHZhciBhZGRJbnB1dENoYW5nZUxpc3RlbmVycyA9IGZ1bmN0aW9uIGFkZElucHV0Q2hhbmdlTGlzdGVuZXJzKCkge1xuICAgIHZhciBjb250ZW50ID0gZ2V0Q29udGVudCgpO1xuICAgIHZhciBpbnB1dCA9IGdldENoaWxkQnlDbGFzcyhjb250ZW50LCBzd2FsQ2xhc3Nlcy5pbnB1dCk7XG4gICAgdmFyIGZpbGUgPSBnZXRDaGlsZEJ5Q2xhc3MoY29udGVudCwgc3dhbENsYXNzZXMuZmlsZSk7XG4gICAgdmFyIHJhbmdlID0gY29udGVudC5xdWVyeVNlbGVjdG9yKFwiLlwiLmNvbmNhdChzd2FsQ2xhc3Nlcy5yYW5nZSwgXCIgaW5wdXRcIikpO1xuICAgIHZhciByYW5nZU91dHB1dCA9IGNvbnRlbnQucXVlcnlTZWxlY3RvcihcIi5cIi5jb25jYXQoc3dhbENsYXNzZXMucmFuZ2UsIFwiIG91dHB1dFwiKSk7XG4gICAgdmFyIHNlbGVjdCA9IGdldENoaWxkQnlDbGFzcyhjb250ZW50LCBzd2FsQ2xhc3Nlcy5zZWxlY3QpO1xuICAgIHZhciBjaGVja2JveCA9IGNvbnRlbnQucXVlcnlTZWxlY3RvcihcIi5cIi5jb25jYXQoc3dhbENsYXNzZXMuY2hlY2tib3gsIFwiIGlucHV0XCIpKTtcbiAgICB2YXIgdGV4dGFyZWEgPSBnZXRDaGlsZEJ5Q2xhc3MoY29udGVudCwgc3dhbENsYXNzZXMudGV4dGFyZWEpO1xuICAgIGlucHV0Lm9uaW5wdXQgPSByZXNldFZhbGlkYXRpb25NZXNzYWdlO1xuICAgIGZpbGUub25jaGFuZ2UgPSByZXNldFZhbGlkYXRpb25NZXNzYWdlO1xuICAgIHNlbGVjdC5vbmNoYW5nZSA9IHJlc2V0VmFsaWRhdGlvbk1lc3NhZ2U7XG4gICAgY2hlY2tib3gub25jaGFuZ2UgPSByZXNldFZhbGlkYXRpb25NZXNzYWdlO1xuICAgIHRleHRhcmVhLm9uaW5wdXQgPSByZXNldFZhbGlkYXRpb25NZXNzYWdlO1xuXG4gICAgcmFuZ2Uub25pbnB1dCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICByZXNldFZhbGlkYXRpb25NZXNzYWdlKGUpO1xuICAgICAgcmFuZ2VPdXRwdXQudmFsdWUgPSByYW5nZS52YWx1ZTtcbiAgICB9O1xuXG4gICAgcmFuZ2Uub25jaGFuZ2UgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgcmVzZXRWYWxpZGF0aW9uTWVzc2FnZShlKTtcbiAgICAgIHJhbmdlLm5leHRTaWJsaW5nLnZhbHVlID0gcmFuZ2UudmFsdWU7XG4gICAgfTtcbiAgfTtcblxuICB2YXIgZ2V0VGFyZ2V0ID0gZnVuY3Rpb24gZ2V0VGFyZ2V0KHRhcmdldCkge1xuICAgIHJldHVybiB0eXBlb2YgdGFyZ2V0ID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KSA6IHRhcmdldDtcbiAgfTtcblxuICB2YXIgc2V0dXBBY2Nlc3NpYmlsaXR5ID0gZnVuY3Rpb24gc2V0dXBBY2Nlc3NpYmlsaXR5KHBhcmFtcykge1xuICAgIHZhciBwb3B1cCA9IGdldFBvcHVwKCk7XG4gICAgcG9wdXAuc2V0QXR0cmlidXRlKCdyb2xlJywgcGFyYW1zLnRvYXN0ID8gJ2FsZXJ0JyA6ICdkaWFsb2cnKTtcbiAgICBwb3B1cC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScsIHBhcmFtcy50b2FzdCA/ICdwb2xpdGUnIDogJ2Fzc2VydGl2ZScpO1xuXG4gICAgaWYgKCFwYXJhbXMudG9hc3QpIHtcbiAgICAgIHBvcHVwLnNldEF0dHJpYnV0ZSgnYXJpYS1tb2RhbCcsICd0cnVlJyk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBzZXR1cFJUTCA9IGZ1bmN0aW9uIHNldHVwUlRMKHRhcmdldEVsZW1lbnQpIHtcbiAgICBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUodGFyZ2V0RWxlbWVudCkuZGlyZWN0aW9uID09PSAncnRsJykge1xuICAgICAgYWRkQ2xhc3MoZ2V0Q29udGFpbmVyKCksIHN3YWxDbGFzc2VzLnJ0bCk7XG4gICAgfVxuICB9O1xuICAvKlxuICAgKiBBZGQgbW9kYWwgKyBiYWNrZHJvcCB0byBET01cbiAgICovXG5cblxuICB2YXIgaW5pdCA9IGZ1bmN0aW9uIGluaXQocGFyYW1zKSB7XG4gICAgLy8gQ2xlYW4gdXAgdGhlIG9sZCBwb3B1cCBjb250YWluZXIgaWYgaXQgZXhpc3RzXG4gICAgdmFyIG9sZENvbnRhaW5lckV4aXN0ZWQgPSByZXNldE9sZENvbnRhaW5lcigpO1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXG4gICAgaWYgKGlzTm9kZUVudigpKSB7XG4gICAgICBlcnJvcignU3dlZXRBbGVydDIgcmVxdWlyZXMgZG9jdW1lbnQgdG8gaW5pdGlhbGl6ZScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb250YWluZXIuY2xhc3NOYW1lID0gc3dhbENsYXNzZXMuY29udGFpbmVyO1xuXG4gICAgaWYgKG9sZENvbnRhaW5lckV4aXN0ZWQpIHtcbiAgICAgIGFkZENsYXNzKGNvbnRhaW5lciwgc3dhbENsYXNzZXNbJ25vLXRyYW5zaXRpb24nXSk7XG4gICAgfVxuXG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9IHN3ZWV0SFRNTDtcbiAgICB2YXIgdGFyZ2V0RWxlbWVudCA9IGdldFRhcmdldChwYXJhbXMudGFyZ2V0KTtcbiAgICB0YXJnZXRFbGVtZW50LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgc2V0dXBBY2Nlc3NpYmlsaXR5KHBhcmFtcyk7XG4gICAgc2V0dXBSVEwodGFyZ2V0RWxlbWVudCk7XG4gICAgYWRkSW5wdXRDaGFuZ2VMaXN0ZW5lcnMoKTtcbiAgfTtcblxuICB2YXIgcGFyc2VIdG1sVG9Db250YWluZXIgPSBmdW5jdGlvbiBwYXJzZUh0bWxUb0NvbnRhaW5lcihwYXJhbSwgdGFyZ2V0KSB7XG4gICAgLy8gRE9NIGVsZW1lbnRcbiAgICBpZiAocGFyYW0gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHBhcmFtKTsgLy8gT2JqZWN0XG4gICAgfSBlbHNlIGlmIChfdHlwZW9mKHBhcmFtKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGhhbmRsZU9iamVjdChwYXJhbSwgdGFyZ2V0KTsgLy8gUGxhaW4gc3RyaW5nXG4gICAgfSBlbHNlIGlmIChwYXJhbSkge1xuICAgICAgdGFyZ2V0LmlubmVySFRNTCA9IHBhcmFtO1xuICAgIH1cbiAgfTtcblxuICB2YXIgaGFuZGxlT2JqZWN0ID0gZnVuY3Rpb24gaGFuZGxlT2JqZWN0KHBhcmFtLCB0YXJnZXQpIHtcbiAgICAvLyBKUXVlcnkgZWxlbWVudChzKVxuICAgIGlmIChwYXJhbS5qcXVlcnkpIHtcbiAgICAgIGhhbmRsZUpxdWVyeUVsZW0odGFyZ2V0LCBwYXJhbSk7IC8vIEZvciBvdGhlciBvYmplY3RzIHVzZSB0aGVpciBzdHJpbmcgcmVwcmVzZW50YXRpb25cbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0LmlubmVySFRNTCA9IHBhcmFtLnRvU3RyaW5nKCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBoYW5kbGVKcXVlcnlFbGVtID0gZnVuY3Rpb24gaGFuZGxlSnF1ZXJ5RWxlbSh0YXJnZXQsIGVsZW0pIHtcbiAgICB0YXJnZXQuaW5uZXJIVE1MID0gJyc7XG5cbiAgICBpZiAoMCBpbiBlbGVtKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSBpbiBlbGVtOyBpKyspIHtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGVsZW1baV0uY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGVsZW0uY2xvbmVOb2RlKHRydWUpKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGFuaW1hdGlvbkVuZEV2ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFByZXZlbnQgcnVuIGluIE5vZGUgZW52XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoaXNOb2RlRW52KCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgdGVzdEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdmFyIHRyYW5zRW5kRXZlbnROYW1lcyA9IHtcbiAgICAgIFdlYmtpdEFuaW1hdGlvbjogJ3dlYmtpdEFuaW1hdGlvbkVuZCcsXG4gICAgICBPQW5pbWF0aW9uOiAnb0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kJyxcbiAgICAgIGFuaW1hdGlvbjogJ2FuaW1hdGlvbmVuZCdcbiAgICB9O1xuXG4gICAgZm9yICh2YXIgaSBpbiB0cmFuc0VuZEV2ZW50TmFtZXMpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodHJhbnNFbmRFdmVudE5hbWVzLCBpKSAmJiB0eXBlb2YgdGVzdEVsLnN0eWxlW2ldICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gdHJhbnNFbmRFdmVudE5hbWVzW2ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSgpO1xuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9qcy9zcmMvbW9kYWwuanNcblxuICB2YXIgbWVhc3VyZVNjcm9sbGJhciA9IGZ1bmN0aW9uIG1lYXN1cmVTY3JvbGxiYXIoKSB7XG4gICAgdmFyIHNjcm9sbERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHNjcm9sbERpdi5jbGFzc05hbWUgPSBzd2FsQ2xhc3Nlc1snc2Nyb2xsYmFyLW1lYXN1cmUnXTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcm9sbERpdik7XG4gICAgdmFyIHNjcm9sbGJhcldpZHRoID0gc2Nyb2xsRGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoIC0gc2Nyb2xsRGl2LmNsaWVudFdpZHRoO1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoc2Nyb2xsRGl2KTtcbiAgICByZXR1cm4gc2Nyb2xsYmFyV2lkdGg7XG4gIH07XG5cbiAgdmFyIHJlbmRlckFjdGlvbnMgPSBmdW5jdGlvbiByZW5kZXJBY3Rpb25zKGluc3RhbmNlLCBwYXJhbXMpIHtcbiAgICB2YXIgYWN0aW9ucyA9IGdldEFjdGlvbnMoKTtcbiAgICB2YXIgY29uZmlybUJ1dHRvbiA9IGdldENvbmZpcm1CdXR0b24oKTtcbiAgICB2YXIgY2FuY2VsQnV0dG9uID0gZ2V0Q2FuY2VsQnV0dG9uKCk7IC8vIEFjdGlvbnMgKGJ1dHRvbnMpIHdyYXBwZXJcblxuICAgIGlmICghcGFyYW1zLnNob3dDb25maXJtQnV0dG9uICYmICFwYXJhbXMuc2hvd0NhbmNlbEJ1dHRvbikge1xuICAgICAgaGlkZShhY3Rpb25zKTtcbiAgICB9IC8vIEN1c3RvbSBjbGFzc1xuXG5cbiAgICBhcHBseUN1c3RvbUNsYXNzKGFjdGlvbnMsIHBhcmFtcywgJ2FjdGlvbnMnKTsgLy8gUmVuZGVyIGNvbmZpcm0gYnV0dG9uXG5cbiAgICByZW5kZXJCdXR0b24oY29uZmlybUJ1dHRvbiwgJ2NvbmZpcm0nLCBwYXJhbXMpOyAvLyByZW5kZXIgQ2FuY2VsIEJ1dHRvblxuXG4gICAgcmVuZGVyQnV0dG9uKGNhbmNlbEJ1dHRvbiwgJ2NhbmNlbCcsIHBhcmFtcyk7XG5cbiAgICBpZiAocGFyYW1zLmJ1dHRvbnNTdHlsaW5nKSB7XG4gICAgICBoYW5kbGVCdXR0b25zU3R5bGluZyhjb25maXJtQnV0dG9uLCBjYW5jZWxCdXR0b24sIHBhcmFtcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbW92ZUNsYXNzKFtjb25maXJtQnV0dG9uLCBjYW5jZWxCdXR0b25dLCBzd2FsQ2xhc3Nlcy5zdHlsZWQpO1xuICAgICAgY29uZmlybUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBjb25maXJtQnV0dG9uLnN0eWxlLmJvcmRlckxlZnRDb2xvciA9IGNvbmZpcm1CdXR0b24uc3R5bGUuYm9yZGVyUmlnaHRDb2xvciA9ICcnO1xuICAgICAgY2FuY2VsQnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNhbmNlbEJ1dHRvbi5zdHlsZS5ib3JkZXJMZWZ0Q29sb3IgPSBjYW5jZWxCdXR0b24uc3R5bGUuYm9yZGVyUmlnaHRDb2xvciA9ICcnO1xuICAgIH1cblxuICAgIGlmIChwYXJhbXMucmV2ZXJzZUJ1dHRvbnMpIHtcbiAgICAgIGNvbmZpcm1CdXR0b24ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoY2FuY2VsQnV0dG9uLCBjb25maXJtQnV0dG9uKTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gaGFuZGxlQnV0dG9uc1N0eWxpbmcoY29uZmlybUJ1dHRvbiwgY2FuY2VsQnV0dG9uLCBwYXJhbXMpIHtcbiAgICBhZGRDbGFzcyhbY29uZmlybUJ1dHRvbiwgY2FuY2VsQnV0dG9uXSwgc3dhbENsYXNzZXMuc3R5bGVkKTsgLy8gQnV0dG9ucyBiYWNrZ3JvdW5kIGNvbG9yc1xuXG4gICAgaWYgKHBhcmFtcy5jb25maXJtQnV0dG9uQ29sb3IpIHtcbiAgICAgIGNvbmZpcm1CdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gcGFyYW1zLmNvbmZpcm1CdXR0b25Db2xvcjtcbiAgICB9XG5cbiAgICBpZiAocGFyYW1zLmNhbmNlbEJ1dHRvbkNvbG9yKSB7XG4gICAgICBjYW5jZWxCdXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gcGFyYW1zLmNhbmNlbEJ1dHRvbkNvbG9yO1xuICAgIH0gLy8gTG9hZGluZyBzdGF0ZVxuXG5cbiAgICB2YXIgY29uZmlybUJ1dHRvbkJhY2tncm91bmRDb2xvciA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGNvbmZpcm1CdXR0b24pLmdldFByb3BlcnR5VmFsdWUoJ2JhY2tncm91bmQtY29sb3InKTtcbiAgICBjb25maXJtQnV0dG9uLnN0eWxlLmJvcmRlckxlZnRDb2xvciA9IGNvbmZpcm1CdXR0b25CYWNrZ3JvdW5kQ29sb3I7XG4gICAgY29uZmlybUJ1dHRvbi5zdHlsZS5ib3JkZXJSaWdodENvbG9yID0gY29uZmlybUJ1dHRvbkJhY2tncm91bmRDb2xvcjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlckJ1dHRvbihidXR0b24sIGJ1dHRvblR5cGUsIHBhcmFtcykge1xuICAgIHRvZ2dsZShidXR0b24sIHBhcmFtc1tcInNob3dcIi5jb25jYXQoY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKGJ1dHRvblR5cGUpLCBcIkJ1dHRvblwiKV0sICdpbmxpbmUtYmxvY2snKTtcbiAgICBidXR0b24uaW5uZXJIVE1MID0gcGFyYW1zW1wiXCIuY29uY2F0KGJ1dHRvblR5cGUsIFwiQnV0dG9uVGV4dFwiKV07IC8vIFNldCBjYXB0aW9uIHRleHRcblxuICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBwYXJhbXNbXCJcIi5jb25jYXQoYnV0dG9uVHlwZSwgXCJCdXR0b25BcmlhTGFiZWxcIildKTsgLy8gQVJJQSBsYWJlbFxuICAgIC8vIEFkZCBidXR0b25zIGN1c3RvbSBjbGFzc2VzXG5cbiAgICBidXR0b24uY2xhc3NOYW1lID0gc3dhbENsYXNzZXNbYnV0dG9uVHlwZV07XG4gICAgYXBwbHlDdXN0b21DbGFzcyhidXR0b24sIHBhcmFtcywgXCJcIi5jb25jYXQoYnV0dG9uVHlwZSwgXCJCdXR0b25cIikpO1xuICAgIGFkZENsYXNzKGJ1dHRvbiwgcGFyYW1zW1wiXCIuY29uY2F0KGJ1dHRvblR5cGUsIFwiQnV0dG9uQ2xhc3NcIildKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZUJhY2tkcm9wUGFyYW0oY29udGFpbmVyLCBiYWNrZHJvcCkge1xuICAgIGlmICh0eXBlb2YgYmFja2Ryb3AgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb250YWluZXIuc3R5bGUuYmFja2dyb3VuZCA9IGJhY2tkcm9wO1xuICAgIH0gZWxzZSBpZiAoIWJhY2tkcm9wKSB7XG4gICAgICBhZGRDbGFzcyhbZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCBkb2N1bWVudC5ib2R5XSwgc3dhbENsYXNzZXNbJ25vLWJhY2tkcm9wJ10pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVBvc2l0aW9uUGFyYW0oY29udGFpbmVyLCBwb3NpdGlvbikge1xuICAgIGlmIChwb3NpdGlvbiBpbiBzd2FsQ2xhc3Nlcykge1xuICAgICAgYWRkQ2xhc3MoY29udGFpbmVyLCBzd2FsQ2xhc3Nlc1twb3NpdGlvbl0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB3YXJuKCdUaGUgXCJwb3NpdGlvblwiIHBhcmFtZXRlciBpcyBub3QgdmFsaWQsIGRlZmF1bHRpbmcgdG8gXCJjZW50ZXJcIicpO1xuICAgICAgYWRkQ2xhc3MoY29udGFpbmVyLCBzd2FsQ2xhc3Nlcy5jZW50ZXIpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZUdyb3dQYXJhbShjb250YWluZXIsIGdyb3cpIHtcbiAgICBpZiAoZ3JvdyAmJiB0eXBlb2YgZ3JvdyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhciBncm93Q2xhc3MgPSBcImdyb3ctXCIuY29uY2F0KGdyb3cpO1xuXG4gICAgICBpZiAoZ3Jvd0NsYXNzIGluIHN3YWxDbGFzc2VzKSB7XG4gICAgICAgIGFkZENsYXNzKGNvbnRhaW5lciwgc3dhbENsYXNzZXNbZ3Jvd0NsYXNzXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIHJlbmRlckNvbnRhaW5lciA9IGZ1bmN0aW9uIHJlbmRlckNvbnRhaW5lcihpbnN0YW5jZSwgcGFyYW1zKSB7XG4gICAgdmFyIGNvbnRhaW5lciA9IGdldENvbnRhaW5lcigpO1xuXG4gICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBoYW5kbGVCYWNrZHJvcFBhcmFtKGNvbnRhaW5lciwgcGFyYW1zLmJhY2tkcm9wKTtcblxuICAgIGlmICghcGFyYW1zLmJhY2tkcm9wICYmIHBhcmFtcy5hbGxvd091dHNpZGVDbGljaykge1xuICAgICAgd2FybignXCJhbGxvd091dHNpZGVDbGlja1wiIHBhcmFtZXRlciByZXF1aXJlcyBgYmFja2Ryb3BgIHBhcmFtZXRlciB0byBiZSBzZXQgdG8gYHRydWVgJyk7XG4gICAgfVxuXG4gICAgaGFuZGxlUG9zaXRpb25QYXJhbShjb250YWluZXIsIHBhcmFtcy5wb3NpdGlvbik7XG4gICAgaGFuZGxlR3Jvd1BhcmFtKGNvbnRhaW5lciwgcGFyYW1zLmdyb3cpOyAvLyBDdXN0b20gY2xhc3NcblxuICAgIGFwcGx5Q3VzdG9tQ2xhc3MoY29udGFpbmVyLCBwYXJhbXMsICdjb250YWluZXInKTsgLy8gU2V0IHF1ZXVlIHN0ZXAgYXR0cmlidXRlIGZvciBnZXRRdWV1ZVN0ZXAoKSBtZXRob2RcblxuICAgIHZhciBxdWV1ZVN0ZXAgPSBkb2N1bWVudC5ib2R5LmdldEF0dHJpYnV0ZSgnZGF0YS1zd2FsMi1xdWV1ZS1zdGVwJyk7XG5cbiAgICBpZiAocXVldWVTdGVwKSB7XG4gICAgICBjb250YWluZXIuc2V0QXR0cmlidXRlKCdkYXRhLXF1ZXVlLXN0ZXAnLCBxdWV1ZVN0ZXApO1xuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtc3dhbDItcXVldWUtc3RlcCcpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogVGhpcyBtb2R1bGUgY29udGFpbnRzIGBXZWFrTWFwYHMgZm9yIGVhY2ggZWZmZWN0aXZlbHktXCJwcml2YXRlICBwcm9wZXJ0eVwiIHRoYXQgYSBgU3dhbGAgaGFzLlxuICAgKiBGb3IgZXhhbXBsZSwgdG8gc2V0IHRoZSBwcml2YXRlIHByb3BlcnR5IFwiZm9vXCIgb2YgYHRoaXNgIHRvIFwiYmFyXCIsIHlvdSBjYW4gYHByaXZhdGVQcm9wcy5mb28uc2V0KHRoaXMsICdiYXInKWBcbiAgICogVGhpcyBpcyB0aGUgYXBwcm9hY2ggdGhhdCBCYWJlbCB3aWxsIHByb2JhYmx5IHRha2UgdG8gaW1wbGVtZW50IHByaXZhdGUgbWV0aG9kcy9maWVsZHNcbiAgICogICBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9wcm9wb3NhbC1wcml2YXRlLW1ldGhvZHNcbiAgICogICBodHRwczovL2dpdGh1Yi5jb20vYmFiZWwvYmFiZWwvcHVsbC83NTU1XG4gICAqIE9uY2Ugd2UgaGF2ZSB0aGUgY2hhbmdlcyBmcm9tIHRoYXQgUFIgaW4gQmFiZWwsIGFuZCBvdXIgY29yZSBjbGFzcyBmaXRzIHJlYXNvbmFibGUgaW4gKm9uZSBtb2R1bGUqXG4gICAqICAgdGhlbiB3ZSBjYW4gdXNlIHRoYXQgbGFuZ3VhZ2UgZmVhdHVyZS5cbiAgICovXG4gIHZhciBwcml2YXRlUHJvcHMgPSB7XG4gICAgcHJvbWlzZTogbmV3IFdlYWtNYXAoKSxcbiAgICBpbm5lclBhcmFtczogbmV3IFdlYWtNYXAoKSxcbiAgICBkb21DYWNoZTogbmV3IFdlYWtNYXAoKVxuICB9O1xuXG4gIHZhciBpbnB1dFR5cGVzID0gWydpbnB1dCcsICdmaWxlJywgJ3JhbmdlJywgJ3NlbGVjdCcsICdyYWRpbycsICdjaGVja2JveCcsICd0ZXh0YXJlYSddO1xuICB2YXIgcmVuZGVySW5wdXQgPSBmdW5jdGlvbiByZW5kZXJJbnB1dChpbnN0YW5jZSwgcGFyYW1zKSB7XG4gICAgdmFyIGNvbnRlbnQgPSBnZXRDb250ZW50KCk7XG4gICAgdmFyIGlubmVyUGFyYW1zID0gcHJpdmF0ZVByb3BzLmlubmVyUGFyYW1zLmdldChpbnN0YW5jZSk7XG4gICAgdmFyIHJlcmVuZGVyID0gIWlubmVyUGFyYW1zIHx8IHBhcmFtcy5pbnB1dCAhPT0gaW5uZXJQYXJhbXMuaW5wdXQ7XG4gICAgaW5wdXRUeXBlcy5mb3JFYWNoKGZ1bmN0aW9uIChpbnB1dFR5cGUpIHtcbiAgICAgIHZhciBpbnB1dENsYXNzID0gc3dhbENsYXNzZXNbaW5wdXRUeXBlXTtcbiAgICAgIHZhciBpbnB1dENvbnRhaW5lciA9IGdldENoaWxkQnlDbGFzcyhjb250ZW50LCBpbnB1dENsYXNzKTsgLy8gc2V0IGF0dHJpYnV0ZXNcblxuICAgICAgc2V0QXR0cmlidXRlcyhpbnB1dFR5cGUsIHBhcmFtcy5pbnB1dEF0dHJpYnV0ZXMpOyAvLyBzZXQgY2xhc3NcblxuICAgICAgaW5wdXRDb250YWluZXIuY2xhc3NOYW1lID0gaW5wdXRDbGFzcztcblxuICAgICAgaWYgKHJlcmVuZGVyKSB7XG4gICAgICAgIGhpZGUoaW5wdXRDb250YWluZXIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHBhcmFtcy5pbnB1dCkge1xuICAgICAgaWYgKHJlcmVuZGVyKSB7XG4gICAgICAgIHNob3dJbnB1dChwYXJhbXMpO1xuICAgICAgfSAvLyBzZXQgY3VzdG9tIGNsYXNzXG5cblxuICAgICAgc2V0Q3VzdG9tQ2xhc3MocGFyYW1zKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHNob3dJbnB1dCA9IGZ1bmN0aW9uIHNob3dJbnB1dChwYXJhbXMpIHtcbiAgICBpZiAoIXJlbmRlcklucHV0VHlwZVtwYXJhbXMuaW5wdXRdKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXCJVbmV4cGVjdGVkIHR5cGUgb2YgaW5wdXQhIEV4cGVjdGVkIFxcXCJ0ZXh0XFxcIiwgXFxcImVtYWlsXFxcIiwgXFxcInBhc3N3b3JkXFxcIiwgXFxcIm51bWJlclxcXCIsIFxcXCJ0ZWxcXFwiLCBcXFwic2VsZWN0XFxcIiwgXFxcInJhZGlvXFxcIiwgXFxcImNoZWNrYm94XFxcIiwgXFxcInRleHRhcmVhXFxcIiwgXFxcImZpbGVcXFwiIG9yIFxcXCJ1cmxcXFwiLCBnb3QgXFxcIlwiLmNvbmNhdChwYXJhbXMuaW5wdXQsIFwiXFxcIlwiKSk7XG4gICAgfVxuXG4gICAgdmFyIGlucHV0Q29udGFpbmVyID0gZ2V0SW5wdXRDb250YWluZXIocGFyYW1zLmlucHV0KTtcbiAgICB2YXIgaW5wdXQgPSByZW5kZXJJbnB1dFR5cGVbcGFyYW1zLmlucHV0XShpbnB1dENvbnRhaW5lciwgcGFyYW1zKTtcbiAgICBzaG93KGlucHV0KTsgLy8gaW5wdXQgYXV0b2ZvY3VzXG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGZvY3VzSW5wdXQoaW5wdXQpO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciByZW1vdmVBdHRyaWJ1dGVzID0gZnVuY3Rpb24gcmVtb3ZlQXR0cmlidXRlcyhpbnB1dCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5wdXQuYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGF0dHJOYW1lID0gaW5wdXQuYXR0cmlidXRlc1tpXS5uYW1lO1xuXG4gICAgICBpZiAoIShbJ3R5cGUnLCAndmFsdWUnLCAnc3R5bGUnXS5pbmRleE9mKGF0dHJOYW1lKSAhPT0gLTEpKSB7XG4gICAgICAgIGlucHV0LnJlbW92ZUF0dHJpYnV0ZShhdHRyTmFtZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHZhciBzZXRBdHRyaWJ1dGVzID0gZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhpbnB1dFR5cGUsIGlucHV0QXR0cmlidXRlcykge1xuICAgIHZhciBpbnB1dCA9IGdldElucHV0KGdldENvbnRlbnQoKSwgaW5wdXRUeXBlKTtcblxuICAgIGlmICghaW5wdXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZW1vdmVBdHRyaWJ1dGVzKGlucHV0KTtcblxuICAgIGZvciAodmFyIGF0dHIgaW4gaW5wdXRBdHRyaWJ1dGVzKSB7XG4gICAgICAvLyBEbyBub3Qgc2V0IGEgcGxhY2Vob2xkZXIgZm9yIDxpbnB1dCB0eXBlPVwicmFuZ2VcIj5cbiAgICAgIC8vIGl0J2xsIGNyYXNoIEVkZ2UsICMxMjk4XG4gICAgICBpZiAoaW5wdXRUeXBlID09PSAncmFuZ2UnICYmIGF0dHIgPT09ICdwbGFjZWhvbGRlcicpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlucHV0LnNldEF0dHJpYnV0ZShhdHRyLCBpbnB1dEF0dHJpYnV0ZXNbYXR0cl0pO1xuICAgIH1cbiAgfTtcblxuICB2YXIgc2V0Q3VzdG9tQ2xhc3MgPSBmdW5jdGlvbiBzZXRDdXN0b21DbGFzcyhwYXJhbXMpIHtcbiAgICB2YXIgaW5wdXRDb250YWluZXIgPSBnZXRJbnB1dENvbnRhaW5lcihwYXJhbXMuaW5wdXQpO1xuXG4gICAgaWYgKHBhcmFtcy5jdXN0b21DbGFzcykge1xuICAgICAgYWRkQ2xhc3MoaW5wdXRDb250YWluZXIsIHBhcmFtcy5jdXN0b21DbGFzcy5pbnB1dCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBzZXRJbnB1dFBsYWNlaG9sZGVyID0gZnVuY3Rpb24gc2V0SW5wdXRQbGFjZWhvbGRlcihpbnB1dCwgcGFyYW1zKSB7XG4gICAgaWYgKCFpbnB1dC5wbGFjZWhvbGRlciB8fCBwYXJhbXMuaW5wdXRQbGFjZWhvbGRlcikge1xuICAgICAgaW5wdXQucGxhY2Vob2xkZXIgPSBwYXJhbXMuaW5wdXRQbGFjZWhvbGRlcjtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGdldElucHV0Q29udGFpbmVyID0gZnVuY3Rpb24gZ2V0SW5wdXRDb250YWluZXIoaW5wdXRUeXBlKSB7XG4gICAgdmFyIGlucHV0Q2xhc3MgPSBzd2FsQ2xhc3Nlc1tpbnB1dFR5cGVdID8gc3dhbENsYXNzZXNbaW5wdXRUeXBlXSA6IHN3YWxDbGFzc2VzLmlucHV0O1xuICAgIHJldHVybiBnZXRDaGlsZEJ5Q2xhc3MoZ2V0Q29udGVudCgpLCBpbnB1dENsYXNzKTtcbiAgfTtcblxuICB2YXIgcmVuZGVySW5wdXRUeXBlID0ge307XG5cbiAgcmVuZGVySW5wdXRUeXBlLnRleHQgPSByZW5kZXJJbnB1dFR5cGUuZW1haWwgPSByZW5kZXJJbnB1dFR5cGUucGFzc3dvcmQgPSByZW5kZXJJbnB1dFR5cGUubnVtYmVyID0gcmVuZGVySW5wdXRUeXBlLnRlbCA9IHJlbmRlcklucHV0VHlwZS51cmwgPSBmdW5jdGlvbiAoaW5wdXQsIHBhcmFtcykge1xuICAgIGlmICh0eXBlb2YgcGFyYW1zLmlucHV0VmFsdWUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBwYXJhbXMuaW5wdXRWYWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIGlucHV0LnZhbHVlID0gcGFyYW1zLmlucHV0VmFsdWU7XG4gICAgfSBlbHNlIGlmICghaXNQcm9taXNlKHBhcmFtcy5pbnB1dFZhbHVlKSkge1xuICAgICAgd2FybihcIlVuZXhwZWN0ZWQgdHlwZSBvZiBpbnB1dFZhbHVlISBFeHBlY3RlZCBcXFwic3RyaW5nXFxcIiwgXFxcIm51bWJlclxcXCIgb3IgXFxcIlByb21pc2VcXFwiLCBnb3QgXFxcIlwiLmNvbmNhdChfdHlwZW9mKHBhcmFtcy5pbnB1dFZhbHVlKSwgXCJcXFwiXCIpKTtcbiAgICB9XG5cbiAgICBzZXRJbnB1dFBsYWNlaG9sZGVyKGlucHV0LCBwYXJhbXMpO1xuICAgIGlucHV0LnR5cGUgPSBwYXJhbXMuaW5wdXQ7XG4gICAgcmV0dXJuIGlucHV0O1xuICB9O1xuXG4gIHJlbmRlcklucHV0VHlwZS5maWxlID0gZnVuY3Rpb24gKGlucHV0LCBwYXJhbXMpIHtcbiAgICBzZXRJbnB1dFBsYWNlaG9sZGVyKGlucHV0LCBwYXJhbXMpO1xuICAgIHJldHVybiBpbnB1dDtcbiAgfTtcblxuICByZW5kZXJJbnB1dFR5cGUucmFuZ2UgPSBmdW5jdGlvbiAocmFuZ2UsIHBhcmFtcykge1xuICAgIHZhciByYW5nZUlucHV0ID0gcmFuZ2UucXVlcnlTZWxlY3RvcignaW5wdXQnKTtcbiAgICB2YXIgcmFuZ2VPdXRwdXQgPSByYW5nZS5xdWVyeVNlbGVjdG9yKCdvdXRwdXQnKTtcbiAgICByYW5nZUlucHV0LnZhbHVlID0gcGFyYW1zLmlucHV0VmFsdWU7XG4gICAgcmFuZ2VJbnB1dC50eXBlID0gcGFyYW1zLmlucHV0O1xuICAgIHJhbmdlT3V0cHV0LnZhbHVlID0gcGFyYW1zLmlucHV0VmFsdWU7XG4gICAgcmV0dXJuIHJhbmdlO1xuICB9O1xuXG4gIHJlbmRlcklucHV0VHlwZS5zZWxlY3QgPSBmdW5jdGlvbiAoc2VsZWN0LCBwYXJhbXMpIHtcbiAgICBzZWxlY3QuaW5uZXJIVE1MID0gJyc7XG5cbiAgICBpZiAocGFyYW1zLmlucHV0UGxhY2Vob2xkZXIpIHtcbiAgICAgIHZhciBwbGFjZWhvbGRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuICAgICAgcGxhY2Vob2xkZXIuaW5uZXJIVE1MID0gcGFyYW1zLmlucHV0UGxhY2Vob2xkZXI7XG4gICAgICBwbGFjZWhvbGRlci52YWx1ZSA9ICcnO1xuICAgICAgcGxhY2Vob2xkZXIuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgcGxhY2Vob2xkZXIuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgc2VsZWN0LmFwcGVuZENoaWxkKHBsYWNlaG9sZGVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZWN0O1xuICB9O1xuXG4gIHJlbmRlcklucHV0VHlwZS5yYWRpbyA9IGZ1bmN0aW9uIChyYWRpbykge1xuICAgIHJhZGlvLmlubmVySFRNTCA9ICcnO1xuICAgIHJldHVybiByYWRpbztcbiAgfTtcblxuICByZW5kZXJJbnB1dFR5cGUuY2hlY2tib3ggPSBmdW5jdGlvbiAoY2hlY2tib3hDb250YWluZXIsIHBhcmFtcykge1xuICAgIHZhciBjaGVja2JveCA9IGdldElucHV0KGdldENvbnRlbnQoKSwgJ2NoZWNrYm94Jyk7XG4gICAgY2hlY2tib3gudmFsdWUgPSAxO1xuICAgIGNoZWNrYm94LmlkID0gc3dhbENsYXNzZXMuY2hlY2tib3g7XG4gICAgY2hlY2tib3guY2hlY2tlZCA9IEJvb2xlYW4ocGFyYW1zLmlucHV0VmFsdWUpO1xuICAgIHZhciBsYWJlbCA9IGNoZWNrYm94Q29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKTtcbiAgICBsYWJlbC5pbm5lckhUTUwgPSBwYXJhbXMuaW5wdXRQbGFjZWhvbGRlcjtcbiAgICByZXR1cm4gY2hlY2tib3hDb250YWluZXI7XG4gIH07XG5cbiAgcmVuZGVySW5wdXRUeXBlLnRleHRhcmVhID0gZnVuY3Rpb24gKHRleHRhcmVhLCBwYXJhbXMpIHtcbiAgICB0ZXh0YXJlYS52YWx1ZSA9IHBhcmFtcy5pbnB1dFZhbHVlO1xuICAgIHNldElucHV0UGxhY2Vob2xkZXIodGV4dGFyZWEsIHBhcmFtcyk7XG5cbiAgICBpZiAoJ011dGF0aW9uT2JzZXJ2ZXInIGluIHdpbmRvdykge1xuICAgICAgLy8gIzE2OTlcbiAgICAgIHZhciBpbml0aWFsUG9wdXBXaWR0aCA9IHBhcnNlSW50KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGdldFBvcHVwKCkpLndpZHRoKTtcbiAgICAgIHZhciBwb3B1cFBhZGRpbmcgPSBwYXJzZUludCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShnZXRQb3B1cCgpKS5wYWRkaW5nTGVmdCkgKyBwYXJzZUludCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShnZXRQb3B1cCgpKS5wYWRkaW5nUmlnaHQpO1xuXG4gICAgICB2YXIgb3V0cHV0c2l6ZSA9IGZ1bmN0aW9uIG91dHB1dHNpemUoKSB7XG4gICAgICAgIHZhciBjb250ZW50V2lkdGggPSB0ZXh0YXJlYS5vZmZzZXRXaWR0aCArIHBvcHVwUGFkZGluZztcblxuICAgICAgICBpZiAoY29udGVudFdpZHRoID4gaW5pdGlhbFBvcHVwV2lkdGgpIHtcbiAgICAgICAgICBnZXRQb3B1cCgpLnN0eWxlLndpZHRoID0gXCJcIi5jb25jYXQoY29udGVudFdpZHRoLCBcInB4XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGdldFBvcHVwKCkuc3R5bGUud2lkdGggPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBuZXcgTXV0YXRpb25PYnNlcnZlcihvdXRwdXRzaXplKS5vYnNlcnZlKHRleHRhcmVhLCB7XG4gICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydzdHlsZSddXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGV4dGFyZWE7XG4gIH07XG5cbiAgdmFyIHJlbmRlckNvbnRlbnQgPSBmdW5jdGlvbiByZW5kZXJDb250ZW50KGluc3RhbmNlLCBwYXJhbXMpIHtcbiAgICB2YXIgY29udGVudCA9IGdldENvbnRlbnQoKS5xdWVyeVNlbGVjdG9yKFwiI1wiLmNvbmNhdChzd2FsQ2xhc3Nlcy5jb250ZW50KSk7IC8vIENvbnRlbnQgYXMgSFRNTFxuXG4gICAgaWYgKHBhcmFtcy5odG1sKSB7XG4gICAgICBwYXJzZUh0bWxUb0NvbnRhaW5lcihwYXJhbXMuaHRtbCwgY29udGVudCk7XG4gICAgICBzaG93KGNvbnRlbnQsICdibG9jaycpOyAvLyBDb250ZW50IGFzIHBsYWluIHRleHRcbiAgICB9IGVsc2UgaWYgKHBhcmFtcy50ZXh0KSB7XG4gICAgICBjb250ZW50LnRleHRDb250ZW50ID0gcGFyYW1zLnRleHQ7XG4gICAgICBzaG93KGNvbnRlbnQsICdibG9jaycpOyAvLyBObyBjb250ZW50XG4gICAgfSBlbHNlIHtcbiAgICAgIGhpZGUoY29udGVudCk7XG4gICAgfVxuXG4gICAgcmVuZGVySW5wdXQoaW5zdGFuY2UsIHBhcmFtcyk7IC8vIEN1c3RvbSBjbGFzc1xuXG4gICAgYXBwbHlDdXN0b21DbGFzcyhnZXRDb250ZW50KCksIHBhcmFtcywgJ2NvbnRlbnQnKTtcbiAgfTtcblxuICB2YXIgcmVuZGVyRm9vdGVyID0gZnVuY3Rpb24gcmVuZGVyRm9vdGVyKGluc3RhbmNlLCBwYXJhbXMpIHtcbiAgICB2YXIgZm9vdGVyID0gZ2V0Rm9vdGVyKCk7XG4gICAgdG9nZ2xlKGZvb3RlciwgcGFyYW1zLmZvb3Rlcik7XG5cbiAgICBpZiAocGFyYW1zLmZvb3Rlcikge1xuICAgICAgcGFyc2VIdG1sVG9Db250YWluZXIocGFyYW1zLmZvb3RlciwgZm9vdGVyKTtcbiAgICB9IC8vIEN1c3RvbSBjbGFzc1xuXG5cbiAgICBhcHBseUN1c3RvbUNsYXNzKGZvb3RlciwgcGFyYW1zLCAnZm9vdGVyJyk7XG4gIH07XG5cbiAgdmFyIHJlbmRlckNsb3NlQnV0dG9uID0gZnVuY3Rpb24gcmVuZGVyQ2xvc2VCdXR0b24oaW5zdGFuY2UsIHBhcmFtcykge1xuICAgIHZhciBjbG9zZUJ1dHRvbiA9IGdldENsb3NlQnV0dG9uKCk7XG4gICAgY2xvc2VCdXR0b24uaW5uZXJIVE1MID0gcGFyYW1zLmNsb3NlQnV0dG9uSHRtbDsgLy8gQ3VzdG9tIGNsYXNzXG5cbiAgICBhcHBseUN1c3RvbUNsYXNzKGNsb3NlQnV0dG9uLCBwYXJhbXMsICdjbG9zZUJ1dHRvbicpO1xuICAgIHRvZ2dsZShjbG9zZUJ1dHRvbiwgcGFyYW1zLnNob3dDbG9zZUJ1dHRvbik7XG4gICAgY2xvc2VCdXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgcGFyYW1zLmNsb3NlQnV0dG9uQXJpYUxhYmVsKTtcbiAgfTtcblxuICB2YXIgcmVuZGVySWNvbiA9IGZ1bmN0aW9uIHJlbmRlckljb24oaW5zdGFuY2UsIHBhcmFtcykge1xuICAgIHZhciBpbm5lclBhcmFtcyA9IHByaXZhdGVQcm9wcy5pbm5lclBhcmFtcy5nZXQoaW5zdGFuY2UpOyAvLyBpZiB0aGUgZ2l2ZSBpY29uIGFscmVhZHkgcmVuZGVyZWQsIGFwcGx5IHRoZSBjdXN0b20gY2xhc3Mgd2l0aG91dCByZS1yZW5kZXJpbmcgdGhlIGljb25cblxuICAgIGlmIChpbm5lclBhcmFtcyAmJiBwYXJhbXMuaWNvbiA9PT0gaW5uZXJQYXJhbXMuaWNvbiAmJiBnZXRJY29uKCkpIHtcbiAgICAgIGFwcGx5Q3VzdG9tQ2xhc3MoZ2V0SWNvbigpLCBwYXJhbXMsICdpY29uJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaGlkZUFsbEljb25zKCk7XG5cbiAgICBpZiAoIXBhcmFtcy5pY29uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKE9iamVjdC5rZXlzKGljb25UeXBlcykuaW5kZXhPZihwYXJhbXMuaWNvbikgIT09IC0xKSB7XG4gICAgICB2YXIgaWNvbiA9IGVsZW1lbnRCeVNlbGVjdG9yKFwiLlwiLmNvbmNhdChzd2FsQ2xhc3Nlcy5pY29uLCBcIi5cIikuY29uY2F0KGljb25UeXBlc1twYXJhbXMuaWNvbl0pKTtcbiAgICAgIHNob3coaWNvbik7IC8vIEN1c3RvbSBvciBkZWZhdWx0IGNvbnRlbnRcblxuICAgICAgc2V0Q29udGVudChpY29uLCBwYXJhbXMpO1xuICAgICAgYWRqdXN0U3VjY2Vzc0ljb25CYWNrZ291bmRDb2xvcigpOyAvLyBDdXN0b20gY2xhc3NcblxuICAgICAgYXBwbHlDdXN0b21DbGFzcyhpY29uLCBwYXJhbXMsICdpY29uJyk7IC8vIEFuaW1hdGUgaWNvblxuXG4gICAgICBhZGRDbGFzcyhpY29uLCBwYXJhbXMuc2hvd0NsYXNzLmljb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICBlcnJvcihcIlVua25vd24gaWNvbiEgRXhwZWN0ZWQgXFxcInN1Y2Nlc3NcXFwiLCBcXFwiZXJyb3JcXFwiLCBcXFwid2FybmluZ1xcXCIsIFxcXCJpbmZvXFxcIiBvciBcXFwicXVlc3Rpb25cXFwiLCBnb3QgXFxcIlwiLmNvbmNhdChwYXJhbXMuaWNvbiwgXCJcXFwiXCIpKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGhpZGVBbGxJY29ucyA9IGZ1bmN0aW9uIGhpZGVBbGxJY29ucygpIHtcbiAgICB2YXIgaWNvbnMgPSBnZXRJY29ucygpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpY29ucy5sZW5ndGg7IGkrKykge1xuICAgICAgaGlkZShpY29uc1tpXSk7XG4gICAgfVxuICB9OyAvLyBBZGp1c3Qgc3VjY2VzcyBpY29uIGJhY2tncm91bmQgY29sb3IgdG8gbWF0Y2ggdGhlIHBvcHVwIGJhY2tncm91bmQgY29sb3JcblxuXG4gIHZhciBhZGp1c3RTdWNjZXNzSWNvbkJhY2tnb3VuZENvbG9yID0gZnVuY3Rpb24gYWRqdXN0U3VjY2Vzc0ljb25CYWNrZ291bmRDb2xvcigpIHtcbiAgICB2YXIgcG9wdXAgPSBnZXRQb3B1cCgpO1xuICAgIHZhciBwb3B1cEJhY2tncm91bmRDb2xvciA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHBvcHVwKS5nZXRQcm9wZXJ0eVZhbHVlKCdiYWNrZ3JvdW5kLWNvbG9yJyk7XG4gICAgdmFyIHN1Y2Nlc3NJY29uUGFydHMgPSBwb3B1cC5xdWVyeVNlbGVjdG9yQWxsKCdbY2xhc3NePXN3YWwyLXN1Y2Nlc3MtY2lyY3VsYXItbGluZV0sIC5zd2FsMi1zdWNjZXNzLWZpeCcpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWNjZXNzSWNvblBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBzdWNjZXNzSWNvblBhcnRzW2ldLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IHBvcHVwQmFja2dyb3VuZENvbG9yO1xuICAgIH1cbiAgfTtcblxuICB2YXIgc2V0Q29udGVudCA9IGZ1bmN0aW9uIHNldENvbnRlbnQoaWNvbiwgcGFyYW1zKSB7XG4gICAgaWNvbi5pbm5lckhUTUwgPSAnJztcblxuICAgIGlmIChwYXJhbXMuaWNvbkh0bWwpIHtcbiAgICAgIGljb24uaW5uZXJIVE1MID0gaWNvbkNvbnRlbnQocGFyYW1zLmljb25IdG1sKTtcbiAgICB9IGVsc2UgaWYgKHBhcmFtcy5pY29uID09PSAnc3VjY2VzcycpIHtcbiAgICAgIGljb24uaW5uZXJIVE1MID0gXCJcXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJzd2FsMi1zdWNjZXNzLWNpcmN1bGFyLWxpbmUtbGVmdFxcXCI+PC9kaXY+XFxuICAgICAgPHNwYW4gY2xhc3M9XFxcInN3YWwyLXN1Y2Nlc3MtbGluZS10aXBcXFwiPjwvc3Bhbj4gPHNwYW4gY2xhc3M9XFxcInN3YWwyLXN1Y2Nlc3MtbGluZS1sb25nXFxcIj48L3NwYW4+XFxuICAgICAgPGRpdiBjbGFzcz1cXFwic3dhbDItc3VjY2Vzcy1yaW5nXFxcIj48L2Rpdj4gPGRpdiBjbGFzcz1cXFwic3dhbDItc3VjY2Vzcy1maXhcXFwiPjwvZGl2PlxcbiAgICAgIDxkaXYgY2xhc3M9XFxcInN3YWwyLXN1Y2Nlc3MtY2lyY3VsYXItbGluZS1yaWdodFxcXCI+PC9kaXY+XFxuICAgIFwiO1xuICAgIH0gZWxzZSBpZiAocGFyYW1zLmljb24gPT09ICdlcnJvcicpIHtcbiAgICAgIGljb24uaW5uZXJIVE1MID0gXCJcXG4gICAgICA8c3BhbiBjbGFzcz1cXFwic3dhbDIteC1tYXJrXFxcIj5cXG4gICAgICAgIDxzcGFuIGNsYXNzPVxcXCJzd2FsMi14LW1hcmstbGluZS1sZWZ0XFxcIj48L3NwYW4+XFxuICAgICAgICA8c3BhbiBjbGFzcz1cXFwic3dhbDIteC1tYXJrLWxpbmUtcmlnaHRcXFwiPjwvc3Bhbj5cXG4gICAgICA8L3NwYW4+XFxuICAgIFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZGVmYXVsdEljb25IdG1sID0ge1xuICAgICAgICBxdWVzdGlvbjogJz8nLFxuICAgICAgICB3YXJuaW5nOiAnIScsXG4gICAgICAgIGluZm86ICdpJ1xuICAgICAgfTtcbiAgICAgIGljb24uaW5uZXJIVE1MID0gaWNvbkNvbnRlbnQoZGVmYXVsdEljb25IdG1sW3BhcmFtcy5pY29uXSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBpY29uQ29udGVudCA9IGZ1bmN0aW9uIGljb25Db250ZW50KGNvbnRlbnQpIHtcbiAgICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJcIi5jb25jYXQoc3dhbENsYXNzZXNbJ2ljb24tY29udGVudCddLCBcIlxcXCI+XCIpLmNvbmNhdChjb250ZW50LCBcIjwvZGl2PlwiKTtcbiAgfTtcblxuICB2YXIgcmVuZGVySW1hZ2UgPSBmdW5jdGlvbiByZW5kZXJJbWFnZShpbnN0YW5jZSwgcGFyYW1zKSB7XG4gICAgdmFyIGltYWdlID0gZ2V0SW1hZ2UoKTtcblxuICAgIGlmICghcGFyYW1zLmltYWdlVXJsKSB7XG4gICAgICByZXR1cm4gaGlkZShpbWFnZSk7XG4gICAgfVxuXG4gICAgc2hvdyhpbWFnZSk7IC8vIFNyYywgYWx0XG5cbiAgICBpbWFnZS5zZXRBdHRyaWJ1dGUoJ3NyYycsIHBhcmFtcy5pbWFnZVVybCk7XG4gICAgaW1hZ2Uuc2V0QXR0cmlidXRlKCdhbHQnLCBwYXJhbXMuaW1hZ2VBbHQpOyAvLyBXaWR0aCwgaGVpZ2h0XG5cbiAgICBhcHBseU51bWVyaWNhbFN0eWxlKGltYWdlLCAnd2lkdGgnLCBwYXJhbXMuaW1hZ2VXaWR0aCk7XG4gICAgYXBwbHlOdW1lcmljYWxTdHlsZShpbWFnZSwgJ2hlaWdodCcsIHBhcmFtcy5pbWFnZUhlaWdodCk7IC8vIENsYXNzXG5cbiAgICBpbWFnZS5jbGFzc05hbWUgPSBzd2FsQ2xhc3Nlcy5pbWFnZTtcbiAgICBhcHBseUN1c3RvbUNsYXNzKGltYWdlLCBwYXJhbXMsICdpbWFnZScpO1xuICB9O1xuXG4gIHZhciBjdXJyZW50U3RlcHMgPSBbXTtcbiAgLypcbiAgICogR2xvYmFsIGZ1bmN0aW9uIGZvciBjaGFpbmluZyBzd2VldEFsZXJ0IHBvcHVwc1xuICAgKi9cblxuICB2YXIgcXVldWUgPSBmdW5jdGlvbiBxdWV1ZShzdGVwcykge1xuICAgIHZhciBTd2FsID0gdGhpcztcbiAgICBjdXJyZW50U3RlcHMgPSBzdGVwcztcblxuICAgIHZhciByZXNldEFuZFJlc29sdmUgPSBmdW5jdGlvbiByZXNldEFuZFJlc29sdmUocmVzb2x2ZSwgdmFsdWUpIHtcbiAgICAgIGN1cnJlbnRTdGVwcyA9IFtdO1xuICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgfTtcblxuICAgIHZhciBxdWV1ZVJlc3VsdCA9IFtdO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgKGZ1bmN0aW9uIHN0ZXAoaSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGkgPCBjdXJyZW50U3RlcHMubGVuZ3RoKSB7XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtc3dhbDItcXVldWUtc3RlcCcsIGkpO1xuICAgICAgICAgIFN3YWwuZmlyZShjdXJyZW50U3RlcHNbaV0pLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQudmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIHF1ZXVlUmVzdWx0LnB1c2gocmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICAgICAgc3RlcChpICsgMSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzZXRBbmRSZXNvbHZlKHJlc29sdmUsIHtcbiAgICAgICAgICAgICAgICBkaXNtaXNzOiByZXN1bHQuZGlzbWlzc1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNldEFuZFJlc29sdmUocmVzb2x2ZSwge1xuICAgICAgICAgICAgdmFsdWU6IHF1ZXVlUmVzdWx0XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pKDApO1xuICAgIH0pO1xuICB9O1xuICAvKlxuICAgKiBHbG9iYWwgZnVuY3Rpb24gZm9yIGdldHRpbmcgdGhlIGluZGV4IG9mIGN1cnJlbnQgcG9wdXAgaW4gcXVldWVcbiAgICovXG5cbiAgdmFyIGdldFF1ZXVlU3RlcCA9IGZ1bmN0aW9uIGdldFF1ZXVlU3RlcCgpIHtcbiAgICByZXR1cm4gZ2V0Q29udGFpbmVyKCkuZ2V0QXR0cmlidXRlKCdkYXRhLXF1ZXVlLXN0ZXAnKTtcbiAgfTtcbiAgLypcbiAgICogR2xvYmFsIGZ1bmN0aW9uIGZvciBpbnNlcnRpbmcgYSBwb3B1cCB0byB0aGUgcXVldWVcbiAgICovXG5cbiAgdmFyIGluc2VydFF1ZXVlU3RlcCA9IGZ1bmN0aW9uIGluc2VydFF1ZXVlU3RlcChzdGVwLCBpbmRleCkge1xuICAgIGlmIChpbmRleCAmJiBpbmRleCA8IGN1cnJlbnRTdGVwcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBjdXJyZW50U3RlcHMuc3BsaWNlKGluZGV4LCAwLCBzdGVwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3VycmVudFN0ZXBzLnB1c2goc3RlcCk7XG4gIH07XG4gIC8qXG4gICAqIEdsb2JhbCBmdW5jdGlvbiBmb3IgZGVsZXRpbmcgYSBwb3B1cCBmcm9tIHRoZSBxdWV1ZVxuICAgKi9cblxuICB2YXIgZGVsZXRlUXVldWVTdGVwID0gZnVuY3Rpb24gZGVsZXRlUXVldWVTdGVwKGluZGV4KSB7XG4gICAgaWYgKHR5cGVvZiBjdXJyZW50U3RlcHNbaW5kZXhdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY3VycmVudFN0ZXBzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBjcmVhdGVTdGVwRWxlbWVudCA9IGZ1bmN0aW9uIGNyZWF0ZVN0ZXBFbGVtZW50KHN0ZXApIHtcbiAgICB2YXIgc3RlcEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBhZGRDbGFzcyhzdGVwRWwsIHN3YWxDbGFzc2VzWydwcm9ncmVzcy1zdGVwJ10pO1xuICAgIHN0ZXBFbC5pbm5lckhUTUwgPSBzdGVwO1xuICAgIHJldHVybiBzdGVwRWw7XG4gIH07XG5cbiAgdmFyIGNyZWF0ZUxpbmVFbGVtZW50ID0gZnVuY3Rpb24gY3JlYXRlTGluZUVsZW1lbnQocGFyYW1zKSB7XG4gICAgdmFyIGxpbmVFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgYWRkQ2xhc3MobGluZUVsLCBzd2FsQ2xhc3Nlc1sncHJvZ3Jlc3Mtc3RlcC1saW5lJ10pO1xuXG4gICAgaWYgKHBhcmFtcy5wcm9ncmVzc1N0ZXBzRGlzdGFuY2UpIHtcbiAgICAgIGxpbmVFbC5zdHlsZS53aWR0aCA9IHBhcmFtcy5wcm9ncmVzc1N0ZXBzRGlzdGFuY2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmVFbDtcbiAgfTtcblxuICB2YXIgcmVuZGVyUHJvZ3Jlc3NTdGVwcyA9IGZ1bmN0aW9uIHJlbmRlclByb2dyZXNzU3RlcHMoaW5zdGFuY2UsIHBhcmFtcykge1xuICAgIHZhciBwcm9ncmVzc1N0ZXBzQ29udGFpbmVyID0gZ2V0UHJvZ3Jlc3NTdGVwcygpO1xuXG4gICAgaWYgKCFwYXJhbXMucHJvZ3Jlc3NTdGVwcyB8fCBwYXJhbXMucHJvZ3Jlc3NTdGVwcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBoaWRlKHByb2dyZXNzU3RlcHNDb250YWluZXIpO1xuICAgIH1cblxuICAgIHNob3cocHJvZ3Jlc3NTdGVwc0NvbnRhaW5lcik7XG4gICAgcHJvZ3Jlc3NTdGVwc0NvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgICB2YXIgY3VycmVudFByb2dyZXNzU3RlcCA9IHBhcnNlSW50KHBhcmFtcy5jdXJyZW50UHJvZ3Jlc3NTdGVwID09PSB1bmRlZmluZWQgPyBnZXRRdWV1ZVN0ZXAoKSA6IHBhcmFtcy5jdXJyZW50UHJvZ3Jlc3NTdGVwKTtcblxuICAgIGlmIChjdXJyZW50UHJvZ3Jlc3NTdGVwID49IHBhcmFtcy5wcm9ncmVzc1N0ZXBzLmxlbmd0aCkge1xuICAgICAgd2FybignSW52YWxpZCBjdXJyZW50UHJvZ3Jlc3NTdGVwIHBhcmFtZXRlciwgaXQgc2hvdWxkIGJlIGxlc3MgdGhhbiBwcm9ncmVzc1N0ZXBzLmxlbmd0aCAnICsgJyhjdXJyZW50UHJvZ3Jlc3NTdGVwIGxpa2UgSlMgYXJyYXlzIHN0YXJ0cyBmcm9tIDApJyk7XG4gICAgfVxuXG4gICAgcGFyYW1zLnByb2dyZXNzU3RlcHMuZm9yRWFjaChmdW5jdGlvbiAoc3RlcCwgaW5kZXgpIHtcbiAgICAgIHZhciBzdGVwRWwgPSBjcmVhdGVTdGVwRWxlbWVudChzdGVwKTtcbiAgICAgIHByb2dyZXNzU3RlcHNDb250YWluZXIuYXBwZW5kQ2hpbGQoc3RlcEVsKTtcblxuICAgICAgaWYgKGluZGV4ID09PSBjdXJyZW50UHJvZ3Jlc3NTdGVwKSB7XG4gICAgICAgIGFkZENsYXNzKHN0ZXBFbCwgc3dhbENsYXNzZXNbJ2FjdGl2ZS1wcm9ncmVzcy1zdGVwJ10pO1xuICAgICAgfVxuXG4gICAgICBpZiAoaW5kZXggIT09IHBhcmFtcy5wcm9ncmVzc1N0ZXBzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgdmFyIGxpbmVFbCA9IGNyZWF0ZUxpbmVFbGVtZW50KHN0ZXApO1xuICAgICAgICBwcm9ncmVzc1N0ZXBzQ29udGFpbmVyLmFwcGVuZENoaWxkKGxpbmVFbCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIHJlbmRlclRpdGxlID0gZnVuY3Rpb24gcmVuZGVyVGl0bGUoaW5zdGFuY2UsIHBhcmFtcykge1xuICAgIHZhciB0aXRsZSA9IGdldFRpdGxlKCk7XG4gICAgdG9nZ2xlKHRpdGxlLCBwYXJhbXMudGl0bGUgfHwgcGFyYW1zLnRpdGxlVGV4dCk7XG5cbiAgICBpZiAocGFyYW1zLnRpdGxlKSB7XG4gICAgICBwYXJzZUh0bWxUb0NvbnRhaW5lcihwYXJhbXMudGl0bGUsIHRpdGxlKTtcbiAgICB9XG5cbiAgICBpZiAocGFyYW1zLnRpdGxlVGV4dCkge1xuICAgICAgdGl0bGUuaW5uZXJUZXh0ID0gcGFyYW1zLnRpdGxlVGV4dDtcbiAgICB9IC8vIEN1c3RvbSBjbGFzc1xuXG5cbiAgICBhcHBseUN1c3RvbUNsYXNzKHRpdGxlLCBwYXJhbXMsICd0aXRsZScpO1xuICB9O1xuXG4gIHZhciByZW5kZXJIZWFkZXIgPSBmdW5jdGlvbiByZW5kZXJIZWFkZXIoaW5zdGFuY2UsIHBhcmFtcykge1xuICAgIHZhciBoZWFkZXIgPSBnZXRIZWFkZXIoKTsgLy8gQ3VzdG9tIGNsYXNzXG5cbiAgICBhcHBseUN1c3RvbUNsYXNzKGhlYWRlciwgcGFyYW1zLCAnaGVhZGVyJyk7IC8vIFByb2dyZXNzIHN0ZXBzXG5cbiAgICByZW5kZXJQcm9ncmVzc1N0ZXBzKGluc3RhbmNlLCBwYXJhbXMpOyAvLyBJY29uXG5cbiAgICByZW5kZXJJY29uKGluc3RhbmNlLCBwYXJhbXMpOyAvLyBJbWFnZVxuXG4gICAgcmVuZGVySW1hZ2UoaW5zdGFuY2UsIHBhcmFtcyk7IC8vIFRpdGxlXG5cbiAgICByZW5kZXJUaXRsZShpbnN0YW5jZSwgcGFyYW1zKTsgLy8gQ2xvc2UgYnV0dG9uXG5cbiAgICByZW5kZXJDbG9zZUJ1dHRvbihpbnN0YW5jZSwgcGFyYW1zKTtcbiAgfTtcblxuICB2YXIgcmVuZGVyUG9wdXAgPSBmdW5jdGlvbiByZW5kZXJQb3B1cChpbnN0YW5jZSwgcGFyYW1zKSB7XG4gICAgdmFyIHBvcHVwID0gZ2V0UG9wdXAoKTsgLy8gV2lkdGhcblxuICAgIGFwcGx5TnVtZXJpY2FsU3R5bGUocG9wdXAsICd3aWR0aCcsIHBhcmFtcy53aWR0aCk7IC8vIFBhZGRpbmdcblxuICAgIGFwcGx5TnVtZXJpY2FsU3R5bGUocG9wdXAsICdwYWRkaW5nJywgcGFyYW1zLnBhZGRpbmcpOyAvLyBCYWNrZ3JvdW5kXG5cbiAgICBpZiAocGFyYW1zLmJhY2tncm91bmQpIHtcbiAgICAgIHBvcHVwLnN0eWxlLmJhY2tncm91bmQgPSBwYXJhbXMuYmFja2dyb3VuZDtcbiAgICB9IC8vIENsYXNzZXNcblxuXG4gICAgYWRkQ2xhc3Nlcyhwb3B1cCwgcGFyYW1zKTtcbiAgfTtcblxuICB2YXIgYWRkQ2xhc3NlcyA9IGZ1bmN0aW9uIGFkZENsYXNzZXMocG9wdXAsIHBhcmFtcykge1xuICAgIC8vIERlZmF1bHQgQ2xhc3MgKyBzaG93Q2xhc3Mgd2hlbiB1cGRhdGluZyBTd2FsLnVwZGF0ZSh7fSlcbiAgICBwb3B1cC5jbGFzc05hbWUgPSBcIlwiLmNvbmNhdChzd2FsQ2xhc3Nlcy5wb3B1cCwgXCIgXCIpLmNvbmNhdChpc1Zpc2libGUocG9wdXApID8gcGFyYW1zLnNob3dDbGFzcy5wb3B1cCA6ICcnKTtcblxuICAgIGlmIChwYXJhbXMudG9hc3QpIHtcbiAgICAgIGFkZENsYXNzKFtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIGRvY3VtZW50LmJvZHldLCBzd2FsQ2xhc3Nlc1sndG9hc3Qtc2hvd24nXSk7XG4gICAgICBhZGRDbGFzcyhwb3B1cCwgc3dhbENsYXNzZXMudG9hc3QpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhZGRDbGFzcyhwb3B1cCwgc3dhbENsYXNzZXMubW9kYWwpO1xuICAgIH0gLy8gQ3VzdG9tIGNsYXNzXG5cblxuICAgIGFwcGx5Q3VzdG9tQ2xhc3MocG9wdXAsIHBhcmFtcywgJ3BvcHVwJyk7XG5cbiAgICBpZiAodHlwZW9mIHBhcmFtcy5jdXN0b21DbGFzcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGFkZENsYXNzKHBvcHVwLCBwYXJhbXMuY3VzdG9tQ2xhc3MpO1xuICAgIH0gLy8gSWNvbiBjbGFzcyAoIzE4NDIpXG5cblxuICAgIGlmIChwYXJhbXMuaWNvbikge1xuICAgICAgYWRkQ2xhc3MocG9wdXAsIHN3YWxDbGFzc2VzW1wiaWNvbi1cIi5jb25jYXQocGFyYW1zLmljb24pXSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciByZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoaW5zdGFuY2UsIHBhcmFtcykge1xuICAgIHJlbmRlclBvcHVwKGluc3RhbmNlLCBwYXJhbXMpO1xuICAgIHJlbmRlckNvbnRhaW5lcihpbnN0YW5jZSwgcGFyYW1zKTtcbiAgICByZW5kZXJIZWFkZXIoaW5zdGFuY2UsIHBhcmFtcyk7XG4gICAgcmVuZGVyQ29udGVudChpbnN0YW5jZSwgcGFyYW1zKTtcbiAgICByZW5kZXJBY3Rpb25zKGluc3RhbmNlLCBwYXJhbXMpO1xuICAgIHJlbmRlckZvb3RlcihpbnN0YW5jZSwgcGFyYW1zKTtcblxuICAgIGlmICh0eXBlb2YgcGFyYW1zLm9uUmVuZGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBwYXJhbXMub25SZW5kZXIoZ2V0UG9wdXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIC8qXG4gICAqIEdsb2JhbCBmdW5jdGlvbiB0byBkZXRlcm1pbmUgaWYgU3dlZXRBbGVydDIgcG9wdXAgaXMgc2hvd25cbiAgICovXG5cbiAgdmFyIGlzVmlzaWJsZSQxID0gZnVuY3Rpb24gaXNWaXNpYmxlJCQxKCkge1xuICAgIHJldHVybiBpc1Zpc2libGUoZ2V0UG9wdXAoKSk7XG4gIH07XG4gIC8qXG4gICAqIEdsb2JhbCBmdW5jdGlvbiB0byBjbGljayAnQ29uZmlybScgYnV0dG9uXG4gICAqL1xuXG4gIHZhciBjbGlja0NvbmZpcm0gPSBmdW5jdGlvbiBjbGlja0NvbmZpcm0oKSB7XG4gICAgcmV0dXJuIGdldENvbmZpcm1CdXR0b24oKSAmJiBnZXRDb25maXJtQnV0dG9uKCkuY2xpY2soKTtcbiAgfTtcbiAgLypcbiAgICogR2xvYmFsIGZ1bmN0aW9uIHRvIGNsaWNrICdDYW5jZWwnIGJ1dHRvblxuICAgKi9cblxuICB2YXIgY2xpY2tDYW5jZWwgPSBmdW5jdGlvbiBjbGlja0NhbmNlbCgpIHtcbiAgICByZXR1cm4gZ2V0Q2FuY2VsQnV0dG9uKCkgJiYgZ2V0Q2FuY2VsQnV0dG9uKCkuY2xpY2soKTtcbiAgfTtcblxuICBmdW5jdGlvbiBmaXJlKCkge1xuICAgIHZhciBTd2FsID0gdGhpcztcblxuICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICByZXR1cm4gX2NvbnN0cnVjdChTd2FsLCBhcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGV4dGVuZGVkIHZlcnNpb24gb2YgYFN3YWxgIGNvbnRhaW5pbmcgYHBhcmFtc2AgYXMgZGVmYXVsdHMuXG4gICAqIFVzZWZ1bCBmb3IgcmV1c2luZyBTd2FsIGNvbmZpZ3VyYXRpb24uXG4gICAqXG4gICAqIEZvciBleGFtcGxlOlxuICAgKlxuICAgKiBCZWZvcmU6XG4gICAqIGNvbnN0IHRleHRQcm9tcHRPcHRpb25zID0geyBpbnB1dDogJ3RleHQnLCBzaG93Q2FuY2VsQnV0dG9uOiB0cnVlIH1cbiAgICogY29uc3Qge3ZhbHVlOiBmaXJzdE5hbWV9ID0gYXdhaXQgU3dhbC5maXJlKHsgLi4udGV4dFByb21wdE9wdGlvbnMsIHRpdGxlOiAnV2hhdCBpcyB5b3VyIGZpcnN0IG5hbWU/JyB9KVxuICAgKiBjb25zdCB7dmFsdWU6IGxhc3ROYW1lfSA9IGF3YWl0IFN3YWwuZmlyZSh7IC4uLnRleHRQcm9tcHRPcHRpb25zLCB0aXRsZTogJ1doYXQgaXMgeW91ciBsYXN0IG5hbWU/JyB9KVxuICAgKlxuICAgKiBBZnRlcjpcbiAgICogY29uc3QgVGV4dFByb21wdCA9IFN3YWwubWl4aW4oeyBpbnB1dDogJ3RleHQnLCBzaG93Q2FuY2VsQnV0dG9uOiB0cnVlIH0pXG4gICAqIGNvbnN0IHt2YWx1ZTogZmlyc3ROYW1lfSA9IGF3YWl0IFRleHRQcm9tcHQoJ1doYXQgaXMgeW91ciBmaXJzdCBuYW1lPycpXG4gICAqIGNvbnN0IHt2YWx1ZTogbGFzdE5hbWV9ID0gYXdhaXQgVGV4dFByb21wdCgnV2hhdCBpcyB5b3VyIGxhc3QgbmFtZT8nKVxuICAgKlxuICAgKiBAcGFyYW0gbWl4aW5QYXJhbXNcbiAgICovXG4gIGZ1bmN0aW9uIG1peGluKG1peGluUGFyYW1zKSB7XG4gICAgdmFyIE1peGluU3dhbCA9XG4gICAgLyojX19QVVJFX18qL1xuICAgIGZ1bmN0aW9uIChfdGhpcykge1xuICAgICAgX2luaGVyaXRzKE1peGluU3dhbCwgX3RoaXMpO1xuXG4gICAgICBmdW5jdGlvbiBNaXhpblN3YWwoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNaXhpblN3YWwpO1xuXG4gICAgICAgIHJldHVybiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCBfZ2V0UHJvdG90eXBlT2YoTWl4aW5Td2FsKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICAgIH1cblxuICAgICAgX2NyZWF0ZUNsYXNzKE1peGluU3dhbCwgW3tcbiAgICAgICAga2V5OiBcIl9tYWluXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfbWFpbihwYXJhbXMpIHtcbiAgICAgICAgICByZXR1cm4gX2dldChfZ2V0UHJvdG90eXBlT2YoTWl4aW5Td2FsLnByb3RvdHlwZSksIFwiX21haW5cIiwgdGhpcykuY2FsbCh0aGlzLCBfZXh0ZW5kcyh7fSwgbWl4aW5QYXJhbXMsIHBhcmFtcykpO1xuICAgICAgICB9XG4gICAgICB9XSk7XG5cbiAgICAgIHJldHVybiBNaXhpblN3YWw7XG4gICAgfSh0aGlzKTtcblxuICAgIHJldHVybiBNaXhpblN3YWw7XG4gIH1cblxuICAvKipcbiAgICogU2hvdyBzcGlubmVyIGluc3RlYWQgb2YgQ29uZmlybSBidXR0b25cbiAgICovXG5cbiAgdmFyIHNob3dMb2FkaW5nID0gZnVuY3Rpb24gc2hvd0xvYWRpbmcoKSB7XG4gICAgdmFyIHBvcHVwID0gZ2V0UG9wdXAoKTtcblxuICAgIGlmICghcG9wdXApIHtcbiAgICAgIFN3YWwuZmlyZSgpO1xuICAgIH1cblxuICAgIHBvcHVwID0gZ2V0UG9wdXAoKTtcbiAgICB2YXIgYWN0aW9ucyA9IGdldEFjdGlvbnMoKTtcbiAgICB2YXIgY29uZmlybUJ1dHRvbiA9IGdldENvbmZpcm1CdXR0b24oKTtcbiAgICBzaG93KGFjdGlvbnMpO1xuICAgIHNob3coY29uZmlybUJ1dHRvbiwgJ2lubGluZS1ibG9jaycpO1xuICAgIGFkZENsYXNzKFtwb3B1cCwgYWN0aW9uc10sIHN3YWxDbGFzc2VzLmxvYWRpbmcpO1xuICAgIGNvbmZpcm1CdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuICAgIHBvcHVwLnNldEF0dHJpYnV0ZSgnZGF0YS1sb2FkaW5nJywgdHJ1ZSk7XG4gICAgcG9wdXAuc2V0QXR0cmlidXRlKCdhcmlhLWJ1c3knLCB0cnVlKTtcbiAgICBwb3B1cC5mb2N1cygpO1xuICB9O1xuXG4gIHZhciBSRVNUT1JFX0ZPQ1VTX1RJTUVPVVQgPSAxMDA7XG5cbiAgdmFyIGdsb2JhbFN0YXRlID0ge307XG5cbiAgdmFyIGZvY3VzUHJldmlvdXNBY3RpdmVFbGVtZW50ID0gZnVuY3Rpb24gZm9jdXNQcmV2aW91c0FjdGl2ZUVsZW1lbnQoKSB7XG4gICAgaWYgKGdsb2JhbFN0YXRlLnByZXZpb3VzQWN0aXZlRWxlbWVudCAmJiBnbG9iYWxTdGF0ZS5wcmV2aW91c0FjdGl2ZUVsZW1lbnQuZm9jdXMpIHtcbiAgICAgIGdsb2JhbFN0YXRlLnByZXZpb3VzQWN0aXZlRWxlbWVudC5mb2N1cygpO1xuICAgICAgZ2xvYmFsU3RhdGUucHJldmlvdXNBY3RpdmVFbGVtZW50ID0gbnVsbDtcbiAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmJvZHkpIHtcbiAgICAgIGRvY3VtZW50LmJvZHkuZm9jdXMoKTtcbiAgICB9XG4gIH07IC8vIFJlc3RvcmUgcHJldmlvdXMgYWN0aXZlIChmb2N1c2VkKSBlbGVtZW50XG5cblxuICB2YXIgcmVzdG9yZUFjdGl2ZUVsZW1lbnQgPSBmdW5jdGlvbiByZXN0b3JlQWN0aXZlRWxlbWVudCgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgIHZhciB4ID0gd2luZG93LnNjcm9sbFg7XG4gICAgICB2YXIgeSA9IHdpbmRvdy5zY3JvbGxZO1xuICAgICAgZ2xvYmFsU3RhdGUucmVzdG9yZUZvY3VzVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBmb2N1c1ByZXZpb3VzQWN0aXZlRWxlbWVudCgpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9LCBSRVNUT1JFX0ZPQ1VTX1RJTUVPVVQpOyAvLyBpc3N1ZXMvOTAwXG5cbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXG4gICAgICBpZiAodHlwZW9mIHggIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB5ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAvLyBJRSBkb2Vzbid0IGhhdmUgc2Nyb2xsWC9zY3JvbGxZIHN1cHBvcnRcbiAgICAgICAgd2luZG93LnNjcm9sbFRvKHgsIHkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJZiBgdGltZXJgIHBhcmFtZXRlciBpcyBzZXQsIHJldHVybnMgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvZiB0aW1lciByZW1haW5lZC5cbiAgICogT3RoZXJ3aXNlLCByZXR1cm5zIHVuZGVmaW5lZC5cbiAgICovXG5cbiAgdmFyIGdldFRpbWVyTGVmdCA9IGZ1bmN0aW9uIGdldFRpbWVyTGVmdCgpIHtcbiAgICByZXR1cm4gZ2xvYmFsU3RhdGUudGltZW91dCAmJiBnbG9iYWxTdGF0ZS50aW1lb3V0LmdldFRpbWVyTGVmdCgpO1xuICB9O1xuICAvKipcbiAgICogU3RvcCB0aW1lci4gUmV0dXJucyBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9mIHRpbWVyIHJlbWFpbmVkLlxuICAgKiBJZiBgdGltZXJgIHBhcmFtZXRlciBpc24ndCBzZXQsIHJldHVybnMgdW5kZWZpbmVkLlxuICAgKi9cblxuICB2YXIgc3RvcFRpbWVyID0gZnVuY3Rpb24gc3RvcFRpbWVyKCkge1xuICAgIGlmIChnbG9iYWxTdGF0ZS50aW1lb3V0KSB7XG4gICAgICBzdG9wVGltZXJQcm9ncmVzc0JhcigpO1xuICAgICAgcmV0dXJuIGdsb2JhbFN0YXRlLnRpbWVvdXQuc3RvcCgpO1xuICAgIH1cbiAgfTtcbiAgLyoqXG4gICAqIFJlc3VtZSB0aW1lci4gUmV0dXJucyBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9mIHRpbWVyIHJlbWFpbmVkLlxuICAgKiBJZiBgdGltZXJgIHBhcmFtZXRlciBpc24ndCBzZXQsIHJldHVybnMgdW5kZWZpbmVkLlxuICAgKi9cblxuICB2YXIgcmVzdW1lVGltZXIgPSBmdW5jdGlvbiByZXN1bWVUaW1lcigpIHtcbiAgICBpZiAoZ2xvYmFsU3RhdGUudGltZW91dCkge1xuICAgICAgdmFyIHJlbWFpbmluZyA9IGdsb2JhbFN0YXRlLnRpbWVvdXQuc3RhcnQoKTtcbiAgICAgIGFuaW1hdGVUaW1lclByb2dyZXNzQmFyKHJlbWFpbmluZyk7XG4gICAgICByZXR1cm4gcmVtYWluaW5nO1xuICAgIH1cbiAgfTtcbiAgLyoqXG4gICAqIFJlc3VtZSB0aW1lci4gUmV0dXJucyBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9mIHRpbWVyIHJlbWFpbmVkLlxuICAgKiBJZiBgdGltZXJgIHBhcmFtZXRlciBpc24ndCBzZXQsIHJldHVybnMgdW5kZWZpbmVkLlxuICAgKi9cblxuICB2YXIgdG9nZ2xlVGltZXIgPSBmdW5jdGlvbiB0b2dnbGVUaW1lcigpIHtcbiAgICB2YXIgdGltZXIgPSBnbG9iYWxTdGF0ZS50aW1lb3V0O1xuICAgIHJldHVybiB0aW1lciAmJiAodGltZXIucnVubmluZyA/IHN0b3BUaW1lcigpIDogcmVzdW1lVGltZXIoKSk7XG4gIH07XG4gIC8qKlxuICAgKiBJbmNyZWFzZSB0aW1lci4gUmV0dXJucyBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9mIGFuIHVwZGF0ZWQgdGltZXIuXG4gICAqIElmIGB0aW1lcmAgcGFyYW1ldGVyIGlzbid0IHNldCwgcmV0dXJucyB1bmRlZmluZWQuXG4gICAqL1xuXG4gIHZhciBpbmNyZWFzZVRpbWVyID0gZnVuY3Rpb24gaW5jcmVhc2VUaW1lcihuKSB7XG4gICAgaWYgKGdsb2JhbFN0YXRlLnRpbWVvdXQpIHtcbiAgICAgIHZhciByZW1haW5pbmcgPSBnbG9iYWxTdGF0ZS50aW1lb3V0LmluY3JlYXNlKG4pO1xuICAgICAgYW5pbWF0ZVRpbWVyUHJvZ3Jlc3NCYXIocmVtYWluaW5nLCB0cnVlKTtcbiAgICAgIHJldHVybiByZW1haW5pbmc7XG4gICAgfVxuICB9O1xuICAvKipcbiAgICogQ2hlY2sgaWYgdGltZXIgaXMgcnVubmluZy4gUmV0dXJucyB0cnVlIGlmIHRpbWVyIGlzIHJ1bm5pbmdcbiAgICogb3IgZmFsc2UgaWYgdGltZXIgaXMgcGF1c2VkIG9yIHN0b3BwZWQuXG4gICAqIElmIGB0aW1lcmAgcGFyYW1ldGVyIGlzbid0IHNldCwgcmV0dXJucyB1bmRlZmluZWRcbiAgICovXG5cbiAgdmFyIGlzVGltZXJSdW5uaW5nID0gZnVuY3Rpb24gaXNUaW1lclJ1bm5pbmcoKSB7XG4gICAgcmV0dXJuIGdsb2JhbFN0YXRlLnRpbWVvdXQgJiYgZ2xvYmFsU3RhdGUudGltZW91dC5pc1J1bm5pbmcoKTtcbiAgfTtcblxuICB2YXIgZGVmYXVsdFBhcmFtcyA9IHtcbiAgICB0aXRsZTogJycsXG4gICAgdGl0bGVUZXh0OiAnJyxcbiAgICB0ZXh0OiAnJyxcbiAgICBodG1sOiAnJyxcbiAgICBmb290ZXI6ICcnLFxuICAgIGljb246IHVuZGVmaW5lZCxcbiAgICBpY29uSHRtbDogdW5kZWZpbmVkLFxuICAgIHRvYXN0OiBmYWxzZSxcbiAgICBhbmltYXRpb246IHRydWUsXG4gICAgc2hvd0NsYXNzOiB7XG4gICAgICBwb3B1cDogJ3N3YWwyLXNob3cnLFxuICAgICAgYmFja2Ryb3A6ICdzd2FsMi1iYWNrZHJvcC1zaG93JyxcbiAgICAgIGljb246ICdzd2FsMi1pY29uLXNob3cnXG4gICAgfSxcbiAgICBoaWRlQ2xhc3M6IHtcbiAgICAgIHBvcHVwOiAnc3dhbDItaGlkZScsXG4gICAgICBiYWNrZHJvcDogJ3N3YWwyLWJhY2tkcm9wLWhpZGUnLFxuICAgICAgaWNvbjogJ3N3YWwyLWljb24taGlkZSdcbiAgICB9LFxuICAgIGN1c3RvbUNsYXNzOiB1bmRlZmluZWQsXG4gICAgdGFyZ2V0OiAnYm9keScsXG4gICAgYmFja2Ryb3A6IHRydWUsXG4gICAgaGVpZ2h0QXV0bzogdHJ1ZSxcbiAgICBhbGxvd091dHNpZGVDbGljazogdHJ1ZSxcbiAgICBhbGxvd0VzY2FwZUtleTogdHJ1ZSxcbiAgICBhbGxvd0VudGVyS2V5OiB0cnVlLFxuICAgIHN0b3BLZXlkb3duUHJvcGFnYXRpb246IHRydWUsXG4gICAga2V5ZG93bkxpc3RlbmVyQ2FwdHVyZTogZmFsc2UsXG4gICAgc2hvd0NvbmZpcm1CdXR0b246IHRydWUsXG4gICAgc2hvd0NhbmNlbEJ1dHRvbjogZmFsc2UsXG4gICAgcHJlQ29uZmlybTogdW5kZWZpbmVkLFxuICAgIGNvbmZpcm1CdXR0b25UZXh0OiAnT0snLFxuICAgIGNvbmZpcm1CdXR0b25BcmlhTGFiZWw6ICcnLFxuICAgIGNvbmZpcm1CdXR0b25Db2xvcjogdW5kZWZpbmVkLFxuICAgIGNhbmNlbEJ1dHRvblRleHQ6ICdDYW5jZWwnLFxuICAgIGNhbmNlbEJ1dHRvbkFyaWFMYWJlbDogJycsXG4gICAgY2FuY2VsQnV0dG9uQ29sb3I6IHVuZGVmaW5lZCxcbiAgICBidXR0b25zU3R5bGluZzogdHJ1ZSxcbiAgICByZXZlcnNlQnV0dG9uczogZmFsc2UsXG4gICAgZm9jdXNDb25maXJtOiB0cnVlLFxuICAgIGZvY3VzQ2FuY2VsOiBmYWxzZSxcbiAgICBzaG93Q2xvc2VCdXR0b246IGZhbHNlLFxuICAgIGNsb3NlQnV0dG9uSHRtbDogJyZ0aW1lczsnLFxuICAgIGNsb3NlQnV0dG9uQXJpYUxhYmVsOiAnQ2xvc2UgdGhpcyBkaWFsb2cnLFxuICAgIHNob3dMb2FkZXJPbkNvbmZpcm06IGZhbHNlLFxuICAgIGltYWdlVXJsOiB1bmRlZmluZWQsXG4gICAgaW1hZ2VXaWR0aDogdW5kZWZpbmVkLFxuICAgIGltYWdlSGVpZ2h0OiB1bmRlZmluZWQsXG4gICAgaW1hZ2VBbHQ6ICcnLFxuICAgIHRpbWVyOiB1bmRlZmluZWQsXG4gICAgdGltZXJQcm9ncmVzc0JhcjogZmFsc2UsXG4gICAgd2lkdGg6IHVuZGVmaW5lZCxcbiAgICBwYWRkaW5nOiB1bmRlZmluZWQsXG4gICAgYmFja2dyb3VuZDogdW5kZWZpbmVkLFxuICAgIGlucHV0OiB1bmRlZmluZWQsXG4gICAgaW5wdXRQbGFjZWhvbGRlcjogJycsXG4gICAgaW5wdXRWYWx1ZTogJycsXG4gICAgaW5wdXRPcHRpb25zOiB7fSxcbiAgICBpbnB1dEF1dG9UcmltOiB0cnVlLFxuICAgIGlucHV0QXR0cmlidXRlczoge30sXG4gICAgaW5wdXRWYWxpZGF0b3I6IHVuZGVmaW5lZCxcbiAgICB2YWxpZGF0aW9uTWVzc2FnZTogdW5kZWZpbmVkLFxuICAgIGdyb3c6IGZhbHNlLFxuICAgIHBvc2l0aW9uOiAnY2VudGVyJyxcbiAgICBwcm9ncmVzc1N0ZXBzOiBbXSxcbiAgICBjdXJyZW50UHJvZ3Jlc3NTdGVwOiB1bmRlZmluZWQsXG4gICAgcHJvZ3Jlc3NTdGVwc0Rpc3RhbmNlOiB1bmRlZmluZWQsXG4gICAgb25CZWZvcmVPcGVuOiB1bmRlZmluZWQsXG4gICAgb25PcGVuOiB1bmRlZmluZWQsXG4gICAgb25SZW5kZXI6IHVuZGVmaW5lZCxcbiAgICBvbkNsb3NlOiB1bmRlZmluZWQsXG4gICAgb25BZnRlckNsb3NlOiB1bmRlZmluZWQsXG4gICAgb25EZXN0cm95OiB1bmRlZmluZWQsXG4gICAgc2Nyb2xsYmFyUGFkZGluZzogdHJ1ZVxuICB9O1xuICB2YXIgdXBkYXRhYmxlUGFyYW1zID0gWyd0aXRsZScsICd0aXRsZVRleHQnLCAndGV4dCcsICdodG1sJywgJ2ljb24nLCAnY3VzdG9tQ2xhc3MnLCAnYWxsb3dPdXRzaWRlQ2xpY2snLCAnYWxsb3dFc2NhcGVLZXknLCAnc2hvd0NvbmZpcm1CdXR0b24nLCAnc2hvd0NhbmNlbEJ1dHRvbicsICdjb25maXJtQnV0dG9uVGV4dCcsICdjb25maXJtQnV0dG9uQXJpYUxhYmVsJywgJ2NvbmZpcm1CdXR0b25Db2xvcicsICdjYW5jZWxCdXR0b25UZXh0JywgJ2NhbmNlbEJ1dHRvbkFyaWFMYWJlbCcsICdjYW5jZWxCdXR0b25Db2xvcicsICdidXR0b25zU3R5bGluZycsICdyZXZlcnNlQnV0dG9ucycsICdpbWFnZVVybCcsICdpbWFnZVdpZHRoJywgJ2ltYWdlSGVpZ2h0JywgJ2ltYWdlQWx0JywgJ3Byb2dyZXNzU3RlcHMnLCAnY3VycmVudFByb2dyZXNzU3RlcCddO1xuICB2YXIgZGVwcmVjYXRlZFBhcmFtcyA9IHtcbiAgICBhbmltYXRpb246ICdzaG93Q2xhc3NcIiBhbmQgXCJoaWRlQ2xhc3MnXG4gIH07XG4gIHZhciB0b2FzdEluY29tcGF0aWJsZVBhcmFtcyA9IFsnYWxsb3dPdXRzaWRlQ2xpY2snLCAnYWxsb3dFbnRlcktleScsICdiYWNrZHJvcCcsICdmb2N1c0NvbmZpcm0nLCAnZm9jdXNDYW5jZWwnLCAnaGVpZ2h0QXV0bycsICdrZXlkb3duTGlzdGVuZXJDYXB0dXJlJ107XG4gIC8qKlxuICAgKiBJcyB2YWxpZCBwYXJhbWV0ZXJcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmFtTmFtZVxuICAgKi9cblxuICB2YXIgaXNWYWxpZFBhcmFtZXRlciA9IGZ1bmN0aW9uIGlzVmFsaWRQYXJhbWV0ZXIocGFyYW1OYW1lKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChkZWZhdWx0UGFyYW1zLCBwYXJhbU5hbWUpO1xuICB9O1xuICAvKipcbiAgICogSXMgdmFsaWQgcGFyYW1ldGVyIGZvciBTd2FsLnVwZGF0ZSgpIG1ldGhvZFxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGFyYW1OYW1lXG4gICAqL1xuXG4gIHZhciBpc1VwZGF0YWJsZVBhcmFtZXRlciA9IGZ1bmN0aW9uIGlzVXBkYXRhYmxlUGFyYW1ldGVyKHBhcmFtTmFtZSkge1xuICAgIHJldHVybiB1cGRhdGFibGVQYXJhbXMuaW5kZXhPZihwYXJhbU5hbWUpICE9PSAtMTtcbiAgfTtcbiAgLyoqXG4gICAqIElzIGRlcHJlY2F0ZWQgcGFyYW1ldGVyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXJhbU5hbWVcbiAgICovXG5cbiAgdmFyIGlzRGVwcmVjYXRlZFBhcmFtZXRlciA9IGZ1bmN0aW9uIGlzRGVwcmVjYXRlZFBhcmFtZXRlcihwYXJhbU5hbWUpIHtcbiAgICByZXR1cm4gZGVwcmVjYXRlZFBhcmFtc1twYXJhbU5hbWVdO1xuICB9O1xuXG4gIHZhciBjaGVja0lmUGFyYW1Jc1ZhbGlkID0gZnVuY3Rpb24gY2hlY2tJZlBhcmFtSXNWYWxpZChwYXJhbSkge1xuICAgIGlmICghaXNWYWxpZFBhcmFtZXRlcihwYXJhbSkpIHtcbiAgICAgIHdhcm4oXCJVbmtub3duIHBhcmFtZXRlciBcXFwiXCIuY29uY2F0KHBhcmFtLCBcIlxcXCJcIikpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgY2hlY2tJZlRvYXN0UGFyYW1Jc1ZhbGlkID0gZnVuY3Rpb24gY2hlY2tJZlRvYXN0UGFyYW1Jc1ZhbGlkKHBhcmFtKSB7XG4gICAgaWYgKHRvYXN0SW5jb21wYXRpYmxlUGFyYW1zLmluZGV4T2YocGFyYW0pICE9PSAtMSkge1xuICAgICAgd2FybihcIlRoZSBwYXJhbWV0ZXIgXFxcIlwiLmNvbmNhdChwYXJhbSwgXCJcXFwiIGlzIGluY29tcGF0aWJsZSB3aXRoIHRvYXN0c1wiKSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBjaGVja0lmUGFyYW1Jc0RlcHJlY2F0ZWQgPSBmdW5jdGlvbiBjaGVja0lmUGFyYW1Jc0RlcHJlY2F0ZWQocGFyYW0pIHtcbiAgICBpZiAoaXNEZXByZWNhdGVkUGFyYW1ldGVyKHBhcmFtKSkge1xuICAgICAgd2FybkFib3V0RGVwcmVhdGlvbihwYXJhbSwgaXNEZXByZWNhdGVkUGFyYW1ldGVyKHBhcmFtKSk7XG4gICAgfVxuICB9O1xuICAvKipcbiAgICogU2hvdyByZWxldmFudCB3YXJuaW5ncyBmb3IgZ2l2ZW4gcGFyYW1zXG4gICAqXG4gICAqIEBwYXJhbSBwYXJhbXNcbiAgICovXG5cblxuICB2YXIgc2hvd1dhcm5pbmdzRm9yUGFyYW1zID0gZnVuY3Rpb24gc2hvd1dhcm5pbmdzRm9yUGFyYW1zKHBhcmFtcykge1xuICAgIGZvciAodmFyIHBhcmFtIGluIHBhcmFtcykge1xuICAgICAgY2hlY2tJZlBhcmFtSXNWYWxpZChwYXJhbSk7XG5cbiAgICAgIGlmIChwYXJhbXMudG9hc3QpIHtcbiAgICAgICAgY2hlY2tJZlRvYXN0UGFyYW1Jc1ZhbGlkKHBhcmFtKTtcbiAgICAgIH1cblxuICAgICAgY2hlY2tJZlBhcmFtSXNEZXByZWNhdGVkKHBhcmFtKTtcbiAgICB9XG4gIH07XG5cblxuXG4gIHZhciBzdGF0aWNNZXRob2RzID0gLyojX19QVVJFX18qL09iamVjdC5mcmVlemUoe1xuICAgIGlzVmFsaWRQYXJhbWV0ZXI6IGlzVmFsaWRQYXJhbWV0ZXIsXG4gICAgaXNVcGRhdGFibGVQYXJhbWV0ZXI6IGlzVXBkYXRhYmxlUGFyYW1ldGVyLFxuICAgIGlzRGVwcmVjYXRlZFBhcmFtZXRlcjogaXNEZXByZWNhdGVkUGFyYW1ldGVyLFxuICAgIGFyZ3NUb1BhcmFtczogYXJnc1RvUGFyYW1zLFxuICAgIGlzVmlzaWJsZTogaXNWaXNpYmxlJDEsXG4gICAgY2xpY2tDb25maXJtOiBjbGlja0NvbmZpcm0sXG4gICAgY2xpY2tDYW5jZWw6IGNsaWNrQ2FuY2VsLFxuICAgIGdldENvbnRhaW5lcjogZ2V0Q29udGFpbmVyLFxuICAgIGdldFBvcHVwOiBnZXRQb3B1cCxcbiAgICBnZXRUaXRsZTogZ2V0VGl0bGUsXG4gICAgZ2V0Q29udGVudDogZ2V0Q29udGVudCxcbiAgICBnZXRIdG1sQ29udGFpbmVyOiBnZXRIdG1sQ29udGFpbmVyLFxuICAgIGdldEltYWdlOiBnZXRJbWFnZSxcbiAgICBnZXRJY29uOiBnZXRJY29uLFxuICAgIGdldEljb25zOiBnZXRJY29ucyxcbiAgICBnZXRDbG9zZUJ1dHRvbjogZ2V0Q2xvc2VCdXR0b24sXG4gICAgZ2V0QWN0aW9uczogZ2V0QWN0aW9ucyxcbiAgICBnZXRDb25maXJtQnV0dG9uOiBnZXRDb25maXJtQnV0dG9uLFxuICAgIGdldENhbmNlbEJ1dHRvbjogZ2V0Q2FuY2VsQnV0dG9uLFxuICAgIGdldEhlYWRlcjogZ2V0SGVhZGVyLFxuICAgIGdldEZvb3RlcjogZ2V0Rm9vdGVyLFxuICAgIGdldFRpbWVyUHJvZ3Jlc3NCYXI6IGdldFRpbWVyUHJvZ3Jlc3NCYXIsXG4gICAgZ2V0Rm9jdXNhYmxlRWxlbWVudHM6IGdldEZvY3VzYWJsZUVsZW1lbnRzLFxuICAgIGdldFZhbGlkYXRpb25NZXNzYWdlOiBnZXRWYWxpZGF0aW9uTWVzc2FnZSxcbiAgICBpc0xvYWRpbmc6IGlzTG9hZGluZyxcbiAgICBmaXJlOiBmaXJlLFxuICAgIG1peGluOiBtaXhpbixcbiAgICBxdWV1ZTogcXVldWUsXG4gICAgZ2V0UXVldWVTdGVwOiBnZXRRdWV1ZVN0ZXAsXG4gICAgaW5zZXJ0UXVldWVTdGVwOiBpbnNlcnRRdWV1ZVN0ZXAsXG4gICAgZGVsZXRlUXVldWVTdGVwOiBkZWxldGVRdWV1ZVN0ZXAsXG4gICAgc2hvd0xvYWRpbmc6IHNob3dMb2FkaW5nLFxuICAgIGVuYWJsZUxvYWRpbmc6IHNob3dMb2FkaW5nLFxuICAgIGdldFRpbWVyTGVmdDogZ2V0VGltZXJMZWZ0LFxuICAgIHN0b3BUaW1lcjogc3RvcFRpbWVyLFxuICAgIHJlc3VtZVRpbWVyOiByZXN1bWVUaW1lcixcbiAgICB0b2dnbGVUaW1lcjogdG9nZ2xlVGltZXIsXG4gICAgaW5jcmVhc2VUaW1lcjogaW5jcmVhc2VUaW1lcixcbiAgICBpc1RpbWVyUnVubmluZzogaXNUaW1lclJ1bm5pbmdcbiAgfSk7XG5cbiAgLyoqXG4gICAqIEVuYWJsZXMgYnV0dG9ucyBhbmQgaGlkZSBsb2FkZXIuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGhpZGVMb2FkaW5nKCkge1xuICAgIC8vIGRvIG5vdGhpbmcgaWYgcG9wdXAgaXMgY2xvc2VkXG4gICAgdmFyIGlubmVyUGFyYW1zID0gcHJpdmF0ZVByb3BzLmlubmVyUGFyYW1zLmdldCh0aGlzKTtcblxuICAgIGlmICghaW5uZXJQYXJhbXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZG9tQ2FjaGUgPSBwcml2YXRlUHJvcHMuZG9tQ2FjaGUuZ2V0KHRoaXMpO1xuXG4gICAgaWYgKCFpbm5lclBhcmFtcy5zaG93Q29uZmlybUJ1dHRvbikge1xuICAgICAgaGlkZShkb21DYWNoZS5jb25maXJtQnV0dG9uKTtcblxuICAgICAgaWYgKCFpbm5lclBhcmFtcy5zaG93Q2FuY2VsQnV0dG9uKSB7XG4gICAgICAgIGhpZGUoZG9tQ2FjaGUuYWN0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVtb3ZlQ2xhc3MoW2RvbUNhY2hlLnBvcHVwLCBkb21DYWNoZS5hY3Rpb25zXSwgc3dhbENsYXNzZXMubG9hZGluZyk7XG4gICAgZG9tQ2FjaGUucG9wdXAucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWJ1c3knKTtcbiAgICBkb21DYWNoZS5wb3B1cC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtbG9hZGluZycpO1xuICAgIGRvbUNhY2hlLmNvbmZpcm1CdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBkb21DYWNoZS5jYW5jZWxCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldElucHV0JDEoaW5zdGFuY2UpIHtcbiAgICB2YXIgaW5uZXJQYXJhbXMgPSBwcml2YXRlUHJvcHMuaW5uZXJQYXJhbXMuZ2V0KGluc3RhbmNlIHx8IHRoaXMpO1xuICAgIHZhciBkb21DYWNoZSA9IHByaXZhdGVQcm9wcy5kb21DYWNoZS5nZXQoaW5zdGFuY2UgfHwgdGhpcyk7XG5cbiAgICBpZiAoIWRvbUNhY2hlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0SW5wdXQoZG9tQ2FjaGUuY29udGVudCwgaW5uZXJQYXJhbXMuaW5wdXQpO1xuICB9XG5cbiAgdmFyIGZpeFNjcm9sbGJhciA9IGZ1bmN0aW9uIGZpeFNjcm9sbGJhcigpIHtcbiAgICAvLyBmb3IgcXVldWVzLCBkbyBub3QgZG8gdGhpcyBtb3JlIHRoYW4gb25jZVxuICAgIGlmIChzdGF0ZXMucHJldmlvdXNCb2R5UGFkZGluZyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gLy8gaWYgdGhlIGJvZHkgaGFzIG92ZXJmbG93XG5cblxuICAgIGlmIChkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xuICAgICAgLy8gYWRkIHBhZGRpbmcgc28gdGhlIGNvbnRlbnQgZG9lc24ndCBzaGlmdCBhZnRlciByZW1vdmFsIG9mIHNjcm9sbGJhclxuICAgICAgc3RhdGVzLnByZXZpb3VzQm9keVBhZGRpbmcgPSBwYXJzZUludCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5KS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLXJpZ2h0JykpO1xuICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5wYWRkaW5nUmlnaHQgPSBcIlwiLmNvbmNhdChzdGF0ZXMucHJldmlvdXNCb2R5UGFkZGluZyArIG1lYXN1cmVTY3JvbGxiYXIoKSwgXCJweFwiKTtcbiAgICB9XG4gIH07XG4gIHZhciB1bmRvU2Nyb2xsYmFyID0gZnVuY3Rpb24gdW5kb1Njcm9sbGJhcigpIHtcbiAgICBpZiAoc3RhdGVzLnByZXZpb3VzQm9keVBhZGRpbmcgIT09IG51bGwpIHtcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0ID0gXCJcIi5jb25jYXQoc3RhdGVzLnByZXZpb3VzQm9keVBhZGRpbmcsIFwicHhcIik7XG4gICAgICBzdGF0ZXMucHJldmlvdXNCb2R5UGFkZGluZyA9IG51bGw7XG4gICAgfVxuICB9O1xuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBmaWxlICovXG5cbiAgdmFyIGlPU2ZpeCA9IGZ1bmN0aW9uIGlPU2ZpeCgpIHtcbiAgICB2YXIgaU9TID0gL2lQYWR8aVBob25lfGlQb2QvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiYgIXdpbmRvdy5NU1N0cmVhbSB8fCBuYXZpZ2F0b3IucGxhdGZvcm0gPT09ICdNYWNJbnRlbCcgJiYgbmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzID4gMTtcblxuICAgIGlmIChpT1MgJiYgIWhhc0NsYXNzKGRvY3VtZW50LmJvZHksIHN3YWxDbGFzc2VzLmlvc2ZpeCkpIHtcbiAgICAgIHZhciBvZmZzZXQgPSBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUudG9wID0gXCJcIi5jb25jYXQob2Zmc2V0ICogLTEsIFwicHhcIik7XG4gICAgICBhZGRDbGFzcyhkb2N1bWVudC5ib2R5LCBzd2FsQ2xhc3Nlcy5pb3NmaXgpO1xuICAgICAgbG9ja0JvZHlTY3JvbGwoKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGxvY2tCb2R5U2Nyb2xsID0gZnVuY3Rpb24gbG9ja0JvZHlTY3JvbGwoKSB7XG4gICAgLy8gIzEyNDZcbiAgICB2YXIgY29udGFpbmVyID0gZ2V0Q29udGFpbmVyKCk7XG4gICAgdmFyIHByZXZlbnRUb3VjaE1vdmU7XG5cbiAgICBjb250YWluZXIub250b3VjaHN0YXJ0ID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgIHByZXZlbnRUb3VjaE1vdmUgPSBlLnRhcmdldCA9PT0gY29udGFpbmVyIHx8ICFpc1Njcm9sbGFibGUoY29udGFpbmVyKSAmJiBlLnRhcmdldC50YWdOYW1lICE9PSAnSU5QVVQnIC8vICMxNjAzXG4gICAgICA7XG4gICAgfTtcblxuICAgIGNvbnRhaW5lci5vbnRvdWNobW92ZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBpZiAocHJldmVudFRvdWNoTW92ZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICB2YXIgdW5kb0lPU2ZpeCA9IGZ1bmN0aW9uIHVuZG9JT1NmaXgoKSB7XG4gICAgaWYgKGhhc0NsYXNzKGRvY3VtZW50LmJvZHksIHN3YWxDbGFzc2VzLmlvc2ZpeCkpIHtcbiAgICAgIHZhciBvZmZzZXQgPSBwYXJzZUludChkb2N1bWVudC5ib2R5LnN0eWxlLnRvcCwgMTApO1xuICAgICAgcmVtb3ZlQ2xhc3MoZG9jdW1lbnQuYm9keSwgc3dhbENsYXNzZXMuaW9zZml4KTtcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUudG9wID0gJyc7XG4gICAgICBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA9IG9mZnNldCAqIC0xO1xuICAgIH1cbiAgfTtcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZmlsZSAqL1xuXG4gIHZhciBpc0lFMTEgPSBmdW5jdGlvbiBpc0lFMTEoKSB7XG4gICAgcmV0dXJuICEhd2luZG93Lk1TSW5wdXRNZXRob2RDb250ZXh0ICYmICEhZG9jdW1lbnQuZG9jdW1lbnRNb2RlO1xuICB9OyAvLyBGaXggSUUxMSBjZW50ZXJpbmcgc3dlZXRhbGVydDIvaXNzdWVzLzkzM1xuXG5cbiAgdmFyIGZpeFZlcnRpY2FsUG9zaXRpb25JRSA9IGZ1bmN0aW9uIGZpeFZlcnRpY2FsUG9zaXRpb25JRSgpIHtcbiAgICB2YXIgY29udGFpbmVyID0gZ2V0Q29udGFpbmVyKCk7XG4gICAgdmFyIHBvcHVwID0gZ2V0UG9wdXAoKTtcbiAgICBjb250YWluZXIuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ2FsaWduLWl0ZW1zJyk7XG5cbiAgICBpZiAocG9wdXAub2Zmc2V0VG9wIDwgMCkge1xuICAgICAgY29udGFpbmVyLnN0eWxlLmFsaWduSXRlbXMgPSAnZmxleC1zdGFydCc7XG4gICAgfVxuICB9O1xuXG4gIHZhciBJRWZpeCA9IGZ1bmN0aW9uIElFZml4KCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiBpc0lFMTEoKSkge1xuICAgICAgZml4VmVydGljYWxQb3NpdGlvbklFKCk7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZml4VmVydGljYWxQb3NpdGlvbklFKTtcbiAgICB9XG4gIH07XG4gIHZhciB1bmRvSUVmaXggPSBmdW5jdGlvbiB1bmRvSUVmaXgoKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIGlzSUUxMSgpKSB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZml4VmVydGljYWxQb3NpdGlvbklFKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gQWRkaW5nIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIHRvIGVsZW1lbnRzIG91dHNpZGUgb2YgdGhlIGFjdGl2ZSBtb2RhbCBkaWFsb2cgZW5zdXJlcyB0aGF0XG4gIC8vIGVsZW1lbnRzIG5vdCB3aXRoaW4gdGhlIGFjdGl2ZSBtb2RhbCBkaWFsb2cgd2lsbCBub3QgYmUgc3VyZmFjZWQgaWYgYSB1c2VyIG9wZW5zIGEgc2NyZWVuXG4gIC8vIHJlYWRlcuKAmXMgbGlzdCBvZiBlbGVtZW50cyAoaGVhZGluZ3MsIGZvcm0gY29udHJvbHMsIGxhbmRtYXJrcywgZXRjLikgaW4gdGhlIGRvY3VtZW50LlxuXG4gIHZhciBzZXRBcmlhSGlkZGVuID0gZnVuY3Rpb24gc2V0QXJpYUhpZGRlbigpIHtcbiAgICB2YXIgYm9keUNoaWxkcmVuID0gdG9BcnJheShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAgICBib2R5Q2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgIGlmIChlbCA9PT0gZ2V0Q29udGFpbmVyKCkgfHwgY29udGFpbnMoZWwsIGdldENvbnRhaW5lcigpKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJykpIHtcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKCdkYXRhLXByZXZpb3VzLWFyaWEtaGlkZGVuJywgZWwuZ2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicpKTtcbiAgICAgIH1cblxuICAgICAgZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgfSk7XG4gIH07XG4gIHZhciB1bnNldEFyaWFIaWRkZW4gPSBmdW5jdGlvbiB1bnNldEFyaWFIaWRkZW4oKSB7XG4gICAgdmFyIGJvZHlDaGlsZHJlbiA9IHRvQXJyYXkoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gICAgYm9keUNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICBpZiAoZWwuaGFzQXR0cmlidXRlKCdkYXRhLXByZXZpb3VzLWFyaWEtaGlkZGVuJykpIHtcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1wcmV2aW91cy1hcmlhLWhpZGRlbicpKTtcbiAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXByZXZpb3VzLWFyaWEtaGlkZGVuJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRoaXMgbW9kdWxlIGNvbnRhaW50cyBgV2Vha01hcGBzIGZvciBlYWNoIGVmZmVjdGl2ZWx5LVwicHJpdmF0ZSAgcHJvcGVydHlcIiB0aGF0IGEgYFN3YWxgIGhhcy5cbiAgICogRm9yIGV4YW1wbGUsIHRvIHNldCB0aGUgcHJpdmF0ZSBwcm9wZXJ0eSBcImZvb1wiIG9mIGB0aGlzYCB0byBcImJhclwiLCB5b3UgY2FuIGBwcml2YXRlUHJvcHMuZm9vLnNldCh0aGlzLCAnYmFyJylgXG4gICAqIFRoaXMgaXMgdGhlIGFwcHJvYWNoIHRoYXQgQmFiZWwgd2lsbCBwcm9iYWJseSB0YWtlIHRvIGltcGxlbWVudCBwcml2YXRlIG1ldGhvZHMvZmllbGRzXG4gICAqICAgaHR0cHM6Ly9naXRodWIuY29tL3RjMzkvcHJvcG9zYWwtcHJpdmF0ZS1tZXRob2RzXG4gICAqICAgaHR0cHM6Ly9naXRodWIuY29tL2JhYmVsL2JhYmVsL3B1bGwvNzU1NVxuICAgKiBPbmNlIHdlIGhhdmUgdGhlIGNoYW5nZXMgZnJvbSB0aGF0IFBSIGluIEJhYmVsLCBhbmQgb3VyIGNvcmUgY2xhc3MgZml0cyByZWFzb25hYmxlIGluICpvbmUgbW9kdWxlKlxuICAgKiAgIHRoZW4gd2UgY2FuIHVzZSB0aGF0IGxhbmd1YWdlIGZlYXR1cmUuXG4gICAqL1xuICB2YXIgcHJpdmF0ZU1ldGhvZHMgPSB7XG4gICAgc3dhbFByb21pc2VSZXNvbHZlOiBuZXcgV2Vha01hcCgpXG4gIH07XG5cbiAgLypcbiAgICogSW5zdGFuY2UgbWV0aG9kIHRvIGNsb3NlIHN3ZWV0QWxlcnRcbiAgICovXG5cbiAgZnVuY3Rpb24gcmVtb3ZlUG9wdXBBbmRSZXNldFN0YXRlKGluc3RhbmNlLCBjb250YWluZXIsIGlzVG9hc3QkJDEsIG9uQWZ0ZXJDbG9zZSkge1xuICAgIGlmIChpc1RvYXN0JCQxKSB7XG4gICAgICB0cmlnZ2VyT25BZnRlckNsb3NlQW5kRGlzcG9zZShpbnN0YW5jZSwgb25BZnRlckNsb3NlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdG9yZUFjdGl2ZUVsZW1lbnQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRyaWdnZXJPbkFmdGVyQ2xvc2VBbmREaXNwb3NlKGluc3RhbmNlLCBvbkFmdGVyQ2xvc2UpO1xuICAgICAgfSk7XG4gICAgICBnbG9iYWxTdGF0ZS5rZXlkb3duVGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBnbG9iYWxTdGF0ZS5rZXlkb3duSGFuZGxlciwge1xuICAgICAgICBjYXB0dXJlOiBnbG9iYWxTdGF0ZS5rZXlkb3duTGlzdGVuZXJDYXB0dXJlXG4gICAgICB9KTtcbiAgICAgIGdsb2JhbFN0YXRlLmtleWRvd25IYW5kbGVyQWRkZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoY29udGFpbmVyLnBhcmVudE5vZGUgJiYgIWRvY3VtZW50LmJvZHkuZ2V0QXR0cmlidXRlKCdkYXRhLXN3YWwyLXF1ZXVlLXN0ZXAnKSkge1xuICAgICAgY29udGFpbmVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY29udGFpbmVyKTtcbiAgICB9XG5cbiAgICBpZiAoaXNNb2RhbCgpKSB7XG4gICAgICB1bmRvU2Nyb2xsYmFyKCk7XG4gICAgICB1bmRvSU9TZml4KCk7XG4gICAgICB1bmRvSUVmaXgoKTtcbiAgICAgIHVuc2V0QXJpYUhpZGRlbigpO1xuICAgIH1cblxuICAgIHJlbW92ZUJvZHlDbGFzc2VzKCk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVCb2R5Q2xhc3NlcygpIHtcbiAgICByZW1vdmVDbGFzcyhbZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCBkb2N1bWVudC5ib2R5XSwgW3N3YWxDbGFzc2VzLnNob3duLCBzd2FsQ2xhc3Nlc1snaGVpZ2h0LWF1dG8nXSwgc3dhbENsYXNzZXNbJ25vLWJhY2tkcm9wJ10sIHN3YWxDbGFzc2VzWyd0b2FzdC1zaG93biddLCBzd2FsQ2xhc3Nlc1sndG9hc3QtY29sdW1uJ11dKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb3NlKHJlc29sdmVWYWx1ZSkge1xuICAgIHZhciBwb3B1cCA9IGdldFBvcHVwKCk7XG5cbiAgICBpZiAoIXBvcHVwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGlubmVyUGFyYW1zID0gcHJpdmF0ZVByb3BzLmlubmVyUGFyYW1zLmdldCh0aGlzKTtcblxuICAgIGlmICghaW5uZXJQYXJhbXMgfHwgaGFzQ2xhc3MocG9wdXAsIGlubmVyUGFyYW1zLmhpZGVDbGFzcy5wb3B1cCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgc3dhbFByb21pc2VSZXNvbHZlID0gcHJpdmF0ZU1ldGhvZHMuc3dhbFByb21pc2VSZXNvbHZlLmdldCh0aGlzKTtcbiAgICByZW1vdmVDbGFzcyhwb3B1cCwgaW5uZXJQYXJhbXMuc2hvd0NsYXNzLnBvcHVwKTtcbiAgICBhZGRDbGFzcyhwb3B1cCwgaW5uZXJQYXJhbXMuaGlkZUNsYXNzLnBvcHVwKTtcbiAgICB2YXIgYmFja2Ryb3AgPSBnZXRDb250YWluZXIoKTtcbiAgICByZW1vdmVDbGFzcyhiYWNrZHJvcCwgaW5uZXJQYXJhbXMuc2hvd0NsYXNzLmJhY2tkcm9wKTtcbiAgICBhZGRDbGFzcyhiYWNrZHJvcCwgaW5uZXJQYXJhbXMuaGlkZUNsYXNzLmJhY2tkcm9wKTtcbiAgICBoYW5kbGVQb3B1cEFuaW1hdGlvbih0aGlzLCBwb3B1cCwgaW5uZXJQYXJhbXMpOyAvLyBSZXNvbHZlIFN3YWwgcHJvbWlzZVxuXG4gICAgc3dhbFByb21pc2VSZXNvbHZlKHJlc29sdmVWYWx1ZSB8fCB7fSk7XG4gIH1cblxuICB2YXIgaGFuZGxlUG9wdXBBbmltYXRpb24gPSBmdW5jdGlvbiBoYW5kbGVQb3B1cEFuaW1hdGlvbihpbnN0YW5jZSwgcG9wdXAsIGlubmVyUGFyYW1zKSB7XG4gICAgdmFyIGNvbnRhaW5lciA9IGdldENvbnRhaW5lcigpOyAvLyBJZiBhbmltYXRpb24gaXMgc3VwcG9ydGVkLCBhbmltYXRlXG5cbiAgICB2YXIgYW5pbWF0aW9uSXNTdXBwb3J0ZWQgPSBhbmltYXRpb25FbmRFdmVudCAmJiBoYXNDc3NBbmltYXRpb24ocG9wdXApO1xuICAgIHZhciBvbkNsb3NlID0gaW5uZXJQYXJhbXMub25DbG9zZSxcbiAgICAgICAgb25BZnRlckNsb3NlID0gaW5uZXJQYXJhbXMub25BZnRlckNsb3NlO1xuXG4gICAgaWYgKG9uQ2xvc2UgIT09IG51bGwgJiYgdHlwZW9mIG9uQ2xvc2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9uQ2xvc2UocG9wdXApO1xuICAgIH1cblxuICAgIGlmIChhbmltYXRpb25Jc1N1cHBvcnRlZCkge1xuICAgICAgYW5pbWF0ZVBvcHVwKGluc3RhbmNlLCBwb3B1cCwgY29udGFpbmVyLCBvbkFmdGVyQ2xvc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBPdGhlcndpc2UsIHJlbW92ZSBpbW1lZGlhdGVseVxuICAgICAgcmVtb3ZlUG9wdXBBbmRSZXNldFN0YXRlKGluc3RhbmNlLCBjb250YWluZXIsIGlzVG9hc3QoKSwgb25BZnRlckNsb3NlKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGFuaW1hdGVQb3B1cCA9IGZ1bmN0aW9uIGFuaW1hdGVQb3B1cChpbnN0YW5jZSwgcG9wdXAsIGNvbnRhaW5lciwgb25BZnRlckNsb3NlKSB7XG4gICAgZ2xvYmFsU3RhdGUuc3dhbENsb3NlRXZlbnRGaW5pc2hlZENhbGxiYWNrID0gcmVtb3ZlUG9wdXBBbmRSZXNldFN0YXRlLmJpbmQobnVsbCwgaW5zdGFuY2UsIGNvbnRhaW5lciwgaXNUb2FzdCgpLCBvbkFmdGVyQ2xvc2UpO1xuICAgIHBvcHVwLmFkZEV2ZW50TGlzdGVuZXIoYW5pbWF0aW9uRW5kRXZlbnQsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBpZiAoZS50YXJnZXQgPT09IHBvcHVwKSB7XG4gICAgICAgIGdsb2JhbFN0YXRlLnN3YWxDbG9zZUV2ZW50RmluaXNoZWRDYWxsYmFjaygpO1xuICAgICAgICBkZWxldGUgZ2xvYmFsU3RhdGUuc3dhbENsb3NlRXZlbnRGaW5pc2hlZENhbGxiYWNrO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHZhciB0cmlnZ2VyT25BZnRlckNsb3NlQW5kRGlzcG9zZSA9IGZ1bmN0aW9uIHRyaWdnZXJPbkFmdGVyQ2xvc2VBbmREaXNwb3NlKGluc3RhbmNlLCBvbkFmdGVyQ2xvc2UpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0eXBlb2Ygb25BZnRlckNsb3NlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG9uQWZ0ZXJDbG9zZSgpO1xuICAgICAgfVxuXG4gICAgICBpbnN0YW5jZS5fZGVzdHJveSgpO1xuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHNldEJ1dHRvbnNEaXNhYmxlZChpbnN0YW5jZSwgYnV0dG9ucywgZGlzYWJsZWQpIHtcbiAgICB2YXIgZG9tQ2FjaGUgPSBwcml2YXRlUHJvcHMuZG9tQ2FjaGUuZ2V0KGluc3RhbmNlKTtcbiAgICBidXR0b25zLmZvckVhY2goZnVuY3Rpb24gKGJ1dHRvbikge1xuICAgICAgZG9tQ2FjaGVbYnV0dG9uXS5kaXNhYmxlZCA9IGRpc2FibGVkO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0SW5wdXREaXNhYmxlZChpbnB1dCwgZGlzYWJsZWQpIHtcbiAgICBpZiAoIWlucHV0KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGlucHV0LnR5cGUgPT09ICdyYWRpbycpIHtcbiAgICAgIHZhciByYWRpb3NDb250YWluZXIgPSBpbnB1dC5wYXJlbnROb2RlLnBhcmVudE5vZGU7XG4gICAgICB2YXIgcmFkaW9zID0gcmFkaW9zQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0Jyk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFkaW9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJhZGlvc1tpXS5kaXNhYmxlZCA9IGRpc2FibGVkO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpbnB1dC5kaXNhYmxlZCA9IGRpc2FibGVkO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVuYWJsZUJ1dHRvbnMoKSB7XG4gICAgc2V0QnV0dG9uc0Rpc2FibGVkKHRoaXMsIFsnY29uZmlybUJ1dHRvbicsICdjYW5jZWxCdXR0b24nXSwgZmFsc2UpO1xuICB9XG4gIGZ1bmN0aW9uIGRpc2FibGVCdXR0b25zKCkge1xuICAgIHNldEJ1dHRvbnNEaXNhYmxlZCh0aGlzLCBbJ2NvbmZpcm1CdXR0b24nLCAnY2FuY2VsQnV0dG9uJ10sIHRydWUpO1xuICB9XG4gIGZ1bmN0aW9uIGVuYWJsZUlucHV0KCkge1xuICAgIHJldHVybiBzZXRJbnB1dERpc2FibGVkKHRoaXMuZ2V0SW5wdXQoKSwgZmFsc2UpO1xuICB9XG4gIGZ1bmN0aW9uIGRpc2FibGVJbnB1dCgpIHtcbiAgICByZXR1cm4gc2V0SW5wdXREaXNhYmxlZCh0aGlzLmdldElucHV0KCksIHRydWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvd1ZhbGlkYXRpb25NZXNzYWdlKGVycm9yKSB7XG4gICAgdmFyIGRvbUNhY2hlID0gcHJpdmF0ZVByb3BzLmRvbUNhY2hlLmdldCh0aGlzKTtcbiAgICBkb21DYWNoZS52YWxpZGF0aW9uTWVzc2FnZS5pbm5lckhUTUwgPSBlcnJvcjtcbiAgICB2YXIgcG9wdXBDb21wdXRlZFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZG9tQ2FjaGUucG9wdXApO1xuICAgIGRvbUNhY2hlLnZhbGlkYXRpb25NZXNzYWdlLnN0eWxlLm1hcmdpbkxlZnQgPSBcIi1cIi5jb25jYXQocG9wdXBDb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctbGVmdCcpKTtcbiAgICBkb21DYWNoZS52YWxpZGF0aW9uTWVzc2FnZS5zdHlsZS5tYXJnaW5SaWdodCA9IFwiLVwiLmNvbmNhdChwb3B1cENvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1yaWdodCcpKTtcbiAgICBzaG93KGRvbUNhY2hlLnZhbGlkYXRpb25NZXNzYWdlKTtcbiAgICB2YXIgaW5wdXQgPSB0aGlzLmdldElucHV0KCk7XG5cbiAgICBpZiAoaW5wdXQpIHtcbiAgICAgIGlucHV0LnNldEF0dHJpYnV0ZSgnYXJpYS1pbnZhbGlkJywgdHJ1ZSk7XG4gICAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkQnknLCBzd2FsQ2xhc3Nlc1sndmFsaWRhdGlvbi1tZXNzYWdlJ10pO1xuICAgICAgZm9jdXNJbnB1dChpbnB1dCk7XG4gICAgICBhZGRDbGFzcyhpbnB1dCwgc3dhbENsYXNzZXMuaW5wdXRlcnJvcik7XG4gICAgfVxuICB9IC8vIEhpZGUgYmxvY2sgd2l0aCB2YWxpZGF0aW9uIG1lc3NhZ2VcblxuICBmdW5jdGlvbiByZXNldFZhbGlkYXRpb25NZXNzYWdlJDEoKSB7XG4gICAgdmFyIGRvbUNhY2hlID0gcHJpdmF0ZVByb3BzLmRvbUNhY2hlLmdldCh0aGlzKTtcblxuICAgIGlmIChkb21DYWNoZS52YWxpZGF0aW9uTWVzc2FnZSkge1xuICAgICAgaGlkZShkb21DYWNoZS52YWxpZGF0aW9uTWVzc2FnZSk7XG4gICAgfVxuXG4gICAgdmFyIGlucHV0ID0gdGhpcy5nZXRJbnB1dCgpO1xuXG4gICAgaWYgKGlucHV0KSB7XG4gICAgICBpbnB1dC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtaW52YWxpZCcpO1xuICAgICAgaW5wdXQucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZEJ5Jyk7XG4gICAgICByZW1vdmVDbGFzcyhpbnB1dCwgc3dhbENsYXNzZXMuaW5wdXRlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UHJvZ3Jlc3NTdGVwcyQxKCkge1xuICAgIHZhciBkb21DYWNoZSA9IHByaXZhdGVQcm9wcy5kb21DYWNoZS5nZXQodGhpcyk7XG4gICAgcmV0dXJuIGRvbUNhY2hlLnByb2dyZXNzU3RlcHM7XG4gIH1cblxuICB2YXIgVGltZXIgPVxuICAvKiNfX1BVUkVfXyovXG4gIGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBUaW1lcihjYWxsYmFjaywgZGVsYXkpIHtcbiAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUaW1lcik7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgIHRoaXMucmVtYWluaW5nID0gZGVsYXk7XG4gICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoVGltZXIsIFt7XG4gICAgICBrZXk6IFwic3RhcnRcIixcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnJ1bm5pbmcpIHtcbiAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuc3RhcnRlZCA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgdGhpcy5pZCA9IHNldFRpbWVvdXQodGhpcy5jYWxsYmFjaywgdGhpcy5yZW1haW5pbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucmVtYWluaW5nO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogXCJzdG9wXCIsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmlkKTtcbiAgICAgICAgICB0aGlzLnJlbWFpbmluZyAtPSBuZXcgRGF0ZSgpIC0gdGhpcy5zdGFydGVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucmVtYWluaW5nO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogXCJpbmNyZWFzZVwiLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGluY3JlYXNlKG4pIHtcbiAgICAgICAgdmFyIHJ1bm5pbmcgPSB0aGlzLnJ1bm5pbmc7XG5cbiAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVtYWluaW5nICs9IG47XG5cbiAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICB0aGlzLnN0YXJ0KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5yZW1haW5pbmc7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiBcImdldFRpbWVyTGVmdFwiLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldFRpbWVyTGVmdCgpIHtcbiAgICAgICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnJlbWFpbmluZztcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6IFwiaXNSdW5uaW5nXCIsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaXNSdW5uaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ydW5uaW5nO1xuICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBUaW1lcjtcbiAgfSgpO1xuXG4gIHZhciBkZWZhdWx0SW5wdXRWYWxpZGF0b3JzID0ge1xuICAgIGVtYWlsOiBmdW5jdGlvbiBlbWFpbChzdHJpbmcsIHZhbGlkYXRpb25NZXNzYWdlKSB7XG4gICAgICByZXR1cm4gL15bYS16QS1aMC05LitfLV0rQFthLXpBLVowLTkuLV0rXFwuW2EtekEtWjAtOS1dezIsMjR9JC8udGVzdChzdHJpbmcpID8gUHJvbWlzZS5yZXNvbHZlKCkgOiBQcm9taXNlLnJlc29sdmUodmFsaWRhdGlvbk1lc3NhZ2UgfHwgJ0ludmFsaWQgZW1haWwgYWRkcmVzcycpO1xuICAgIH0sXG4gICAgdXJsOiBmdW5jdGlvbiB1cmwoc3RyaW5nLCB2YWxpZGF0aW9uTWVzc2FnZSkge1xuICAgICAgLy8gdGFrZW4gZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzgwOTQzNSB3aXRoIGEgc21hbGwgY2hhbmdlIGZyb20gIzEzMDZcbiAgICAgIHJldHVybiAvXmh0dHBzPzpcXC9cXC8od3d3XFwuKT9bLWEtekEtWjAtOUA6JS5fK34jPV17MiwyNTZ9XFwuW2Etel17Miw2M31cXGIoWy1hLXpBLVowLTlAOiVfKy5+Iz8mLz1dKikkLy50ZXN0KHN0cmluZykgPyBQcm9taXNlLnJlc29sdmUoKSA6IFByb21pc2UucmVzb2x2ZSh2YWxpZGF0aW9uTWVzc2FnZSB8fCAnSW52YWxpZCBVUkwnKTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gc2V0RGVmYXVsdElucHV0VmFsaWRhdG9ycyhwYXJhbXMpIHtcbiAgICAvLyBVc2UgZGVmYXVsdCBgaW5wdXRWYWxpZGF0b3JgIGZvciBzdXBwb3J0ZWQgaW5wdXQgdHlwZXMgaWYgbm90IHByb3ZpZGVkXG4gICAgaWYgKCFwYXJhbXMuaW5wdXRWYWxpZGF0b3IpIHtcbiAgICAgIE9iamVjdC5rZXlzKGRlZmF1bHRJbnB1dFZhbGlkYXRvcnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAocGFyYW1zLmlucHV0ID09PSBrZXkpIHtcbiAgICAgICAgICBwYXJhbXMuaW5wdXRWYWxpZGF0b3IgPSBkZWZhdWx0SW5wdXRWYWxpZGF0b3JzW2tleV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlQ3VzdG9tVGFyZ2V0RWxlbWVudChwYXJhbXMpIHtcbiAgICAvLyBEZXRlcm1pbmUgaWYgdGhlIGN1c3RvbSB0YXJnZXQgZWxlbWVudCBpcyB2YWxpZFxuICAgIGlmICghcGFyYW1zLnRhcmdldCB8fCB0eXBlb2YgcGFyYW1zLnRhcmdldCA9PT0gJ3N0cmluZycgJiYgIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocGFyYW1zLnRhcmdldCkgfHwgdHlwZW9mIHBhcmFtcy50YXJnZXQgIT09ICdzdHJpbmcnICYmICFwYXJhbXMudGFyZ2V0LmFwcGVuZENoaWxkKSB7XG4gICAgICB3YXJuKCdUYXJnZXQgcGFyYW1ldGVyIGlzIG5vdCB2YWxpZCwgZGVmYXVsdGluZyB0byBcImJvZHlcIicpO1xuICAgICAgcGFyYW1zLnRhcmdldCA9ICdib2R5JztcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIFNldCB0eXBlLCB0ZXh0IGFuZCBhY3Rpb25zIG9uIHBvcHVwXG4gICAqXG4gICAqIEBwYXJhbSBwYXJhbXNcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuXG5cbiAgZnVuY3Rpb24gc2V0UGFyYW1ldGVycyhwYXJhbXMpIHtcbiAgICBzZXREZWZhdWx0SW5wdXRWYWxpZGF0b3JzKHBhcmFtcyk7IC8vIHNob3dMb2FkZXJPbkNvbmZpcm0gJiYgcHJlQ29uZmlybVxuXG4gICAgaWYgKHBhcmFtcy5zaG93TG9hZGVyT25Db25maXJtICYmICFwYXJhbXMucHJlQ29uZmlybSkge1xuICAgICAgd2Fybignc2hvd0xvYWRlck9uQ29uZmlybSBpcyBzZXQgdG8gdHJ1ZSwgYnV0IHByZUNvbmZpcm0gaXMgbm90IGRlZmluZWQuXFxuJyArICdzaG93TG9hZGVyT25Db25maXJtIHNob3VsZCBiZSB1c2VkIHRvZ2V0aGVyIHdpdGggcHJlQ29uZmlybSwgc2VlIHVzYWdlIGV4YW1wbGU6XFxuJyArICdodHRwczovL3N3ZWV0YWxlcnQyLmdpdGh1Yi5pby8jYWpheC1yZXF1ZXN0Jyk7XG4gICAgfSAvLyBwYXJhbXMuYW5pbWF0aW9uIHdpbGwgYmUgYWN0dWFsbHkgdXNlZCBpbiByZW5kZXJQb3B1cC5qc1xuICAgIC8vIGJ1dCBpbiBjYXNlIHdoZW4gcGFyYW1zLmFuaW1hdGlvbiBpcyBhIGZ1bmN0aW9uLCB3ZSBuZWVkIHRvIGNhbGwgdGhhdCBmdW5jdGlvblxuICAgIC8vIGJlZm9yZSBwb3B1cCAocmUpaW5pdGlhbGl6YXRpb24sIHNvIGl0J2xsIGJlIHBvc3NpYmxlIHRvIGNoZWNrIFN3YWwuaXNWaXNpYmxlKClcbiAgICAvLyBpbnNpZGUgdGhlIHBhcmFtcy5hbmltYXRpb24gZnVuY3Rpb25cblxuXG4gICAgcGFyYW1zLmFuaW1hdGlvbiA9IGNhbGxJZkZ1bmN0aW9uKHBhcmFtcy5hbmltYXRpb24pO1xuICAgIHZhbGlkYXRlQ3VzdG9tVGFyZ2V0RWxlbWVudChwYXJhbXMpOyAvLyBSZXBsYWNlIG5ld2xpbmVzIHdpdGggPGJyPiBpbiB0aXRsZVxuXG4gICAgaWYgKHR5cGVvZiBwYXJhbXMudGl0bGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwYXJhbXMudGl0bGUgPSBwYXJhbXMudGl0bGUuc3BsaXQoJ1xcbicpLmpvaW4oJzxiciAvPicpO1xuICAgIH1cblxuICAgIGluaXQocGFyYW1zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVuIHBvcHVwLCBhZGQgbmVjZXNzYXJ5IGNsYXNzZXMgYW5kIHN0eWxlcywgZml4IHNjcm9sbGJhclxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5fSBwYXJhbXNcbiAgICovXG5cbiAgdmFyIG9wZW5Qb3B1cCA9IGZ1bmN0aW9uIG9wZW5Qb3B1cChwYXJhbXMpIHtcbiAgICB2YXIgY29udGFpbmVyID0gZ2V0Q29udGFpbmVyKCk7XG4gICAgdmFyIHBvcHVwID0gZ2V0UG9wdXAoKTtcblxuICAgIGlmICh0eXBlb2YgcGFyYW1zLm9uQmVmb3JlT3BlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcGFyYW1zLm9uQmVmb3JlT3Blbihwb3B1cCk7XG4gICAgfVxuXG4gICAgYWRkQ2xhc3NlcyQxKGNvbnRhaW5lciwgcG9wdXAsIHBhcmFtcyk7IC8vIHNjcm9sbGluZyBpcyAnaGlkZGVuJyB1bnRpbCBhbmltYXRpb24gaXMgZG9uZSwgYWZ0ZXIgdGhhdCAnYXV0bydcblxuICAgIHNldFNjcm9sbGluZ1Zpc2liaWxpdHkoY29udGFpbmVyLCBwb3B1cCk7XG5cbiAgICBpZiAoaXNNb2RhbCgpKSB7XG4gICAgICBmaXhTY3JvbGxDb250YWluZXIoY29udGFpbmVyLCBwYXJhbXMuc2Nyb2xsYmFyUGFkZGluZyk7XG4gICAgfVxuXG4gICAgaWYgKCFpc1RvYXN0KCkgJiYgIWdsb2JhbFN0YXRlLnByZXZpb3VzQWN0aXZlRWxlbWVudCkge1xuICAgICAgZ2xvYmFsU3RhdGUucHJldmlvdXNBY3RpdmVFbGVtZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBhcmFtcy5vbk9wZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gcGFyYW1zLm9uT3Blbihwb3B1cCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZW1vdmVDbGFzcyhjb250YWluZXIsIHN3YWxDbGFzc2VzWyduby10cmFuc2l0aW9uJ10pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHN3YWxPcGVuQW5pbWF0aW9uRmluaXNoZWQoZXZlbnQpIHtcbiAgICB2YXIgcG9wdXAgPSBnZXRQb3B1cCgpO1xuXG4gICAgaWYgKGV2ZW50LnRhcmdldCAhPT0gcG9wdXApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgY29udGFpbmVyID0gZ2V0Q29udGFpbmVyKCk7XG4gICAgcG9wdXAucmVtb3ZlRXZlbnRMaXN0ZW5lcihhbmltYXRpb25FbmRFdmVudCwgc3dhbE9wZW5BbmltYXRpb25GaW5pc2hlZCk7XG4gICAgY29udGFpbmVyLnN0eWxlLm92ZXJmbG93WSA9ICdhdXRvJztcbiAgfVxuXG4gIHZhciBzZXRTY3JvbGxpbmdWaXNpYmlsaXR5ID0gZnVuY3Rpb24gc2V0U2Nyb2xsaW5nVmlzaWJpbGl0eShjb250YWluZXIsIHBvcHVwKSB7XG4gICAgaWYgKGFuaW1hdGlvbkVuZEV2ZW50ICYmIGhhc0Nzc0FuaW1hdGlvbihwb3B1cCkpIHtcbiAgICAgIGNvbnRhaW5lci5zdHlsZS5vdmVyZmxvd1kgPSAnaGlkZGVuJztcbiAgICAgIHBvcHVwLmFkZEV2ZW50TGlzdGVuZXIoYW5pbWF0aW9uRW5kRXZlbnQsIHN3YWxPcGVuQW5pbWF0aW9uRmluaXNoZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXIuc3R5bGUub3ZlcmZsb3dZID0gJ2F1dG8nO1xuICAgIH1cbiAgfTtcblxuICB2YXIgZml4U2Nyb2xsQ29udGFpbmVyID0gZnVuY3Rpb24gZml4U2Nyb2xsQ29udGFpbmVyKGNvbnRhaW5lciwgc2Nyb2xsYmFyUGFkZGluZykge1xuICAgIGlPU2ZpeCgpO1xuICAgIElFZml4KCk7XG4gICAgc2V0QXJpYUhpZGRlbigpO1xuXG4gICAgaWYgKHNjcm9sbGJhclBhZGRpbmcpIHtcbiAgICAgIGZpeFNjcm9sbGJhcigpO1xuICAgIH0gLy8gc3dlZXRhbGVydDIvaXNzdWVzLzEyNDdcblxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gMDtcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgYWRkQ2xhc3NlcyQxID0gZnVuY3Rpb24gYWRkQ2xhc3Nlcyhjb250YWluZXIsIHBvcHVwLCBwYXJhbXMpIHtcbiAgICBhZGRDbGFzcyhjb250YWluZXIsIHBhcmFtcy5zaG93Q2xhc3MuYmFja2Ryb3ApO1xuICAgIHNob3cocG9wdXApOyAvLyBBbmltYXRlIHBvcHVwIHJpZ2h0IGFmdGVyIHNob3dpbmcgaXRcblxuICAgIGFkZENsYXNzKHBvcHVwLCBwYXJhbXMuc2hvd0NsYXNzLnBvcHVwKTtcbiAgICBhZGRDbGFzcyhbZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCBkb2N1bWVudC5ib2R5XSwgc3dhbENsYXNzZXMuc2hvd24pO1xuXG4gICAgaWYgKHBhcmFtcy5oZWlnaHRBdXRvICYmIHBhcmFtcy5iYWNrZHJvcCAmJiAhcGFyYW1zLnRvYXN0KSB7XG4gICAgICBhZGRDbGFzcyhbZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCBkb2N1bWVudC5ib2R5XSwgc3dhbENsYXNzZXNbJ2hlaWdodC1hdXRvJ10pO1xuICAgIH1cbiAgfTtcblxuICB2YXIgaGFuZGxlSW5wdXRPcHRpb25zQW5kVmFsdWUgPSBmdW5jdGlvbiBoYW5kbGVJbnB1dE9wdGlvbnNBbmRWYWx1ZShpbnN0YW5jZSwgcGFyYW1zKSB7XG4gICAgaWYgKHBhcmFtcy5pbnB1dCA9PT0gJ3NlbGVjdCcgfHwgcGFyYW1zLmlucHV0ID09PSAncmFkaW8nKSB7XG4gICAgICBoYW5kbGVJbnB1dE9wdGlvbnMoaW5zdGFuY2UsIHBhcmFtcyk7XG4gICAgfSBlbHNlIGlmIChbJ3RleHQnLCAnZW1haWwnLCAnbnVtYmVyJywgJ3RlbCcsICd0ZXh0YXJlYSddLmluZGV4T2YocGFyYW1zLmlucHV0KSAhPT0gLTEgJiYgaXNQcm9taXNlKHBhcmFtcy5pbnB1dFZhbHVlKSkge1xuICAgICAgaGFuZGxlSW5wdXRWYWx1ZShpbnN0YW5jZSwgcGFyYW1zKTtcbiAgICB9XG4gIH07XG4gIHZhciBnZXRJbnB1dFZhbHVlID0gZnVuY3Rpb24gZ2V0SW5wdXRWYWx1ZShpbnN0YW5jZSwgaW5uZXJQYXJhbXMpIHtcbiAgICB2YXIgaW5wdXQgPSBpbnN0YW5jZS5nZXRJbnB1dCgpO1xuXG4gICAgaWYgKCFpbnB1dCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgc3dpdGNoIChpbm5lclBhcmFtcy5pbnB1dCkge1xuICAgICAgY2FzZSAnY2hlY2tib3gnOlxuICAgICAgICByZXR1cm4gZ2V0Q2hlY2tib3hWYWx1ZShpbnB1dCk7XG5cbiAgICAgIGNhc2UgJ3JhZGlvJzpcbiAgICAgICAgcmV0dXJuIGdldFJhZGlvVmFsdWUoaW5wdXQpO1xuXG4gICAgICBjYXNlICdmaWxlJzpcbiAgICAgICAgcmV0dXJuIGdldEZpbGVWYWx1ZShpbnB1dCk7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBpbm5lclBhcmFtcy5pbnB1dEF1dG9UcmltID8gaW5wdXQudmFsdWUudHJpbSgpIDogaW5wdXQudmFsdWU7XG4gICAgfVxuICB9O1xuXG4gIHZhciBnZXRDaGVja2JveFZhbHVlID0gZnVuY3Rpb24gZ2V0Q2hlY2tib3hWYWx1ZShpbnB1dCkge1xuICAgIHJldHVybiBpbnB1dC5jaGVja2VkID8gMSA6IDA7XG4gIH07XG5cbiAgdmFyIGdldFJhZGlvVmFsdWUgPSBmdW5jdGlvbiBnZXRSYWRpb1ZhbHVlKGlucHV0KSB7XG4gICAgcmV0dXJuIGlucHV0LmNoZWNrZWQgPyBpbnB1dC52YWx1ZSA6IG51bGw7XG4gIH07XG5cbiAgdmFyIGdldEZpbGVWYWx1ZSA9IGZ1bmN0aW9uIGdldEZpbGVWYWx1ZShpbnB1dCkge1xuICAgIHJldHVybiBpbnB1dC5maWxlcy5sZW5ndGggPyBpbnB1dC5nZXRBdHRyaWJ1dGUoJ211bHRpcGxlJykgIT09IG51bGwgPyBpbnB1dC5maWxlcyA6IGlucHV0LmZpbGVzWzBdIDogbnVsbDtcbiAgfTtcblxuICB2YXIgaGFuZGxlSW5wdXRPcHRpb25zID0gZnVuY3Rpb24gaGFuZGxlSW5wdXRPcHRpb25zKGluc3RhbmNlLCBwYXJhbXMpIHtcbiAgICB2YXIgY29udGVudCA9IGdldENvbnRlbnQoKTtcblxuICAgIHZhciBwcm9jZXNzSW5wdXRPcHRpb25zID0gZnVuY3Rpb24gcHJvY2Vzc0lucHV0T3B0aW9ucyhpbnB1dE9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBwb3B1bGF0ZUlucHV0T3B0aW9uc1twYXJhbXMuaW5wdXRdKGNvbnRlbnQsIGZvcm1hdElucHV0T3B0aW9ucyhpbnB1dE9wdGlvbnMpLCBwYXJhbXMpO1xuICAgIH07XG5cbiAgICBpZiAoaXNQcm9taXNlKHBhcmFtcy5pbnB1dE9wdGlvbnMpKSB7XG4gICAgICBzaG93TG9hZGluZygpO1xuICAgICAgcGFyYW1zLmlucHV0T3B0aW9ucy50aGVuKGZ1bmN0aW9uIChpbnB1dE9wdGlvbnMpIHtcbiAgICAgICAgaW5zdGFuY2UuaGlkZUxvYWRpbmcoKTtcbiAgICAgICAgcHJvY2Vzc0lucHV0T3B0aW9ucyhpbnB1dE9wdGlvbnMpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChfdHlwZW9mKHBhcmFtcy5pbnB1dE9wdGlvbnMpID09PSAnb2JqZWN0Jykge1xuICAgICAgcHJvY2Vzc0lucHV0T3B0aW9ucyhwYXJhbXMuaW5wdXRPcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3IoXCJVbmV4cGVjdGVkIHR5cGUgb2YgaW5wdXRPcHRpb25zISBFeHBlY3RlZCBvYmplY3QsIE1hcCBvciBQcm9taXNlLCBnb3QgXCIuY29uY2F0KF90eXBlb2YocGFyYW1zLmlucHV0T3B0aW9ucykpKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGhhbmRsZUlucHV0VmFsdWUgPSBmdW5jdGlvbiBoYW5kbGVJbnB1dFZhbHVlKGluc3RhbmNlLCBwYXJhbXMpIHtcbiAgICB2YXIgaW5wdXQgPSBpbnN0YW5jZS5nZXRJbnB1dCgpO1xuICAgIGhpZGUoaW5wdXQpO1xuICAgIHBhcmFtcy5pbnB1dFZhbHVlLnRoZW4oZnVuY3Rpb24gKGlucHV0VmFsdWUpIHtcbiAgICAgIGlucHV0LnZhbHVlID0gcGFyYW1zLmlucHV0ID09PSAnbnVtYmVyJyA/IHBhcnNlRmxvYXQoaW5wdXRWYWx1ZSkgfHwgMCA6IFwiXCIuY29uY2F0KGlucHV0VmFsdWUpO1xuICAgICAgc2hvdyhpbnB1dCk7XG4gICAgICBpbnB1dC5mb2N1cygpO1xuICAgICAgaW5zdGFuY2UuaGlkZUxvYWRpbmcoKTtcbiAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIGVycm9yKFwiRXJyb3IgaW4gaW5wdXRWYWx1ZSBwcm9taXNlOiBcIi5jb25jYXQoZXJyKSk7XG4gICAgICBpbnB1dC52YWx1ZSA9ICcnO1xuICAgICAgc2hvdyhpbnB1dCk7XG4gICAgICBpbnB1dC5mb2N1cygpO1xuICAgICAgaW5zdGFuY2UuaGlkZUxvYWRpbmcoKTtcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgcG9wdWxhdGVJbnB1dE9wdGlvbnMgPSB7XG4gICAgc2VsZWN0OiBmdW5jdGlvbiBzZWxlY3QoY29udGVudCwgaW5wdXRPcHRpb25zLCBwYXJhbXMpIHtcbiAgICAgIHZhciBzZWxlY3QgPSBnZXRDaGlsZEJ5Q2xhc3MoY29udGVudCwgc3dhbENsYXNzZXMuc2VsZWN0KTtcbiAgICAgIGlucHV0T3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChpbnB1dE9wdGlvbikge1xuICAgICAgICB2YXIgb3B0aW9uVmFsdWUgPSBpbnB1dE9wdGlvblswXTtcbiAgICAgICAgdmFyIG9wdGlvbkxhYmVsID0gaW5wdXRPcHRpb25bMV07XG4gICAgICAgIHZhciBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICAgICAgb3B0aW9uLnZhbHVlID0gb3B0aW9uVmFsdWU7XG4gICAgICAgIG9wdGlvbi5pbm5lckhUTUwgPSBvcHRpb25MYWJlbDtcblxuICAgICAgICBpZiAocGFyYW1zLmlucHV0VmFsdWUudG9TdHJpbmcoKSA9PT0gb3B0aW9uVmFsdWUudG9TdHJpbmcoKSkge1xuICAgICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxlY3QuYXBwZW5kQ2hpbGQob3B0aW9uKTtcbiAgICAgIH0pO1xuICAgICAgc2VsZWN0LmZvY3VzKCk7XG4gICAgfSxcbiAgICByYWRpbzogZnVuY3Rpb24gcmFkaW8oY29udGVudCwgaW5wdXRPcHRpb25zLCBwYXJhbXMpIHtcbiAgICAgIHZhciByYWRpbyA9IGdldENoaWxkQnlDbGFzcyhjb250ZW50LCBzd2FsQ2xhc3Nlcy5yYWRpbyk7XG4gICAgICBpbnB1dE9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoaW5wdXRPcHRpb24pIHtcbiAgICAgICAgdmFyIHJhZGlvVmFsdWUgPSBpbnB1dE9wdGlvblswXTtcbiAgICAgICAgdmFyIHJhZGlvTGFiZWwgPSBpbnB1dE9wdGlvblsxXTtcbiAgICAgICAgdmFyIHJhZGlvSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICB2YXIgcmFkaW9MYWJlbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgICAgICByYWRpb0lucHV0LnR5cGUgPSAncmFkaW8nO1xuICAgICAgICByYWRpb0lucHV0Lm5hbWUgPSBzd2FsQ2xhc3Nlcy5yYWRpbztcbiAgICAgICAgcmFkaW9JbnB1dC52YWx1ZSA9IHJhZGlvVmFsdWU7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5pbnB1dFZhbHVlLnRvU3RyaW5nKCkgPT09IHJhZGlvVmFsdWUudG9TdHJpbmcoKSkge1xuICAgICAgICAgIHJhZGlvSW5wdXQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIGxhYmVsLmlubmVySFRNTCA9IHJhZGlvTGFiZWw7XG4gICAgICAgIGxhYmVsLmNsYXNzTmFtZSA9IHN3YWxDbGFzc2VzLmxhYmVsO1xuICAgICAgICByYWRpb0xhYmVsRWxlbWVudC5hcHBlbmRDaGlsZChyYWRpb0lucHV0KTtcbiAgICAgICAgcmFkaW9MYWJlbEVsZW1lbnQuYXBwZW5kQ2hpbGQobGFiZWwpO1xuICAgICAgICByYWRpby5hcHBlbmRDaGlsZChyYWRpb0xhYmVsRWxlbWVudCk7XG4gICAgICB9KTtcbiAgICAgIHZhciByYWRpb3MgPSByYWRpby5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dCcpO1xuXG4gICAgICBpZiAocmFkaW9zLmxlbmd0aCkge1xuICAgICAgICByYWRpb3NbMF0uZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyBgaW5wdXRPcHRpb25zYCBpbnRvIGFuIGFycmF5IG9mIGBbdmFsdWUsIGxhYmVsXWBzXG4gICAqIEBwYXJhbSBpbnB1dE9wdGlvbnNcbiAgICovXG5cbiAgdmFyIGZvcm1hdElucHV0T3B0aW9ucyA9IGZ1bmN0aW9uIGZvcm1hdElucHV0T3B0aW9ucyhpbnB1dE9wdGlvbnMpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG5cbiAgICBpZiAodHlwZW9mIE1hcCAhPT0gJ3VuZGVmaW5lZCcgJiYgaW5wdXRPcHRpb25zIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICBpbnB1dE9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICByZXN1bHQucHVzaChba2V5LCB2YWx1ZV0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIE9iamVjdC5rZXlzKGlucHV0T3B0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKFtrZXksIGlucHV0T3B0aW9uc1trZXldXSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIHZhciBoYW5kbGVDb25maXJtQnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiBoYW5kbGVDb25maXJtQnV0dG9uQ2xpY2soaW5zdGFuY2UsIGlubmVyUGFyYW1zKSB7XG4gICAgaW5zdGFuY2UuZGlzYWJsZUJ1dHRvbnMoKTtcblxuICAgIGlmIChpbm5lclBhcmFtcy5pbnB1dCkge1xuICAgICAgaGFuZGxlQ29uZmlybVdpdGhJbnB1dChpbnN0YW5jZSwgaW5uZXJQYXJhbXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25maXJtKGluc3RhbmNlLCBpbm5lclBhcmFtcywgdHJ1ZSk7XG4gICAgfVxuICB9O1xuICB2YXIgaGFuZGxlQ2FuY2VsQnV0dG9uQ2xpY2sgPSBmdW5jdGlvbiBoYW5kbGVDYW5jZWxCdXR0b25DbGljayhpbnN0YW5jZSwgZGlzbWlzc1dpdGgpIHtcbiAgICBpbnN0YW5jZS5kaXNhYmxlQnV0dG9ucygpO1xuICAgIGRpc21pc3NXaXRoKERpc21pc3NSZWFzb24uY2FuY2VsKTtcbiAgfTtcblxuICB2YXIgaGFuZGxlQ29uZmlybVdpdGhJbnB1dCA9IGZ1bmN0aW9uIGhhbmRsZUNvbmZpcm1XaXRoSW5wdXQoaW5zdGFuY2UsIGlubmVyUGFyYW1zKSB7XG4gICAgdmFyIGlucHV0VmFsdWUgPSBnZXRJbnB1dFZhbHVlKGluc3RhbmNlLCBpbm5lclBhcmFtcyk7XG5cbiAgICBpZiAoaW5uZXJQYXJhbXMuaW5wdXRWYWxpZGF0b3IpIHtcbiAgICAgIGluc3RhbmNlLmRpc2FibGVJbnB1dCgpO1xuICAgICAgdmFyIHZhbGlkYXRpb25Qcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBpbm5lclBhcmFtcy5pbnB1dFZhbGlkYXRvcihpbnB1dFZhbHVlLCBpbm5lclBhcmFtcy52YWxpZGF0aW9uTWVzc2FnZSk7XG4gICAgICB9KTtcbiAgICAgIHZhbGlkYXRpb25Qcm9taXNlLnRoZW4oZnVuY3Rpb24gKHZhbGlkYXRpb25NZXNzYWdlKSB7XG4gICAgICAgIGluc3RhbmNlLmVuYWJsZUJ1dHRvbnMoKTtcbiAgICAgICAgaW5zdGFuY2UuZW5hYmxlSW5wdXQoKTtcblxuICAgICAgICBpZiAodmFsaWRhdGlvbk1lc3NhZ2UpIHtcbiAgICAgICAgICBpbnN0YW5jZS5zaG93VmFsaWRhdGlvbk1lc3NhZ2UodmFsaWRhdGlvbk1lc3NhZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbmZpcm0oaW5zdGFuY2UsIGlubmVyUGFyYW1zLCBpbnB1dFZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICghaW5zdGFuY2UuZ2V0SW5wdXQoKS5jaGVja1ZhbGlkaXR5KCkpIHtcbiAgICAgIGluc3RhbmNlLmVuYWJsZUJ1dHRvbnMoKTtcbiAgICAgIGluc3RhbmNlLnNob3dWYWxpZGF0aW9uTWVzc2FnZShpbm5lclBhcmFtcy52YWxpZGF0aW9uTWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbmZpcm0oaW5zdGFuY2UsIGlubmVyUGFyYW1zLCBpbnB1dFZhbHVlKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHN1Y2NlZWRXaXRoID0gZnVuY3Rpb24gc3VjY2VlZFdpdGgoaW5zdGFuY2UsIHZhbHVlKSB7XG4gICAgaW5zdGFuY2UuY2xvc2VQb3B1cCh7XG4gICAgICB2YWx1ZTogdmFsdWVcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgY29uZmlybSA9IGZ1bmN0aW9uIGNvbmZpcm0oaW5zdGFuY2UsIGlubmVyUGFyYW1zLCB2YWx1ZSkge1xuICAgIGlmIChpbm5lclBhcmFtcy5zaG93TG9hZGVyT25Db25maXJtKSB7XG4gICAgICBzaG93TG9hZGluZygpOyAvLyBUT0RPOiBtYWtlIHNob3dMb2FkaW5nIGFuICppbnN0YW5jZSogbWV0aG9kXG4gICAgfVxuXG4gICAgaWYgKGlubmVyUGFyYW1zLnByZUNvbmZpcm0pIHtcbiAgICAgIGluc3RhbmNlLnJlc2V0VmFsaWRhdGlvbk1lc3NhZ2UoKTtcbiAgICAgIHZhciBwcmVDb25maXJtUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gaW5uZXJQYXJhbXMucHJlQ29uZmlybSh2YWx1ZSwgaW5uZXJQYXJhbXMudmFsaWRhdGlvbk1lc3NhZ2UpO1xuICAgICAgfSk7XG4gICAgICBwcmVDb25maXJtUHJvbWlzZS50aGVuKGZ1bmN0aW9uIChwcmVDb25maXJtVmFsdWUpIHtcbiAgICAgICAgaWYgKGlzVmlzaWJsZShnZXRWYWxpZGF0aW9uTWVzc2FnZSgpKSB8fCBwcmVDb25maXJtVmFsdWUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgaW5zdGFuY2UuaGlkZUxvYWRpbmcoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdWNjZWVkV2l0aChpbnN0YW5jZSwgdHlwZW9mIHByZUNvbmZpcm1WYWx1ZSA9PT0gJ3VuZGVmaW5lZCcgPyB2YWx1ZSA6IHByZUNvbmZpcm1WYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWNjZWVkV2l0aChpbnN0YW5jZSwgdmFsdWUpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgYWRkS2V5ZG93bkhhbmRsZXIgPSBmdW5jdGlvbiBhZGRLZXlkb3duSGFuZGxlcihpbnN0YW5jZSwgZ2xvYmFsU3RhdGUsIGlubmVyUGFyYW1zLCBkaXNtaXNzV2l0aCkge1xuICAgIGlmIChnbG9iYWxTdGF0ZS5rZXlkb3duVGFyZ2V0ICYmIGdsb2JhbFN0YXRlLmtleWRvd25IYW5kbGVyQWRkZWQpIHtcbiAgICAgIGdsb2JhbFN0YXRlLmtleWRvd25UYXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGdsb2JhbFN0YXRlLmtleWRvd25IYW5kbGVyLCB7XG4gICAgICAgIGNhcHR1cmU6IGdsb2JhbFN0YXRlLmtleWRvd25MaXN0ZW5lckNhcHR1cmVcbiAgICAgIH0pO1xuICAgICAgZ2xvYmFsU3RhdGUua2V5ZG93bkhhbmRsZXJBZGRlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghaW5uZXJQYXJhbXMudG9hc3QpIHtcbiAgICAgIGdsb2JhbFN0YXRlLmtleWRvd25IYW5kbGVyID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgcmV0dXJuIGtleWRvd25IYW5kbGVyKGluc3RhbmNlLCBlLCBkaXNtaXNzV2l0aCk7XG4gICAgICB9O1xuXG4gICAgICBnbG9iYWxTdGF0ZS5rZXlkb3duVGFyZ2V0ID0gaW5uZXJQYXJhbXMua2V5ZG93bkxpc3RlbmVyQ2FwdHVyZSA/IHdpbmRvdyA6IGdldFBvcHVwKCk7XG4gICAgICBnbG9iYWxTdGF0ZS5rZXlkb3duTGlzdGVuZXJDYXB0dXJlID0gaW5uZXJQYXJhbXMua2V5ZG93bkxpc3RlbmVyQ2FwdHVyZTtcbiAgICAgIGdsb2JhbFN0YXRlLmtleWRvd25UYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGdsb2JhbFN0YXRlLmtleWRvd25IYW5kbGVyLCB7XG4gICAgICAgIGNhcHR1cmU6IGdsb2JhbFN0YXRlLmtleWRvd25MaXN0ZW5lckNhcHR1cmVcbiAgICAgIH0pO1xuICAgICAgZ2xvYmFsU3RhdGUua2V5ZG93bkhhbmRsZXJBZGRlZCA9IHRydWU7XG4gICAgfVxuICB9OyAvLyBGb2N1cyBoYW5kbGluZ1xuXG4gIHZhciBzZXRGb2N1cyA9IGZ1bmN0aW9uIHNldEZvY3VzKGlubmVyUGFyYW1zLCBpbmRleCwgaW5jcmVtZW50KSB7XG4gICAgdmFyIGZvY3VzYWJsZUVsZW1lbnRzID0gZ2V0Rm9jdXNhYmxlRWxlbWVudHMoKTsgLy8gc2VhcmNoIGZvciB2aXNpYmxlIGVsZW1lbnRzIGFuZCBzZWxlY3QgdGhlIG5leHQgcG9zc2libGUgbWF0Y2hcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGluZGV4ID0gaW5kZXggKyBpbmNyZW1lbnQ7IC8vIHJvbGxvdmVyIHRvIGZpcnN0IGl0ZW1cblxuICAgICAgaWYgKGluZGV4ID09PSBmb2N1c2FibGVFbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgaW5kZXggPSAwOyAvLyBnbyB0byBsYXN0IGl0ZW1cbiAgICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgIGluZGV4ID0gZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoIC0gMTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZvY3VzYWJsZUVsZW1lbnRzW2luZGV4XS5mb2N1cygpO1xuICAgIH0gLy8gbm8gdmlzaWJsZSBmb2N1c2FibGUgZWxlbWVudHMsIGZvY3VzIHRoZSBwb3B1cFxuXG5cbiAgICBnZXRQb3B1cCgpLmZvY3VzKCk7XG4gIH07XG4gIHZhciBhcnJvd0tleXMgPSBbJ0Fycm93TGVmdCcsICdBcnJvd1JpZ2h0JywgJ0Fycm93VXAnLCAnQXJyb3dEb3duJywgJ0xlZnQnLCAnUmlnaHQnLCAnVXAnLCAnRG93bicgLy8gSUUxMVxuICBdO1xuICB2YXIgZXNjS2V5cyA9IFsnRXNjYXBlJywgJ0VzYycgLy8gSUUxMVxuICBdO1xuXG4gIHZhciBrZXlkb3duSGFuZGxlciA9IGZ1bmN0aW9uIGtleWRvd25IYW5kbGVyKGluc3RhbmNlLCBlLCBkaXNtaXNzV2l0aCkge1xuICAgIHZhciBpbm5lclBhcmFtcyA9IHByaXZhdGVQcm9wcy5pbm5lclBhcmFtcy5nZXQoaW5zdGFuY2UpO1xuXG4gICAgaWYgKGlubmVyUGFyYW1zLnN0b3BLZXlkb3duUHJvcGFnYXRpb24pIHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSAvLyBFTlRFUlxuXG5cbiAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgIGhhbmRsZUVudGVyKGluc3RhbmNlLCBlLCBpbm5lclBhcmFtcyk7IC8vIFRBQlxuICAgIH0gZWxzZSBpZiAoZS5rZXkgPT09ICdUYWInKSB7XG4gICAgICBoYW5kbGVUYWIoZSwgaW5uZXJQYXJhbXMpOyAvLyBBUlJPV1MgLSBzd2l0Y2ggZm9jdXMgYmV0d2VlbiBidXR0b25zXG4gICAgfSBlbHNlIGlmIChhcnJvd0tleXMuaW5kZXhPZihlLmtleSkgIT09IC0xKSB7XG4gICAgICBoYW5kbGVBcnJvd3MoKTsgLy8gRVNDXG4gICAgfSBlbHNlIGlmIChlc2NLZXlzLmluZGV4T2YoZS5rZXkpICE9PSAtMSkge1xuICAgICAgaGFuZGxlRXNjKGUsIGlubmVyUGFyYW1zLCBkaXNtaXNzV2l0aCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBoYW5kbGVFbnRlciA9IGZ1bmN0aW9uIGhhbmRsZUVudGVyKGluc3RhbmNlLCBlLCBpbm5lclBhcmFtcykge1xuICAgIC8vICM3MjAgIzcyMVxuICAgIGlmIChlLmlzQ29tcG9zaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGUudGFyZ2V0ICYmIGluc3RhbmNlLmdldElucHV0KCkgJiYgZS50YXJnZXQub3V0ZXJIVE1MID09PSBpbnN0YW5jZS5nZXRJbnB1dCgpLm91dGVySFRNTCkge1xuICAgICAgaWYgKFsndGV4dGFyZWEnLCAnZmlsZSddLmluZGV4T2YoaW5uZXJQYXJhbXMuaW5wdXQpICE9PSAtMSkge1xuICAgICAgICByZXR1cm47IC8vIGRvIG5vdCBzdWJtaXRcbiAgICAgIH1cblxuICAgICAgY2xpY2tDb25maXJtKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBoYW5kbGVUYWIgPSBmdW5jdGlvbiBoYW5kbGVUYWIoZSwgaW5uZXJQYXJhbXMpIHtcbiAgICB2YXIgdGFyZ2V0RWxlbWVudCA9IGUudGFyZ2V0O1xuICAgIHZhciBmb2N1c2FibGVFbGVtZW50cyA9IGdldEZvY3VzYWJsZUVsZW1lbnRzKCk7XG4gICAgdmFyIGJ0bkluZGV4ID0gLTE7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZvY3VzYWJsZUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGFyZ2V0RWxlbWVudCA9PT0gZm9jdXNhYmxlRWxlbWVudHNbaV0pIHtcbiAgICAgICAgYnRuSW5kZXggPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWUuc2hpZnRLZXkpIHtcbiAgICAgIC8vIEN5Y2xlIHRvIHRoZSBuZXh0IGJ1dHRvblxuICAgICAgc2V0Rm9jdXMoaW5uZXJQYXJhbXMsIGJ0bkluZGV4LCAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQ3ljbGUgdG8gdGhlIHByZXYgYnV0dG9uXG4gICAgICBzZXRGb2N1cyhpbm5lclBhcmFtcywgYnRuSW5kZXgsIC0xKTtcbiAgICB9XG5cbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfTtcblxuICB2YXIgaGFuZGxlQXJyb3dzID0gZnVuY3Rpb24gaGFuZGxlQXJyb3dzKCkge1xuICAgIHZhciBjb25maXJtQnV0dG9uID0gZ2V0Q29uZmlybUJ1dHRvbigpO1xuICAgIHZhciBjYW5jZWxCdXR0b24gPSBnZXRDYW5jZWxCdXR0b24oKTsgLy8gZm9jdXMgQ2FuY2VsIGJ1dHRvbiBpZiBDb25maXJtIGJ1dHRvbiBpcyBjdXJyZW50bHkgZm9jdXNlZFxuXG4gICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgPT09IGNvbmZpcm1CdXR0b24gJiYgaXNWaXNpYmxlKGNhbmNlbEJ1dHRvbikpIHtcbiAgICAgIGNhbmNlbEJ1dHRvbi5mb2N1cygpOyAvLyBhbmQgdmljZSB2ZXJzYVxuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gY2FuY2VsQnV0dG9uICYmIGlzVmlzaWJsZShjb25maXJtQnV0dG9uKSkge1xuICAgICAgY29uZmlybUJ1dHRvbi5mb2N1cygpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgaGFuZGxlRXNjID0gZnVuY3Rpb24gaGFuZGxlRXNjKGUsIGlubmVyUGFyYW1zLCBkaXNtaXNzV2l0aCkge1xuICAgIGlmIChjYWxsSWZGdW5jdGlvbihpbm5lclBhcmFtcy5hbGxvd0VzY2FwZUtleSkpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGRpc21pc3NXaXRoKERpc21pc3NSZWFzb24uZXNjKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGhhbmRsZVBvcHVwQ2xpY2sgPSBmdW5jdGlvbiBoYW5kbGVQb3B1cENsaWNrKGluc3RhbmNlLCBkb21DYWNoZSwgZGlzbWlzc1dpdGgpIHtcbiAgICB2YXIgaW5uZXJQYXJhbXMgPSBwcml2YXRlUHJvcHMuaW5uZXJQYXJhbXMuZ2V0KGluc3RhbmNlKTtcblxuICAgIGlmIChpbm5lclBhcmFtcy50b2FzdCkge1xuICAgICAgaGFuZGxlVG9hc3RDbGljayhpbnN0YW5jZSwgZG9tQ2FjaGUsIGRpc21pc3NXaXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWdub3JlIGNsaWNrIGV2ZW50cyB0aGF0IGhhZCBtb3VzZWRvd24gb24gdGhlIHBvcHVwIGJ1dCBtb3VzZXVwIG9uIHRoZSBjb250YWluZXJcbiAgICAgIC8vIFRoaXMgY2FuIGhhcHBlbiB3aGVuIHRoZSB1c2VyIGRyYWdzIGEgc2xpZGVyXG4gICAgICBoYW5kbGVNb2RhbE1vdXNlZG93bihkb21DYWNoZSk7IC8vIElnbm9yZSBjbGljayBldmVudHMgdGhhdCBoYWQgbW91c2Vkb3duIG9uIHRoZSBjb250YWluZXIgYnV0IG1vdXNldXAgb24gdGhlIHBvcHVwXG5cbiAgICAgIGhhbmRsZUNvbnRhaW5lck1vdXNlZG93bihkb21DYWNoZSk7XG4gICAgICBoYW5kbGVNb2RhbENsaWNrKGluc3RhbmNlLCBkb21DYWNoZSwgZGlzbWlzc1dpdGgpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgaGFuZGxlVG9hc3RDbGljayA9IGZ1bmN0aW9uIGhhbmRsZVRvYXN0Q2xpY2soaW5zdGFuY2UsIGRvbUNhY2hlLCBkaXNtaXNzV2l0aCkge1xuICAgIC8vIENsb3NpbmcgdG9hc3QgYnkgaW50ZXJuYWwgY2xpY2tcbiAgICBkb21DYWNoZS5wb3B1cC5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGlubmVyUGFyYW1zID0gcHJpdmF0ZVByb3BzLmlubmVyUGFyYW1zLmdldChpbnN0YW5jZSk7XG5cbiAgICAgIGlmIChpbm5lclBhcmFtcy5zaG93Q29uZmlybUJ1dHRvbiB8fCBpbm5lclBhcmFtcy5zaG93Q2FuY2VsQnV0dG9uIHx8IGlubmVyUGFyYW1zLnNob3dDbG9zZUJ1dHRvbiB8fCBpbm5lclBhcmFtcy5pbnB1dCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGRpc21pc3NXaXRoKERpc21pc3NSZWFzb24uY2xvc2UpO1xuICAgIH07XG4gIH07XG5cbiAgdmFyIGlnbm9yZU91dHNpZGVDbGljayA9IGZhbHNlO1xuXG4gIHZhciBoYW5kbGVNb2RhbE1vdXNlZG93biA9IGZ1bmN0aW9uIGhhbmRsZU1vZGFsTW91c2Vkb3duKGRvbUNhY2hlKSB7XG4gICAgZG9tQ2FjaGUucG9wdXAub25tb3VzZWRvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICBkb21DYWNoZS5jb250YWluZXIub25tb3VzZXVwID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZG9tQ2FjaGUuY29udGFpbmVyLm9ubW91c2V1cCA9IHVuZGVmaW5lZDsgLy8gV2Ugb25seSBjaGVjayBpZiB0aGUgbW91c2V1cCB0YXJnZXQgaXMgdGhlIGNvbnRhaW5lciBiZWNhdXNlIHVzdWFsbHkgaXQgZG9lc24ndFxuICAgICAgICAvLyBoYXZlIGFueSBvdGhlciBkaXJlY3QgY2hpbGRyZW4gYXNpZGUgb2YgdGhlIHBvcHVwXG5cbiAgICAgICAgaWYgKGUudGFyZ2V0ID09PSBkb21DYWNoZS5jb250YWluZXIpIHtcbiAgICAgICAgICBpZ25vcmVPdXRzaWRlQ2xpY2sgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG4gIH07XG5cbiAgdmFyIGhhbmRsZUNvbnRhaW5lck1vdXNlZG93biA9IGZ1bmN0aW9uIGhhbmRsZUNvbnRhaW5lck1vdXNlZG93bihkb21DYWNoZSkge1xuICAgIGRvbUNhY2hlLmNvbnRhaW5lci5vbm1vdXNlZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGRvbUNhY2hlLnBvcHVwLm9ubW91c2V1cCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGRvbUNhY2hlLnBvcHVwLm9ubW91c2V1cCA9IHVuZGVmaW5lZDsgLy8gV2UgYWxzbyBuZWVkIHRvIGNoZWNrIGlmIHRoZSBtb3VzZXVwIHRhcmdldCBpcyBhIGNoaWxkIG9mIHRoZSBwb3B1cFxuXG4gICAgICAgIGlmIChlLnRhcmdldCA9PT0gZG9tQ2FjaGUucG9wdXAgfHwgZG9tQ2FjaGUucG9wdXAuY29udGFpbnMoZS50YXJnZXQpKSB7XG4gICAgICAgICAgaWdub3JlT3V0c2lkZUNsaWNrID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuICB9O1xuXG4gIHZhciBoYW5kbGVNb2RhbENsaWNrID0gZnVuY3Rpb24gaGFuZGxlTW9kYWxDbGljayhpbnN0YW5jZSwgZG9tQ2FjaGUsIGRpc21pc3NXaXRoKSB7XG4gICAgZG9tQ2FjaGUuY29udGFpbmVyLm9uY2xpY2sgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyIGlubmVyUGFyYW1zID0gcHJpdmF0ZVByb3BzLmlubmVyUGFyYW1zLmdldChpbnN0YW5jZSk7XG5cbiAgICAgIGlmIChpZ25vcmVPdXRzaWRlQ2xpY2spIHtcbiAgICAgICAgaWdub3JlT3V0c2lkZUNsaWNrID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGUudGFyZ2V0ID09PSBkb21DYWNoZS5jb250YWluZXIgJiYgY2FsbElmRnVuY3Rpb24oaW5uZXJQYXJhbXMuYWxsb3dPdXRzaWRlQ2xpY2spKSB7XG4gICAgICAgIGRpc21pc3NXaXRoKERpc21pc3NSZWFzb24uYmFja2Ryb3ApO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gX21haW4odXNlclBhcmFtcykge1xuICAgIHNob3dXYXJuaW5nc0ZvclBhcmFtcyh1c2VyUGFyYW1zKTtcblxuICAgIGlmIChnbG9iYWxTdGF0ZS5jdXJyZW50SW5zdGFuY2UpIHtcbiAgICAgIGdsb2JhbFN0YXRlLmN1cnJlbnRJbnN0YW5jZS5fZGVzdHJveSgpO1xuICAgIH1cblxuICAgIGdsb2JhbFN0YXRlLmN1cnJlbnRJbnN0YW5jZSA9IHRoaXM7XG4gICAgdmFyIGlubmVyUGFyYW1zID0gcHJlcGFyZVBhcmFtcyh1c2VyUGFyYW1zKTtcbiAgICBzZXRQYXJhbWV0ZXJzKGlubmVyUGFyYW1zKTtcbiAgICBPYmplY3QuZnJlZXplKGlubmVyUGFyYW1zKTsgLy8gY2xlYXIgdGhlIHByZXZpb3VzIHRpbWVyXG5cbiAgICBpZiAoZ2xvYmFsU3RhdGUudGltZW91dCkge1xuICAgICAgZ2xvYmFsU3RhdGUudGltZW91dC5zdG9wKCk7XG4gICAgICBkZWxldGUgZ2xvYmFsU3RhdGUudGltZW91dDtcbiAgICB9IC8vIGNsZWFyIHRoZSByZXN0b3JlIGZvY3VzIHRpbWVvdXRcblxuXG4gICAgY2xlYXJUaW1lb3V0KGdsb2JhbFN0YXRlLnJlc3RvcmVGb2N1c1RpbWVvdXQpO1xuICAgIHZhciBkb21DYWNoZSA9IHBvcHVsYXRlRG9tQ2FjaGUodGhpcyk7XG4gICAgcmVuZGVyKHRoaXMsIGlubmVyUGFyYW1zKTtcbiAgICBwcml2YXRlUHJvcHMuaW5uZXJQYXJhbXMuc2V0KHRoaXMsIGlubmVyUGFyYW1zKTtcbiAgICByZXR1cm4gc3dhbFByb21pc2UodGhpcywgZG9tQ2FjaGUsIGlubmVyUGFyYW1zKTtcbiAgfVxuXG4gIHZhciBwcmVwYXJlUGFyYW1zID0gZnVuY3Rpb24gcHJlcGFyZVBhcmFtcyh1c2VyUGFyYW1zKSB7XG4gICAgdmFyIHNob3dDbGFzcyA9IF9leHRlbmRzKHt9LCBkZWZhdWx0UGFyYW1zLnNob3dDbGFzcywgdXNlclBhcmFtcy5zaG93Q2xhc3MpO1xuXG4gICAgdmFyIGhpZGVDbGFzcyA9IF9leHRlbmRzKHt9LCBkZWZhdWx0UGFyYW1zLmhpZGVDbGFzcywgdXNlclBhcmFtcy5oaWRlQ2xhc3MpO1xuXG4gICAgdmFyIHBhcmFtcyA9IF9leHRlbmRzKHt9LCBkZWZhdWx0UGFyYW1zLCB1c2VyUGFyYW1zKTtcblxuICAgIHBhcmFtcy5zaG93Q2xhc3MgPSBzaG93Q2xhc3M7XG4gICAgcGFyYW1zLmhpZGVDbGFzcyA9IGhpZGVDbGFzczsgLy8gQGRlcHJlY2F0ZWRcblxuICAgIGlmICh1c2VyUGFyYW1zLmFuaW1hdGlvbiA9PT0gZmFsc2UpIHtcbiAgICAgIHBhcmFtcy5zaG93Q2xhc3MgPSB7XG4gICAgICAgIHBvcHVwOiAnJyxcbiAgICAgICAgYmFja2Ryb3A6ICdzd2FsMi1iYWNrZHJvcC1zaG93IHN3YWwyLW5vYW5pbWF0aW9uJ1xuICAgICAgfTtcbiAgICAgIHBhcmFtcy5oaWRlQ2xhc3MgPSB7fTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyYW1zO1xuICB9O1xuXG4gIHZhciBzd2FsUHJvbWlzZSA9IGZ1bmN0aW9uIHN3YWxQcm9taXNlKGluc3RhbmNlLCBkb21DYWNoZSwgaW5uZXJQYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgIC8vIGZ1bmN0aW9ucyB0byBoYW5kbGUgYWxsIGNsb3NpbmdzL2Rpc21pc3NhbHNcbiAgICAgIHZhciBkaXNtaXNzV2l0aCA9IGZ1bmN0aW9uIGRpc21pc3NXaXRoKGRpc21pc3MpIHtcbiAgICAgICAgaW5zdGFuY2UuY2xvc2VQb3B1cCh7XG4gICAgICAgICAgZGlzbWlzczogZGlzbWlzc1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIHByaXZhdGVNZXRob2RzLnN3YWxQcm9taXNlUmVzb2x2ZS5zZXQoaW5zdGFuY2UsIHJlc29sdmUpO1xuICAgICAgc2V0dXBUaW1lcihnbG9iYWxTdGF0ZSwgaW5uZXJQYXJhbXMsIGRpc21pc3NXaXRoKTtcblxuICAgICAgZG9tQ2FjaGUuY29uZmlybUJ1dHRvbi5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gaGFuZGxlQ29uZmlybUJ1dHRvbkNsaWNrKGluc3RhbmNlLCBpbm5lclBhcmFtcyk7XG4gICAgICB9O1xuXG4gICAgICBkb21DYWNoZS5jYW5jZWxCdXR0b24ub25jbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZUNhbmNlbEJ1dHRvbkNsaWNrKGluc3RhbmNlLCBkaXNtaXNzV2l0aCk7XG4gICAgICB9O1xuXG4gICAgICBkb21DYWNoZS5jbG9zZUJ1dHRvbi5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZGlzbWlzc1dpdGgoRGlzbWlzc1JlYXNvbi5jbG9zZSk7XG4gICAgICB9O1xuXG4gICAgICBoYW5kbGVQb3B1cENsaWNrKGluc3RhbmNlLCBkb21DYWNoZSwgZGlzbWlzc1dpdGgpO1xuICAgICAgYWRkS2V5ZG93bkhhbmRsZXIoaW5zdGFuY2UsIGdsb2JhbFN0YXRlLCBpbm5lclBhcmFtcywgZGlzbWlzc1dpdGgpO1xuXG4gICAgICBpZiAoaW5uZXJQYXJhbXMudG9hc3QgJiYgKGlubmVyUGFyYW1zLmlucHV0IHx8IGlubmVyUGFyYW1zLmZvb3RlciB8fCBpbm5lclBhcmFtcy5zaG93Q2xvc2VCdXR0b24pKSB7XG4gICAgICAgIGFkZENsYXNzKGRvY3VtZW50LmJvZHksIHN3YWxDbGFzc2VzWyd0b2FzdC1jb2x1bW4nXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW1vdmVDbGFzcyhkb2N1bWVudC5ib2R5LCBzd2FsQ2xhc3Nlc1sndG9hc3QtY29sdW1uJ10pO1xuICAgICAgfVxuXG4gICAgICBoYW5kbGVJbnB1dE9wdGlvbnNBbmRWYWx1ZShpbnN0YW5jZSwgaW5uZXJQYXJhbXMpO1xuICAgICAgb3BlblBvcHVwKGlubmVyUGFyYW1zKTtcbiAgICAgIGluaXRGb2N1cyhkb21DYWNoZSwgaW5uZXJQYXJhbXMpOyAvLyBTY3JvbGwgY29udGFpbmVyIHRvIHRvcCBvbiBvcGVuICgjMTI0NylcblxuICAgICAgZG9tQ2FjaGUuY29udGFpbmVyLnNjcm9sbFRvcCA9IDA7XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIHBvcHVsYXRlRG9tQ2FjaGUgPSBmdW5jdGlvbiBwb3B1bGF0ZURvbUNhY2hlKGluc3RhbmNlKSB7XG4gICAgdmFyIGRvbUNhY2hlID0ge1xuICAgICAgcG9wdXA6IGdldFBvcHVwKCksXG4gICAgICBjb250YWluZXI6IGdldENvbnRhaW5lcigpLFxuICAgICAgY29udGVudDogZ2V0Q29udGVudCgpLFxuICAgICAgYWN0aW9uczogZ2V0QWN0aW9ucygpLFxuICAgICAgY29uZmlybUJ1dHRvbjogZ2V0Q29uZmlybUJ1dHRvbigpLFxuICAgICAgY2FuY2VsQnV0dG9uOiBnZXRDYW5jZWxCdXR0b24oKSxcbiAgICAgIGNsb3NlQnV0dG9uOiBnZXRDbG9zZUJ1dHRvbigpLFxuICAgICAgdmFsaWRhdGlvbk1lc3NhZ2U6IGdldFZhbGlkYXRpb25NZXNzYWdlKCksXG4gICAgICBwcm9ncmVzc1N0ZXBzOiBnZXRQcm9ncmVzc1N0ZXBzKClcbiAgICB9O1xuICAgIHByaXZhdGVQcm9wcy5kb21DYWNoZS5zZXQoaW5zdGFuY2UsIGRvbUNhY2hlKTtcbiAgICByZXR1cm4gZG9tQ2FjaGU7XG4gIH07XG5cbiAgdmFyIHNldHVwVGltZXIgPSBmdW5jdGlvbiBzZXR1cFRpbWVyKGdsb2JhbFN0YXRlJCQxLCBpbm5lclBhcmFtcywgZGlzbWlzc1dpdGgpIHtcbiAgICB2YXIgdGltZXJQcm9ncmVzc0JhciA9IGdldFRpbWVyUHJvZ3Jlc3NCYXIoKTtcbiAgICBoaWRlKHRpbWVyUHJvZ3Jlc3NCYXIpO1xuXG4gICAgaWYgKGlubmVyUGFyYW1zLnRpbWVyKSB7XG4gICAgICBnbG9iYWxTdGF0ZSQkMS50aW1lb3V0ID0gbmV3IFRpbWVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZGlzbWlzc1dpdGgoJ3RpbWVyJyk7XG4gICAgICAgIGRlbGV0ZSBnbG9iYWxTdGF0ZSQkMS50aW1lb3V0O1xuICAgICAgfSwgaW5uZXJQYXJhbXMudGltZXIpO1xuXG4gICAgICBpZiAoaW5uZXJQYXJhbXMudGltZXJQcm9ncmVzc0Jhcikge1xuICAgICAgICBzaG93KHRpbWVyUHJvZ3Jlc3NCYXIpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoZ2xvYmFsU3RhdGUkJDEudGltZW91dC5ydW5uaW5nKSB7XG4gICAgICAgICAgICAvLyB0aW1lciBjYW4gYmUgYWxyZWFkeSBzdG9wcGVkIGF0IHRoaXMgcG9pbnRcbiAgICAgICAgICAgIGFuaW1hdGVUaW1lclByb2dyZXNzQmFyKGlubmVyUGFyYW1zLnRpbWVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICB2YXIgaW5pdEZvY3VzID0gZnVuY3Rpb24gaW5pdEZvY3VzKGRvbUNhY2hlLCBpbm5lclBhcmFtcykge1xuICAgIGlmIChpbm5lclBhcmFtcy50b2FzdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghY2FsbElmRnVuY3Rpb24oaW5uZXJQYXJhbXMuYWxsb3dFbnRlcktleSkpIHtcbiAgICAgIHJldHVybiBibHVyQWN0aXZlRWxlbWVudCgpO1xuICAgIH1cblxuICAgIGlmIChpbm5lclBhcmFtcy5mb2N1c0NhbmNlbCAmJiBpc1Zpc2libGUoZG9tQ2FjaGUuY2FuY2VsQnV0dG9uKSkge1xuICAgICAgcmV0dXJuIGRvbUNhY2hlLmNhbmNlbEJ1dHRvbi5mb2N1cygpO1xuICAgIH1cblxuICAgIGlmIChpbm5lclBhcmFtcy5mb2N1c0NvbmZpcm0gJiYgaXNWaXNpYmxlKGRvbUNhY2hlLmNvbmZpcm1CdXR0b24pKSB7XG4gICAgICByZXR1cm4gZG9tQ2FjaGUuY29uZmlybUJ1dHRvbi5mb2N1cygpO1xuICAgIH1cblxuICAgIHNldEZvY3VzKGlubmVyUGFyYW1zLCAtMSwgMSk7XG4gIH07XG5cbiAgdmFyIGJsdXJBY3RpdmVFbGVtZW50ID0gZnVuY3Rpb24gYmx1ckFjdGl2ZUVsZW1lbnQoKSB7XG4gICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgJiYgdHlwZW9mIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1ciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHBvcHVwIHBhcmFtZXRlcnMuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHVwZGF0ZShwYXJhbXMpIHtcbiAgICB2YXIgcG9wdXAgPSBnZXRQb3B1cCgpO1xuICAgIHZhciBpbm5lclBhcmFtcyA9IHByaXZhdGVQcm9wcy5pbm5lclBhcmFtcy5nZXQodGhpcyk7XG5cbiAgICBpZiAoIXBvcHVwIHx8IGhhc0NsYXNzKHBvcHVwLCBpbm5lclBhcmFtcy5oaWRlQ2xhc3MucG9wdXApKSB7XG4gICAgICByZXR1cm4gd2FybihcIllvdSdyZSB0cnlpbmcgdG8gdXBkYXRlIHRoZSBjbG9zZWQgb3IgY2xvc2luZyBwb3B1cCwgdGhhdCB3b24ndCB3b3JrLiBVc2UgdGhlIHVwZGF0ZSgpIG1ldGhvZCBpbiBwcmVDb25maXJtIHBhcmFtZXRlciBvciBzaG93IGEgbmV3IHBvcHVwLlwiKTtcbiAgICB9XG5cbiAgICB2YXIgdmFsaWRVcGRhdGFibGVQYXJhbXMgPSB7fTsgLy8gYXNzaWduIHZhbGlkIHBhcmFtcyBmcm9tIGBwYXJhbXNgIHRvIGBkZWZhdWx0c2BcblxuICAgIE9iamVjdC5rZXlzKHBhcmFtcykuZm9yRWFjaChmdW5jdGlvbiAocGFyYW0pIHtcbiAgICAgIGlmIChTd2FsLmlzVXBkYXRhYmxlUGFyYW1ldGVyKHBhcmFtKSkge1xuICAgICAgICB2YWxpZFVwZGF0YWJsZVBhcmFtc1twYXJhbV0gPSBwYXJhbXNbcGFyYW1dO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2FybihcIkludmFsaWQgcGFyYW1ldGVyIHRvIHVwZGF0ZTogXFxcIlwiLmNvbmNhdChwYXJhbSwgXCJcXFwiLiBVcGRhdGFibGUgcGFyYW1zIGFyZSBsaXN0ZWQgaGVyZTogaHR0cHM6Ly9naXRodWIuY29tL3N3ZWV0YWxlcnQyL3N3ZWV0YWxlcnQyL2Jsb2IvbWFzdGVyL3NyYy91dGlscy9wYXJhbXMuanNcIikpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIHVwZGF0ZWRQYXJhbXMgPSBfZXh0ZW5kcyh7fSwgaW5uZXJQYXJhbXMsIHZhbGlkVXBkYXRhYmxlUGFyYW1zKTtcblxuICAgIHJlbmRlcih0aGlzLCB1cGRhdGVkUGFyYW1zKTtcbiAgICBwcml2YXRlUHJvcHMuaW5uZXJQYXJhbXMuc2V0KHRoaXMsIHVwZGF0ZWRQYXJhbXMpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgIHBhcmFtczoge1xuICAgICAgICB2YWx1ZTogX2V4dGVuZHMoe30sIHRoaXMucGFyYW1zLCBwYXJhbXMpLFxuICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9kZXN0cm95KCkge1xuICAgIHZhciBkb21DYWNoZSA9IHByaXZhdGVQcm9wcy5kb21DYWNoZS5nZXQodGhpcyk7XG4gICAgdmFyIGlubmVyUGFyYW1zID0gcHJpdmF0ZVByb3BzLmlubmVyUGFyYW1zLmdldCh0aGlzKTtcblxuICAgIGlmICghaW5uZXJQYXJhbXMpIHtcbiAgICAgIHJldHVybjsgLy8gVGhpcyBpbnN0YW5jZSBoYXMgYWxyZWFkeSBiZWVuIGRlc3Ryb3llZFxuICAgIH0gLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYW5vdGhlciBTd2FsIGNsb3NpbmdcblxuXG4gICAgaWYgKGRvbUNhY2hlLnBvcHVwICYmIGdsb2JhbFN0YXRlLnN3YWxDbG9zZUV2ZW50RmluaXNoZWRDYWxsYmFjaykge1xuICAgICAgZ2xvYmFsU3RhdGUuc3dhbENsb3NlRXZlbnRGaW5pc2hlZENhbGxiYWNrKCk7XG4gICAgICBkZWxldGUgZ2xvYmFsU3RhdGUuc3dhbENsb3NlRXZlbnRGaW5pc2hlZENhbGxiYWNrO1xuICAgIH0gLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSBzd2FsIGRpc3Bvc2FsIGRlZmVyIHRpbWVyXG5cblxuICAgIGlmIChnbG9iYWxTdGF0ZS5kZWZlckRpc3Bvc2FsVGltZXIpIHtcbiAgICAgIGNsZWFyVGltZW91dChnbG9iYWxTdGF0ZS5kZWZlckRpc3Bvc2FsVGltZXIpO1xuICAgICAgZGVsZXRlIGdsb2JhbFN0YXRlLmRlZmVyRGlzcG9zYWxUaW1lcjtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGlubmVyUGFyYW1zLm9uRGVzdHJveSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaW5uZXJQYXJhbXMub25EZXN0cm95KCk7XG4gICAgfVxuXG4gICAgZGlzcG9zZVN3YWwodGhpcyk7XG4gIH1cblxuICB2YXIgZGlzcG9zZVN3YWwgPSBmdW5jdGlvbiBkaXNwb3NlU3dhbChpbnN0YW5jZSkge1xuICAgIC8vIFVuc2V0IHRoaXMucGFyYW1zIHNvIEdDIHdpbGwgZGlzcG9zZSBpdCAoIzE1NjkpXG4gICAgZGVsZXRlIGluc3RhbmNlLnBhcmFtczsgLy8gVW5zZXQgZ2xvYmFsU3RhdGUgcHJvcHMgc28gR0Mgd2lsbCBkaXNwb3NlIGdsb2JhbFN0YXRlICgjMTU2OSlcblxuICAgIGRlbGV0ZSBnbG9iYWxTdGF0ZS5rZXlkb3duSGFuZGxlcjtcbiAgICBkZWxldGUgZ2xvYmFsU3RhdGUua2V5ZG93blRhcmdldDsgLy8gVW5zZXQgV2Vha01hcHMgc28gR0Mgd2lsbCBiZSBhYmxlIHRvIGRpc3Bvc2UgdGhlbSAoIzE1NjkpXG5cbiAgICB1bnNldFdlYWtNYXBzKHByaXZhdGVQcm9wcyk7XG4gICAgdW5zZXRXZWFrTWFwcyhwcml2YXRlTWV0aG9kcyk7XG4gIH07XG5cbiAgdmFyIHVuc2V0V2Vha01hcHMgPSBmdW5jdGlvbiB1bnNldFdlYWtNYXBzKG9iaikge1xuICAgIGZvciAodmFyIGkgaW4gb2JqKSB7XG4gICAgICBvYmpbaV0gPSBuZXcgV2Vha01hcCgpO1xuICAgIH1cbiAgfTtcblxuXG5cbiAgdmFyIGluc3RhbmNlTWV0aG9kcyA9IC8qI19fUFVSRV9fKi9PYmplY3QuZnJlZXplKHtcbiAgICBoaWRlTG9hZGluZzogaGlkZUxvYWRpbmcsXG4gICAgZGlzYWJsZUxvYWRpbmc6IGhpZGVMb2FkaW5nLFxuICAgIGdldElucHV0OiBnZXRJbnB1dCQxLFxuICAgIGNsb3NlOiBjbG9zZSxcbiAgICBjbG9zZVBvcHVwOiBjbG9zZSxcbiAgICBjbG9zZU1vZGFsOiBjbG9zZSxcbiAgICBjbG9zZVRvYXN0OiBjbG9zZSxcbiAgICBlbmFibGVCdXR0b25zOiBlbmFibGVCdXR0b25zLFxuICAgIGRpc2FibGVCdXR0b25zOiBkaXNhYmxlQnV0dG9ucyxcbiAgICBlbmFibGVJbnB1dDogZW5hYmxlSW5wdXQsXG4gICAgZGlzYWJsZUlucHV0OiBkaXNhYmxlSW5wdXQsXG4gICAgc2hvd1ZhbGlkYXRpb25NZXNzYWdlOiBzaG93VmFsaWRhdGlvbk1lc3NhZ2UsXG4gICAgcmVzZXRWYWxpZGF0aW9uTWVzc2FnZTogcmVzZXRWYWxpZGF0aW9uTWVzc2FnZSQxLFxuICAgIGdldFByb2dyZXNzU3RlcHM6IGdldFByb2dyZXNzU3RlcHMkMSxcbiAgICBfbWFpbjogX21haW4sXG4gICAgdXBkYXRlOiB1cGRhdGUsXG4gICAgX2Rlc3Ryb3k6IF9kZXN0cm95XG4gIH0pO1xuXG4gIHZhciBjdXJyZW50SW5zdGFuY2U7IC8vIFN3ZWV0QWxlcnQgY29uc3RydWN0b3JcblxuICBmdW5jdGlvbiBTd2VldEFsZXJ0KCkge1xuICAgIC8vIFByZXZlbnQgcnVuIGluIE5vZGUgZW52XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IC8vIENoZWNrIGZvciB0aGUgZXhpc3RlbmNlIG9mIFByb21pc2VcblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXG5cbiAgICBpZiAodHlwZW9mIFByb21pc2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBlcnJvcignVGhpcyBwYWNrYWdlIHJlcXVpcmVzIGEgUHJvbWlzZSBsaWJyYXJ5LCBwbGVhc2UgaW5jbHVkZSBhIHNoaW0gdG8gZW5hYmxlIGl0IGluIHRoaXMgYnJvd3NlciAoU2VlOiBodHRwczovL2dpdGh1Yi5jb20vc3dlZXRhbGVydDIvc3dlZXRhbGVydDIvd2lraS9NaWdyYXRpb24tZnJvbS1Td2VldEFsZXJ0LXRvLVN3ZWV0QWxlcnQyIzEtaWUtc3VwcG9ydCknKTtcbiAgICB9XG5cbiAgICBjdXJyZW50SW5zdGFuY2UgPSB0aGlzO1xuXG4gICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgIH1cblxuICAgIHZhciBvdXRlclBhcmFtcyA9IE9iamVjdC5mcmVlemUodGhpcy5jb25zdHJ1Y3Rvci5hcmdzVG9QYXJhbXMoYXJncykpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgIHBhcmFtczoge1xuICAgICAgICB2YWx1ZTogb3V0ZXJQYXJhbXMsXG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgcHJvbWlzZSA9IHRoaXMuX21haW4odGhpcy5wYXJhbXMpO1xuXG4gICAgcHJpdmF0ZVByb3BzLnByb21pc2Uuc2V0KHRoaXMsIHByb21pc2UpO1xuICB9IC8vIGBjYXRjaGAgY2Fubm90IGJlIHRoZSBuYW1lIG9mIGEgbW9kdWxlIGV4cG9ydCwgc28gd2UgZGVmaW5lIG91ciB0aGVuYWJsZSBtZXRob2RzIGhlcmUgaW5zdGVhZFxuXG5cbiAgU3dlZXRBbGVydC5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChvbkZ1bGZpbGxlZCkge1xuICAgIHZhciBwcm9taXNlID0gcHJpdmF0ZVByb3BzLnByb21pc2UuZ2V0KHRoaXMpO1xuICAgIHJldHVybiBwcm9taXNlLnRoZW4ob25GdWxmaWxsZWQpO1xuICB9O1xuXG4gIFN3ZWV0QWxlcnQucHJvdG90eXBlW1wiZmluYWxseVwiXSA9IGZ1bmN0aW9uIChvbkZpbmFsbHkpIHtcbiAgICB2YXIgcHJvbWlzZSA9IHByaXZhdGVQcm9wcy5wcm9taXNlLmdldCh0aGlzKTtcbiAgICByZXR1cm4gcHJvbWlzZVtcImZpbmFsbHlcIl0ob25GaW5hbGx5KTtcbiAgfTsgLy8gQXNzaWduIGluc3RhbmNlIG1ldGhvZHMgZnJvbSBzcmMvaW5zdGFuY2VNZXRob2RzLyouanMgdG8gcHJvdG90eXBlXG5cblxuICBfZXh0ZW5kcyhTd2VldEFsZXJ0LnByb3RvdHlwZSwgaW5zdGFuY2VNZXRob2RzKTsgLy8gQXNzaWduIHN0YXRpYyBtZXRob2RzIGZyb20gc3JjL3N0YXRpY01ldGhvZHMvKi5qcyB0byBjb25zdHJ1Y3RvclxuXG5cbiAgX2V4dGVuZHMoU3dlZXRBbGVydCwgc3RhdGljTWV0aG9kcyk7IC8vIFByb3h5IHRvIGluc3RhbmNlIG1ldGhvZHMgdG8gY29uc3RydWN0b3IsIGZvciBub3csIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuXG5cbiAgT2JqZWN0LmtleXMoaW5zdGFuY2VNZXRob2RzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBTd2VldEFsZXJ0W2tleV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoY3VycmVudEluc3RhbmNlKSB7XG4gICAgICAgIHZhciBfY3VycmVudEluc3RhbmNlO1xuXG4gICAgICAgIHJldHVybiAoX2N1cnJlbnRJbnN0YW5jZSA9IGN1cnJlbnRJbnN0YW5jZSlba2V5XS5hcHBseShfY3VycmVudEluc3RhbmNlLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuICBTd2VldEFsZXJ0LkRpc21pc3NSZWFzb24gPSBEaXNtaXNzUmVhc29uO1xuICBTd2VldEFsZXJ0LnZlcnNpb24gPSAnOS44LjInO1xuXG4gIHZhciBTd2FsID0gU3dlZXRBbGVydDtcbiAgU3dhbFtcImRlZmF1bHRcIl0gPSBTd2FsO1xuXG4gIHJldHVybiBTd2FsO1xuXG59KSk7XG5pZiAodHlwZW9mIHRoaXMgIT09ICd1bmRlZmluZWQnICYmIHRoaXMuU3dlZXRhbGVydDIpeyAgdGhpcy5zd2FsID0gdGhpcy5zd2VldEFsZXJ0ID0gdGhpcy5Td2FsID0gdGhpcy5Td2VldEFsZXJ0ID0gdGhpcy5Td2VldGFsZXJ0Mn1cblxuXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRvY3VtZW50JiZmdW5jdGlvbihlLHQpe3ZhciBuPWUuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO2lmKGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdLmFwcGVuZENoaWxkKG4pLG4uc3R5bGVTaGVldCluLnN0eWxlU2hlZXQuZGlzYWJsZWR8fChuLnN0eWxlU2hlZXQuY3NzVGV4dD10KTtlbHNlIHRyeXtuLmlubmVySFRNTD10fWNhdGNoKGUpe24uaW5uZXJUZXh0PXR9fShkb2N1bWVudCxcIi5zd2FsMi1wb3B1cC5zd2FsMi10b2FzdHtmbGV4LWRpcmVjdGlvbjpyb3c7YWxpZ24taXRlbXM6Y2VudGVyO3dpZHRoOmF1dG87cGFkZGluZzouNjI1ZW07b3ZlcmZsb3cteTpoaWRkZW47YmFja2dyb3VuZDojZmZmO2JveC1zaGFkb3c6MCAwIC42MjVlbSAjZDlkOWQ5fS5zd2FsMi1wb3B1cC5zd2FsMi10b2FzdCAuc3dhbDItaGVhZGVye2ZsZXgtZGlyZWN0aW9uOnJvd30uc3dhbDItcG9wdXAuc3dhbDItdG9hc3QgLnN3YWwyLXRpdGxle2ZsZXgtZ3JvdzoxO2p1c3RpZnktY29udGVudDpmbGV4LXN0YXJ0O21hcmdpbjowIC42ZW07Zm9udC1zaXplOjFlbX0uc3dhbDItcG9wdXAuc3dhbDItdG9hc3QgLnN3YWwyLWZvb3RlcnttYXJnaW46LjVlbSAwIDA7cGFkZGluZzouNWVtIDAgMDtmb250LXNpemU6LjhlbX0uc3dhbDItcG9wdXAuc3dhbDItdG9hc3QgLnN3YWwyLWNsb3Nle3Bvc2l0aW9uOnN0YXRpYzt3aWR0aDouOGVtO2hlaWdodDouOGVtO2xpbmUtaGVpZ2h0Oi44fS5zd2FsMi1wb3B1cC5zd2FsMi10b2FzdCAuc3dhbDItY29udGVudHtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1zdGFydDtmb250LXNpemU6MWVtfS5zd2FsMi1wb3B1cC5zd2FsMi10b2FzdCAuc3dhbDItaWNvbnt3aWR0aDoyZW07bWluLXdpZHRoOjJlbTtoZWlnaHQ6MmVtO21hcmdpbjowfS5zd2FsMi1wb3B1cC5zd2FsMi10b2FzdCAuc3dhbDItaWNvbiAuc3dhbDItaWNvbi1jb250ZW50e2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Zm9udC1zaXplOjEuOGVtO2ZvbnQtd2VpZ2h0OjcwMH1AbWVkaWEgYWxsIGFuZCAoLW1zLWhpZ2gtY29udHJhc3Q6bm9uZSksKC1tcy1oaWdoLWNvbnRyYXN0OmFjdGl2ZSl7LnN3YWwyLXBvcHVwLnN3YWwyLXRvYXN0IC5zd2FsMi1pY29uIC5zd2FsMi1pY29uLWNvbnRlbnR7Zm9udC1zaXplOi4yNWVtfX0uc3dhbDItcG9wdXAuc3dhbDItdG9hc3QgLnN3YWwyLWljb24uc3dhbDItc3VjY2VzcyAuc3dhbDItc3VjY2Vzcy1yaW5ne3dpZHRoOjJlbTtoZWlnaHQ6MmVtfS5zd2FsMi1wb3B1cC5zd2FsMi10b2FzdCAuc3dhbDItaWNvbi5zd2FsMi1lcnJvciBbY2xhc3NePXN3YWwyLXgtbWFyay1saW5lXXt0b3A6Ljg3NWVtO3dpZHRoOjEuMzc1ZW19LnN3YWwyLXBvcHVwLnN3YWwyLXRvYXN0IC5zd2FsMi1pY29uLnN3YWwyLWVycm9yIFtjbGFzc149c3dhbDIteC1tYXJrLWxpbmVdW2NsYXNzJD1sZWZ0XXtsZWZ0Oi4zMTI1ZW19LnN3YWwyLXBvcHVwLnN3YWwyLXRvYXN0IC5zd2FsMi1pY29uLnN3YWwyLWVycm9yIFtjbGFzc149c3dhbDIteC1tYXJrLWxpbmVdW2NsYXNzJD1yaWdodF17cmlnaHQ6LjMxMjVlbX0uc3dhbDItcG9wdXAuc3dhbDItdG9hc3QgLnN3YWwyLWFjdGlvbnN7ZmxleC1iYXNpczphdXRvIWltcG9ydGFudDt3aWR0aDphdXRvO2hlaWdodDphdXRvO21hcmdpbjowIC4zMTI1ZW19LnN3YWwyLXBvcHVwLnN3YWwyLXRvYXN0IC5zd2FsMi1zdHlsZWR7bWFyZ2luOjAgLjMxMjVlbTtwYWRkaW5nOi4zMTI1ZW0gLjYyNWVtO2ZvbnQtc2l6ZToxZW19LnN3YWwyLXBvcHVwLnN3YWwyLXRvYXN0IC5zd2FsMi1zdHlsZWQ6Zm9jdXN7Ym94LXNoYWRvdzowIDAgMCAxcHggI2ZmZiwwIDAgMCAzcHggcmdiYSg1MCwxMDAsMTUwLC40KX0uc3dhbDItcG9wdXAuc3dhbDItdG9hc3QgLnN3YWwyLXN1Y2Nlc3N7Ym9yZGVyLWNvbG9yOiNhNWRjODZ9LnN3YWwyLXBvcHVwLnN3YWwyLXRvYXN0IC5zd2FsMi1zdWNjZXNzIFtjbGFzc149c3dhbDItc3VjY2Vzcy1jaXJjdWxhci1saW5lXXtwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDoxLjZlbTtoZWlnaHQ6M2VtO3RyYW5zZm9ybTpyb3RhdGUoNDVkZWcpO2JvcmRlci1yYWRpdXM6NTAlfS5zd2FsMi1wb3B1cC5zd2FsMi10b2FzdCAuc3dhbDItc3VjY2VzcyBbY2xhc3NePXN3YWwyLXN1Y2Nlc3MtY2lyY3VsYXItbGluZV1bY2xhc3MkPWxlZnRde3RvcDotLjhlbTtsZWZ0Oi0uNWVtO3RyYW5zZm9ybTpyb3RhdGUoLTQ1ZGVnKTt0cmFuc2Zvcm0tb3JpZ2luOjJlbSAyZW07Ym9yZGVyLXJhZGl1czo0ZW0gMCAwIDRlbX0uc3dhbDItcG9wdXAuc3dhbDItdG9hc3QgLnN3YWwyLXN1Y2Nlc3MgW2NsYXNzXj1zd2FsMi1zdWNjZXNzLWNpcmN1bGFyLWxpbmVdW2NsYXNzJD1yaWdodF17dG9wOi0uMjVlbTtsZWZ0Oi45Mzc1ZW07dHJhbnNmb3JtLW9yaWdpbjowIDEuNWVtO2JvcmRlci1yYWRpdXM6MCA0ZW0gNGVtIDB9LnN3YWwyLXBvcHVwLnN3YWwyLXRvYXN0IC5zd2FsMi1zdWNjZXNzIC5zd2FsMi1zdWNjZXNzLXJpbmd7d2lkdGg6MmVtO2hlaWdodDoyZW19LnN3YWwyLXBvcHVwLnN3YWwyLXRvYXN0IC5zd2FsMi1zdWNjZXNzIC5zd2FsMi1zdWNjZXNzLWZpeHt0b3A6MDtsZWZ0Oi40Mzc1ZW07d2lkdGg6LjQzNzVlbTtoZWlnaHQ6Mi42ODc1ZW19LnN3YWwyLXBvcHVwLnN3YWwyLXRvYXN0IC5zd2FsMi1zdWNjZXNzIFtjbGFzc149c3dhbDItc3VjY2Vzcy1saW5lXXtoZWlnaHQ6LjMxMjVlbX0uc3dhbDItcG9wdXAuc3dhbDItdG9hc3QgLnN3YWwyLXN1Y2Nlc3MgW2NsYXNzXj1zd2FsMi1zdWNjZXNzLWxpbmVdW2NsYXNzJD10aXBde3RvcDoxLjEyNWVtO2xlZnQ6LjE4NzVlbTt3aWR0aDouNzVlbX0uc3dhbDItcG9wdXAuc3dhbDItdG9hc3QgLnN3YWwyLXN1Y2Nlc3MgW2NsYXNzXj1zd2FsMi1zdWNjZXNzLWxpbmVdW2NsYXNzJD1sb25nXXt0b3A6LjkzNzVlbTtyaWdodDouMTg3NWVtO3dpZHRoOjEuMzc1ZW19LnN3YWwyLXBvcHVwLnN3YWwyLXRvYXN0IC5zd2FsMi1zdWNjZXNzLnN3YWwyLWljb24tc2hvdyAuc3dhbDItc3VjY2Vzcy1saW5lLXRpcHstd2Via2l0LWFuaW1hdGlvbjpzd2FsMi10b2FzdC1hbmltYXRlLXN1Y2Nlc3MtbGluZS10aXAgLjc1czthbmltYXRpb246c3dhbDItdG9hc3QtYW5pbWF0ZS1zdWNjZXNzLWxpbmUtdGlwIC43NXN9LnN3YWwyLXBvcHVwLnN3YWwyLXRvYXN0IC5zd2FsMi1zdWNjZXNzLnN3YWwyLWljb24tc2hvdyAuc3dhbDItc3VjY2Vzcy1saW5lLWxvbmd7LXdlYmtpdC1hbmltYXRpb246c3dhbDItdG9hc3QtYW5pbWF0ZS1zdWNjZXNzLWxpbmUtbG9uZyAuNzVzO2FuaW1hdGlvbjpzd2FsMi10b2FzdC1hbmltYXRlLXN1Y2Nlc3MtbGluZS1sb25nIC43NXN9LnN3YWwyLXBvcHVwLnN3YWwyLXRvYXN0LnN3YWwyLXNob3d7LXdlYmtpdC1hbmltYXRpb246c3dhbDItdG9hc3Qtc2hvdyAuNXM7YW5pbWF0aW9uOnN3YWwyLXRvYXN0LXNob3cgLjVzfS5zd2FsMi1wb3B1cC5zd2FsMi10b2FzdC5zd2FsMi1oaWRley13ZWJraXQtYW5pbWF0aW9uOnN3YWwyLXRvYXN0LWhpZGUgLjFzIGZvcndhcmRzO2FuaW1hdGlvbjpzd2FsMi10b2FzdC1oaWRlIC4xcyBmb3J3YXJkc30uc3dhbDItY29udGFpbmVye2Rpc3BsYXk6ZmxleDtwb3NpdGlvbjpmaXhlZDt6LWluZGV4OjEwNjA7dG9wOjA7cmlnaHQ6MDtib3R0b206MDtsZWZ0OjA7ZmxleC1kaXJlY3Rpb246cm93O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3BhZGRpbmc6LjYyNWVtO292ZXJmbG93LXg6aGlkZGVuO3RyYW5zaXRpb246YmFja2dyb3VuZC1jb2xvciAuMXM7LXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6dG91Y2h9LnN3YWwyLWNvbnRhaW5lci5zd2FsMi1iYWNrZHJvcC1zaG93e2JhY2tncm91bmQ6cmdiYSgwLDAsMCwuNCl9LnN3YWwyLWNvbnRhaW5lci5zd2FsMi1iYWNrZHJvcC1oaWRle2JhY2tncm91bmQ6MCAwIWltcG9ydGFudH0uc3dhbDItY29udGFpbmVyLnN3YWwyLXRvcHthbGlnbi1pdGVtczpmbGV4LXN0YXJ0fS5zd2FsMi1jb250YWluZXIuc3dhbDItdG9wLWxlZnQsLnN3YWwyLWNvbnRhaW5lci5zd2FsMi10b3Atc3RhcnR7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1zdGFydH0uc3dhbDItY29udGFpbmVyLnN3YWwyLXRvcC1lbmQsLnN3YWwyLWNvbnRhaW5lci5zd2FsMi10b3AtcmlnaHR7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1lbmR9LnN3YWwyLWNvbnRhaW5lci5zd2FsMi1jZW50ZXJ7YWxpZ24taXRlbXM6Y2VudGVyfS5zd2FsMi1jb250YWluZXIuc3dhbDItY2VudGVyLWxlZnQsLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1jZW50ZXItc3RhcnR7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpmbGV4LXN0YXJ0fS5zd2FsMi1jb250YWluZXIuc3dhbDItY2VudGVyLWVuZCwuc3dhbDItY29udGFpbmVyLnN3YWwyLWNlbnRlci1yaWdodHthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmZsZXgtZW5kfS5zd2FsMi1jb250YWluZXIuc3dhbDItYm90dG9te2FsaWduLWl0ZW1zOmZsZXgtZW5kfS5zd2FsMi1jb250YWluZXIuc3dhbDItYm90dG9tLWxlZnQsLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ib3R0b20tc3RhcnR7YWxpZ24taXRlbXM6ZmxleC1lbmQ7anVzdGlmeS1jb250ZW50OmZsZXgtc3RhcnR9LnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ib3R0b20tZW5kLC5zd2FsMi1jb250YWluZXIuc3dhbDItYm90dG9tLXJpZ2h0e2FsaWduLWl0ZW1zOmZsZXgtZW5kO2p1c3RpZnktY29udGVudDpmbGV4LWVuZH0uc3dhbDItY29udGFpbmVyLnN3YWwyLWJvdHRvbS1lbmQ+OmZpcnN0LWNoaWxkLC5zd2FsMi1jb250YWluZXIuc3dhbDItYm90dG9tLWxlZnQ+OmZpcnN0LWNoaWxkLC5zd2FsMi1jb250YWluZXIuc3dhbDItYm90dG9tLXJpZ2h0PjpmaXJzdC1jaGlsZCwuc3dhbDItY29udGFpbmVyLnN3YWwyLWJvdHRvbS1zdGFydD46Zmlyc3QtY2hpbGQsLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ib3R0b20+OmZpcnN0LWNoaWxke21hcmdpbi10b3A6YXV0b30uc3dhbDItY29udGFpbmVyLnN3YWwyLWdyb3ctZnVsbHNjcmVlbj4uc3dhbDItbW9kYWx7ZGlzcGxheTpmbGV4IWltcG9ydGFudDtmbGV4OjE7YWxpZ24tc2VsZjpzdHJldGNoO2p1c3RpZnktY29udGVudDpjZW50ZXJ9LnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ncm93LXJvdz4uc3dhbDItbW9kYWx7ZGlzcGxheTpmbGV4IWltcG9ydGFudDtmbGV4OjE7YWxpZ24tY29udGVudDpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcn0uc3dhbDItY29udGFpbmVyLnN3YWwyLWdyb3ctY29sdW1ue2ZsZXg6MTtmbGV4LWRpcmVjdGlvbjpjb2x1bW59LnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ncm93LWNvbHVtbi5zd2FsMi1ib3R0b20sLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ncm93LWNvbHVtbi5zd2FsMi1jZW50ZXIsLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ncm93LWNvbHVtbi5zd2FsMi10b3B7YWxpZ24taXRlbXM6Y2VudGVyfS5zd2FsMi1jb250YWluZXIuc3dhbDItZ3Jvdy1jb2x1bW4uc3dhbDItYm90dG9tLWxlZnQsLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ncm93LWNvbHVtbi5zd2FsMi1ib3R0b20tc3RhcnQsLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ncm93LWNvbHVtbi5zd2FsMi1jZW50ZXItbGVmdCwuc3dhbDItY29udGFpbmVyLnN3YWwyLWdyb3ctY29sdW1uLnN3YWwyLWNlbnRlci1zdGFydCwuc3dhbDItY29udGFpbmVyLnN3YWwyLWdyb3ctY29sdW1uLnN3YWwyLXRvcC1sZWZ0LC5zd2FsMi1jb250YWluZXIuc3dhbDItZ3Jvdy1jb2x1bW4uc3dhbDItdG9wLXN0YXJ0e2FsaWduLWl0ZW1zOmZsZXgtc3RhcnR9LnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ncm93LWNvbHVtbi5zd2FsMi1ib3R0b20tZW5kLC5zd2FsMi1jb250YWluZXIuc3dhbDItZ3Jvdy1jb2x1bW4uc3dhbDItYm90dG9tLXJpZ2h0LC5zd2FsMi1jb250YWluZXIuc3dhbDItZ3Jvdy1jb2x1bW4uc3dhbDItY2VudGVyLWVuZCwuc3dhbDItY29udGFpbmVyLnN3YWwyLWdyb3ctY29sdW1uLnN3YWwyLWNlbnRlci1yaWdodCwuc3dhbDItY29udGFpbmVyLnN3YWwyLWdyb3ctY29sdW1uLnN3YWwyLXRvcC1lbmQsLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ncm93LWNvbHVtbi5zd2FsMi10b3AtcmlnaHR7YWxpZ24taXRlbXM6ZmxleC1lbmR9LnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ncm93LWNvbHVtbj4uc3dhbDItbW9kYWx7ZGlzcGxheTpmbGV4IWltcG9ydGFudDtmbGV4OjE7YWxpZ24tY29udGVudDpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcn0uc3dhbDItY29udGFpbmVyLnN3YWwyLW5vLXRyYW5zaXRpb257dHJhbnNpdGlvbjpub25lIWltcG9ydGFudH0uc3dhbDItY29udGFpbmVyOm5vdCguc3dhbDItdG9wKTpub3QoLnN3YWwyLXRvcC1zdGFydCk6bm90KC5zd2FsMi10b3AtZW5kKTpub3QoLnN3YWwyLXRvcC1sZWZ0KTpub3QoLnN3YWwyLXRvcC1yaWdodCk6bm90KC5zd2FsMi1jZW50ZXItc3RhcnQpOm5vdCguc3dhbDItY2VudGVyLWVuZCk6bm90KC5zd2FsMi1jZW50ZXItbGVmdCk6bm90KC5zd2FsMi1jZW50ZXItcmlnaHQpOm5vdCguc3dhbDItYm90dG9tKTpub3QoLnN3YWwyLWJvdHRvbS1zdGFydCk6bm90KC5zd2FsMi1ib3R0b20tZW5kKTpub3QoLnN3YWwyLWJvdHRvbS1sZWZ0KTpub3QoLnN3YWwyLWJvdHRvbS1yaWdodCk6bm90KC5zd2FsMi1ncm93LWZ1bGxzY3JlZW4pPi5zd2FsMi1tb2RhbHttYXJnaW46YXV0b31AbWVkaWEgYWxsIGFuZCAoLW1zLWhpZ2gtY29udHJhc3Q6bm9uZSksKC1tcy1oaWdoLWNvbnRyYXN0OmFjdGl2ZSl7LnN3YWwyLWNvbnRhaW5lciAuc3dhbDItbW9kYWx7bWFyZ2luOjAhaW1wb3J0YW50fX0uc3dhbDItcG9wdXB7ZGlzcGxheTpub25lO3Bvc2l0aW9uOnJlbGF0aXZlO2JveC1zaXppbmc6Ym9yZGVyLWJveDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aWR0aDozMmVtO21heC13aWR0aDoxMDAlO3BhZGRpbmc6MS4yNWVtO2JvcmRlcjpub25lO2JvcmRlci1yYWRpdXM6LjMxMjVlbTtiYWNrZ3JvdW5kOiNmZmY7Zm9udC1mYW1pbHk6aW5oZXJpdDtmb250LXNpemU6MXJlbX0uc3dhbDItcG9wdXA6Zm9jdXN7b3V0bGluZTowfS5zd2FsMi1wb3B1cC5zd2FsMi1sb2FkaW5ne292ZXJmbG93LXk6aGlkZGVufS5zd2FsMi1oZWFkZXJ7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjthbGlnbi1pdGVtczpjZW50ZXJ9LnN3YWwyLXRpdGxle3Bvc2l0aW9uOnJlbGF0aXZlO21heC13aWR0aDoxMDAlO21hcmdpbjowIDAgLjRlbTtwYWRkaW5nOjA7Y29sb3I6IzU5NTk1OTtmb250LXNpemU6MS44NzVlbTtmb250LXdlaWdodDo2MDA7dGV4dC1hbGlnbjpjZW50ZXI7dGV4dC10cmFuc2Zvcm06bm9uZTt3b3JkLXdyYXA6YnJlYWstd29yZH0uc3dhbDItYWN0aW9uc3tkaXNwbGF5OmZsZXg7ei1pbmRleDoxO2ZsZXgtd3JhcDp3cmFwO2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjEwMCU7bWFyZ2luOjEuMjVlbSBhdXRvIDB9LnN3YWwyLWFjdGlvbnM6bm90KC5zd2FsMi1sb2FkaW5nKSAuc3dhbDItc3R5bGVkW2Rpc2FibGVkXXtvcGFjaXR5Oi40fS5zd2FsMi1hY3Rpb25zOm5vdCguc3dhbDItbG9hZGluZykgLnN3YWwyLXN0eWxlZDpob3ZlcntiYWNrZ3JvdW5kLWltYWdlOmxpbmVhci1ncmFkaWVudChyZ2JhKDAsMCwwLC4xKSxyZ2JhKDAsMCwwLC4xKSl9LnN3YWwyLWFjdGlvbnM6bm90KC5zd2FsMi1sb2FkaW5nKSAuc3dhbDItc3R5bGVkOmFjdGl2ZXtiYWNrZ3JvdW5kLWltYWdlOmxpbmVhci1ncmFkaWVudChyZ2JhKDAsMCwwLC4yKSxyZ2JhKDAsMCwwLC4yKSl9LnN3YWwyLWFjdGlvbnMuc3dhbDItbG9hZGluZyAuc3dhbDItc3R5bGVkLnN3YWwyLWNvbmZpcm17Ym94LXNpemluZzpib3JkZXItYm94O3dpZHRoOjIuNWVtO2hlaWdodDoyLjVlbTttYXJnaW46LjQ2ODc1ZW07cGFkZGluZzowOy13ZWJraXQtYW5pbWF0aW9uOnN3YWwyLXJvdGF0ZS1sb2FkaW5nIDEuNXMgbGluZWFyIDBzIGluZmluaXRlIG5vcm1hbDthbmltYXRpb246c3dhbDItcm90YXRlLWxvYWRpbmcgMS41cyBsaW5lYXIgMHMgaW5maW5pdGUgbm9ybWFsO2JvcmRlcjouMjVlbSBzb2xpZCB0cmFuc3BhcmVudDtib3JkZXItcmFkaXVzOjEwMCU7Ym9yZGVyLWNvbG9yOnRyYW5zcGFyZW50O2JhY2tncm91bmQtY29sb3I6dHJhbnNwYXJlbnQhaW1wb3J0YW50O2NvbG9yOnRyYW5zcGFyZW50O2N1cnNvcjpkZWZhdWx0Oy13ZWJraXQtdXNlci1zZWxlY3Q6bm9uZTstbW96LXVzZXItc2VsZWN0Om5vbmU7LW1zLXVzZXItc2VsZWN0Om5vbmU7dXNlci1zZWxlY3Q6bm9uZX0uc3dhbDItYWN0aW9ucy5zd2FsMi1sb2FkaW5nIC5zd2FsMi1zdHlsZWQuc3dhbDItY2FuY2Vse21hcmdpbi1yaWdodDozMHB4O21hcmdpbi1sZWZ0OjMwcHh9LnN3YWwyLWFjdGlvbnMuc3dhbDItbG9hZGluZyA6bm90KC5zd2FsMi1zdHlsZWQpLnN3YWwyLWNvbmZpcm06OmFmdGVye2NvbnRlbnQ6XFxcIlxcXCI7ZGlzcGxheTppbmxpbmUtYmxvY2s7d2lkdGg6MTVweDtoZWlnaHQ6MTVweDttYXJnaW4tbGVmdDo1cHg7LXdlYmtpdC1hbmltYXRpb246c3dhbDItcm90YXRlLWxvYWRpbmcgMS41cyBsaW5lYXIgMHMgaW5maW5pdGUgbm9ybWFsO2FuaW1hdGlvbjpzd2FsMi1yb3RhdGUtbG9hZGluZyAxLjVzIGxpbmVhciAwcyBpbmZpbml0ZSBub3JtYWw7Ym9yZGVyOjNweCBzb2xpZCAjOTk5O2JvcmRlci1yYWRpdXM6NTAlO2JvcmRlci1yaWdodC1jb2xvcjp0cmFuc3BhcmVudDtib3gtc2hhZG93OjFweCAxcHggMXB4ICNmZmZ9LnN3YWwyLXN0eWxlZHttYXJnaW46LjMxMjVlbTtwYWRkaW5nOi42MjVlbSAyZW07Ym94LXNoYWRvdzpub25lO2ZvbnQtd2VpZ2h0OjUwMH0uc3dhbDItc3R5bGVkOm5vdChbZGlzYWJsZWRdKXtjdXJzb3I6cG9pbnRlcn0uc3dhbDItc3R5bGVkLnN3YWwyLWNvbmZpcm17Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czouMjVlbTtiYWNrZ3JvdW5kOmluaXRpYWw7YmFja2dyb3VuZC1jb2xvcjojMzA4NWQ2O2NvbG9yOiNmZmY7Zm9udC1zaXplOjEuMDYyNWVtfS5zd2FsMi1zdHlsZWQuc3dhbDItY2FuY2Vse2JvcmRlcjowO2JvcmRlci1yYWRpdXM6LjI1ZW07YmFja2dyb3VuZDppbml0aWFsO2JhY2tncm91bmQtY29sb3I6I2FhYTtjb2xvcjojZmZmO2ZvbnQtc2l6ZToxLjA2MjVlbX0uc3dhbDItc3R5bGVkOmZvY3Vze291dGxpbmU6MDtib3gtc2hhZG93OjAgMCAwIDFweCAjZmZmLDAgMCAwIDNweCByZ2JhKDUwLDEwMCwxNTAsLjQpfS5zd2FsMi1zdHlsZWQ6Oi1tb3otZm9jdXMtaW5uZXJ7Ym9yZGVyOjB9LnN3YWwyLWZvb3RlcntqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO21hcmdpbjoxLjI1ZW0gMCAwO3BhZGRpbmc6MWVtIDAgMDtib3JkZXItdG9wOjFweCBzb2xpZCAjZWVlO2NvbG9yOiM1NDU0NTQ7Zm9udC1zaXplOjFlbX0uc3dhbDItdGltZXItcHJvZ3Jlc3MtYmFye3Bvc2l0aW9uOmFic29sdXRlO2JvdHRvbTowO2xlZnQ6MDt3aWR0aDoxMDAlO2hlaWdodDouMjVlbTtiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsLjIpfS5zd2FsMi1pbWFnZXttYXgtd2lkdGg6MTAwJTttYXJnaW46MS4yNWVtIGF1dG99LnN3YWwyLWNsb3Nle3Bvc2l0aW9uOmFic29sdXRlO3otaW5kZXg6Mjt0b3A6MDtyaWdodDowO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MS4yZW07aGVpZ2h0OjEuMmVtO3BhZGRpbmc6MDtvdmVyZmxvdzpoaWRkZW47dHJhbnNpdGlvbjpjb2xvciAuMXMgZWFzZS1vdXQ7Ym9yZGVyOm5vbmU7Ym9yZGVyLXJhZGl1czowO291dGxpbmU6aW5pdGlhbDtiYWNrZ3JvdW5kOjAgMDtjb2xvcjojY2NjO2ZvbnQtZmFtaWx5OnNlcmlmO2ZvbnQtc2l6ZToyLjVlbTtsaW5lLWhlaWdodDoxLjI7Y3Vyc29yOnBvaW50ZXJ9LnN3YWwyLWNsb3NlOmhvdmVye3RyYW5zZm9ybTpub25lO2JhY2tncm91bmQ6MCAwO2NvbG9yOiNmMjc0NzR9LnN3YWwyLWNsb3NlOjotbW96LWZvY3VzLWlubmVye2JvcmRlcjowfS5zd2FsMi1jb250ZW50e3otaW5kZXg6MTtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO21hcmdpbjowO3BhZGRpbmc6MDtjb2xvcjojNTQ1NDU0O2ZvbnQtc2l6ZToxLjEyNWVtO2ZvbnQtd2VpZ2h0OjQwMDtsaW5lLWhlaWdodDpub3JtYWw7dGV4dC1hbGlnbjpjZW50ZXI7d29yZC13cmFwOmJyZWFrLXdvcmR9LnN3YWwyLWNoZWNrYm94LC5zd2FsMi1maWxlLC5zd2FsMi1pbnB1dCwuc3dhbDItcmFkaW8sLnN3YWwyLXNlbGVjdCwuc3dhbDItdGV4dGFyZWF7bWFyZ2luOjFlbSBhdXRvfS5zd2FsMi1maWxlLC5zd2FsMi1pbnB1dCwuc3dhbDItdGV4dGFyZWF7Ym94LXNpemluZzpib3JkZXItYm94O3dpZHRoOjEwMCU7dHJhbnNpdGlvbjpib3JkZXItY29sb3IgLjNzLGJveC1zaGFkb3cgLjNzO2JvcmRlcjoxcHggc29saWQgI2Q5ZDlkOTtib3JkZXItcmFkaXVzOi4xODc1ZW07YmFja2dyb3VuZDppbmhlcml0O2JveC1zaGFkb3c6aW5zZXQgMCAxcHggMXB4IHJnYmEoMCwwLDAsLjA2KTtjb2xvcjppbmhlcml0O2ZvbnQtc2l6ZToxLjEyNWVtfS5zd2FsMi1maWxlLnN3YWwyLWlucHV0ZXJyb3IsLnN3YWwyLWlucHV0LnN3YWwyLWlucHV0ZXJyb3IsLnN3YWwyLXRleHRhcmVhLnN3YWwyLWlucHV0ZXJyb3J7Ym9yZGVyLWNvbG9yOiNmMjc0NzQhaW1wb3J0YW50O2JveC1zaGFkb3c6MCAwIDJweCAjZjI3NDc0IWltcG9ydGFudH0uc3dhbDItZmlsZTpmb2N1cywuc3dhbDItaW5wdXQ6Zm9jdXMsLnN3YWwyLXRleHRhcmVhOmZvY3Vze2JvcmRlcjoxcHggc29saWQgI2I0ZGJlZDtvdXRsaW5lOjA7Ym94LXNoYWRvdzowIDAgM3B4ICNjNGU2ZjV9LnN3YWwyLWZpbGU6Oi13ZWJraXQtaW5wdXQtcGxhY2Vob2xkZXIsLnN3YWwyLWlucHV0Ojotd2Via2l0LWlucHV0LXBsYWNlaG9sZGVyLC5zd2FsMi10ZXh0YXJlYTo6LXdlYmtpdC1pbnB1dC1wbGFjZWhvbGRlcntjb2xvcjojY2NjfS5zd2FsMi1maWxlOjotbW96LXBsYWNlaG9sZGVyLC5zd2FsMi1pbnB1dDo6LW1vei1wbGFjZWhvbGRlciwuc3dhbDItdGV4dGFyZWE6Oi1tb3otcGxhY2Vob2xkZXJ7Y29sb3I6I2NjY30uc3dhbDItZmlsZTotbXMtaW5wdXQtcGxhY2Vob2xkZXIsLnN3YWwyLWlucHV0Oi1tcy1pbnB1dC1wbGFjZWhvbGRlciwuc3dhbDItdGV4dGFyZWE6LW1zLWlucHV0LXBsYWNlaG9sZGVye2NvbG9yOiNjY2N9LnN3YWwyLWZpbGU6Oi1tcy1pbnB1dC1wbGFjZWhvbGRlciwuc3dhbDItaW5wdXQ6Oi1tcy1pbnB1dC1wbGFjZWhvbGRlciwuc3dhbDItdGV4dGFyZWE6Oi1tcy1pbnB1dC1wbGFjZWhvbGRlcntjb2xvcjojY2NjfS5zd2FsMi1maWxlOjpwbGFjZWhvbGRlciwuc3dhbDItaW5wdXQ6OnBsYWNlaG9sZGVyLC5zd2FsMi10ZXh0YXJlYTo6cGxhY2Vob2xkZXJ7Y29sb3I6I2NjY30uc3dhbDItcmFuZ2V7bWFyZ2luOjFlbSBhdXRvO2JhY2tncm91bmQ6I2ZmZn0uc3dhbDItcmFuZ2UgaW5wdXR7d2lkdGg6ODAlfS5zd2FsMi1yYW5nZSBvdXRwdXR7d2lkdGg6MjAlO2NvbG9yOmluaGVyaXQ7Zm9udC13ZWlnaHQ6NjAwO3RleHQtYWxpZ246Y2VudGVyfS5zd2FsMi1yYW5nZSBpbnB1dCwuc3dhbDItcmFuZ2Ugb3V0cHV0e2hlaWdodDoyLjYyNWVtO3BhZGRpbmc6MDtmb250LXNpemU6MS4xMjVlbTtsaW5lLWhlaWdodDoyLjYyNWVtfS5zd2FsMi1pbnB1dHtoZWlnaHQ6Mi42MjVlbTtwYWRkaW5nOjAgLjc1ZW19LnN3YWwyLWlucHV0W3R5cGU9bnVtYmVyXXttYXgtd2lkdGg6MTBlbX0uc3dhbDItZmlsZXtiYWNrZ3JvdW5kOmluaGVyaXQ7Zm9udC1zaXplOjEuMTI1ZW19LnN3YWwyLXRleHRhcmVhe2hlaWdodDo2Ljc1ZW07cGFkZGluZzouNzVlbX0uc3dhbDItc2VsZWN0e21pbi13aWR0aDo1MCU7bWF4LXdpZHRoOjEwMCU7cGFkZGluZzouMzc1ZW0gLjYyNWVtO2JhY2tncm91bmQ6aW5oZXJpdDtjb2xvcjppbmhlcml0O2ZvbnQtc2l6ZToxLjEyNWVtfS5zd2FsMi1jaGVja2JveCwuc3dhbDItcmFkaW97YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7YmFja2dyb3VuZDojZmZmO2NvbG9yOmluaGVyaXR9LnN3YWwyLWNoZWNrYm94IGxhYmVsLC5zd2FsMi1yYWRpbyBsYWJlbHttYXJnaW46MCAuNmVtO2ZvbnQtc2l6ZToxLjEyNWVtfS5zd2FsMi1jaGVja2JveCBpbnB1dCwuc3dhbDItcmFkaW8gaW5wdXR7bWFyZ2luOjAgLjRlbX0uc3dhbDItdmFsaWRhdGlvbi1tZXNzYWdle2Rpc3BsYXk6bm9uZTthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtwYWRkaW5nOi42MjVlbTtvdmVyZmxvdzpoaWRkZW47YmFja2dyb3VuZDojZjBmMGYwO2NvbG9yOiM2NjY7Zm9udC1zaXplOjFlbTtmb250LXdlaWdodDozMDB9LnN3YWwyLXZhbGlkYXRpb24tbWVzc2FnZTo6YmVmb3Jle2NvbnRlbnQ6XFxcIiFcXFwiO2Rpc3BsYXk6aW5saW5lLWJsb2NrO3dpZHRoOjEuNWVtO21pbi13aWR0aDoxLjVlbTtoZWlnaHQ6MS41ZW07bWFyZ2luOjAgLjYyNWVtO2JvcmRlci1yYWRpdXM6NTAlO2JhY2tncm91bmQtY29sb3I6I2YyNzQ3NDtjb2xvcjojZmZmO2ZvbnQtd2VpZ2h0OjYwMDtsaW5lLWhlaWdodDoxLjVlbTt0ZXh0LWFsaWduOmNlbnRlcn0uc3dhbDItaWNvbntwb3NpdGlvbjpyZWxhdGl2ZTtib3gtc2l6aW5nOmNvbnRlbnQtYm94O2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6NWVtO2hlaWdodDo1ZW07bWFyZ2luOjEuMjVlbSBhdXRvIDEuODc1ZW07Ym9yZGVyOi4yNWVtIHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci1yYWRpdXM6NTAlO2ZvbnQtZmFtaWx5OmluaGVyaXQ7bGluZS1oZWlnaHQ6NWVtO2N1cnNvcjpkZWZhdWx0Oy13ZWJraXQtdXNlci1zZWxlY3Q6bm9uZTstbW96LXVzZXItc2VsZWN0Om5vbmU7LW1zLXVzZXItc2VsZWN0Om5vbmU7dXNlci1zZWxlY3Q6bm9uZX0uc3dhbDItaWNvbiAuc3dhbDItaWNvbi1jb250ZW50e2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Zm9udC1zaXplOjMuNzVlbX0uc3dhbDItaWNvbi5zd2FsMi1lcnJvcntib3JkZXItY29sb3I6I2YyNzQ3NDtjb2xvcjojZjI3NDc0fS5zd2FsMi1pY29uLnN3YWwyLWVycm9yIC5zd2FsMi14LW1hcmt7cG9zaXRpb246cmVsYXRpdmU7ZmxleC1ncm93OjF9LnN3YWwyLWljb24uc3dhbDItZXJyb3IgW2NsYXNzXj1zd2FsMi14LW1hcmstbGluZV17ZGlzcGxheTpibG9jaztwb3NpdGlvbjphYnNvbHV0ZTt0b3A6Mi4zMTI1ZW07d2lkdGg6Mi45Mzc1ZW07aGVpZ2h0Oi4zMTI1ZW07Ym9yZGVyLXJhZGl1czouMTI1ZW07YmFja2dyb3VuZC1jb2xvcjojZjI3NDc0fS5zd2FsMi1pY29uLnN3YWwyLWVycm9yIFtjbGFzc149c3dhbDIteC1tYXJrLWxpbmVdW2NsYXNzJD1sZWZ0XXtsZWZ0OjEuMDYyNWVtO3RyYW5zZm9ybTpyb3RhdGUoNDVkZWcpfS5zd2FsMi1pY29uLnN3YWwyLWVycm9yIFtjbGFzc149c3dhbDIteC1tYXJrLWxpbmVdW2NsYXNzJD1yaWdodF17cmlnaHQ6MWVtO3RyYW5zZm9ybTpyb3RhdGUoLTQ1ZGVnKX0uc3dhbDItaWNvbi5zd2FsMi1lcnJvci5zd2FsMi1pY29uLXNob3d7LXdlYmtpdC1hbmltYXRpb246c3dhbDItYW5pbWF0ZS1lcnJvci1pY29uIC41czthbmltYXRpb246c3dhbDItYW5pbWF0ZS1lcnJvci1pY29uIC41c30uc3dhbDItaWNvbi5zd2FsMi1lcnJvci5zd2FsMi1pY29uLXNob3cgLnN3YWwyLXgtbWFya3std2Via2l0LWFuaW1hdGlvbjpzd2FsMi1hbmltYXRlLWVycm9yLXgtbWFyayAuNXM7YW5pbWF0aW9uOnN3YWwyLWFuaW1hdGUtZXJyb3IteC1tYXJrIC41c30uc3dhbDItaWNvbi5zd2FsMi13YXJuaW5ne2JvcmRlci1jb2xvcjojZmFjZWE4O2NvbG9yOiNmOGJiODZ9LnN3YWwyLWljb24uc3dhbDItaW5mb3tib3JkZXItY29sb3I6IzlkZTBmNjtjb2xvcjojM2ZjM2VlfS5zd2FsMi1pY29uLnN3YWwyLXF1ZXN0aW9ue2JvcmRlci1jb2xvcjojYzlkYWUxO2NvbG9yOiM4N2FkYmR9LnN3YWwyLWljb24uc3dhbDItc3VjY2Vzc3tib3JkZXItY29sb3I6I2E1ZGM4Njtjb2xvcjojYTVkYzg2fS5zd2FsMi1pY29uLnN3YWwyLXN1Y2Nlc3MgW2NsYXNzXj1zd2FsMi1zdWNjZXNzLWNpcmN1bGFyLWxpbmVde3Bvc2l0aW9uOmFic29sdXRlO3dpZHRoOjMuNzVlbTtoZWlnaHQ6Ny41ZW07dHJhbnNmb3JtOnJvdGF0ZSg0NWRlZyk7Ym9yZGVyLXJhZGl1czo1MCV9LnN3YWwyLWljb24uc3dhbDItc3VjY2VzcyBbY2xhc3NePXN3YWwyLXN1Y2Nlc3MtY2lyY3VsYXItbGluZV1bY2xhc3MkPWxlZnRde3RvcDotLjQzNzVlbTtsZWZ0Oi0yLjA2MzVlbTt0cmFuc2Zvcm06cm90YXRlKC00NWRlZyk7dHJhbnNmb3JtLW9yaWdpbjozLjc1ZW0gMy43NWVtO2JvcmRlci1yYWRpdXM6Ny41ZW0gMCAwIDcuNWVtfS5zd2FsMi1pY29uLnN3YWwyLXN1Y2Nlc3MgW2NsYXNzXj1zd2FsMi1zdWNjZXNzLWNpcmN1bGFyLWxpbmVdW2NsYXNzJD1yaWdodF17dG9wOi0uNjg3NWVtO2xlZnQ6MS44NzVlbTt0cmFuc2Zvcm06cm90YXRlKC00NWRlZyk7dHJhbnNmb3JtLW9yaWdpbjowIDMuNzVlbTtib3JkZXItcmFkaXVzOjAgNy41ZW0gNy41ZW0gMH0uc3dhbDItaWNvbi5zd2FsMi1zdWNjZXNzIC5zd2FsMi1zdWNjZXNzLXJpbmd7cG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDoyO3RvcDotLjI1ZW07bGVmdDotLjI1ZW07Ym94LXNpemluZzpjb250ZW50LWJveDt3aWR0aDoxMDAlO2hlaWdodDoxMDAlO2JvcmRlcjouMjVlbSBzb2xpZCByZ2JhKDE2NSwyMjAsMTM0LC4zKTtib3JkZXItcmFkaXVzOjUwJX0uc3dhbDItaWNvbi5zd2FsMi1zdWNjZXNzIC5zd2FsMi1zdWNjZXNzLWZpeHtwb3NpdGlvbjphYnNvbHV0ZTt6LWluZGV4OjE7dG9wOi41ZW07bGVmdDoxLjYyNWVtO3dpZHRoOi40Mzc1ZW07aGVpZ2h0OjUuNjI1ZW07dHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpfS5zd2FsMi1pY29uLnN3YWwyLXN1Y2Nlc3MgW2NsYXNzXj1zd2FsMi1zdWNjZXNzLWxpbmVde2Rpc3BsYXk6YmxvY2s7cG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDoyO2hlaWdodDouMzEyNWVtO2JvcmRlci1yYWRpdXM6LjEyNWVtO2JhY2tncm91bmQtY29sb3I6I2E1ZGM4Nn0uc3dhbDItaWNvbi5zd2FsMi1zdWNjZXNzIFtjbGFzc149c3dhbDItc3VjY2Vzcy1saW5lXVtjbGFzcyQ9dGlwXXt0b3A6Mi44NzVlbTtsZWZ0Oi44MTI1ZW07d2lkdGg6MS41NjI1ZW07dHJhbnNmb3JtOnJvdGF0ZSg0NWRlZyl9LnN3YWwyLWljb24uc3dhbDItc3VjY2VzcyBbY2xhc3NePXN3YWwyLXN1Y2Nlc3MtbGluZV1bY2xhc3MkPWxvbmdde3RvcDoyLjM3NWVtO3JpZ2h0Oi41ZW07d2lkdGg6Mi45Mzc1ZW07dHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpfS5zd2FsMi1pY29uLnN3YWwyLXN1Y2Nlc3Muc3dhbDItaWNvbi1zaG93IC5zd2FsMi1zdWNjZXNzLWxpbmUtdGlwey13ZWJraXQtYW5pbWF0aW9uOnN3YWwyLWFuaW1hdGUtc3VjY2Vzcy1saW5lLXRpcCAuNzVzO2FuaW1hdGlvbjpzd2FsMi1hbmltYXRlLXN1Y2Nlc3MtbGluZS10aXAgLjc1c30uc3dhbDItaWNvbi5zd2FsMi1zdWNjZXNzLnN3YWwyLWljb24tc2hvdyAuc3dhbDItc3VjY2Vzcy1saW5lLWxvbmd7LXdlYmtpdC1hbmltYXRpb246c3dhbDItYW5pbWF0ZS1zdWNjZXNzLWxpbmUtbG9uZyAuNzVzO2FuaW1hdGlvbjpzd2FsMi1hbmltYXRlLXN1Y2Nlc3MtbGluZS1sb25nIC43NXN9LnN3YWwyLWljb24uc3dhbDItc3VjY2Vzcy5zd2FsMi1pY29uLXNob3cgLnN3YWwyLXN1Y2Nlc3MtY2lyY3VsYXItbGluZS1yaWdodHstd2Via2l0LWFuaW1hdGlvbjpzd2FsMi1yb3RhdGUtc3VjY2Vzcy1jaXJjdWxhci1saW5lIDQuMjVzIGVhc2UtaW47YW5pbWF0aW9uOnN3YWwyLXJvdGF0ZS1zdWNjZXNzLWNpcmN1bGFyLWxpbmUgNC4yNXMgZWFzZS1pbn0uc3dhbDItcHJvZ3Jlc3Mtc3RlcHN7YWxpZ24taXRlbXM6Y2VudGVyO21hcmdpbjowIDAgMS4yNWVtO3BhZGRpbmc6MDtiYWNrZ3JvdW5kOmluaGVyaXQ7Zm9udC13ZWlnaHQ6NjAwfS5zd2FsMi1wcm9ncmVzcy1zdGVwcyBsaXtkaXNwbGF5OmlubGluZS1ibG9jaztwb3NpdGlvbjpyZWxhdGl2ZX0uc3dhbDItcHJvZ3Jlc3Mtc3RlcHMgLnN3YWwyLXByb2dyZXNzLXN0ZXB7ei1pbmRleDoyMDt3aWR0aDoyZW07aGVpZ2h0OjJlbTtib3JkZXItcmFkaXVzOjJlbTtiYWNrZ3JvdW5kOiMzMDg1ZDY7Y29sb3I6I2ZmZjtsaW5lLWhlaWdodDoyZW07dGV4dC1hbGlnbjpjZW50ZXJ9LnN3YWwyLXByb2dyZXNzLXN0ZXBzIC5zd2FsMi1wcm9ncmVzcy1zdGVwLnN3YWwyLWFjdGl2ZS1wcm9ncmVzcy1zdGVwe2JhY2tncm91bmQ6IzMwODVkNn0uc3dhbDItcHJvZ3Jlc3Mtc3RlcHMgLnN3YWwyLXByb2dyZXNzLXN0ZXAuc3dhbDItYWN0aXZlLXByb2dyZXNzLXN0ZXB+LnN3YWwyLXByb2dyZXNzLXN0ZXB7YmFja2dyb3VuZDojYWRkOGU2O2NvbG9yOiNmZmZ9LnN3YWwyLXByb2dyZXNzLXN0ZXBzIC5zd2FsMi1wcm9ncmVzcy1zdGVwLnN3YWwyLWFjdGl2ZS1wcm9ncmVzcy1zdGVwfi5zd2FsMi1wcm9ncmVzcy1zdGVwLWxpbmV7YmFja2dyb3VuZDojYWRkOGU2fS5zd2FsMi1wcm9ncmVzcy1zdGVwcyAuc3dhbDItcHJvZ3Jlc3Mtc3RlcC1saW5le3otaW5kZXg6MTA7d2lkdGg6Mi41ZW07aGVpZ2h0Oi40ZW07bWFyZ2luOjAgLTFweDtiYWNrZ3JvdW5kOiMzMDg1ZDZ9W2NsYXNzXj1zd2FsMl17LXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOnRyYW5zcGFyZW50fS5zd2FsMi1zaG93ey13ZWJraXQtYW5pbWF0aW9uOnN3YWwyLXNob3cgLjNzO2FuaW1hdGlvbjpzd2FsMi1zaG93IC4zc30uc3dhbDItaGlkZXstd2Via2l0LWFuaW1hdGlvbjpzd2FsMi1oaWRlIC4xNXMgZm9yd2FyZHM7YW5pbWF0aW9uOnN3YWwyLWhpZGUgLjE1cyBmb3J3YXJkc30uc3dhbDItbm9hbmltYXRpb257dHJhbnNpdGlvbjpub25lfS5zd2FsMi1zY3JvbGxiYXItbWVhc3VyZXtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6LTk5OTlweDt3aWR0aDo1MHB4O2hlaWdodDo1MHB4O292ZXJmbG93OnNjcm9sbH0uc3dhbDItcnRsIC5zd2FsMi1jbG9zZXtyaWdodDphdXRvO2xlZnQ6MH0uc3dhbDItcnRsIC5zd2FsMi10aW1lci1wcm9ncmVzcy1iYXJ7cmlnaHQ6MDtsZWZ0OmF1dG99QHN1cHBvcnRzICgtbXMtYWNjZWxlcmF0b3I6dHJ1ZSl7LnN3YWwyLXJhbmdlIGlucHV0e3dpZHRoOjEwMCUhaW1wb3J0YW50fS5zd2FsMi1yYW5nZSBvdXRwdXR7ZGlzcGxheTpub25lfX1AbWVkaWEgYWxsIGFuZCAoLW1zLWhpZ2gtY29udHJhc3Q6bm9uZSksKC1tcy1oaWdoLWNvbnRyYXN0OmFjdGl2ZSl7LnN3YWwyLXJhbmdlIGlucHV0e3dpZHRoOjEwMCUhaW1wb3J0YW50fS5zd2FsMi1yYW5nZSBvdXRwdXR7ZGlzcGxheTpub25lfX1ALW1vei1kb2N1bWVudCB1cmwtcHJlZml4KCl7LnN3YWwyLWNsb3NlOmZvY3Vze291dGxpbmU6MnB4IHNvbGlkIHJnYmEoNTAsMTAwLDE1MCwuNCl9fUAtd2Via2l0LWtleWZyYW1lcyBzd2FsMi10b2FzdC1zaG93ezAle3RyYW5zZm9ybTp0cmFuc2xhdGVZKC0uNjI1ZW0pIHJvdGF0ZVooMmRlZyl9MzMle3RyYW5zZm9ybTp0cmFuc2xhdGVZKDApIHJvdGF0ZVooLTJkZWcpfTY2JXt0cmFuc2Zvcm06dHJhbnNsYXRlWSguMzEyNWVtKSByb3RhdGVaKDJkZWcpfTEwMCV7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoMCkgcm90YXRlWigwKX19QGtleWZyYW1lcyBzd2FsMi10b2FzdC1zaG93ezAle3RyYW5zZm9ybTp0cmFuc2xhdGVZKC0uNjI1ZW0pIHJvdGF0ZVooMmRlZyl9MzMle3RyYW5zZm9ybTp0cmFuc2xhdGVZKDApIHJvdGF0ZVooLTJkZWcpfTY2JXt0cmFuc2Zvcm06dHJhbnNsYXRlWSguMzEyNWVtKSByb3RhdGVaKDJkZWcpfTEwMCV7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoMCkgcm90YXRlWigwKX19QC13ZWJraXQta2V5ZnJhbWVzIHN3YWwyLXRvYXN0LWhpZGV7MTAwJXt0cmFuc2Zvcm06cm90YXRlWigxZGVnKTtvcGFjaXR5OjB9fUBrZXlmcmFtZXMgc3dhbDItdG9hc3QtaGlkZXsxMDAle3RyYW5zZm9ybTpyb3RhdGVaKDFkZWcpO29wYWNpdHk6MH19QC13ZWJraXQta2V5ZnJhbWVzIHN3YWwyLXRvYXN0LWFuaW1hdGUtc3VjY2Vzcy1saW5lLXRpcHswJXt0b3A6LjU2MjVlbTtsZWZ0Oi4wNjI1ZW07d2lkdGg6MH01NCV7dG9wOi4xMjVlbTtsZWZ0Oi4xMjVlbTt3aWR0aDowfTcwJXt0b3A6LjYyNWVtO2xlZnQ6LS4yNWVtO3dpZHRoOjEuNjI1ZW19ODQle3RvcDoxLjA2MjVlbTtsZWZ0Oi43NWVtO3dpZHRoOi41ZW19MTAwJXt0b3A6MS4xMjVlbTtsZWZ0Oi4xODc1ZW07d2lkdGg6Ljc1ZW19fUBrZXlmcmFtZXMgc3dhbDItdG9hc3QtYW5pbWF0ZS1zdWNjZXNzLWxpbmUtdGlwezAle3RvcDouNTYyNWVtO2xlZnQ6LjA2MjVlbTt3aWR0aDowfTU0JXt0b3A6LjEyNWVtO2xlZnQ6LjEyNWVtO3dpZHRoOjB9NzAle3RvcDouNjI1ZW07bGVmdDotLjI1ZW07d2lkdGg6MS42MjVlbX04NCV7dG9wOjEuMDYyNWVtO2xlZnQ6Ljc1ZW07d2lkdGg6LjVlbX0xMDAle3RvcDoxLjEyNWVtO2xlZnQ6LjE4NzVlbTt3aWR0aDouNzVlbX19QC13ZWJraXQta2V5ZnJhbWVzIHN3YWwyLXRvYXN0LWFuaW1hdGUtc3VjY2Vzcy1saW5lLWxvbmd7MCV7dG9wOjEuNjI1ZW07cmlnaHQ6MS4zNzVlbTt3aWR0aDowfTY1JXt0b3A6MS4yNWVtO3JpZ2h0Oi45Mzc1ZW07d2lkdGg6MH04NCV7dG9wOi45Mzc1ZW07cmlnaHQ6MDt3aWR0aDoxLjEyNWVtfTEwMCV7dG9wOi45Mzc1ZW07cmlnaHQ6LjE4NzVlbTt3aWR0aDoxLjM3NWVtfX1Aa2V5ZnJhbWVzIHN3YWwyLXRvYXN0LWFuaW1hdGUtc3VjY2Vzcy1saW5lLWxvbmd7MCV7dG9wOjEuNjI1ZW07cmlnaHQ6MS4zNzVlbTt3aWR0aDowfTY1JXt0b3A6MS4yNWVtO3JpZ2h0Oi45Mzc1ZW07d2lkdGg6MH04NCV7dG9wOi45Mzc1ZW07cmlnaHQ6MDt3aWR0aDoxLjEyNWVtfTEwMCV7dG9wOi45Mzc1ZW07cmlnaHQ6LjE4NzVlbTt3aWR0aDoxLjM3NWVtfX1ALXdlYmtpdC1rZXlmcmFtZXMgc3dhbDItc2hvd3swJXt0cmFuc2Zvcm06c2NhbGUoLjcpfTQ1JXt0cmFuc2Zvcm06c2NhbGUoMS4wNSl9ODAle3RyYW5zZm9ybTpzY2FsZSguOTUpfTEwMCV7dHJhbnNmb3JtOnNjYWxlKDEpfX1Aa2V5ZnJhbWVzIHN3YWwyLXNob3d7MCV7dHJhbnNmb3JtOnNjYWxlKC43KX00NSV7dHJhbnNmb3JtOnNjYWxlKDEuMDUpfTgwJXt0cmFuc2Zvcm06c2NhbGUoLjk1KX0xMDAle3RyYW5zZm9ybTpzY2FsZSgxKX19QC13ZWJraXQta2V5ZnJhbWVzIHN3YWwyLWhpZGV7MCV7dHJhbnNmb3JtOnNjYWxlKDEpO29wYWNpdHk6MX0xMDAle3RyYW5zZm9ybTpzY2FsZSguNSk7b3BhY2l0eTowfX1Aa2V5ZnJhbWVzIHN3YWwyLWhpZGV7MCV7dHJhbnNmb3JtOnNjYWxlKDEpO29wYWNpdHk6MX0xMDAle3RyYW5zZm9ybTpzY2FsZSguNSk7b3BhY2l0eTowfX1ALXdlYmtpdC1rZXlmcmFtZXMgc3dhbDItYW5pbWF0ZS1zdWNjZXNzLWxpbmUtdGlwezAle3RvcDoxLjE4NzVlbTtsZWZ0Oi4wNjI1ZW07d2lkdGg6MH01NCV7dG9wOjEuMDYyNWVtO2xlZnQ6LjEyNWVtO3dpZHRoOjB9NzAle3RvcDoyLjE4NzVlbTtsZWZ0Oi0uMzc1ZW07d2lkdGg6My4xMjVlbX04NCV7dG9wOjNlbTtsZWZ0OjEuMzEyNWVtO3dpZHRoOjEuMDYyNWVtfTEwMCV7dG9wOjIuODEyNWVtO2xlZnQ6LjgxMjVlbTt3aWR0aDoxLjU2MjVlbX19QGtleWZyYW1lcyBzd2FsMi1hbmltYXRlLXN1Y2Nlc3MtbGluZS10aXB7MCV7dG9wOjEuMTg3NWVtO2xlZnQ6LjA2MjVlbTt3aWR0aDowfTU0JXt0b3A6MS4wNjI1ZW07bGVmdDouMTI1ZW07d2lkdGg6MH03MCV7dG9wOjIuMTg3NWVtO2xlZnQ6LS4zNzVlbTt3aWR0aDozLjEyNWVtfTg0JXt0b3A6M2VtO2xlZnQ6MS4zMTI1ZW07d2lkdGg6MS4wNjI1ZW19MTAwJXt0b3A6Mi44MTI1ZW07bGVmdDouODEyNWVtO3dpZHRoOjEuNTYyNWVtfX1ALXdlYmtpdC1rZXlmcmFtZXMgc3dhbDItYW5pbWF0ZS1zdWNjZXNzLWxpbmUtbG9uZ3swJXt0b3A6My4zNzVlbTtyaWdodDoyLjg3NWVtO3dpZHRoOjB9NjUle3RvcDozLjM3NWVtO3JpZ2h0OjIuODc1ZW07d2lkdGg6MH04NCV7dG9wOjIuMTg3NWVtO3JpZ2h0OjA7d2lkdGg6My40Mzc1ZW19MTAwJXt0b3A6Mi4zNzVlbTtyaWdodDouNWVtO3dpZHRoOjIuOTM3NWVtfX1Aa2V5ZnJhbWVzIHN3YWwyLWFuaW1hdGUtc3VjY2Vzcy1saW5lLWxvbmd7MCV7dG9wOjMuMzc1ZW07cmlnaHQ6Mi44NzVlbTt3aWR0aDowfTY1JXt0b3A6My4zNzVlbTtyaWdodDoyLjg3NWVtO3dpZHRoOjB9ODQle3RvcDoyLjE4NzVlbTtyaWdodDowO3dpZHRoOjMuNDM3NWVtfTEwMCV7dG9wOjIuMzc1ZW07cmlnaHQ6LjVlbTt3aWR0aDoyLjkzNzVlbX19QC13ZWJraXQta2V5ZnJhbWVzIHN3YWwyLXJvdGF0ZS1zdWNjZXNzLWNpcmN1bGFyLWxpbmV7MCV7dHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpfTUle3RyYW5zZm9ybTpyb3RhdGUoLTQ1ZGVnKX0xMiV7dHJhbnNmb3JtOnJvdGF0ZSgtNDA1ZGVnKX0xMDAle3RyYW5zZm9ybTpyb3RhdGUoLTQwNWRlZyl9fUBrZXlmcmFtZXMgc3dhbDItcm90YXRlLXN1Y2Nlc3MtY2lyY3VsYXItbGluZXswJXt0cmFuc2Zvcm06cm90YXRlKC00NWRlZyl9NSV7dHJhbnNmb3JtOnJvdGF0ZSgtNDVkZWcpfTEyJXt0cmFuc2Zvcm06cm90YXRlKC00MDVkZWcpfTEwMCV7dHJhbnNmb3JtOnJvdGF0ZSgtNDA1ZGVnKX19QC13ZWJraXQta2V5ZnJhbWVzIHN3YWwyLWFuaW1hdGUtZXJyb3IteC1tYXJrezAle21hcmdpbi10b3A6MS42MjVlbTt0cmFuc2Zvcm06c2NhbGUoLjQpO29wYWNpdHk6MH01MCV7bWFyZ2luLXRvcDoxLjYyNWVtO3RyYW5zZm9ybTpzY2FsZSguNCk7b3BhY2l0eTowfTgwJXttYXJnaW4tdG9wOi0uMzc1ZW07dHJhbnNmb3JtOnNjYWxlKDEuMTUpfTEwMCV7bWFyZ2luLXRvcDowO3RyYW5zZm9ybTpzY2FsZSgxKTtvcGFjaXR5OjF9fUBrZXlmcmFtZXMgc3dhbDItYW5pbWF0ZS1lcnJvci14LW1hcmt7MCV7bWFyZ2luLXRvcDoxLjYyNWVtO3RyYW5zZm9ybTpzY2FsZSguNCk7b3BhY2l0eTowfTUwJXttYXJnaW4tdG9wOjEuNjI1ZW07dHJhbnNmb3JtOnNjYWxlKC40KTtvcGFjaXR5OjB9ODAle21hcmdpbi10b3A6LS4zNzVlbTt0cmFuc2Zvcm06c2NhbGUoMS4xNSl9MTAwJXttYXJnaW4tdG9wOjA7dHJhbnNmb3JtOnNjYWxlKDEpO29wYWNpdHk6MX19QC13ZWJraXQta2V5ZnJhbWVzIHN3YWwyLWFuaW1hdGUtZXJyb3ItaWNvbnswJXt0cmFuc2Zvcm06cm90YXRlWCgxMDBkZWcpO29wYWNpdHk6MH0xMDAle3RyYW5zZm9ybTpyb3RhdGVYKDApO29wYWNpdHk6MX19QGtleWZyYW1lcyBzd2FsMi1hbmltYXRlLWVycm9yLWljb257MCV7dHJhbnNmb3JtOnJvdGF0ZVgoMTAwZGVnKTtvcGFjaXR5OjB9MTAwJXt0cmFuc2Zvcm06cm90YXRlWCgwKTtvcGFjaXR5OjF9fUAtd2Via2l0LWtleWZyYW1lcyBzd2FsMi1yb3RhdGUtbG9hZGluZ3swJXt0cmFuc2Zvcm06cm90YXRlKDApfTEwMCV7dHJhbnNmb3JtOnJvdGF0ZSgzNjBkZWcpfX1Aa2V5ZnJhbWVzIHN3YWwyLXJvdGF0ZS1sb2FkaW5nezAle3RyYW5zZm9ybTpyb3RhdGUoMCl9MTAwJXt0cmFuc2Zvcm06cm90YXRlKDM2MGRlZyl9fWJvZHkuc3dhbDItc2hvd246bm90KC5zd2FsMi1uby1iYWNrZHJvcCk6bm90KC5zd2FsMi10b2FzdC1zaG93bil7b3ZlcmZsb3c6aGlkZGVufWJvZHkuc3dhbDItaGVpZ2h0LWF1dG97aGVpZ2h0OmF1dG8haW1wb3J0YW50fWJvZHkuc3dhbDItbm8tYmFja2Ryb3AgLnN3YWwyLWNvbnRhaW5lcnt0b3A6YXV0bztyaWdodDphdXRvO2JvdHRvbTphdXRvO2xlZnQ6YXV0bzttYXgtd2lkdGg6Y2FsYygxMDAlIC0gLjYyNWVtICogMik7YmFja2dyb3VuZC1jb2xvcjp0cmFuc3BhcmVudCFpbXBvcnRhbnR9Ym9keS5zd2FsMi1uby1iYWNrZHJvcCAuc3dhbDItY29udGFpbmVyPi5zd2FsMi1tb2RhbHtib3gtc2hhZG93OjAgMCAxMHB4IHJnYmEoMCwwLDAsLjQpfWJvZHkuc3dhbDItbm8tYmFja2Ryb3AgLnN3YWwyLWNvbnRhaW5lci5zd2FsMi10b3B7dG9wOjA7bGVmdDo1MCU7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoLTUwJSl9Ym9keS5zd2FsMi1uby1iYWNrZHJvcCAuc3dhbDItY29udGFpbmVyLnN3YWwyLXRvcC1sZWZ0LGJvZHkuc3dhbDItbm8tYmFja2Ryb3AgLnN3YWwyLWNvbnRhaW5lci5zd2FsMi10b3Atc3RhcnR7dG9wOjA7bGVmdDowfWJvZHkuc3dhbDItbm8tYmFja2Ryb3AgLnN3YWwyLWNvbnRhaW5lci5zd2FsMi10b3AtZW5kLGJvZHkuc3dhbDItbm8tYmFja2Ryb3AgLnN3YWwyLWNvbnRhaW5lci5zd2FsMi10b3AtcmlnaHR7dG9wOjA7cmlnaHQ6MH1ib2R5LnN3YWwyLW5vLWJhY2tkcm9wIC5zd2FsMi1jb250YWluZXIuc3dhbDItY2VudGVye3RvcDo1MCU7bGVmdDo1MCU7dHJhbnNmb3JtOnRyYW5zbGF0ZSgtNTAlLC01MCUpfWJvZHkuc3dhbDItbm8tYmFja2Ryb3AgLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1jZW50ZXItbGVmdCxib2R5LnN3YWwyLW5vLWJhY2tkcm9wIC5zd2FsMi1jb250YWluZXIuc3dhbDItY2VudGVyLXN0YXJ0e3RvcDo1MCU7bGVmdDowO3RyYW5zZm9ybTp0cmFuc2xhdGVZKC01MCUpfWJvZHkuc3dhbDItbm8tYmFja2Ryb3AgLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1jZW50ZXItZW5kLGJvZHkuc3dhbDItbm8tYmFja2Ryb3AgLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1jZW50ZXItcmlnaHR7dG9wOjUwJTtyaWdodDowO3RyYW5zZm9ybTp0cmFuc2xhdGVZKC01MCUpfWJvZHkuc3dhbDItbm8tYmFja2Ryb3AgLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ib3R0b217Ym90dG9tOjA7bGVmdDo1MCU7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoLTUwJSl9Ym9keS5zd2FsMi1uby1iYWNrZHJvcCAuc3dhbDItY29udGFpbmVyLnN3YWwyLWJvdHRvbS1sZWZ0LGJvZHkuc3dhbDItbm8tYmFja2Ryb3AgLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ib3R0b20tc3RhcnR7Ym90dG9tOjA7bGVmdDowfWJvZHkuc3dhbDItbm8tYmFja2Ryb3AgLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ib3R0b20tZW5kLGJvZHkuc3dhbDItbm8tYmFja2Ryb3AgLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ib3R0b20tcmlnaHR7cmlnaHQ6MDtib3R0b206MH1AbWVkaWEgcHJpbnR7Ym9keS5zd2FsMi1zaG93bjpub3QoLnN3YWwyLW5vLWJhY2tkcm9wKTpub3QoLnN3YWwyLXRvYXN0LXNob3duKXtvdmVyZmxvdy15OnNjcm9sbCFpbXBvcnRhbnR9Ym9keS5zd2FsMi1zaG93bjpub3QoLnN3YWwyLW5vLWJhY2tkcm9wKTpub3QoLnN3YWwyLXRvYXN0LXNob3duKT5bYXJpYS1oaWRkZW49dHJ1ZV17ZGlzcGxheTpub25lfWJvZHkuc3dhbDItc2hvd246bm90KC5zd2FsMi1uby1iYWNrZHJvcCk6bm90KC5zd2FsMi10b2FzdC1zaG93bikgLnN3YWwyLWNvbnRhaW5lcntwb3NpdGlvbjpzdGF0aWMhaW1wb3J0YW50fX1ib2R5LnN3YWwyLXRvYXN0LXNob3duIC5zd2FsMi1jb250YWluZXJ7YmFja2dyb3VuZC1jb2xvcjp0cmFuc3BhcmVudH1ib2R5LnN3YWwyLXRvYXN0LXNob3duIC5zd2FsMi1jb250YWluZXIuc3dhbDItdG9we3RvcDowO3JpZ2h0OmF1dG87Ym90dG9tOmF1dG87bGVmdDo1MCU7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoLTUwJSl9Ym9keS5zd2FsMi10b2FzdC1zaG93biAuc3dhbDItY29udGFpbmVyLnN3YWwyLXRvcC1lbmQsYm9keS5zd2FsMi10b2FzdC1zaG93biAuc3dhbDItY29udGFpbmVyLnN3YWwyLXRvcC1yaWdodHt0b3A6MDtyaWdodDowO2JvdHRvbTphdXRvO2xlZnQ6YXV0b31ib2R5LnN3YWwyLXRvYXN0LXNob3duIC5zd2FsMi1jb250YWluZXIuc3dhbDItdG9wLWxlZnQsYm9keS5zd2FsMi10b2FzdC1zaG93biAuc3dhbDItY29udGFpbmVyLnN3YWwyLXRvcC1zdGFydHt0b3A6MDtyaWdodDphdXRvO2JvdHRvbTphdXRvO2xlZnQ6MH1ib2R5LnN3YWwyLXRvYXN0LXNob3duIC5zd2FsMi1jb250YWluZXIuc3dhbDItY2VudGVyLWxlZnQsYm9keS5zd2FsMi10b2FzdC1zaG93biAuc3dhbDItY29udGFpbmVyLnN3YWwyLWNlbnRlci1zdGFydHt0b3A6NTAlO3JpZ2h0OmF1dG87Ym90dG9tOmF1dG87bGVmdDowO3RyYW5zZm9ybTp0cmFuc2xhdGVZKC01MCUpfWJvZHkuc3dhbDItdG9hc3Qtc2hvd24gLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1jZW50ZXJ7dG9wOjUwJTtyaWdodDphdXRvO2JvdHRvbTphdXRvO2xlZnQ6NTAlO3RyYW5zZm9ybTp0cmFuc2xhdGUoLTUwJSwtNTAlKX1ib2R5LnN3YWwyLXRvYXN0LXNob3duIC5zd2FsMi1jb250YWluZXIuc3dhbDItY2VudGVyLWVuZCxib2R5LnN3YWwyLXRvYXN0LXNob3duIC5zd2FsMi1jb250YWluZXIuc3dhbDItY2VudGVyLXJpZ2h0e3RvcDo1MCU7cmlnaHQ6MDtib3R0b206YXV0bztsZWZ0OmF1dG87dHJhbnNmb3JtOnRyYW5zbGF0ZVkoLTUwJSl9Ym9keS5zd2FsMi10b2FzdC1zaG93biAuc3dhbDItY29udGFpbmVyLnN3YWwyLWJvdHRvbS1sZWZ0LGJvZHkuc3dhbDItdG9hc3Qtc2hvd24gLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ib3R0b20tc3RhcnR7dG9wOmF1dG87cmlnaHQ6YXV0bztib3R0b206MDtsZWZ0OjB9Ym9keS5zd2FsMi10b2FzdC1zaG93biAuc3dhbDItY29udGFpbmVyLnN3YWwyLWJvdHRvbXt0b3A6YXV0bztyaWdodDphdXRvO2JvdHRvbTowO2xlZnQ6NTAlO3RyYW5zZm9ybTp0cmFuc2xhdGVYKC01MCUpfWJvZHkuc3dhbDItdG9hc3Qtc2hvd24gLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ib3R0b20tZW5kLGJvZHkuc3dhbDItdG9hc3Qtc2hvd24gLnN3YWwyLWNvbnRhaW5lci5zd2FsMi1ib3R0b20tcmlnaHR7dG9wOmF1dG87cmlnaHQ6MDtib3R0b206MDtsZWZ0OmF1dG99Ym9keS5zd2FsMi10b2FzdC1jb2x1bW4gLnN3YWwyLXRvYXN0e2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjthbGlnbi1pdGVtczpzdHJldGNofWJvZHkuc3dhbDItdG9hc3QtY29sdW1uIC5zd2FsMi10b2FzdCAuc3dhbDItYWN0aW9uc3tmbGV4OjE7YWxpZ24tc2VsZjpzdHJldGNoO2hlaWdodDoyLjJlbTttYXJnaW4tdG9wOi4zMTI1ZW19Ym9keS5zd2FsMi10b2FzdC1jb2x1bW4gLnN3YWwyLXRvYXN0IC5zd2FsMi1sb2FkaW5ne2p1c3RpZnktY29udGVudDpjZW50ZXJ9Ym9keS5zd2FsMi10b2FzdC1jb2x1bW4gLnN3YWwyLXRvYXN0IC5zd2FsMi1pbnB1dHtoZWlnaHQ6MmVtO21hcmdpbjouMzEyNWVtIGF1dG87Zm9udC1zaXplOjFlbX1ib2R5LnN3YWwyLXRvYXN0LWNvbHVtbiAuc3dhbDItdG9hc3QgLnN3YWwyLXZhbGlkYXRpb24tbWVzc2FnZXtmb250LXNpemU6MWVtfVwiKTsiLCJmdW5jdGlvbiBwdWdfYXR0cih0LGUsbixyKXtpZighMT09PWV8fG51bGw9PWV8fCFlJiYoXCJjbGFzc1wiPT09dHx8XCJzdHlsZVwiPT09dCkpcmV0dXJuXCJcIjtpZighMD09PWUpcmV0dXJuXCIgXCIrKHI/dDp0Kyc9XCInK3QrJ1wiJyk7dmFyIGY9dHlwZW9mIGU7cmV0dXJuXCJvYmplY3RcIiE9PWYmJlwiZnVuY3Rpb25cIiE9PWZ8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIGUudG9KU09OfHwoZT1lLnRvSlNPTigpKSxcInN0cmluZ1wiPT10eXBlb2YgZXx8KGU9SlNPTi5zdHJpbmdpZnkoZSksbnx8LTE9PT1lLmluZGV4T2YoJ1wiJykpPyhuJiYoZT1wdWdfZXNjYXBlKGUpKSxcIiBcIit0Kyc9XCInK2UrJ1wiJyk6XCIgXCIrdCtcIj0nXCIrZS5yZXBsYWNlKC8nL2csXCImIzM5O1wiKStcIidcIn1cbmZ1bmN0aW9uIHB1Z19jbGFzc2VzKHMscil7cmV0dXJuIEFycmF5LmlzQXJyYXkocyk/cHVnX2NsYXNzZXNfYXJyYXkocyxyKTpzJiZcIm9iamVjdFwiPT10eXBlb2Ygcz9wdWdfY2xhc3Nlc19vYmplY3Qocyk6c3x8XCJcIn1cbmZ1bmN0aW9uIHB1Z19jbGFzc2VzX2FycmF5KHIsYSl7Zm9yKHZhciBzLGU9XCJcIix1PVwiXCIsYz1BcnJheS5pc0FycmF5KGEpLGc9MDtnPHIubGVuZ3RoO2crKykocz1wdWdfY2xhc3NlcyhyW2ddKSkmJihjJiZhW2ddJiYocz1wdWdfZXNjYXBlKHMpKSxlPWUrdStzLHU9XCIgXCIpO3JldHVybiBlfVxuZnVuY3Rpb24gcHVnX2NsYXNzZXNfb2JqZWN0KHIpe3ZhciBhPVwiXCIsbj1cIlwiO2Zvcih2YXIgbyBpbiByKW8mJnJbb10mJnB1Z19oYXNfb3duX3Byb3BlcnR5LmNhbGwocixvKSYmKGE9YStuK28sbj1cIiBcIik7cmV0dXJuIGF9XG5mdW5jdGlvbiBwdWdfZXNjYXBlKGUpe3ZhciBhPVwiXCIrZSx0PXB1Z19tYXRjaF9odG1sLmV4ZWMoYSk7aWYoIXQpcmV0dXJuIGU7dmFyIHIsYyxuLHM9XCJcIjtmb3Iocj10LmluZGV4LGM9MDtyPGEubGVuZ3RoO3IrKyl7c3dpdGNoKGEuY2hhckNvZGVBdChyKSl7Y2FzZSAzNDpuPVwiJnF1b3Q7XCI7YnJlYWs7Y2FzZSAzODpuPVwiJmFtcDtcIjticmVhaztjYXNlIDYwOm49XCImbHQ7XCI7YnJlYWs7Y2FzZSA2MjpuPVwiJmd0O1wiO2JyZWFrO2RlZmF1bHQ6Y29udGludWV9YyE9PXImJihzKz1hLnN1YnN0cmluZyhjLHIpKSxjPXIrMSxzKz1ufXJldHVybiBjIT09cj9zK2Euc3Vic3RyaW5nKGMscik6c31cbnZhciBwdWdfaGFzX293bl9wcm9wZXJ0eT1PYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHB1Z19tYXRjaF9odG1sPS9bXCImPD5dLztmdW5jdGlvbiBlbXBsb3llZXNUYWJsZShsb2NhbHMpIHt2YXIgcHVnX2h0bWwgPSBcIlwiLCBwdWdfbWl4aW5zID0ge30sIHB1Z19pbnRlcnA7O3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKE1hdGgsIGN1cnJlbnRQYWdlLCBkZWZhdWx0TGltaXQsIHVzZXJzLCB1c2Vyc0NvdW50KSB7cHVnX2h0bWwgPSBwdWdfaHRtbCArIFwiXFx1MDAzQ3RhYmxlIGNsYXNzPVxcXCJ0YWJsZSBpcy1mdWxsd2lkdGggaXMtc3RyaXBlZCBpcy1ob3ZlcmFibGVcXFwiXFx1MDAzRVxcdTAwM0N0aGVhZFxcdTAwM0VcXHUwMDNDdHJcXHUwMDNFXFx1MDAzQ3RoXFx1MDAzRUVtcGxveWVlIGNvZGVcXHUwMDNDXFx1MDAyRnRoXFx1MDAzRVxcdTAwM0N0aFxcdTAwM0VJbWFnZVxcdTAwM0NcXHUwMDJGdGhcXHUwMDNFXFx1MDAzQ3RoXFx1MDAzRU5hbWVcXHUwMDNDXFx1MDAyRnRoXFx1MDAzRVxcdTAwM0N0aFxcdTAwM0VFbWFpbFxcdTAwM0NcXHUwMDJGdGhcXHUwMDNFXFx1MDAzQ3RoIGNsYXNzPVxcXCJoYXMtdGV4dC1jZW50ZXJlZFxcXCJcXHUwMDNFQWN0aW9uXFx1MDAzQ1xcdTAwMkZ0aFxcdTAwM0VcXHUwMDNDXFx1MDAyRnRyXFx1MDAzRVxcdTAwM0NcXHUwMDJGdGhlYWRcXHUwMDNFXFx1MDAzQ3Rib2R5XFx1MDAzRVwiO1xuLy8gaXRlcmF0ZSB1c2Vyc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSB1c2VycztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIHB1Z19pbmRleDAgPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IHB1Z19pbmRleDAgPCAkJGw7IHB1Z19pbmRleDArKykge1xuICAgICAgICB2YXIgZW1wbG95ZWUgPSAkJG9ialtwdWdfaW5kZXgwXTtcbnB1Z19odG1sID0gcHVnX2h0bWwgKyBcIlxcdTAwM0N0clxcdTAwM0VcXHUwMDNDdGQgY2xhc3M9XFxcImlzLW5hcnJvd1xcXCJcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gZW1wbG95ZWUuZW1wbG95ZWVDb2RlKSA/IFwiXCIgOiBwdWdfaW50ZXJwKSkgKyBcIlxcdTAwM0NcXHUwMDJGdGRcXHUwMDNFXFx1MDAzQ3RkIGNsYXNzPVxcXCJpcy1uYXJyb3dcXFwiXFx1MDAzRVxcdTAwM0NkaXYgY2xhc3M9XFxcImltYWdlIGlzLTQ4eDQ4XFxcIlxcdTAwM0VcXHUwMDNDaW1nXCIgKyAoXCIgY2xhc3M9XFxcImlzLXJvdW5kZWRcXFwiXCIrcHVnX2F0dHIoXCJzcmNcIiwgZW1wbG95ZWUuaW1hZ2VVcmwsIHRydWUsIGZhbHNlKSkgKyBcIlxcdTAwMkZcXHUwMDNFXFx1MDAzQ1xcdTAwMkZkaXZcXHUwMDNFXFx1MDAzQ1xcdTAwMkZ0ZFxcdTAwM0VcXHUwMDNDdGRcXHUwMDNFXFx1MDAzQ2EgY2xhc3M9XFxcInRhYmxlLWVtcGxveWVlcy0tZW1wbG95ZWUtbmFtZVxcXCIgaHJlZj1cXFwiI1xcXCJcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gZW1wbG95ZWUubmFtZSkgPyBcIlwiIDogcHVnX2ludGVycCkpICsgXCJcXHUwMDNDXFx1MDAyRmFcXHUwMDNFXFx1MDAzQ1xcdTAwMkZ0ZFxcdTAwM0VcXHUwMDNDdGQgY2xhc3M9XFxcInRhYmxlLWVtcGxveWVlcy0tZW1wbG95ZWUtZW1haWxcXFwiXFx1MDAzRVwiICsgKHB1Z19lc2NhcGUobnVsbCA9PSAocHVnX2ludGVycCA9IGVtcGxveWVlLmVtYWlsKSA/IFwiXCIgOiBwdWdfaW50ZXJwKSkgKyBcIlxcdTAwM0NcXHUwMDJGdGRcXHUwMDNFXFx1MDAzQ3RkIGNsYXNzPVxcXCJpcy1uYXJyb3cgdGFibGUtZW1wbG95ZWVzLS1hY3Rpb25zXFxcIlxcdTAwM0VcXHUwMDNDYnV0dG9uIGNsYXNzPVxcXCJidXR0b24gaXMtcHJpbWFyeSBpcy1yb3VuZGVkIGlzLXVwcGVyY2FzZSB0YWJsZS1lbXBsb3llZXMtLXJlcXVpcmUtcmV2aWV3LWJ1dHRvblxcXCJcXHUwMDNFXFx1MDAzQ3NwYW4gY2xhc3M9XFxcImljb25cXFwiXFx1MDAzRVxcdTAwM0NzdmcgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiIGZvY3VzYWJsZT1cXFwiZmFsc2VcXFwiIGRhdGEtcHJlZml4PVxcXCJmYXNcXFwiIGRhdGEtaWNvbj1cXFwicGVuXFxcIiBjbGFzcz1cXFwic3ZnLWlubGluZS0tZmEgZmEtcGVuIGZhLXctMTZcXFwiIHJvbGU9XFxcImltZ1xcXCIgeG1sbnM9XFxcImh0dHA6XFx1MDAyRlxcdTAwMkZ3d3cudzMub3JnXFx1MDAyRjIwMDBcXHUwMDJGc3ZnXFxcIiB2aWV3Qm94PVxcXCIwIDAgNTEyIDUxMlxcXCJcXHUwMDNFXFx1MDAzQ3BhdGggZmlsbD1cXFwiY3VycmVudENvbG9yXFxcIiBkPVxcXCJNMjkwLjc0IDkzLjI0bDEyOC4wMiAxMjguMDItMjc3Ljk5IDI3Ny45OS0xMTQuMTQgMTIuNkMxMS4zNSA1MTMuNTQtMS41NiA1MDAuNjIuMTQgNDg1LjM0bDEyLjctMTE0LjIyIDI3Ny45LTI3Ny44OHptMjA3LjItMTkuMDZsLTYwLjExLTYwLjExYy0xOC43NS0xOC43NS00OS4xNi0xOC43NS02Ny45MSAwbC01Ni41NSA1Ni41NSAxMjguMDIgMTI4LjAyIDU2LjU1LTU2LjU1YzE4Ljc1LTE4Ljc2IDE4Ljc1LTQ5LjE2IDAtNjcuOTF6XFxcIlxcdTAwM0VcXHUwMDNDXFx1MDAyRnBhdGhcXHUwMDNFXFx1MDAzQ1xcdTAwMkZzdmdcXHUwMDNFXFx1MDAzQ1xcdTAwMkZzcGFuXFx1MDAzRVxcdTAwM0NzcGFuXFx1MDAzRVJlcXVpcmUgcmV2aWV3XFx1MDAzQ1xcdTAwMkZzcGFuXFx1MDAzRVxcdTAwM0NcXHUwMDJGYnV0dG9uXFx1MDAzRVxcdTAwM0NidXR0b25cIiArIChcIiBjbGFzcz1cXFwiYnV0dG9uIGlzLWRhbmdlciBpcy1yb3VuZGVkIGlzLXVwcGVyY2FzZSB0YWJsZS1lbXBsb3llZXMtLWJ1dHRvbi1kZWxldGVcXFwiXCIrcHVnX2F0dHIoXCJkYXRhLWlkXCIsIGVtcGxveWVlLl9pZCwgdHJ1ZSwgZmFsc2UpKSArIFwiXFx1MDAzRVxcdTAwM0NzcGFuXFx1MDAzRURlbGV0ZVxcdTAwM0NcXHUwMDJGc3BhblxcdTAwM0VcXHUwMDNDXFx1MDAyRmJ1dHRvblxcdTAwM0VcXHUwMDNDXFx1MDAyRnRkXFx1MDAzRVxcdTAwM0NcXHUwMDJGdHJcXHUwMDNFXCI7XG4gICAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgcHVnX2luZGV4MCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7XG4gICAgICB2YXIgZW1wbG95ZWUgPSAkJG9ialtwdWdfaW5kZXgwXTtcbnB1Z19odG1sID0gcHVnX2h0bWwgKyBcIlxcdTAwM0N0clxcdTAwM0VcXHUwMDNDdGQgY2xhc3M9XFxcImlzLW5hcnJvd1xcXCJcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gZW1wbG95ZWUuZW1wbG95ZWVDb2RlKSA/IFwiXCIgOiBwdWdfaW50ZXJwKSkgKyBcIlxcdTAwM0NcXHUwMDJGdGRcXHUwMDNFXFx1MDAzQ3RkIGNsYXNzPVxcXCJpcy1uYXJyb3dcXFwiXFx1MDAzRVxcdTAwM0NkaXYgY2xhc3M9XFxcImltYWdlIGlzLTQ4eDQ4XFxcIlxcdTAwM0VcXHUwMDNDaW1nXCIgKyAoXCIgY2xhc3M9XFxcImlzLXJvdW5kZWRcXFwiXCIrcHVnX2F0dHIoXCJzcmNcIiwgZW1wbG95ZWUuaW1hZ2VVcmwsIHRydWUsIGZhbHNlKSkgKyBcIlxcdTAwMkZcXHUwMDNFXFx1MDAzQ1xcdTAwMkZkaXZcXHUwMDNFXFx1MDAzQ1xcdTAwMkZ0ZFxcdTAwM0VcXHUwMDNDdGRcXHUwMDNFXFx1MDAzQ2EgY2xhc3M9XFxcInRhYmxlLWVtcGxveWVlcy0tZW1wbG95ZWUtbmFtZVxcXCIgaHJlZj1cXFwiI1xcXCJcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gZW1wbG95ZWUubmFtZSkgPyBcIlwiIDogcHVnX2ludGVycCkpICsgXCJcXHUwMDNDXFx1MDAyRmFcXHUwMDNFXFx1MDAzQ1xcdTAwMkZ0ZFxcdTAwM0VcXHUwMDNDdGQgY2xhc3M9XFxcInRhYmxlLWVtcGxveWVlcy0tZW1wbG95ZWUtZW1haWxcXFwiXFx1MDAzRVwiICsgKHB1Z19lc2NhcGUobnVsbCA9PSAocHVnX2ludGVycCA9IGVtcGxveWVlLmVtYWlsKSA/IFwiXCIgOiBwdWdfaW50ZXJwKSkgKyBcIlxcdTAwM0NcXHUwMDJGdGRcXHUwMDNFXFx1MDAzQ3RkIGNsYXNzPVxcXCJpcy1uYXJyb3cgdGFibGUtZW1wbG95ZWVzLS1hY3Rpb25zXFxcIlxcdTAwM0VcXHUwMDNDYnV0dG9uIGNsYXNzPVxcXCJidXR0b24gaXMtcHJpbWFyeSBpcy1yb3VuZGVkIGlzLXVwcGVyY2FzZSB0YWJsZS1lbXBsb3llZXMtLXJlcXVpcmUtcmV2aWV3LWJ1dHRvblxcXCJcXHUwMDNFXFx1MDAzQ3NwYW4gY2xhc3M9XFxcImljb25cXFwiXFx1MDAzRVxcdTAwM0NzdmcgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiIGZvY3VzYWJsZT1cXFwiZmFsc2VcXFwiIGRhdGEtcHJlZml4PVxcXCJmYXNcXFwiIGRhdGEtaWNvbj1cXFwicGVuXFxcIiBjbGFzcz1cXFwic3ZnLWlubGluZS0tZmEgZmEtcGVuIGZhLXctMTZcXFwiIHJvbGU9XFxcImltZ1xcXCIgeG1sbnM9XFxcImh0dHA6XFx1MDAyRlxcdTAwMkZ3d3cudzMub3JnXFx1MDAyRjIwMDBcXHUwMDJGc3ZnXFxcIiB2aWV3Qm94PVxcXCIwIDAgNTEyIDUxMlxcXCJcXHUwMDNFXFx1MDAzQ3BhdGggZmlsbD1cXFwiY3VycmVudENvbG9yXFxcIiBkPVxcXCJNMjkwLjc0IDkzLjI0bDEyOC4wMiAxMjguMDItMjc3Ljk5IDI3Ny45OS0xMTQuMTQgMTIuNkMxMS4zNSA1MTMuNTQtMS41NiA1MDAuNjIuMTQgNDg1LjM0bDEyLjctMTE0LjIyIDI3Ny45LTI3Ny44OHptMjA3LjItMTkuMDZsLTYwLjExLTYwLjExYy0xOC43NS0xOC43NS00OS4xNi0xOC43NS02Ny45MSAwbC01Ni41NSA1Ni41NSAxMjguMDIgMTI4LjAyIDU2LjU1LTU2LjU1YzE4Ljc1LTE4Ljc2IDE4Ljc1LTQ5LjE2IDAtNjcuOTF6XFxcIlxcdTAwM0VcXHUwMDNDXFx1MDAyRnBhdGhcXHUwMDNFXFx1MDAzQ1xcdTAwMkZzdmdcXHUwMDNFXFx1MDAzQ1xcdTAwMkZzcGFuXFx1MDAzRVxcdTAwM0NzcGFuXFx1MDAzRVJlcXVpcmUgcmV2aWV3XFx1MDAzQ1xcdTAwMkZzcGFuXFx1MDAzRVxcdTAwM0NcXHUwMDJGYnV0dG9uXFx1MDAzRVxcdTAwM0NidXR0b25cIiArIChcIiBjbGFzcz1cXFwiYnV0dG9uIGlzLWRhbmdlciBpcy1yb3VuZGVkIGlzLXVwcGVyY2FzZSB0YWJsZS1lbXBsb3llZXMtLWJ1dHRvbi1kZWxldGVcXFwiXCIrcHVnX2F0dHIoXCJkYXRhLWlkXCIsIGVtcGxveWVlLl9pZCwgdHJ1ZSwgZmFsc2UpKSArIFwiXFx1MDAzRVxcdTAwM0NzcGFuXFx1MDAzRURlbGV0ZVxcdTAwM0NcXHUwMDJGc3BhblxcdTAwM0VcXHUwMDNDXFx1MDAyRmJ1dHRvblxcdTAwM0VcXHUwMDNDXFx1MDAyRnRkXFx1MDAzRVxcdTAwM0NcXHUwMDJGdHJcXHUwMDNFXCI7XG4gICAgfVxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG5wdWdfaHRtbCA9IHB1Z19odG1sICsgXCJcXHUwMDNDXFx1MDAyRnRib2R5XFx1MDAzRVxcdTAwM0NcXHUwMDJGdGFibGVcXHUwMDNFXCI7XG52YXIgcGFnZUNvdW50ID0gTWF0aC5jZWlsKHVzZXJzQ291bnQvZGVmYXVsdExpbWl0KVxuXG5wdWdfaHRtbCA9IHB1Z19odG1sICsgXCJcXHUwMDNDbmF2IGNsYXNzPVxcXCJwYWdpbmF0aW9uIGlzLXJvdW5kZWRcXFwiIHJvbGU9XFxcIm5hdmlnYXRpb25cXFwiXFx1MDAzRVxcdTAwM0NhIGNsYXNzPVxcXCJwYWdpbmF0aW9uLXByZXZpb3VzXFxcIlxcdTAwM0VQcmV2aW91c1xcdTAwM0NcXHUwMDJGYVxcdTAwM0VcXHUwMDNDYSBjbGFzcz1cXFwicGFnaW5hdGlvbi1uZXh0XFxcIlxcdTAwM0VOZXh0IHBhZ2VcXHUwMDNDXFx1MDAyRmFcXHUwMDNFXFx1MDAzQ3VsIGNsYXNzPVxcXCJwYWdpbmF0aW9uLWxpc3RcXFwiXFx1MDAzRVwiO1xuZm9yICh2YXIgaSA9IDE7IGkgPD0gcGFnZUNvdW50OyBpKyspXG57XG5wdWdfaHRtbCA9IHB1Z19odG1sICsgXCJcXHUwMDNDbGlcXHUwMDNFXFx1MDAzQ2FcIiArIChwdWdfYXR0cihcImNsYXNzXCIsIHB1Z19jbGFzc2VzKFtgcGFnaW5hdGlvbi1saW5rICR7aSA9PT0gY3VycmVudFBhZ2UgPyAnaXMtY3VycmVudCcgOiAnJ31gXSwgW3RydWVdKSwgZmFsc2UsIGZhbHNlKSkgKyBcIlxcdTAwM0VcIiArIChwdWdfZXNjYXBlKG51bGwgPT0gKHB1Z19pbnRlcnAgPSBpKSA/IFwiXCIgOiBwdWdfaW50ZXJwKSkgKyBcIlxcdTAwM0NcXHUwMDJGYVxcdTAwM0VcXHUwMDNDXFx1MDAyRmxpXFx1MDAzRVwiO1xufVxucHVnX2h0bWwgPSBwdWdfaHRtbCArIFwiXFx1MDAzQ1xcdTAwMkZ1bFxcdTAwM0VcXHUwMDNDXFx1MDAyRm5hdlxcdTAwM0VcIjt9LmNhbGwodGhpcyxcIk1hdGhcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLk1hdGg6dHlwZW9mIE1hdGghPT1cInVuZGVmaW5lZFwiP01hdGg6dW5kZWZpbmVkLFwiY3VycmVudFBhZ2VcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmN1cnJlbnRQYWdlOnR5cGVvZiBjdXJyZW50UGFnZSE9PVwidW5kZWZpbmVkXCI/Y3VycmVudFBhZ2U6dW5kZWZpbmVkLFwiZGVmYXVsdExpbWl0XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5kZWZhdWx0TGltaXQ6dHlwZW9mIGRlZmF1bHRMaW1pdCE9PVwidW5kZWZpbmVkXCI/ZGVmYXVsdExpbWl0OnVuZGVmaW5lZCxcInVzZXJzXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51c2Vyczp0eXBlb2YgdXNlcnMhPT1cInVuZGVmaW5lZFwiP3VzZXJzOnVuZGVmaW5lZCxcInVzZXJzQ291bnRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVzZXJzQ291bnQ6dHlwZW9mIHVzZXJzQ291bnQhPT1cInVuZGVmaW5lZFwiP3VzZXJzQ291bnQ6dW5kZWZpbmVkKSk7O3JldHVybiBwdWdfaHRtbDt9ZXhwb3J0IGRlZmF1bHQgZW1wbG95ZWVzVGFibGU7IiwiZnVuY3Rpb24gcHVnX2F0dHIodCxlLG4scil7aWYoITE9PT1lfHxudWxsPT1lfHwhZSYmKFwiY2xhc3NcIj09PXR8fFwic3R5bGVcIj09PXQpKXJldHVyblwiXCI7aWYoITA9PT1lKXJldHVyblwiIFwiKyhyP3Q6dCsnPVwiJyt0KydcIicpO3ZhciBmPXR5cGVvZiBlO3JldHVyblwib2JqZWN0XCIhPT1mJiZcImZ1bmN0aW9uXCIhPT1mfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBlLnRvSlNPTnx8KGU9ZS50b0pTT04oKSksXCJzdHJpbmdcIj09dHlwZW9mIGV8fChlPUpTT04uc3RyaW5naWZ5KGUpLG58fC0xPT09ZS5pbmRleE9mKCdcIicpKT8obiYmKGU9cHVnX2VzY2FwZShlKSksXCIgXCIrdCsnPVwiJytlKydcIicpOlwiIFwiK3QrXCI9J1wiK2UucmVwbGFjZSgvJy9nLFwiJiMzOTtcIikrXCInXCJ9XG5mdW5jdGlvbiBwdWdfY2xhc3NlcyhzLHIpe3JldHVybiBBcnJheS5pc0FycmF5KHMpP3B1Z19jbGFzc2VzX2FycmF5KHMscik6cyYmXCJvYmplY3RcIj09dHlwZW9mIHM/cHVnX2NsYXNzZXNfb2JqZWN0KHMpOnN8fFwiXCJ9XG5mdW5jdGlvbiBwdWdfY2xhc3Nlc19hcnJheShyLGEpe2Zvcih2YXIgcyxlPVwiXCIsdT1cIlwiLGM9QXJyYXkuaXNBcnJheShhKSxnPTA7ZzxyLmxlbmd0aDtnKyspKHM9cHVnX2NsYXNzZXMocltnXSkpJiYoYyYmYVtnXSYmKHM9cHVnX2VzY2FwZShzKSksZT1lK3Urcyx1PVwiIFwiKTtyZXR1cm4gZX1cbmZ1bmN0aW9uIHB1Z19jbGFzc2VzX29iamVjdChyKXt2YXIgYT1cIlwiLG49XCJcIjtmb3IodmFyIG8gaW4gcilvJiZyW29dJiZwdWdfaGFzX293bl9wcm9wZXJ0eS5jYWxsKHIsbykmJihhPWErbitvLG49XCIgXCIpO3JldHVybiBhfVxuZnVuY3Rpb24gcHVnX2VzY2FwZShlKXt2YXIgYT1cIlwiK2UsdD1wdWdfbWF0Y2hfaHRtbC5leGVjKGEpO2lmKCF0KXJldHVybiBlO3ZhciByLGMsbixzPVwiXCI7Zm9yKHI9dC5pbmRleCxjPTA7cjxhLmxlbmd0aDtyKyspe3N3aXRjaChhLmNoYXJDb2RlQXQocikpe2Nhc2UgMzQ6bj1cIiZxdW90O1wiO2JyZWFrO2Nhc2UgMzg6bj1cIiZhbXA7XCI7YnJlYWs7Y2FzZSA2MDpuPVwiJmx0O1wiO2JyZWFrO2Nhc2UgNjI6bj1cIiZndDtcIjticmVhaztkZWZhdWx0OmNvbnRpbnVlfWMhPT1yJiYocys9YS5zdWJzdHJpbmcoYyxyKSksYz1yKzEscys9bn1yZXR1cm4gYyE9PXI/cythLnN1YnN0cmluZyhjLHIpOnN9XG52YXIgcHVnX2hhc19vd25fcHJvcGVydHk9T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciBwdWdfbWF0Y2hfaHRtbD0vW1wiJjw+XS87ZnVuY3Rpb24gcmV2aWV3Qm9hcmRzVGFibGUobG9jYWxzKSB7dmFyIHB1Z19odG1sID0gXCJcIiwgcHVnX21peGlucyA9IHt9LCBwdWdfaW50ZXJwOzt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChEYXRlLCBNYXRoLCBjdXJyZW50UGFnZSwgZGVmYXVsdExpbWl0LCByZXZpZXdCb2FyZHMsIHJldmlld0JvYXJkc0NvdW50KSB7cHVnX2h0bWwgPSBwdWdfaHRtbCArIFwiXFx1MDAzQ3RhYmxlIGNsYXNzPVxcXCJ0YWJsZSBpcy1mdWxsd2lkdGggaXMtc3RyaXBlZCBpcy1ob3ZlcmFibGVcXFwiXFx1MDAzRVxcdTAwM0N0aGVhZFxcdTAwM0VcXHUwMDNDdHJcXHUwMDNFXFx1MDAzQ3RoXFx1MDAzRVRpdGxlXFx1MDAzQ1xcdTAwMkZ0aFxcdTAwM0VcXHUwMDNDdGhcXHUwMDNFRGVzY3JpcHRpb25cXHUwMDNDXFx1MDAyRnRoXFx1MDAzRVxcdTAwM0N0aFxcdTAwM0VEdWUgZGF0ZVxcdTAwM0NcXHUwMDJGdGhcXHUwMDNFXFx1MDAzQ3RoXFx1MDAzRVJldmlldyBmYWN0b3JzXFx1MDAzQ1xcdTAwMkZ0aFxcdTAwM0VcXHUwMDNDXFx1MDAyRnRyXFx1MDAzRVxcdTAwM0NcXHUwMDJGdGhlYWRcXHUwMDNFXFx1MDAzQ3Rib2R5XFx1MDAzRVwiO1xuLy8gaXRlcmF0ZSByZXZpZXdCb2FyZHNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gcmV2aWV3Qm9hcmRzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgcHVnX2luZGV4MCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgcHVnX2luZGV4MCA8ICQkbDsgcHVnX2luZGV4MCsrKSB7XG4gICAgICAgIHZhciByZXZpZXdCb2FyZCA9ICQkb2JqW3B1Z19pbmRleDBdO1xucHVnX2h0bWwgPSBwdWdfaHRtbCArIFwiXFx1MDAzQ3RyXFx1MDAzRVxcdTAwM0N0ZFxcdTAwM0VcIiArIChwdWdfZXNjYXBlKG51bGwgPT0gKHB1Z19pbnRlcnAgPSByZXZpZXdCb2FyZC50aXRsZSkgPyBcIlwiIDogcHVnX2ludGVycCkpICsgXCJcXHUwMDNDXFx1MDAyRnRkXFx1MDAzRVxcdTAwM0N0ZFxcdTAwM0VcXHUwMDNDcFxcdTAwM0VcIiArIChwdWdfZXNjYXBlKG51bGwgPT0gKHB1Z19pbnRlcnAgPSByZXZpZXdCb2FyZC5kZXNjcmlwdGlvbikgPyBcIlwiIDogcHVnX2ludGVycCkpICsgXCJcXHUwMDNDXFx1MDAyRnBcXHUwMDNFXFx1MDAzQ1xcdTAwMkZ0ZFxcdTAwM0VcXHUwMDNDdGRcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gbmV3IERhdGUocmV2aWV3Qm9hcmQuZHVlRGF0ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCkpID8gXCJcIiA6IHB1Z19pbnRlcnApKSArIFwiXFx1MDAzQ1xcdTAwMkZ0ZFxcdTAwM0VcXHUwMDNDdGRcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gcmV2aWV3Qm9hcmQucmV2aWV3RmFjdG9ycykgPyBcIlwiIDogcHVnX2ludGVycCkpICsgXCJcXHUwMDNDXFx1MDAyRnRkXFx1MDAzRVxcdTAwM0NcXHUwMDJGdHJcXHUwMDNFXCI7XG4gICAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgcHVnX2luZGV4MCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7XG4gICAgICB2YXIgcmV2aWV3Qm9hcmQgPSAkJG9ialtwdWdfaW5kZXgwXTtcbnB1Z19odG1sID0gcHVnX2h0bWwgKyBcIlxcdTAwM0N0clxcdTAwM0VcXHUwMDNDdGRcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gcmV2aWV3Qm9hcmQudGl0bGUpID8gXCJcIiA6IHB1Z19pbnRlcnApKSArIFwiXFx1MDAzQ1xcdTAwMkZ0ZFxcdTAwM0VcXHUwMDNDdGRcXHUwMDNFXFx1MDAzQ3BcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gcmV2aWV3Qm9hcmQuZGVzY3JpcHRpb24pID8gXCJcIiA6IHB1Z19pbnRlcnApKSArIFwiXFx1MDAzQ1xcdTAwMkZwXFx1MDAzRVxcdTAwM0NcXHUwMDJGdGRcXHUwMDNFXFx1MDAzQ3RkXFx1MDAzRVwiICsgKHB1Z19lc2NhcGUobnVsbCA9PSAocHVnX2ludGVycCA9IG5ldyBEYXRlKHJldmlld0JvYXJkLmR1ZURhdGUpLnRvTG9jYWxlRGF0ZVN0cmluZygpKSA/IFwiXCIgOiBwdWdfaW50ZXJwKSkgKyBcIlxcdTAwM0NcXHUwMDJGdGRcXHUwMDNFXFx1MDAzQ3RkXFx1MDAzRVwiICsgKHB1Z19lc2NhcGUobnVsbCA9PSAocHVnX2ludGVycCA9IHJldmlld0JvYXJkLnJldmlld0ZhY3RvcnMpID8gXCJcIiA6IHB1Z19pbnRlcnApKSArIFwiXFx1MDAzQ1xcdTAwMkZ0ZFxcdTAwM0VcXHUwMDNDXFx1MDAyRnRyXFx1MDAzRVwiO1xuICAgIH1cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxucHVnX2h0bWwgPSBwdWdfaHRtbCArIFwiXFx1MDAzQ1xcdTAwMkZ0Ym9keVxcdTAwM0VcXHUwMDNDXFx1MDAyRnRhYmxlXFx1MDAzRVwiO1xudmFyIHBhZ2VDb3VudCA9IE1hdGguY2VpbChyZXZpZXdCb2FyZHNDb3VudC9kZWZhdWx0TGltaXQpXG5cbnB1Z19odG1sID0gcHVnX2h0bWwgKyBcIlxcdTAwM0NuYXYgY2xhc3M9XFxcInBhZ2luYXRpb24gaXMtcm91bmRlZFxcXCIgcm9sZT1cXFwibmF2aWdhdGlvblxcXCJcXHUwMDNFXFx1MDAzQ2EgY2xhc3M9XFxcInBhZ2luYXRpb24tcHJldmlvdXNcXFwiXFx1MDAzRVByZXZpb3VzXFx1MDAzQ1xcdTAwMkZhXFx1MDAzRVxcdTAwM0NhIGNsYXNzPVxcXCJwYWdpbmF0aW9uLW5leHRcXFwiXFx1MDAzRU5leHQgcGFnZVxcdTAwM0NcXHUwMDJGYVxcdTAwM0VcXHUwMDNDdWwgY2xhc3M9XFxcInBhZ2luYXRpb24tbGlzdFxcXCJcXHUwMDNFXCI7XG5mb3IgKHZhciBpID0gMTsgaSA8PSBwYWdlQ291bnQ7IGkrKylcbntcbnB1Z19odG1sID0gcHVnX2h0bWwgKyBcIlxcdTAwM0NsaVxcdTAwM0VcXHUwMDNDYVwiICsgKHB1Z19hdHRyKFwiY2xhc3NcIiwgcHVnX2NsYXNzZXMoW2BwYWdpbmF0aW9uLWxpbmsgJHtpID09PSBjdXJyZW50UGFnZSA/ICdpcy1jdXJyZW50JyA6ICcnfWBdLCBbdHJ1ZV0pLCBmYWxzZSwgZmFsc2UpKSArIFwiXFx1MDAzRVwiICsgKHB1Z19lc2NhcGUobnVsbCA9PSAocHVnX2ludGVycCA9IGkpID8gXCJcIiA6IHB1Z19pbnRlcnApKSArIFwiXFx1MDAzQ1xcdTAwMkZhXFx1MDAzRVxcdTAwM0NcXHUwMDJGbGlcXHUwMDNFXCI7XG59XG5wdWdfaHRtbCA9IHB1Z19odG1sICsgXCJcXHUwMDNDXFx1MDAyRnVsXFx1MDAzRVxcdTAwM0NcXHUwMDJGbmF2XFx1MDAzRVwiO30uY2FsbCh0aGlzLFwiRGF0ZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguRGF0ZTp0eXBlb2YgRGF0ZSE9PVwidW5kZWZpbmVkXCI/RGF0ZTp1bmRlZmluZWQsXCJNYXRoXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5NYXRoOnR5cGVvZiBNYXRoIT09XCJ1bmRlZmluZWRcIj9NYXRoOnVuZGVmaW5lZCxcImN1cnJlbnRQYWdlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jdXJyZW50UGFnZTp0eXBlb2YgY3VycmVudFBhZ2UhPT1cInVuZGVmaW5lZFwiP2N1cnJlbnRQYWdlOnVuZGVmaW5lZCxcImRlZmF1bHRMaW1pdFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguZGVmYXVsdExpbWl0OnR5cGVvZiBkZWZhdWx0TGltaXQhPT1cInVuZGVmaW5lZFwiP2RlZmF1bHRMaW1pdDp1bmRlZmluZWQsXCJyZXZpZXdCb2FyZHNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnJldmlld0JvYXJkczp0eXBlb2YgcmV2aWV3Qm9hcmRzIT09XCJ1bmRlZmluZWRcIj9yZXZpZXdCb2FyZHM6dW5kZWZpbmVkLFwicmV2aWV3Qm9hcmRzQ291bnRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnJldmlld0JvYXJkc0NvdW50OnR5cGVvZiByZXZpZXdCb2FyZHNDb3VudCE9PVwidW5kZWZpbmVkXCI/cmV2aWV3Qm9hcmRzQ291bnQ6dW5kZWZpbmVkKSk7O3JldHVybiBwdWdfaHRtbDt9ZXhwb3J0IGRlZmF1bHQgcmV2aWV3Qm9hcmRzVGFibGU7IiwiZnVuY3Rpb24gcHVnX2F0dHIodCxlLG4scil7aWYoITE9PT1lfHxudWxsPT1lfHwhZSYmKFwiY2xhc3NcIj09PXR8fFwic3R5bGVcIj09PXQpKXJldHVyblwiXCI7aWYoITA9PT1lKXJldHVyblwiIFwiKyhyP3Q6dCsnPVwiJyt0KydcIicpO3ZhciBmPXR5cGVvZiBlO3JldHVyblwib2JqZWN0XCIhPT1mJiZcImZ1bmN0aW9uXCIhPT1mfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBlLnRvSlNPTnx8KGU9ZS50b0pTT04oKSksXCJzdHJpbmdcIj09dHlwZW9mIGV8fChlPUpTT04uc3RyaW5naWZ5KGUpLG58fC0xPT09ZS5pbmRleE9mKCdcIicpKT8obiYmKGU9cHVnX2VzY2FwZShlKSksXCIgXCIrdCsnPVwiJytlKydcIicpOlwiIFwiK3QrXCI9J1wiK2UucmVwbGFjZSgvJy9nLFwiJiMzOTtcIikrXCInXCJ9XG5mdW5jdGlvbiBwdWdfY2xhc3NlcyhzLHIpe3JldHVybiBBcnJheS5pc0FycmF5KHMpP3B1Z19jbGFzc2VzX2FycmF5KHMscik6cyYmXCJvYmplY3RcIj09dHlwZW9mIHM/cHVnX2NsYXNzZXNfb2JqZWN0KHMpOnN8fFwiXCJ9XG5mdW5jdGlvbiBwdWdfY2xhc3Nlc19hcnJheShyLGEpe2Zvcih2YXIgcyxlPVwiXCIsdT1cIlwiLGM9QXJyYXkuaXNBcnJheShhKSxnPTA7ZzxyLmxlbmd0aDtnKyspKHM9cHVnX2NsYXNzZXMocltnXSkpJiYoYyYmYVtnXSYmKHM9cHVnX2VzY2FwZShzKSksZT1lK3Urcyx1PVwiIFwiKTtyZXR1cm4gZX1cbmZ1bmN0aW9uIHB1Z19jbGFzc2VzX29iamVjdChyKXt2YXIgYT1cIlwiLG49XCJcIjtmb3IodmFyIG8gaW4gcilvJiZyW29dJiZwdWdfaGFzX293bl9wcm9wZXJ0eS5jYWxsKHIsbykmJihhPWErbitvLG49XCIgXCIpO3JldHVybiBhfVxuZnVuY3Rpb24gcHVnX2VzY2FwZShlKXt2YXIgYT1cIlwiK2UsdD1wdWdfbWF0Y2hfaHRtbC5leGVjKGEpO2lmKCF0KXJldHVybiBlO3ZhciByLGMsbixzPVwiXCI7Zm9yKHI9dC5pbmRleCxjPTA7cjxhLmxlbmd0aDtyKyspe3N3aXRjaChhLmNoYXJDb2RlQXQocikpe2Nhc2UgMzQ6bj1cIiZxdW90O1wiO2JyZWFrO2Nhc2UgMzg6bj1cIiZhbXA7XCI7YnJlYWs7Y2FzZSA2MDpuPVwiJmx0O1wiO2JyZWFrO2Nhc2UgNjI6bj1cIiZndDtcIjticmVhaztkZWZhdWx0OmNvbnRpbnVlfWMhPT1yJiYocys9YS5zdWJzdHJpbmcoYyxyKSksYz1yKzEscys9bn1yZXR1cm4gYyE9PXI/cythLnN1YnN0cmluZyhjLHIpOnN9XG52YXIgcHVnX2hhc19vd25fcHJvcGVydHk9T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciBwdWdfbWF0Y2hfaHRtbD0vW1wiJjw+XS87ZnVuY3Rpb24gcmV2aWV3UmVxdWVzdHNNb2RhbChsb2NhbHMpIHt2YXIgcHVnX2h0bWwgPSBcIlwiLCBwdWdfbWl4aW5zID0ge30sIHB1Z19pbnRlcnA7O3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKF9pZCwgcmV2aWV3Qm9hcmRJbmZvLCByZXZpZXdGYWN0b3JzLCB0YXJnZXRJbmZvKSB7cHVnX2h0bWwgPSBwdWdfaHRtbCArIFwiXFx1MDAzQ2RpdiBjbGFzcz1cXFwibW9kYWwgcmV2aWV3LXJlcXVlc3RzLW1vZGFsLS13cmFwcGVyXFxcIlxcdTAwM0VcXHUwMDNDZGl2IGNsYXNzPVxcXCJtb2RhbC1iYWNrZ3JvdW5kXFxcIlxcdTAwM0VcXHUwMDNDXFx1MDAyRmRpdlxcdTAwM0VcXHUwMDNDZGl2IGNsYXNzPVxcXCJtb2RhbC1jYXJkXFxcIlxcdTAwM0VcXHUwMDNDaGVhZGVyIGNsYXNzPVxcXCJtb2RhbC1jYXJkLWhlYWRcXFwiXFx1MDAzRVxcdTAwM0NwIGNsYXNzPVxcXCJtb2RhbC1jYXJkLXRpdGxlXFxcIlxcdTAwM0VSZXZpZXcgdG8gXFx1MDAzQ2JcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gdGFyZ2V0SW5mby5uYW1lKSA/IFwiXCIgOiBwdWdfaW50ZXJwKSkgKyBcIlxcdTAwM0NcXHUwMDJGYlxcdTAwM0VcXHUwMDNDXFx1MDAyRnBcXHUwMDNFXFx1MDAzQ2J1dHRvbiBjbGFzcz1cXFwiZGVsZXRlXFxcIlxcdTAwM0VcXHUwMDNDXFx1MDAyRmJ1dHRvblxcdTAwM0VcXHUwMDNDXFx1MDAyRmhlYWRlclxcdTAwM0VcXHUwMDNDc2VjdGlvbiBjbGFzcz1cXFwibW9kYWwtY2FyZC1ib2R5XFxcIlxcdTAwM0VcXHUwMDNDZm9ybVxcdTAwM0VcXHUwMDNDaW5wdXRcIiArIChcIiB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcInJldmlld1JlcXVlc3RJZFxcXCJcIitwdWdfYXR0cihcInZhbHVlXCIsIF9pZCwgdHJ1ZSwgZmFsc2UpKSArIFwiXFx1MDAyRlxcdTAwM0VcXHUwMDNDc2VjdGlvbiBjbGFzcz1cXFwiaGVybyBpcy1wcmltYXJ5XFxcIlxcdTAwM0VcXHUwMDNDZGl2IGNsYXNzPVxcXCJoZXJvLWJvZHlcXFwiXFx1MDAzRVxcdTAwM0NkaXYgY2xhc3M9XFxcImNvbnRhaW5lclxcXCJcXHUwMDNFXFx1MDAzQ2gxIGNsYXNzPVxcXCJ0aXRsZVxcXCJcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gcmV2aWV3Qm9hcmRJbmZvLnRpdGxlKSA/IFwiXCIgOiBwdWdfaW50ZXJwKSkgKyBcIlxcdTAwM0NcXHUwMDJGaDFcXHUwMDNFXFx1MDAzQ2gyIGNsYXNzPVxcXCJzdWJ0aXRsZVxcXCJcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gcmV2aWV3Qm9hcmRJbmZvLmRlc2NyaXB0aW9uKSA/IFwiXCIgOiBwdWdfaW50ZXJwKSkgKyBcIlxcdTAwM0NcXHUwMDJGaDJcXHUwMDNFXFx1MDAzQ1xcdTAwMkZkaXZcXHUwMDNFXFx1MDAzQ1xcdTAwMkZkaXZcXHUwMDNFXFx1MDAzQ1xcdTAwMkZzZWN0aW9uXFx1MDAzRVwiO1xuLy8gaXRlcmF0ZSByZXZpZXdGYWN0b3JzXG47KGZ1bmN0aW9uKCl7XG4gIHZhciAkJG9iaiA9IHJldmlld0ZhY3RvcnM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBwdWdfaW5kZXgwID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBwdWdfaW5kZXgwIDwgJCRsOyBwdWdfaW5kZXgwKyspIHtcbiAgICAgICAgdmFyIHJldmlld0ZhY3RvciA9ICQkb2JqW3B1Z19pbmRleDBdO1xucHVnX2h0bWwgPSBwdWdfaHRtbCArIFwiXFx1MDAzQ2RpdiBjbGFzcz1cXFwiZmllbGRcXFwiXFx1MDAzRVxcdTAwM0NsYWJlbCBjbGFzcz1cXFwibGFiZWxcXFwiXFx1MDAzRVwiICsgKHB1Z19lc2NhcGUobnVsbCA9PSAocHVnX2ludGVycCA9IHJldmlld0ZhY3Rvci50aXRsZSkgPyBcIlwiIDogcHVnX2ludGVycCkpICsgXCJcXHUwMDNDXFx1MDAyRmxhYmVsXFx1MDAzRVxcdTAwM0NkaXYgY2xhc3M9XFxcImNvbnRyb2xcXFwiXFx1MDAzRVxcdTAwM0NcIiArIChyZXZpZXdGYWN0b3IuaW5wdXRDb250cm9sKSArIChwdWdfYXR0cihcImNsYXNzXCIsIHB1Z19jbGFzc2VzKFtyZXZpZXdGYWN0b3IuaW5wdXRDb250cm9sXSwgW3RydWVdKSwgZmFsc2UsIGZhbHNlKStwdWdfYXR0cihcIm5hbWVcIiwgYGZhY3Rvci0ke3Jldmlld0ZhY3Rvci5faWR9YCwgdHJ1ZSwgZmFsc2UpKSArIFwiXFx1MDAzRVxcdTAwM0NcXHUwMDJGXCIgKyAocmV2aWV3RmFjdG9yLmlucHV0Q29udHJvbCkgKyBcIlxcdTAwM0VcXHUwMDNDXFx1MDAyRmRpdlxcdTAwM0VcXHUwMDNDXFx1MDAyRmRpdlxcdTAwM0VcIjtcbiAgICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBwdWdfaW5kZXgwIGluICQkb2JqKSB7XG4gICAgICAkJGwrKztcbiAgICAgIHZhciByZXZpZXdGYWN0b3IgPSAkJG9ialtwdWdfaW5kZXgwXTtcbnB1Z19odG1sID0gcHVnX2h0bWwgKyBcIlxcdTAwM0NkaXYgY2xhc3M9XFxcImZpZWxkXFxcIlxcdTAwM0VcXHUwMDNDbGFiZWwgY2xhc3M9XFxcImxhYmVsXFxcIlxcdTAwM0VcIiArIChwdWdfZXNjYXBlKG51bGwgPT0gKHB1Z19pbnRlcnAgPSByZXZpZXdGYWN0b3IudGl0bGUpID8gXCJcIiA6IHB1Z19pbnRlcnApKSArIFwiXFx1MDAzQ1xcdTAwMkZsYWJlbFxcdTAwM0VcXHUwMDNDZGl2IGNsYXNzPVxcXCJjb250cm9sXFxcIlxcdTAwM0VcXHUwMDNDXCIgKyAocmV2aWV3RmFjdG9yLmlucHV0Q29udHJvbCkgKyAocHVnX2F0dHIoXCJjbGFzc1wiLCBwdWdfY2xhc3NlcyhbcmV2aWV3RmFjdG9yLmlucHV0Q29udHJvbF0sIFt0cnVlXSksIGZhbHNlLCBmYWxzZSkrcHVnX2F0dHIoXCJuYW1lXCIsIGBmYWN0b3ItJHtyZXZpZXdGYWN0b3IuX2lkfWAsIHRydWUsIGZhbHNlKSkgKyBcIlxcdTAwM0VcXHUwMDNDXFx1MDAyRlwiICsgKHJldmlld0ZhY3Rvci5pbnB1dENvbnRyb2wpICsgXCJcXHUwMDNFXFx1MDAzQ1xcdTAwMkZkaXZcXHUwMDNFXFx1MDAzQ1xcdTAwMkZkaXZcXHUwMDNFXCI7XG4gICAgfVxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG5wdWdfaHRtbCA9IHB1Z19odG1sICsgXCJcXHUwMDNDXFx1MDAyRmZvcm1cXHUwMDNFXFx1MDAzQ1xcdTAwMkZzZWN0aW9uXFx1MDAzRVxcdTAwM0Nmb290ZXIgY2xhc3M9XFxcIm1vZGFsLWNhcmQtZm9vdFxcXCJcXHUwMDNFXFx1MDAzQ2J1dHRvblwiICsgKFwiIGNsYXNzPVxcXCJidXR0b24gaXMtc3VjY2VzcyByZXZpZXctcmVxdWVzdHMtbW9kYWwtLXN1Ym1pdC1idXR0b25cXFwiXCIrcHVnX2F0dHIoXCJkYXRhLWlkXCIsIF9pZCwgdHJ1ZSwgZmFsc2UpKSArIFwiXFx1MDAzRUNvbmZpcm0gUmV2aWV3XFx1MDAzQ1xcdTAwMkZidXR0b25cXHUwMDNFXFx1MDAzQ1xcdTAwMkZmb290ZXJcXHUwMDNFXFx1MDAzQ1xcdTAwMkZkaXZcXHUwMDNFXFx1MDAzQ1xcdTAwMkZkaXZcXHUwMDNFXCI7fS5jYWxsKHRoaXMsXCJfaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLl9pZDp0eXBlb2YgX2lkIT09XCJ1bmRlZmluZWRcIj9faWQ6dW5kZWZpbmVkLFwicmV2aWV3Qm9hcmRJbmZvXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5yZXZpZXdCb2FyZEluZm86dHlwZW9mIHJldmlld0JvYXJkSW5mbyE9PVwidW5kZWZpbmVkXCI/cmV2aWV3Qm9hcmRJbmZvOnVuZGVmaW5lZCxcInJldmlld0ZhY3RvcnNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnJldmlld0ZhY3RvcnM6dHlwZW9mIHJldmlld0ZhY3RvcnMhPT1cInVuZGVmaW5lZFwiP3Jldmlld0ZhY3RvcnM6dW5kZWZpbmVkLFwidGFyZ2V0SW5mb1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudGFyZ2V0SW5mbzp0eXBlb2YgdGFyZ2V0SW5mbyE9PVwidW5kZWZpbmVkXCI/dGFyZ2V0SW5mbzp1bmRlZmluZWQpKTs7cmV0dXJuIHB1Z19odG1sO31leHBvcnQgZGVmYXVsdCByZXZpZXdSZXF1ZXN0c01vZGFsOyIsImZ1bmN0aW9uIHB1Z19hdHRyKHQsZSxuLHIpe2lmKCExPT09ZXx8bnVsbD09ZXx8IWUmJihcImNsYXNzXCI9PT10fHxcInN0eWxlXCI9PT10KSlyZXR1cm5cIlwiO2lmKCEwPT09ZSlyZXR1cm5cIiBcIisocj90OnQrJz1cIicrdCsnXCInKTt2YXIgZj10eXBlb2YgZTtyZXR1cm5cIm9iamVjdFwiIT09ZiYmXCJmdW5jdGlvblwiIT09Znx8XCJmdW5jdGlvblwiIT10eXBlb2YgZS50b0pTT058fChlPWUudG9KU09OKCkpLFwic3RyaW5nXCI9PXR5cGVvZiBlfHwoZT1KU09OLnN0cmluZ2lmeShlKSxufHwtMT09PWUuaW5kZXhPZignXCInKSk/KG4mJihlPXB1Z19lc2NhcGUoZSkpLFwiIFwiK3QrJz1cIicrZSsnXCInKTpcIiBcIit0K1wiPSdcIitlLnJlcGxhY2UoLycvZyxcIiYjMzk7XCIpK1wiJ1wifVxuZnVuY3Rpb24gcHVnX2NsYXNzZXMocyxyKXtyZXR1cm4gQXJyYXkuaXNBcnJheShzKT9wdWdfY2xhc3Nlc19hcnJheShzLHIpOnMmJlwib2JqZWN0XCI9PXR5cGVvZiBzP3B1Z19jbGFzc2VzX29iamVjdChzKTpzfHxcIlwifVxuZnVuY3Rpb24gcHVnX2NsYXNzZXNfYXJyYXkocixhKXtmb3IodmFyIHMsZT1cIlwiLHU9XCJcIixjPUFycmF5LmlzQXJyYXkoYSksZz0wO2c8ci5sZW5ndGg7ZysrKShzPXB1Z19jbGFzc2VzKHJbZ10pKSYmKGMmJmFbZ10mJihzPXB1Z19lc2NhcGUocykpLGU9ZSt1K3MsdT1cIiBcIik7cmV0dXJuIGV9XG5mdW5jdGlvbiBwdWdfY2xhc3Nlc19vYmplY3Qocil7dmFyIGE9XCJcIixuPVwiXCI7Zm9yKHZhciBvIGluIHIpbyYmcltvXSYmcHVnX2hhc19vd25fcHJvcGVydHkuY2FsbChyLG8pJiYoYT1hK24rbyxuPVwiIFwiKTtyZXR1cm4gYX1cbmZ1bmN0aW9uIHB1Z19lc2NhcGUoZSl7dmFyIGE9XCJcIitlLHQ9cHVnX21hdGNoX2h0bWwuZXhlYyhhKTtpZighdClyZXR1cm4gZTt2YXIgcixjLG4scz1cIlwiO2ZvcihyPXQuaW5kZXgsYz0wO3I8YS5sZW5ndGg7cisrKXtzd2l0Y2goYS5jaGFyQ29kZUF0KHIpKXtjYXNlIDM0Om49XCImcXVvdDtcIjticmVhaztjYXNlIDM4Om49XCImYW1wO1wiO2JyZWFrO2Nhc2UgNjA6bj1cIiZsdDtcIjticmVhaztjYXNlIDYyOm49XCImZ3Q7XCI7YnJlYWs7ZGVmYXVsdDpjb250aW51ZX1jIT09ciYmKHMrPWEuc3Vic3RyaW5nKGMscikpLGM9cisxLHMrPW59cmV0dXJuIGMhPT1yP3MrYS5zdWJzdHJpbmcoYyxyKTpzfVxudmFyIHB1Z19oYXNfb3duX3Byb3BlcnR5PU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgcHVnX21hdGNoX2h0bWw9L1tcIiY8Pl0vO2Z1bmN0aW9uIHJldmlld1JlcXVlc3RzVGFibGUobG9jYWxzKSB7dmFyIHB1Z19odG1sID0gXCJcIiwgcHVnX21peGlucyA9IHt9LCBwdWdfaW50ZXJwOzt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChEYXRlLCBNYXRoLCBjdXJyZW50UGFnZSwgZGVmYXVsdExpbWl0LCByZXZpZXdSZXF1ZXN0cywgdXNlcnNDb3VudCkge3B1Z19odG1sID0gcHVnX2h0bWwgKyBcIlxcdTAwM0N0YWJsZSBjbGFzcz1cXFwidGFibGUgaXMtZnVsbHdpZHRoIGlzLXN0cmlwZWQgaXMtaG92ZXJhYmxlXFxcIlxcdTAwM0VcXHUwMDNDdGhlYWRcXHUwMDNFXFx1MDAzQ3RyXFx1MDAzRVxcdTAwM0N0aFxcdTAwM0VUaXRsZVxcdTAwM0NcXHUwMDJGdGhcXHUwMDNFXFx1MDAzQ3RoXFx1MDAzRUltYWdlXFx1MDAzQ1xcdTAwMkZ0aFxcdTAwM0VcXHUwMDNDdGhcXHUwMDNFVGFyZ2V0IGVtcGxveWVlXFx1MDAzQ1xcdTAwMkZ0aFxcdTAwM0VcXHUwMDNDdGhcXHUwMDNFRW1haWxcXHUwMDNDXFx1MDAyRnRoXFx1MDAzRVxcdTAwM0N0aFxcdTAwM0VEdWUgZGF0ZVxcdTAwM0NcXHUwMDJGdGhcXHUwMDNFXFx1MDAzQ3RoXFx1MDAzRVJlcXVlc3RlclxcdTAwM0NcXHUwMDJGdGhcXHUwMDNFXFx1MDAzQ3RoIGNsYXNzPVxcXCJoYXMtdGV4dC1jZW50ZXJlZFxcXCJcXHUwMDNFQWN0aW9uXFx1MDAzQ1xcdTAwMkZ0aFxcdTAwM0VcXHUwMDNDXFx1MDAyRnRyXFx1MDAzRVxcdTAwM0NcXHUwMDJGdGhlYWRcXHUwMDNFXFx1MDAzQ3Rib2R5XFx1MDAzRVwiO1xuLy8gaXRlcmF0ZSByZXZpZXdSZXF1ZXN0c1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSByZXZpZXdSZXF1ZXN0cztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIHB1Z19pbmRleDAgPSAwLCAkJGwgPSAkJG9iai5sZW5ndGg7IHB1Z19pbmRleDAgPCAkJGw7IHB1Z19pbmRleDArKykge1xuICAgICAgICB2YXIgcmVxdWVzdCA9ICQkb2JqW3B1Z19pbmRleDBdO1xucHVnX2h0bWwgPSBwdWdfaHRtbCArIFwiXFx1MDAzQ3RyXFx1MDAzRVxcdTAwM0N0ZCBjbGFzcz1cXFwiaXMtaGlkZGVuIHRhYmxlLXJldmlldy1yZXF1ZXN0cy0tcmV2aWV3LXJlcXVlc3QtaWRcXFwiXFx1MDAzRVwiICsgKHB1Z19lc2NhcGUobnVsbCA9PSAocHVnX2ludGVycCA9IHJlcXVlc3QuX2lkKSA/IFwiXCIgOiBwdWdfaW50ZXJwKSkgKyBcIlxcdTAwM0NcXHUwMDJGdGRcXHUwMDNFXFx1MDAzQ3RkIGNsYXNzPVxcXCJpcy1oaWRkZW4gdGFibGUtcmV2aWV3LXJlcXVlc3RzLS1yZXZpZXctYm9hcmRcXFwiXFx1MDAzRVwiICsgKHB1Z19lc2NhcGUobnVsbCA9PSAocHVnX2ludGVycCA9IHJlcXVlc3QucmV2aWV3Qm9hcmQpID8gXCJcIiA6IHB1Z19pbnRlcnApKSArIFwiXFx1MDAzQ1xcdTAwMkZ0ZFxcdTAwM0VcXHUwMDNDdGRcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gcmVxdWVzdC5yZXZpZXdCb2FyZEluZm8udGl0bGUpID8gXCJcIiA6IHB1Z19pbnRlcnApKSArIFwiXFx1MDAzQ1xcdTAwMkZ0ZFxcdTAwM0VcXHUwMDNDdGQgY2xhc3M9XFxcImlzLW5hcnJvd1xcXCJcXHUwMDNFXFx1MDAzQ2RpdiBjbGFzcz1cXFwiaW1hZ2UgaXMtNDh4NDhcXFwiXFx1MDAzRVxcdTAwM0NpbWdcIiArIChcIiBjbGFzcz1cXFwiaXMtcm91bmRlZFxcXCJcIitwdWdfYXR0cihcInNyY1wiLCByZXF1ZXN0LnRhcmdldEluZm8uaW1hZ2VVcmwsIHRydWUsIGZhbHNlKSkgKyBcIlxcdTAwMkZcXHUwMDNFXFx1MDAzQ1xcdTAwMkZkaXZcXHUwMDNFXFx1MDAzQ1xcdTAwMkZ0ZFxcdTAwM0VcXHUwMDNDdGQgY2xhc3M9XFxcImlzLW5hcnJvd1xcXCJcXHUwMDNFXFx1MDAzQ2EgY2xhc3M9XFxcInRhYmxlLXJldmlldy1yZXF1ZXN0cy0tdGFyZ2V0LW5hbWVcXFwiIGhyZWY9XFxcIiNcXFwiXFx1MDAzRVwiICsgKHB1Z19lc2NhcGUobnVsbCA9PSAocHVnX2ludGVycCA9IHJlcXVlc3QudGFyZ2V0SW5mby5uYW1lKSA/IFwiXCIgOiBwdWdfaW50ZXJwKSkgKyBcIlxcdTAwM0NcXHUwMDJGYVxcdTAwM0VcXHUwMDNDXFx1MDAyRnRkXFx1MDAzRVxcdTAwM0N0ZCBjbGFzcz1cXFwiaXMtbmFycm93IHRhYmxlLXJldmlldy1yZXF1ZXN0cy0tdGFyZ2V0LWVtYWlsXFxcIlxcdTAwM0VcIiArIChwdWdfZXNjYXBlKG51bGwgPT0gKHB1Z19pbnRlcnAgPSByZXF1ZXN0LnRhcmdldEVtYWlsKSA/IFwiXCIgOiBwdWdfaW50ZXJwKSkgKyBcIlxcdTAwM0NcXHUwMDJGdGRcXHUwMDNFXFx1MDAzQ3RkIGNsYXNzPVxcXCJpcy1uYXJyb3cgdGFibGUtcmV2aWV3LXJlcXVlc3RzLS1kdWUtZGF0ZVxcXCJcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gbmV3IERhdGUocmVxdWVzdC5yZXZpZXdCb2FyZEluZm8uZHVlRGF0ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCkpID8gXCJcIiA6IHB1Z19pbnRlcnApKSArIFwiXFx1MDAzQ1xcdTAwMkZ0ZFxcdTAwM0VcXHUwMDNDdGQgY2xhc3M9XFxcImlzLW5hcnJvdyB0YWJsZS1yZXZpZXctcmVxdWVzdHMtLXJlcXVlc3RlclxcXCJcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gcmVxdWVzdC5yZXF1ZXN0ZXJFbWFpbCkgPyBcIlwiIDogcHVnX2ludGVycCkpICsgXCJcXHUwMDNDXFx1MDAyRnRkXFx1MDAzRVxcdTAwM0N0ZCBjbGFzcz1cXFwiaXMtbmFycm93IHRhYmxlLXJldmlldy1yZXF1ZXN0cy0tYWN0aW9uc1xcXCJcXHUwMDNFXFx1MDAzQ2J1dHRvbiBjbGFzcz1cXFwiYnV0dG9uIGlzLXByaW1hcnkgaXMtcm91bmRlZCBpcy11cHBlcmNhc2UgdGFibGUtcmV2aWV3LXJlcXVlc3RzLS1zdGFydC1yZXZpZXctYnV0dG9uXFxcIlxcdTAwM0VcXHUwMDNDc3BhbiBjbGFzcz1cXFwiaWNvblxcXCJcXHUwMDNFXFx1MDAzQ3N2ZyBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCIgZm9jdXNhYmxlPVxcXCJmYWxzZVxcXCIgZGF0YS1wcmVmaXg9XFxcImZhc1xcXCIgZGF0YS1pY29uPVxcXCJwZW5cXFwiIGNsYXNzPVxcXCJzdmctaW5saW5lLS1mYSBmYS1wZW4gZmEtdy0xNlxcXCIgcm9sZT1cXFwiaW1nXFxcIiB4bWxucz1cXFwiaHR0cDpcXHUwMDJGXFx1MDAyRnd3dy53My5vcmdcXHUwMDJGMjAwMFxcdTAwMkZzdmdcXFwiIHZpZXdCb3g9XFxcIjAgMCA1MTIgNTEyXFxcIlxcdTAwM0VcXHUwMDNDcGF0aCBmaWxsPVxcXCJjdXJyZW50Q29sb3JcXFwiIGQ9XFxcIk0yOTAuNzQgOTMuMjRsMTI4LjAyIDEyOC4wMi0yNzcuOTkgMjc3Ljk5LTExNC4xNCAxMi42QzExLjM1IDUxMy41NC0xLjU2IDUwMC42Mi4xNCA0ODUuMzRsMTIuNy0xMTQuMjIgMjc3LjktMjc3Ljg4em0yMDcuMi0xOS4wNmwtNjAuMTEtNjAuMTFjLTE4Ljc1LTE4Ljc1LTQ5LjE2LTE4Ljc1LTY3LjkxIDBsLTU2LjU1IDU2LjU1IDEyOC4wMiAxMjguMDIgNTYuNTUtNTYuNTVjMTguNzUtMTguNzYgMTguNzUtNDkuMTYgMC02Ny45MXpcXFwiXFx1MDAzRVxcdTAwM0NcXHUwMDJGcGF0aFxcdTAwM0VcXHUwMDNDXFx1MDAyRnN2Z1xcdTAwM0VcXHUwMDNDXFx1MDAyRnNwYW5cXHUwMDNFXFx1MDAzQ3NwYW5cXHUwMDNFU3RhcnQgcmV2aWV3aW5nXFx1MDAzQ1xcdTAwMkZzcGFuXFx1MDAzRVxcdTAwM0NcXHUwMDJGYnV0dG9uXFx1MDAzRVxcdTAwM0NcXHUwMDJGdGRcXHUwMDNFXFx1MDAzQ1xcdTAwMkZ0clxcdTAwM0VcIjtcbiAgICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBwdWdfaW5kZXgwIGluICQkb2JqKSB7XG4gICAgICAkJGwrKztcbiAgICAgIHZhciByZXF1ZXN0ID0gJCRvYmpbcHVnX2luZGV4MF07XG5wdWdfaHRtbCA9IHB1Z19odG1sICsgXCJcXHUwMDNDdHJcXHUwMDNFXFx1MDAzQ3RkIGNsYXNzPVxcXCJpcy1oaWRkZW4gdGFibGUtcmV2aWV3LXJlcXVlc3RzLS1yZXZpZXctcmVxdWVzdC1pZFxcXCJcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gcmVxdWVzdC5faWQpID8gXCJcIiA6IHB1Z19pbnRlcnApKSArIFwiXFx1MDAzQ1xcdTAwMkZ0ZFxcdTAwM0VcXHUwMDNDdGQgY2xhc3M9XFxcImlzLWhpZGRlbiB0YWJsZS1yZXZpZXctcmVxdWVzdHMtLXJldmlldy1ib2FyZFxcXCJcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gcmVxdWVzdC5yZXZpZXdCb2FyZCkgPyBcIlwiIDogcHVnX2ludGVycCkpICsgXCJcXHUwMDNDXFx1MDAyRnRkXFx1MDAzRVxcdTAwM0N0ZFxcdTAwM0VcIiArIChwdWdfZXNjYXBlKG51bGwgPT0gKHB1Z19pbnRlcnAgPSByZXF1ZXN0LnJldmlld0JvYXJkSW5mby50aXRsZSkgPyBcIlwiIDogcHVnX2ludGVycCkpICsgXCJcXHUwMDNDXFx1MDAyRnRkXFx1MDAzRVxcdTAwM0N0ZCBjbGFzcz1cXFwiaXMtbmFycm93XFxcIlxcdTAwM0VcXHUwMDNDZGl2IGNsYXNzPVxcXCJpbWFnZSBpcy00OHg0OFxcXCJcXHUwMDNFXFx1MDAzQ2ltZ1wiICsgKFwiIGNsYXNzPVxcXCJpcy1yb3VuZGVkXFxcIlwiK3B1Z19hdHRyKFwic3JjXCIsIHJlcXVlc3QudGFyZ2V0SW5mby5pbWFnZVVybCwgdHJ1ZSwgZmFsc2UpKSArIFwiXFx1MDAyRlxcdTAwM0VcXHUwMDNDXFx1MDAyRmRpdlxcdTAwM0VcXHUwMDNDXFx1MDAyRnRkXFx1MDAzRVxcdTAwM0N0ZCBjbGFzcz1cXFwiaXMtbmFycm93XFxcIlxcdTAwM0VcXHUwMDNDYSBjbGFzcz1cXFwidGFibGUtcmV2aWV3LXJlcXVlc3RzLS10YXJnZXQtbmFtZVxcXCIgaHJlZj1cXFwiI1xcXCJcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gcmVxdWVzdC50YXJnZXRJbmZvLm5hbWUpID8gXCJcIiA6IHB1Z19pbnRlcnApKSArIFwiXFx1MDAzQ1xcdTAwMkZhXFx1MDAzRVxcdTAwM0NcXHUwMDJGdGRcXHUwMDNFXFx1MDAzQ3RkIGNsYXNzPVxcXCJpcy1uYXJyb3cgdGFibGUtcmV2aWV3LXJlcXVlc3RzLS10YXJnZXQtZW1haWxcXFwiXFx1MDAzRVwiICsgKHB1Z19lc2NhcGUobnVsbCA9PSAocHVnX2ludGVycCA9IHJlcXVlc3QudGFyZ2V0RW1haWwpID8gXCJcIiA6IHB1Z19pbnRlcnApKSArIFwiXFx1MDAzQ1xcdTAwMkZ0ZFxcdTAwM0VcXHUwMDNDdGQgY2xhc3M9XFxcImlzLW5hcnJvdyB0YWJsZS1yZXZpZXctcmVxdWVzdHMtLWR1ZS1kYXRlXFxcIlxcdTAwM0VcIiArIChwdWdfZXNjYXBlKG51bGwgPT0gKHB1Z19pbnRlcnAgPSBuZXcgRGF0ZShyZXF1ZXN0LnJldmlld0JvYXJkSW5mby5kdWVEYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoKSkgPyBcIlwiIDogcHVnX2ludGVycCkpICsgXCJcXHUwMDNDXFx1MDAyRnRkXFx1MDAzRVxcdTAwM0N0ZCBjbGFzcz1cXFwiaXMtbmFycm93IHRhYmxlLXJldmlldy1yZXF1ZXN0cy0tcmVxdWVzdGVyXFxcIlxcdTAwM0VcIiArIChwdWdfZXNjYXBlKG51bGwgPT0gKHB1Z19pbnRlcnAgPSByZXF1ZXN0LnJlcXVlc3RlckVtYWlsKSA/IFwiXCIgOiBwdWdfaW50ZXJwKSkgKyBcIlxcdTAwM0NcXHUwMDJGdGRcXHUwMDNFXFx1MDAzQ3RkIGNsYXNzPVxcXCJpcy1uYXJyb3cgdGFibGUtcmV2aWV3LXJlcXVlc3RzLS1hY3Rpb25zXFxcIlxcdTAwM0VcXHUwMDNDYnV0dG9uIGNsYXNzPVxcXCJidXR0b24gaXMtcHJpbWFyeSBpcy1yb3VuZGVkIGlzLXVwcGVyY2FzZSB0YWJsZS1yZXZpZXctcmVxdWVzdHMtLXN0YXJ0LXJldmlldy1idXR0b25cXFwiXFx1MDAzRVxcdTAwM0NzcGFuIGNsYXNzPVxcXCJpY29uXFxcIlxcdTAwM0VcXHUwMDNDc3ZnIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIiBmb2N1c2FibGU9XFxcImZhbHNlXFxcIiBkYXRhLXByZWZpeD1cXFwiZmFzXFxcIiBkYXRhLWljb249XFxcInBlblxcXCIgY2xhc3M9XFxcInN2Zy1pbmxpbmUtLWZhIGZhLXBlbiBmYS13LTE2XFxcIiByb2xlPVxcXCJpbWdcXFwiIHhtbG5zPVxcXCJodHRwOlxcdTAwMkZcXHUwMDJGd3d3LnczLm9yZ1xcdTAwMkYyMDAwXFx1MDAyRnN2Z1xcXCIgdmlld0JveD1cXFwiMCAwIDUxMiA1MTJcXFwiXFx1MDAzRVxcdTAwM0NwYXRoIGZpbGw9XFxcImN1cnJlbnRDb2xvclxcXCIgZD1cXFwiTTI5MC43NCA5My4yNGwxMjguMDIgMTI4LjAyLTI3Ny45OSAyNzcuOTktMTE0LjE0IDEyLjZDMTEuMzUgNTEzLjU0LTEuNTYgNTAwLjYyLjE0IDQ4NS4zNGwxMi43LTExNC4yMiAyNzcuOS0yNzcuODh6bTIwNy4yLTE5LjA2bC02MC4xMS02MC4xMWMtMTguNzUtMTguNzUtNDkuMTYtMTguNzUtNjcuOTEgMGwtNTYuNTUgNTYuNTUgMTI4LjAyIDEyOC4wMiA1Ni41NS01Ni41NWMxOC43NS0xOC43NiAxOC43NS00OS4xNiAwLTY3LjkxelxcXCJcXHUwMDNFXFx1MDAzQ1xcdTAwMkZwYXRoXFx1MDAzRVxcdTAwM0NcXHUwMDJGc3ZnXFx1MDAzRVxcdTAwM0NcXHUwMDJGc3BhblxcdTAwM0VcXHUwMDNDc3BhblxcdTAwM0VTdGFydCByZXZpZXdpbmdcXHUwMDNDXFx1MDAyRnNwYW5cXHUwMDNFXFx1MDAzQ1xcdTAwMkZidXR0b25cXHUwMDNFXFx1MDAzQ1xcdTAwMkZ0ZFxcdTAwM0VcXHUwMDNDXFx1MDAyRnRyXFx1MDAzRVwiO1xuICAgIH1cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxucHVnX2h0bWwgPSBwdWdfaHRtbCArIFwiXFx1MDAzQ1xcdTAwMkZ0Ym9keVxcdTAwM0VcXHUwMDNDXFx1MDAyRnRhYmxlXFx1MDAzRVwiO1xudmFyIHBhZ2VDb3VudCA9IE1hdGguY2VpbCh1c2Vyc0NvdW50L2RlZmF1bHRMaW1pdClcblxucHVnX2h0bWwgPSBwdWdfaHRtbCArIFwiXFx1MDAzQ25hdiBjbGFzcz1cXFwicGFnaW5hdGlvbiBpcy1yb3VuZGVkXFxcIiByb2xlPVxcXCJuYXZpZ2F0aW9uXFxcIlxcdTAwM0VcXHUwMDNDYSBjbGFzcz1cXFwicGFnaW5hdGlvbi1wcmV2aW91c1xcXCJcXHUwMDNFUHJldmlvdXNcXHUwMDNDXFx1MDAyRmFcXHUwMDNFXFx1MDAzQ2EgY2xhc3M9XFxcInBhZ2luYXRpb24tbmV4dFxcXCJcXHUwMDNFTmV4dCBwYWdlXFx1MDAzQ1xcdTAwMkZhXFx1MDAzRVxcdTAwM0N1bCBjbGFzcz1cXFwicGFnaW5hdGlvbi1saXN0XFxcIlxcdTAwM0VcIjtcbmZvciAodmFyIGkgPSAxOyBpIDw9IHBhZ2VDb3VudDsgaSsrKVxue1xucHVnX2h0bWwgPSBwdWdfaHRtbCArIFwiXFx1MDAzQ2xpXFx1MDAzRVxcdTAwM0NhXCIgKyAocHVnX2F0dHIoXCJjbGFzc1wiLCBwdWdfY2xhc3NlcyhbYHBhZ2luYXRpb24tbGluayAke2kgPT09IGN1cnJlbnRQYWdlID8gJ2lzLWN1cnJlbnQnIDogJyd9YF0sIFt0cnVlXSksIGZhbHNlLCBmYWxzZSkpICsgXCJcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gaSkgPyBcIlwiIDogcHVnX2ludGVycCkpICsgXCJcXHUwMDNDXFx1MDAyRmFcXHUwMDNFXFx1MDAzQ1xcdTAwMkZsaVxcdTAwM0VcIjtcbn1cbnB1Z19odG1sID0gcHVnX2h0bWwgKyBcIlxcdTAwM0NcXHUwMDJGdWxcXHUwMDNFXFx1MDAzQ1xcdTAwMkZuYXZcXHUwMDNFXCI7fS5jYWxsKHRoaXMsXCJEYXRlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5EYXRlOnR5cGVvZiBEYXRlIT09XCJ1bmRlZmluZWRcIj9EYXRlOnVuZGVmaW5lZCxcIk1hdGhcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLk1hdGg6dHlwZW9mIE1hdGghPT1cInVuZGVmaW5lZFwiP01hdGg6dW5kZWZpbmVkLFwiY3VycmVudFBhZ2VcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmN1cnJlbnRQYWdlOnR5cGVvZiBjdXJyZW50UGFnZSE9PVwidW5kZWZpbmVkXCI/Y3VycmVudFBhZ2U6dW5kZWZpbmVkLFwiZGVmYXVsdExpbWl0XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5kZWZhdWx0TGltaXQ6dHlwZW9mIGRlZmF1bHRMaW1pdCE9PVwidW5kZWZpbmVkXCI/ZGVmYXVsdExpbWl0OnVuZGVmaW5lZCxcInJldmlld1JlcXVlc3RzXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5yZXZpZXdSZXF1ZXN0czp0eXBlb2YgcmV2aWV3UmVxdWVzdHMhPT1cInVuZGVmaW5lZFwiP3Jldmlld1JlcXVlc3RzOnVuZGVmaW5lZCxcInVzZXJzQ291bnRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVzZXJzQ291bnQ6dHlwZW9mIHVzZXJzQ291bnQhPT1cInVuZGVmaW5lZFwiP3VzZXJzQ291bnQ6dW5kZWZpbmVkKSk7O3JldHVybiBwdWdfaHRtbDt9ZXhwb3J0IGRlZmF1bHQgcmV2aWV3UmVxdWVzdHNUYWJsZTsiLCJmdW5jdGlvbiBwdWdfYXR0cih0LGUsbixyKXtpZighMT09PWV8fG51bGw9PWV8fCFlJiYoXCJjbGFzc1wiPT09dHx8XCJzdHlsZVwiPT09dCkpcmV0dXJuXCJcIjtpZighMD09PWUpcmV0dXJuXCIgXCIrKHI/dDp0Kyc9XCInK3QrJ1wiJyk7dmFyIGY9dHlwZW9mIGU7cmV0dXJuXCJvYmplY3RcIiE9PWYmJlwiZnVuY3Rpb25cIiE9PWZ8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIGUudG9KU09OfHwoZT1lLnRvSlNPTigpKSxcInN0cmluZ1wiPT10eXBlb2YgZXx8KGU9SlNPTi5zdHJpbmdpZnkoZSksbnx8LTE9PT1lLmluZGV4T2YoJ1wiJykpPyhuJiYoZT1wdWdfZXNjYXBlKGUpKSxcIiBcIit0Kyc9XCInK2UrJ1wiJyk6XCIgXCIrdCtcIj0nXCIrZS5yZXBsYWNlKC8nL2csXCImIzM5O1wiKStcIidcIn1cbmZ1bmN0aW9uIHB1Z19lc2NhcGUoZSl7dmFyIGE9XCJcIitlLHQ9cHVnX21hdGNoX2h0bWwuZXhlYyhhKTtpZighdClyZXR1cm4gZTt2YXIgcixjLG4scz1cIlwiO2ZvcihyPXQuaW5kZXgsYz0wO3I8YS5sZW5ndGg7cisrKXtzd2l0Y2goYS5jaGFyQ29kZUF0KHIpKXtjYXNlIDM0Om49XCImcXVvdDtcIjticmVhaztjYXNlIDM4Om49XCImYW1wO1wiO2JyZWFrO2Nhc2UgNjA6bj1cIiZsdDtcIjticmVhaztjYXNlIDYyOm49XCImZ3Q7XCI7YnJlYWs7ZGVmYXVsdDpjb250aW51ZX1jIT09ciYmKHMrPWEuc3Vic3RyaW5nKGMscikpLGM9cisxLHMrPW59cmV0dXJuIGMhPT1yP3MrYS5zdWJzdHJpbmcoYyxyKTpzfVxudmFyIHB1Z19tYXRjaF9odG1sPS9bXCImPD5dLztmdW5jdGlvbiBzZWxlY3RPcHRpb25zKGxvY2Fscykge3ZhciBwdWdfaHRtbCA9IFwiXCIsIHB1Z19taXhpbnMgPSB7fSwgcHVnX2ludGVycDs7dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAob3B0aW9ucykgey8vIGl0ZXJhdGUgb3B0aW9uc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcHRpb25zO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgcHVnX2luZGV4MCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgcHVnX2luZGV4MCA8ICQkbDsgcHVnX2luZGV4MCsrKSB7XG4gICAgICAgIHZhciBvcHRpb24gPSAkJG9ialtwdWdfaW5kZXgwXTtcbnB1Z19odG1sID0gcHVnX2h0bWwgKyBcIlxcdTAwM0NvcHRpb25cIiArIChwdWdfYXR0cihcInZhbHVlXCIsIG9wdGlvbi52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIFwiXFx1MDAzRVwiICsgKHB1Z19lc2NhcGUobnVsbCA9PSAocHVnX2ludGVycCA9IG9wdGlvbi50ZXh0KSA/IFwiXCIgOiBwdWdfaW50ZXJwKSkgKyBcIlxcdTAwM0NcXHUwMDJGb3B0aW9uXFx1MDAzRVwiO1xuICAgICAgfVxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIHB1Z19pbmRleDAgaW4gJCRvYmopIHtcbiAgICAgICQkbCsrO1xuICAgICAgdmFyIG9wdGlvbiA9ICQkb2JqW3B1Z19pbmRleDBdO1xucHVnX2h0bWwgPSBwdWdfaHRtbCArIFwiXFx1MDAzQ29wdGlvblwiICsgKHB1Z19hdHRyKFwidmFsdWVcIiwgb3B0aW9uLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgXCJcXHUwMDNFXCIgKyAocHVnX2VzY2FwZShudWxsID09IChwdWdfaW50ZXJwID0gb3B0aW9uLnRleHQpID8gXCJcIiA6IHB1Z19pbnRlcnApKSArIFwiXFx1MDAzQ1xcdTAwMkZvcHRpb25cXHUwMDNFXCI7XG4gICAgfVxuICB9XG59KS5jYWxsKHRoaXMpO1xufS5jYWxsKHRoaXMsXCJvcHRpb25zXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcHRpb25zOnR5cGVvZiBvcHRpb25zIT09XCJ1bmRlZmluZWRcIj9vcHRpb25zOnVuZGVmaW5lZCkpOztyZXR1cm4gcHVnX2h0bWw7fWV4cG9ydCBkZWZhdWx0IHNlbGVjdE9wdGlvbnM7IiwidmFyIERvbU1hbmlwdWxhdG9yID0gKCgpID0+IHtcbiAgLy8gUG9seWZpbCBFbGVtZW50Lm1hdGNoZXNcbiAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vZG9jcy9XZWIvQVBJL0VsZW1lbnQvbWF0Y2hlcyNQb2x5ZmlsbFxuICBpZiAoIUVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpIHtcbiAgICBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzID1cbiAgICAgIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgRWxlbWVudC5wcm90b3R5cGUubW96TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICBFbGVtZW50LnByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgRWxlbWVudC5wcm90b3R5cGUub01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgRWxlbWVudC5wcm90b3R5cGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICBmdW5jdGlvbiAocykge1xuICAgICAgICB2YXIgbWF0Y2hlcyA9ICh0aGlzLmRvY3VtZW50IHx8IHRoaXMub3duZXJEb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzKSxcbiAgICAgICAgICBpID0gbWF0Y2hlcy5sZW5ndGhcbiAgICAgICAgd2hpbGUgKC0taSA+PSAwICYmIG1hdGNoZXMuaXRlbShpKSAhPT0gdGhpcykgeyB9XG4gICAgICAgIHJldHVybiBpID4gLTFcbiAgICAgIH1cbiAgfVxuXG4gIGxldCBfZ2V0Q29uZGl0aW9uYWxDYWxsYmFjayA9IGZ1bmN0aW9uIChzZWxlY3RvciwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGUpIHtcbiAgICAgIGlmICghZS50YXJnZXQpIHJldHVyblxuICAgICAgaWYgKCFlLnRhcmdldC5tYXRjaGVzKHNlbGVjdG9yKSAmJiAhZS50YXJnZXQuY2xvc2VzdChzZWxlY3RvcikpIHJldHVyblxuICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIH1cbiAgfVxuXG4gIGxldCBfb3BlblBhZ2UgPSBmaWxlTmFtZSA9PiB7XG4gICAgY2hyb21lLnRhYnMuY3JlYXRlKHtcbiAgICAgIHVybDogY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKGBwYWdlcy8ke2ZpbGVOYW1lfWApXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZGlzcGxheVBhZ2VEYXRhOiBodG1sU3RyaW5nID0+IHtcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnZmFkZScpXG4gICAgICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IGh0bWxTdHJpbmdcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnZmFkZScpXG4gICAgfSxcbiAgICBhZGREeW5hbWljRXZlbnRMaXN0ZW5lcjogKHJvb3RFbGVtZW50LCBldmVudFR5cGUsIHNlbGVjdG9yLCBjYWxsYmFjaywgb3B0aW9ucykgPT5cbiAgICAgIHJvb3RFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBfZ2V0Q29uZGl0aW9uYWxDYWxsYmFjayhzZWxlY3RvciwgY2FsbGJhY2spLCBvcHRpb25zKSxcbiAgICBvcGVuUGFnZTogX29wZW5QYWdlLFxuICAgIHVwZGF0ZVBhZ2VUaXRsZTogaTE4bktleSA9PiBkb2N1bWVudC50aXRsZSA9IGAke2Nocm9tZS5pMThuLmdldE1lc3NhZ2UoJ2FwcE5hbWUnKX0gLSAke2Nocm9tZS5pMThuLmdldE1lc3NhZ2UoaTE4bktleSl9YCxcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBodG1sU3RyaW5nOiBIVE1MIHJlcHJlc2VudGluZyBhIHNpbmdsZSBlbGVtZW50XG4gICAgICogQHJldHVybiB7RWxlbWVudH1cbiAgICAgKi9cbiAgICBodG1sU3RyaW5nVG9IdG1sTm9kZTogaHRtbFN0cmluZyA9PiB7XG4gICAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpXG4gICAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBodG1sU3RyaW5nLnRyaW0oKVxuICAgICAgcmV0dXJuIHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RDaGlsZFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaHRtbFN0cmluZzogSFRNTCByZXByZXNlbnRpbmcgYW55IG51bWJlciBvZiBzaWJsaW5nIGVsZW1lbnRzXG4gICAgICogQHJldHVybiB7Tm9kZUxpc3R9XG4gICAgICovXG4gICAgaHRtbFN0cmluZ1RvSHRtbE5vZGVzOiBodG1sU3RyaW5nID0+IHtcbiAgICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJylcbiAgICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IGh0bWxTdHJpbmdcbiAgICAgIHJldHVybiB0ZW1wbGF0ZS5jb250ZW50LmNoaWxkTm9kZXNcbiAgICB9LFxuXG4gICAgaW5zZXJ0QmVmb3JlOiAobmV3Tm9kZSwgcmVmZXJlbmNlTm9kZSkgPT4ge1xuICAgICAgcmVmZXJlbmNlTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdOb2RlLCByZWZlcmVuY2VOb2RlLm5leHRTaWJsaW5nKVxuICAgIH1cbiAgfVxufSkoKVxuXG5leHBvcnQgZGVmYXVsdCBEb21NYW5pcHVsYXRvclxuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBlbXBsb3llZXM6ICd1c2VycycsXG4gIHJldmlld0JvYXJkczogJ3Jldmlldy1ib2FyZHMnLFxuICByZXZpZXdSZXF1ZXN0czogJ3Jldmlldy1yZXF1ZXN0cycsXG4gIHJldmlld1Jlc3VsdHM6ICdyZXZpZXctcmVzdWx0cycsXG4gIGxvZ291dDogJ2F1dGgvbG9nb3V0Jyxcbn1cbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgYXBpQmFzZVVybDogJ2h0dHA6Ly9sb2NhbGhvc3QvYXBpL3YxLycsXG4gIGRlZmF1bHRMaW1pdDogMTUsXG59XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIF9fcHJlZml4X186ICdwYXlwYXlyZXZpZXcuJyxcblxuICB0b2tlbjogJ3Rva2VuJyxcbiAgdXNlcjogJ3VzZXInLFxufVxuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBsb2dpbjogJy9sb2dpbicsXG4gIGhvbWU6ICcvJyxcbiAgYWRtaW46IHtcbiAgICBkZWZhdWx0OiAnL2FkbWluJyxcbiAgICBlbXBsb3llZXM6ICcvYWRtaW4vZW1wbG95ZWVzJyxcbiAgICByZXZpZXdCb2FyZHM6ICcvYWRtaW4vcmV2aWV3cycsXG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgR0VUOiAnR0VUJyxcbiAgSEVBRDogJ0hFQUQnLFxuICBQT1NUOiAnUE9TVCcsXG4gIFBVVDogJ1BVVCcsXG4gIERFTEVURTogJ0RFTEVURScsXG4gIENPTk5FQ1Q6ICdDT05ORUNUJyxcbiAgT1BUSU9OUzogJ09QVElPTlMnLFxuICBUUkFDRTogJ1RSQUNFJyxcbiAgUEFUQ0g6ICdQQVRDSCdcbn1cbiIsImltcG9ydCBTd2FsIGZyb20gJ3N3ZWV0YWxlcnQyJ1xuXG5jb25zdCBUb2FzdCA9IFN3YWwubWl4aW4oe1xuICB0b2FzdDogdHJ1ZSxcbiAgcG9zaXRpb246ICd0b3AnLFxuICBzaG93Q29uZmlybUJ1dHRvbjogZmFsc2UsXG4gIHRpbWVyOiAzMDAwLFxuICB0aW1lclByb2dyZXNzQmFyOiB0cnVlLFxuICBvbk9wZW46IHRvYXN0ID0+IHtcbiAgICB0b2FzdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgU3dhbC5zdG9wVGltZXIpXG4gICAgdG9hc3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIFN3YWwucmVzdW1lVGltZXIpXG4gIH1cbn0pXG5cblxuZXhwb3J0IGRlZmF1bHQge1xuICB0b2FzdEVycm9yOiBtZXNzYWdlID0+IHtcbiAgICBUb2FzdC5maXJlKHtcbiAgICAgIGljb246ICdlcnJvcicsXG4gICAgICB0aXRsZTogbWVzc2FnZVxuICAgIH0pXG4gIH0sXG4gIHRvYXN0U3VjY2VzczogbWVzc2FnZSA9PiB7XG4gICAgVG9hc3QuZmlyZSh7XG4gICAgICBpY29uOiAnc3VjY2VzcycsXG4gICAgICB0aXRsZTogbWVzc2FnZVxuICAgIH0pXG4gIH0sXG4gIGNvbmZpcm1EZWxldGU6IGNhbGxiYWNrID0+IHtcbiAgICBTd2FsLmZpcmUoe1xuICAgICAgdGl0bGU6ICdBcmUgeW91IHN1cmU/JyxcbiAgICAgIHRleHQ6IFwiWW91IHdvbid0IGJlIGFibGUgdG8gcmV2ZXJ0IHRoaXMhXCIsXG4gICAgICBpY29uOiAnd2FybmluZycsXG4gICAgICBzaG93Q2FuY2VsQnV0dG9uOiB0cnVlLFxuICAgICAgY29uZmlybUJ1dHRvblRleHQ6ICdZZXMsIGRlbGV0ZSBpdCEnXG4gICAgfSkudGhlbihyZXN1bHQgPT4ge1xuICAgICAgaWYgKHJlc3VsdC52YWx1ZSkge1xuICAgICAgICBjYWxsYmFjaygpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuIiwiaW1wb3J0IEh0dHBNZXRob2RzIGZyb20gJy4uLy4uL19nbG9iYWwvZW51bXMvaHR0cC1tZXRob2RzJ1xuXG52YXIgWGhyRmFjYWRlID0gKGZ1bmN0aW9uICgpIHtcbiAgbGV0IF9qd3RUb2tlblxuXG4gIGxldCBfdG9Gb3JtRGF0YSA9IG9iamVjdCA9PiBPYmplY3Qua2V5cyhvYmplY3QpLnJlZHVjZSgoZm9ybURhdGEsIGtleSkgPT4ge1xuICAgIGZvcm1EYXRhLmFwcGVuZChrZXksIHR5cGVvZiBvYmplY3Rba2V5XSA9PT0gJ29iamVjdCcgPyBKU09OLnN0cmluZ2lmeShvYmplY3Rba2V5XSkgOiBvYmplY3Rba2V5XSlcbiAgICByZXR1cm4gZm9ybURhdGFcbiAgfSwgbmV3IEZvcm1EYXRhKCkpXG5cbiAgbGV0IF9tYWtlWGhyUmVxdWVzdCA9IGZ1bmN0aW9uIChtZXRob2QsIHVybCwgZGF0YSwgaXNQYXJzZUpTT04gPSB0cnVlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgICAgeGhyLm9wZW4obWV0aG9kLCB1cmwsIHRydWUpXG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsIGBCZWFyZXIgJHtfand0VG9rZW59YClcblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHhoci5zdGF0dXMgPj0gMjAwICYmIHhoci5zdGF0dXMgPCAzMDApIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShpc1BhcnNlSlNPTiA/IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKSA6IHhoci5yZXNwb25zZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWplY3QoRXJyb3IoaXNQYXJzZUpTT04gPyBKU09OLnBhcnNlKHhoci5yZXNwb25zZSkuZXJyb3IgOiB4aHIucmVzcG9uc2UpKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZWplY3QoRXJyb3IoaXNQYXJzZUpTT04gPyBKU09OLnBhcnNlKHhoci5yZXNwb25zZSkuZXJyb3IgOiB4aHIucmVzcG9uc2UpKVxuICAgICAgfVxuXG4gICAgICBpZiAoIWRhdGEpIHhoci5zZW5kKClcbiAgICAgIGVsc2UgeGhyLnNlbmQoZGF0YSBpbnN0YW5jZW9mIEZvcm1EYXRhID8gZGF0YSA6IF90b0Zvcm1EYXRhKGRhdGEpKVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gand0VG9rZW4gPT4ge1xuICAgIF9qd3RUb2tlbiA9IGp3dFRva2VuXG5cbiAgICByZXR1cm4ge1xuICAgICAgZ2V0OiAodXJsLCBpc1BhcnNlSlNPTiA9IHRydWUpID0+IF9tYWtlWGhyUmVxdWVzdChIdHRwTWV0aG9kcy5HRVQsIHVybCwgbnVsbCwgaXNQYXJzZUpTT04pLFxuICAgICAgcG9zdDogKHVybCwgZGF0YSwgaXNQYXJzZUpTT04gPSB0cnVlKSA9PiBfbWFrZVhoclJlcXVlc3QoSHR0cE1ldGhvZHMuUE9TVCwgdXJsLCBkYXRhLCBpc1BhcnNlSlNPTiksXG4gICAgICBwdXQ6ICh1cmwsIGRhdGEpID0+IF9tYWtlWGhyUmVxdWVzdChIdHRwTWV0aG9kcy5QVVQsIHVybCwgZGF0YSksXG4gICAgICBwYXRjaDogKHVybCwgZGF0YSwgaXNQYXJzZUpTT04gPSB0cnVlKSA9PiBfbWFrZVhoclJlcXVlc3QoSHR0cE1ldGhvZHMuUEFUQ0gsIHVybCwgZGF0YSwgaXNQYXJzZUpTT04pLFxuICAgICAgZGVsZXRlOiAodXJsLCBkYXRhKSA9PiBfbWFrZVhoclJlcXVlc3QoSHR0cE1ldGhvZHMuREVMRVRFLCB1cmwsIGRhdGEpLFxuICAgICAgcmVuZXdUb2tlbjogbmV3Snd0VG9rZW4gPT4gX2p3dFRva2VuID0gbmV3Snd0VG9rZW5cbiAgICB9XG4gIH1cbn0pKClcblxuZXhwb3J0IGRlZmF1bHQgWGhyRmFjYWRlXG4iLCJpbXBvcnQgbG9naW4gZnJvbSAnLi9wYWdlcy9sb2dpbidcbmltcG9ydCBob21lIGZyb20gJy4vcGFnZXMvaG9tZSdcbmltcG9ydCBhZG1pbkVtcGxveWVlcyBmcm9tICcuL3BhZ2VzL2FkbWluL2VtcGxveWVlcydcbmltcG9ydCBhZG1pblJldmlld0JvYXJkIGZyb20gJy4vcGFnZXMvYWRtaW4vcmV2aWV3LWJvYXJkcydcbmltcG9ydCBjb21tb25BY3Rpb25zIGZyb20gJy4vcGFnZXMvY29tbW9uLWFjdGlvbnMnXG4iLCJpbXBvcnQgbG9ja3IgZnJvbSAnbG9ja3InXG5pbXBvcnQgeGhyRmFjYWRlIGZyb20gJy4uLy4uL19nbG9iYWwvZmFjYWRlcy94aHItZmFjYWRlJ1xuaW1wb3J0IHN3YWwgZnJvbSAnLi4vLi4vX2dsb2JhbC9mYWNhZGVzL3N3YWwtZmFjYWRlJ1xuaW1wb3J0IHVybHMgZnJvbSAnLi4vLi4vX2dsb2JhbC9jb25zdHMvdXJscydcbmltcG9ydCBsb2NrcktleXMgZnJvbSAnLi4vLi4vX2dsb2JhbC9jb25zdHMvbG9ja3Ita2V5cydcbmltcG9ydCBjb25zdHMgZnJvbSAnLi4vLi4vX2dsb2JhbC9jb25zdHMvY29uc3RzJ1xuaW1wb3J0IGFwaXMgZnJvbSAnLi4vLi4vX2dsb2JhbC9jb25zdHMvYXBpcydcbmltcG9ydCBkb21NYW5pcHVsYXRvciBmcm9tICcuLi8uLi9fZ2xvYmFsL2NvbW1vbi1tb2R1bGVzL2RvbS1tYW5pcHVsYXRvcidcblxuaW1wb3J0IGVtcGxveWVlc1RhYmxlIGZyb20gJy4uLy4uLy4uL2NvbnRlbnQtc2NyaXB0cy9fZ2VuZXJhdGVkLWNvbXBvbmVudHMvZW1wbG95ZWVzLXRhYmxlJ1xuaW1wb3J0IHNlbGVjdE9wdGlvbnMgZnJvbSAnLi4vLi4vLi4vY29udGVudC1zY3JpcHRzL19nZW5lcmF0ZWQtY29tcG9uZW50cy9zZWxlY3Qtb3B0aW9ucydcblxubG9ja3IucHJlZml4ID0gbG9ja3JLZXlzLl9fcHJlZml4X19cblxubGV0IEFkbWluRW1wbG95ZWVzTW9kdWxlID0gKCgpID0+IHtcbiAgbGV0IF94aHJGYWNhZGUgPSB4aHJGYWNhZGUobG9ja3IuZ2V0KGxvY2tyS2V5cy50b2tlbikpXG4gIGxldCBfdXNlciA9IGxvY2tyLmdldChsb2NrcktleXMudXNlcilcbiAgbGV0IF9jdXJyZW50UGFnZSA9IDFcblxuICBsZXQgX2FkZER5bmFtaWNDbGlja0V2ZW50TGlzdGVuZXIgPSAodGFyZ2V0U2VsZWN0b3IsIGNhbGxiYWNrKSA9PiB7XG4gICAgZG9tTWFuaXB1bGF0b3IuYWRkRHluYW1pY0V2ZW50TGlzdGVuZXIoZG9jdW1lbnQuYm9keSwgJ2NsaWNrJyxcbiAgICAgIHRhcmdldFNlbGVjdG9yLCBjYWxsYmFjaylcbiAgfVxuXG4gIGxldCBfcmVnaXN0ZXJEb21FdmVudEhhbmRsZXIgPSAoKSA9PiB7XG4gICAgX2FkZER5bmFtaWNDbGlja0V2ZW50TGlzdGVuZXIoJy50YWJsZS1lbXBsb3llZXMtLWJ1dHRvbi1kZWxldGUnLCBfZGVsZXRlRW1wbG95ZWUpXG4gICAgX2FkZER5bmFtaWNDbGlja0V2ZW50TGlzdGVuZXIoJy50YWJsZS1lbXBsb3llZXMtLXJlcXVpcmUtcmV2aWV3LWJ1dHRvbicsIF9vcGVuTW9kYWwpXG4gICAgX2FkZER5bmFtaWNDbGlja0V2ZW50TGlzdGVuZXIoJy5yZXF1aXJpbmctcmV2aWV3LW1vZGFsLS13cmFwcGVyIC5tb2RhbC1iYWNrZ3JvdW5kLCAucmVxdWlyaW5nLXJldmlldy1tb2RhbC0td3JhcHBlciAuZGVsZXRlJywgX2Nsb3NlTW9kYWwpXG4gICAgX2FkZER5bmFtaWNDbGlja0V2ZW50TGlzdGVuZXIoJy5yZXF1aXJpbmctcmV2aWV3LW1vZGFsLS13cmFwcGVyIC5yZXF1aXJpbmctcmV2aWV3LW1vZGFsLS1zdWJtaXQtYnV0dG9uJywgX3JlcXVpcmVSZXZpZXcpXG4gICAgX2FkZER5bmFtaWNDbGlja0V2ZW50TGlzdGVuZXIoJy5wYWdpbmF0aW9uLWxpbmsnLCBfZ29Ub05leHRQYWdlKVxuICB9XG5cbiAgbGV0IF9kZWxldGVFbXBsb3llZSA9IGUgPT4ge1xuICAgIHN3YWwuY29uZmlybURlbGV0ZShhc3luYyAoKSA9PiB7XG4gICAgICBlLnRhcmdldC5jbG9zZXN0KCd0cicpLnJlbW92ZSgpXG4gICAgICBhd2FpdCBfeGhyRmFjYWRlLmRlbGV0ZShgJHtjb25zdHMuYXBpQmFzZVVybH0ke2FwaXMuZW1wbG95ZWVzfS8ke2UudGFyZ2V0LmRhdGFzZXQuaWR9YClcbiAgICB9KVxuICB9XG5cbiAgbGV0IF9vcGVuTW9kYWwgPSBlID0+IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVxdWlyaW5nLXJldmlldy1tb2RhbC0td3JhcHBlciAubW9kYWwtY2FyZC10aXRsZSBiJykuaW5uZXJIVE1MID1cbiAgICAgIGUudGFyZ2V0LmNsb3Nlc3QoJ3RyJykucXVlcnlTZWxlY3RvcignLnRhYmxlLWVtcGxveWVlcy0tZW1wbG95ZWUtbmFtZScpLmlubmVySFRNTFxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJlcXVpcmluZy1yZXZpZXctbW9kYWwtLXdyYXBwZXIgW25hbWU9ZnJvbUVtYWlsXScpLnZhbHVlID1cbiAgICAgIGUudGFyZ2V0LmNsb3Nlc3QoJ3RyJykucXVlcnlTZWxlY3RvcignLnRhYmxlLWVtcGxveWVlcy0tZW1wbG95ZWUtZW1haWwnKS5pbm5lckhUTUxcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZXF1aXJpbmctcmV2aWV3LW1vZGFsLS13cmFwcGVyJykuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtYWN0aXZlJylcbiAgfVxuXG4gIGxldCBfY2xvc2VNb2RhbCA9IGUgPT4ge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZXF1aXJpbmctcmV2aWV3LW1vZGFsLS13cmFwcGVyJykuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtYWN0aXZlJylcbiAgfVxuXG4gIGxldCBfcmVxdWlyZVJldmlldyA9IGFzeW5jIGUgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGluc2VydGVkQ291bnQgfSA9IGF3YWl0IF94aHJGYWNhZGUucHV0KFxuICAgICAgICBgJHtjb25zdHMuYXBpQmFzZVVybH0ke2FwaXMucmV2aWV3UmVxdWVzdHN9YCxcbiAgICAgICAgbmV3IEZvcm1EYXRhKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZXF1aXJpbmctcmV2aWV3LW1vZGFsLS13cmFwcGVyIGZvcm0nKSlcbiAgICAgIClcblxuICAgICAgX3Jlc2V0TW9kYWxDb250ZW50KClcblxuICAgICAgc3dhbC50b2FzdFN1Y2Nlc3MoYFN1Y2Nlc3NmdWxseSBpbnNlcnRlZCAke2luc2VydGVkQ291bnR9IHJldmlldyByZXF1ZXN0cyFgKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBzd2FsLnRvYXN0RXJyb3IoJ0FuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJlZCEgUGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nKVxuICAgIH1cbiAgfVxuXG4gIGxldCBfcmVzZXRNb2RhbENvbnRlbnQgPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJlcXVpcmluZy1yZXZpZXctbW9kYWwtLXdyYXBwZXIgW25hbWU9ZnJvbUVtYWlsXScpLnZhbHVlID0gJydcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVxdWlyaW5nLXJldmlldy1tb2RhbC0td3JhcHBlciBbbmFtZT10YXJnZXRFbWFpbHNdJykudmFsdWUgPSAnJ1xuICB9XG5cbiAgbGV0IF9nb1RvTmV4dFBhZ2UgPSBlID0+IHtcbiAgICBfY3VycmVudFBhZ2UgPSBwYXJzZUludChlLnRhcmdldC5pbm5lclRleHQpXG4gICAgX3JlbmRlckVtcGxveWVlc1RhYmxlKClcbiAgfVxuXG4gIGxldCBfcmVuZGVyRHluYW1pY0NvbnRlbnQgPSAoKSA9PiB7XG4gICAgX3JlbmRlckVtcGxveWVlc1RhYmxlKClcbiAgICBfcmVuZGVyUmV2aWV3Qm9hcmRzT3B0aW9ucygpXG4gIH1cblxuICBsZXQgX3JlbmRlckVtcGxveWVlc1RhYmxlID0gYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbXBsb3llZXMgPSBhd2FpdCBfeGhyRmFjYWRlLmdldChgJHtjb25zdHMuYXBpQmFzZVVybH0ke2FwaXMuZW1wbG95ZWVzfT9za2lwPSR7KF9jdXJyZW50UGFnZSAtIDEpICogY29uc3RzLmRlZmF1bHRMaW1pdH0mbGltaXQ9JHtjb25zdHMuZGVmYXVsdExpbWl0fWApXG5cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0YWJsZS1lbXBsb3llZXMnKVxuICAgICAgICAuaW5uZXJIVE1MID0gZW1wbG95ZWVzVGFibGUoeyAuLi5lbXBsb3llZXMsIGRlZmF1bHRMaW1pdDogY29uc3RzLmRlZmF1bHRMaW1pdCwgY3VycmVudFBhZ2U6IF9jdXJyZW50UGFnZSB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBzd2FsLnRvYXN0RXJyb3IoJ0FuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJlZCEgUGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nKVxuICAgIH1cbiAgfVxuXG4gIGxldCBfcmVuZGVyUmV2aWV3Qm9hcmRzT3B0aW9ucyA9IGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyByZXZpZXdCb2FyZHMgfSA9IGF3YWl0IF94aHJGYWNhZGUuZ2V0KGAke2NvbnN0cy5hcGlCYXNlVXJsfSR7YXBpcy5yZXZpZXdCb2FyZHN9P3NraXA9JHsoX2N1cnJlbnRQYWdlIC0gMSkgKiBjb25zdHMuZGVmYXVsdExpbWl0fSZsaW1pdD0ke2NvbnN0cy5kZWZhdWx0TGltaXR9YClcblxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJlcXVpcmluZy1yZXZpZXctbW9kYWwtLXJldmlldy1ib2FyZHMnKVxuICAgICAgICAuaW5uZXJIVE1MICs9IHNlbGVjdE9wdGlvbnMoeyBvcHRpb25zOiByZXZpZXdCb2FyZHMubWFwKGIgPT4gKHsgdmFsdWU6IGIuX2lkLCB0ZXh0OiBiLnRpdGxlIH0pKSB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBzd2FsLnRvYXN0RXJyb3IoJ0FuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJlZCEgUGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogKCkgPT4ge1xuICAgICAgX3JlbmRlckR5bmFtaWNDb250ZW50KClcbiAgICAgIF9yZWdpc3RlckRvbUV2ZW50SGFuZGxlcigpXG4gICAgfVxuICB9XG59KSgpXG5cbmlmIChbdXJscy5hZG1pbi5kZWZhdWx0LCB1cmxzLmFkbWluLmVtcGxveWVlc10uaW5jbHVkZXMod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKSkge1xuICBBZG1pbkVtcGxveWVlc01vZHVsZS5pbml0KClcbn1cbiIsImltcG9ydCBsb2NrciBmcm9tICdsb2NrcidcbmltcG9ydCB4aHJGYWNhZGUgZnJvbSAnLi4vLi4vX2dsb2JhbC9mYWNhZGVzL3hoci1mYWNhZGUnXG5pbXBvcnQgdXJscyBmcm9tICcuLi8uLi9fZ2xvYmFsL2NvbnN0cy91cmxzJ1xuaW1wb3J0IGxvY2tyS2V5cyBmcm9tICcuLi8uLi9fZ2xvYmFsL2NvbnN0cy9sb2Nrci1rZXlzJ1xuaW1wb3J0IGNvbnN0cyBmcm9tICcuLi8uLi9fZ2xvYmFsL2NvbnN0cy9jb25zdHMnXG5pbXBvcnQgYXBpcyBmcm9tICcuLi8uLi9fZ2xvYmFsL2NvbnN0cy9hcGlzJ1xuaW1wb3J0IGRvbU1hbmlwdWxhdG9yIGZyb20gJy4uLy4uL19nbG9iYWwvY29tbW9uLW1vZHVsZXMvZG9tLW1hbmlwdWxhdG9yJ1xuXG5pbXBvcnQgcmV2aWV3Qm9hcmRzVGFibGUgZnJvbSAnLi4vLi4vX2dlbmVyYXRlZC1jb21wb25lbnRzL3Jldmlldy1ib2FyZHMtdGFibGUnXG5cbmxvY2tyLnByZWZpeCA9IGxvY2tyS2V5cy5fX3ByZWZpeF9fXG5cbmxldCBBZG1pblJldmlld0JvYXJkc01vZHVsZSA9ICgoKSA9PiB7XG4gIGxldCBfeGhyRmFjYWRlID0geGhyRmFjYWRlKGxvY2tyLmdldChsb2NrcktleXMudG9rZW4pKVxuICBsZXQgX3VzZXIgPSBsb2Nrci5nZXQobG9ja3JLZXlzLnVzZXIpXG4gIGxldCBfY3VycmVudFBhZ2UgPSAxXG5cbiAgbGV0IF9hZGREeW5hbWljQ2xpY2tFdmVudExpc3RlbmVyID0gKHRhcmdldFNlbGVjdG9yLCBjYWxsYmFjaykgPT4ge1xuICAgIGRvbU1hbmlwdWxhdG9yLmFkZER5bmFtaWNFdmVudExpc3RlbmVyKGRvY3VtZW50LmJvZHksICdjbGljaycsXG4gICAgICB0YXJnZXRTZWxlY3RvciwgY2FsbGJhY2spXG4gIH1cblxuICBsZXQgX3JlZ2lzdGVyRG9tRXZlbnRIYW5kbGVyID0gKCkgPT4ge1xuICB9XG5cbiAgbGV0IF9yZW5kZXJEeW5hbWljQ29udGVudCA9ICgpID0+IHtcbiAgICBfcmVuZGVyUmV2aWV3Qm9hcmRzVGFibGUoKVxuICB9XG5cbiAgbGV0IF9yZW5kZXJSZXZpZXdCb2FyZHNUYWJsZSA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCByZXZpZXdCb2FyZHMgPSBhd2FpdCBfeGhyRmFjYWRlLmdldChgJHtjb25zdHMuYXBpQmFzZVVybH0ke2FwaXMucmV2aWV3Qm9hcmRzfT9za2lwPSR7KF9jdXJyZW50UGFnZSAtIDEpICogY29uc3RzLmRlZmF1bHRMaW1pdH0mbGltaXQ9JHtjb25zdHMuZGVmYXVsdExpbWl0fWApXG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdGFibGUtcmV2aWV3LWJvYXJkcycpXG4gICAgICAuaW5uZXJIVE1MID0gcmV2aWV3Qm9hcmRzVGFibGUoeyAuLi5yZXZpZXdCb2FyZHMsIGRlZmF1bHRMaW1pdDogY29uc3RzLmRlZmF1bHRMaW1pdCwgY3VycmVudFBhZ2U6IF9jdXJyZW50UGFnZSB9KVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiAoKSA9PiB7XG4gICAgICBfcmVuZGVyRHluYW1pY0NvbnRlbnQoKVxuICAgICAgX3JlZ2lzdGVyRG9tRXZlbnRIYW5kbGVyKClcbiAgICB9XG4gIH1cbn0pKClcblxudXJscy5hZG1pbi5yZXZpZXdCb2FyZHMgPT09IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSAmJiBBZG1pblJldmlld0JvYXJkc01vZHVsZS5pbml0KClcbiIsImltcG9ydCBsb2NrciBmcm9tICdsb2NrcidcbmltcG9ydCBkb21NYW5pcHVsYXRvciBmcm9tICcuLi9fZ2xvYmFsL2NvbW1vbi1tb2R1bGVzL2RvbS1tYW5pcHVsYXRvcidcbmltcG9ydCBhcGlzIGZyb20gJy4uL19nbG9iYWwvY29uc3RzL2FwaXMnXG5pbXBvcnQgY29uc3RzIGZyb20gJy4uL19nbG9iYWwvY29uc3RzL2NvbnN0cydcbmltcG9ydCB4aHJGYWNhZGUgZnJvbSAnLi4vX2dsb2JhbC9mYWNhZGVzL3hoci1mYWNhZGUnXG5cbmltcG9ydCBsb2NrcktleXMgZnJvbSAnLi4vX2dsb2JhbC9jb25zdHMvbG9ja3Ita2V5cydcblxubGV0IF94aHJGYWNhZGUgPSB4aHJGYWNhZGUobG9ja3IuZ2V0KGxvY2tyS2V5cy50b2tlbikpXG5cbmRvbU1hbmlwdWxhdG9yLmFkZER5bmFtaWNFdmVudExpc3RlbmVyKGRvY3VtZW50LmJvZHksICdjbGljaycsICcjYnV0dG9uLWxvZ291dCcsIGFzeW5jICgpID0+IHtcbiAgbG9ja3Iucm0obG9ja3JLZXlzLnVzZXIpXG4gIGxvY2tyLnJtKGxvY2tyS2V5cy50b2tlbilcblxuICBhd2FpdCBfeGhyRmFjYWRlLmdldChcbiAgICBgJHtjb25zdHMuYXBpQmFzZVVybH0ke2FwaXMubG9nb3V0fWAsIGZhbHNlXG4gIClcblxuICBkb2N1bWVudC5jb29raWUgPSAnQXV0aFRva2VuPSA7IGV4cGlyZXMgPSBUaHUsIDAxIEphbiAxOTcwIDAwOjAwOjAwIEdNVCdcblxuICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZSgnL2xvZ2luJylcbn0pXG4iLCJpbXBvcnQgbG9ja3IgZnJvbSAnbG9ja3InXG5pbXBvcnQgeGhyRmFjYWRlIGZyb20gJy4uL19nbG9iYWwvZmFjYWRlcy94aHItZmFjYWRlJ1xuaW1wb3J0IHN3YWwgZnJvbSAnLi4vX2dsb2JhbC9mYWNhZGVzL3N3YWwtZmFjYWRlJ1xuaW1wb3J0IHVybHMgZnJvbSAnLi4vX2dsb2JhbC9jb25zdHMvdXJscydcbmltcG9ydCBsb2NrcktleXMgZnJvbSAnLi4vX2dsb2JhbC9jb25zdHMvbG9ja3Ita2V5cydcbmltcG9ydCBjb25zdHMgZnJvbSAnLi4vX2dsb2JhbC9jb25zdHMvY29uc3RzJ1xuaW1wb3J0IGFwaXMgZnJvbSAnLi4vX2dsb2JhbC9jb25zdHMvYXBpcydcbmltcG9ydCBkb21NYW5pcHVsYXRvciBmcm9tICcuLi9fZ2xvYmFsL2NvbW1vbi1tb2R1bGVzL2RvbS1tYW5pcHVsYXRvcidcblxuaW1wb3J0IHJldmlld1JlcXVlc3RzVGFibGUgZnJvbSAnLi4vLi4vY29udGVudC1zY3JpcHRzL19nZW5lcmF0ZWQtY29tcG9uZW50cy9yZXZpZXctcmVxdWVzdHMtdGFibGUnXG5pbXBvcnQgcmV2aWV3UmVxdWVzdHNNb2RhbCBmcm9tICcuLi8uLi9jb250ZW50LXNjcmlwdHMvX2dlbmVyYXRlZC1jb21wb25lbnRzL3Jldmlldy1yZXF1ZXN0cy1tb2RhbCdcblxubG9ja3IucHJlZml4ID0gbG9ja3JLZXlzLl9fcHJlZml4X19cblxubGV0IEhvbWVNb2R1bGUgPSAoKCkgPT4ge1xuICBsZXQgX3hockZhY2FkZSA9IHhockZhY2FkZShsb2Nrci5nZXQobG9ja3JLZXlzLnRva2VuKSlcbiAgbGV0IF91c2VyID0gbG9ja3IuZ2V0KGxvY2tyS2V5cy51c2VyKVxuICBsZXQgX2N1cnJlbnRQYWdlID0gMVxuICBsZXQgX3Jldmlld1JlcXVlc3RzUGVuZGluZ1xuICBsZXQgX3Jldmlld2luZ1JlcXVlc3RSb3dcblxuICBsZXQgX2FkZER5bmFtaWNDbGlja0V2ZW50TGlzdGVuZXIgPSAodGFyZ2V0U2VsZWN0b3IsIGNhbGxiYWNrKSA9PiB7XG4gICAgZG9tTWFuaXB1bGF0b3IuYWRkRHluYW1pY0V2ZW50TGlzdGVuZXIoZG9jdW1lbnQuYm9keSwgJ2NsaWNrJyxcbiAgICAgIHRhcmdldFNlbGVjdG9yLCBjYWxsYmFjaylcbiAgfVxuXG4gIGxldCBfcmVnaXN0ZXJEb21FdmVudEhhbmRsZXIgPSAoKSA9PiB7XG4gICAgX2FkZER5bmFtaWNDbGlja0V2ZW50TGlzdGVuZXIoJy50YWJsZS1yZXZpZXctcmVxdWVzdHMtLXN0YXJ0LXJldmlldy1idXR0b24nLCBfb3Blbk1vZGFsKVxuICAgIF9hZGREeW5hbWljQ2xpY2tFdmVudExpc3RlbmVyKCcucmV2aWV3LXJlcXVlc3RzLW1vZGFsLS13cmFwcGVyIC5tb2RhbC1iYWNrZ3JvdW5kLCAucmV2aWV3LXJlcXVlc3RzLW1vZGFsLS13cmFwcGVyIC5kZWxldGUnLCBfY2xvc2VNb2RhbClcbiAgICBfYWRkRHluYW1pY0NsaWNrRXZlbnRMaXN0ZW5lcignLnJldmlldy1yZXF1ZXN0cy1tb2RhbC0td3JhcHBlciAucmV2aWV3LXJlcXVlc3RzLW1vZGFsLS1zdWJtaXQtYnV0dG9uJywgX2NvbmZpcm1SZXZpZXcpXG4gICAgX2FkZER5bmFtaWNDbGlja0V2ZW50TGlzdGVuZXIoJyN0YWJzLS1yZXZpZXctcmVxdWVzdHMgdWwgbGkgYScsIF9zd2l0Y2hUYWIpXG4gIH1cblxuICBsZXQgX29wZW5Nb2RhbCA9IGUgPT4ge1xuICAgIF9yZXZpZXdpbmdSZXF1ZXN0Um93ID0gZS50YXJnZXQuY2xvc2VzdCgndHInKVxuXG4gICAgY29uc3QgcmV2aWV3UmVxdWVzdElkID0gX3Jldmlld2luZ1JlcXVlc3RSb3cucXVlcnlTZWxlY3RvcignLnRhYmxlLXJldmlldy1yZXF1ZXN0cy0tcmV2aWV3LXJlcXVlc3QtaWQnKS5pbm5lclRleHRcblxuICAgIGNvbnN0IHJldmlld1JlcXVlc3QgPSBfcmV2aWV3UmVxdWVzdHNQZW5kaW5nLmZpbmQociA9PiByLl9pZCA9PT0gcmV2aWV3UmVxdWVzdElkKVxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Jldmlldy1yZXF1ZXN0cy1tb2RhbCcpLmlubmVySFRNTCA9IHJldmlld1JlcXVlc3RzTW9kYWwocmV2aWV3UmVxdWVzdClcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZXZpZXctcmVxdWVzdHMtbW9kYWwtLXdyYXBwZXInKS5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnKVxuICB9XG5cbiAgbGV0IF9jbG9zZU1vZGFsID0gZSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJldmlldy1yZXF1ZXN0cy1tb2RhbC0td3JhcHBlcicpLmNsYXNzTGlzdC50b2dnbGUoJ2lzLWFjdGl2ZScpXG4gIH1cblxuICBsZXQgX2NvbmZpcm1SZXZpZXcgPSBhc3luYyBlID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmV2aWV3UmVxdWVzdElkID0gZS50YXJnZXQuZGF0YXNldC5pZFxuXG4gICAgICAvLyBUT0RPOiBTdXBwb3J0IHRyYW5zYWN0aW9uLlxuICAgICAgYXdhaXQgX3hockZhY2FkZS5wdXQoXG4gICAgICAgIGAke2NvbnN0cy5hcGlCYXNlVXJsfSR7YXBpcy5yZXZpZXdSZXN1bHRzfWAsXG4gICAgICAgIG5ldyBGb3JtRGF0YShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmV2aWV3LXJlcXVlc3RzLW1vZGFsLS13cmFwcGVyIGZvcm0nKSlcbiAgICAgIClcblxuICAgICAgYXdhaXQgX3hockZhY2FkZS5wYXRjaChcbiAgICAgICAgYCR7Y29uc3RzLmFwaUJhc2VVcmx9JHthcGlzLnJldmlld1JlcXVlc3RzfS8ke3Jldmlld1JlcXVlc3RJZH1gLCB7IHN0YXR1czogMSB9LCBmYWxzZVxuICAgICAgKVxuXG4gICAgICBfbW92ZVJlcXVlc3RUb0hpc3RvcnkoX3Jldmlld2luZ1JlcXVlc3RSb3cpXG5cbiAgICAgIHN3YWwudG9hc3RTdWNjZXNzKGBZb3VyIHJldmlldyBpcyBzYXZlZCFgKVxuXG4gICAgICBfY2xvc2VNb2RhbCgpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHN3YWwudG9hc3RFcnJvcignQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cmVkISBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLicpXG4gICAgfVxuICB9XG5cbiAgbGV0IF9zd2l0Y2hUYWIgPSBlID0+IHtcbiAgICBlLnRhcmdldC5jbG9zZXN0KCcudGFicycpLnF1ZXJ5U2VsZWN0b3JBbGwoJ3VsIGxpJykuZm9yRWFjaChsaSA9PiBsaS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKSlcbiAgICBlLnRhcmdldC5wYXJlbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRhYnMtLXJldmlldy1yZXF1ZXN0cy0tY29udGVudCcpLmZvckVhY2goYyA9PiBjLmNsYXNzTGlzdC5hZGQoJ2lzLWhpZGRlbicpKVxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZS50YXJnZXQucGFyZW50RWxlbWVudC5kYXRhc2V0LnRhcmdldHNlbGVjdG9yKS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1oaWRkZW4nKVxuICB9XG5cbiAgbGV0IF9tb3ZlUmVxdWVzdFRvSGlzdG9yeSA9IGl0ZW0gPT4ge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0YWJzLXN1Ym1pdGVkLWhpc3RvcnkgdGFibGUgdGJvZHknKS5hcHBlbmRDaGlsZChpdGVtLmNsb25lTm9kZSh0cnVlKSlcbiAgICBpdGVtLnJlbW92ZSgpXG4gIH1cblxuICBsZXQgX3JlbmRlckR5bmFtaWNDb250ZW50ID0gKCkgPT4ge1xuICAgIF9yZW5kZXJSZXZpZXdSZXF1ZXN0c1RhYmxlKClcbiAgfVxuXG4gIGxldCBfcmVuZGVyUmV2aWV3UmVxdWVzdHNUYWJsZSA9IGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmV2aWV3UmVxdWVzdHMgPSBhd2FpdCBfeGhyRmFjYWRlLmdldChgJHtjb25zdHMuYXBpQmFzZVVybH0ke2FwaXMucmV2aWV3UmVxdWVzdHN9P3NraXA9JHsoX2N1cnJlbnRQYWdlIC0gMSkgKiBjb25zdHMuZGVmYXVsdExpbWl0fSZsaW1pdD0ke2NvbnN0cy5kZWZhdWx0TGltaXR9YClcblxuICAgICAgX3Jldmlld1JlcXVlc3RzUGVuZGluZyA9IHJldmlld1JlcXVlc3RzLnJldmlld1JlcXVlc3RzLmZpbHRlcihyID0+IHIuc3RhdHVzID09IDApXG4gICAgICBsZXQgcmV2aWV3UmVxdWVzdHNIaXN0b3J5ID0gcmV2aWV3UmVxdWVzdHMucmV2aWV3UmVxdWVzdHMuZmlsdGVyKHIgPT4gci5zdGF0dXMgPT0gMSlcblxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RhYnMtcmV2aWV3LXJlcXVlc3RzJylcbiAgICAgICAgLmlubmVySFRNTCA9IHJldmlld1JlcXVlc3RzVGFibGUoeyByZXZpZXdSZXF1ZXN0czogX3Jldmlld1JlcXVlc3RzUGVuZGluZywgZGVmYXVsdExpbWl0OiBjb25zdHMuZGVmYXVsdExpbWl0LCBjdXJyZW50UGFnZTogX2N1cnJlbnRQYWdlIH0pXG5cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0YWJzLXN1Ym1pdGVkLWhpc3RvcnknKVxuICAgICAgICAuaW5uZXJIVE1MID0gcmV2aWV3UmVxdWVzdHNUYWJsZSh7IHJldmlld1JlcXVlc3RzOiByZXZpZXdSZXF1ZXN0c0hpc3RvcnksIGRlZmF1bHRMaW1pdDogY29uc3RzLmRlZmF1bHRMaW1pdCwgY3VycmVudFBhZ2U6IF9jdXJyZW50UGFnZSB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBzd2FsLnRvYXN0RXJyb3IoJ0FuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJlZCEgUGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogKCkgPT4ge1xuICAgICAgX3JlbmRlckR5bmFtaWNDb250ZW50KClcbiAgICAgIF9yZWdpc3RlckRvbUV2ZW50SGFuZGxlcigpXG4gICAgfVxuICB9XG59KSgpXG5cbndpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gdXJscy5ob21lICYmIEhvbWVNb2R1bGUuaW5pdCgpXG4iLCJpbXBvcnQgbG9ja3IgZnJvbSAnbG9ja3InXG5pbXBvcnQgZG9tTWFuaXB1bGF0b3IgZnJvbSAnLi4vX2dsb2JhbC9jb21tb24tbW9kdWxlcy9kb20tbWFuaXB1bGF0b3InXG5pbXBvcnQgeGhyRmFjYWRlIGZyb20gJy4uL19nbG9iYWwvZmFjYWRlcy94aHItZmFjYWRlJ1xuaW1wb3J0IHN3YWxGYWNhZGUgZnJvbSAnLi4vX2dsb2JhbC9mYWNhZGVzL3N3YWwtZmFjYWRlJ1xuaW1wb3J0IHVybHMgZnJvbSAnLi4vX2dsb2JhbC9jb25zdHMvdXJscydcbmltcG9ydCBsb2NrcktleXMgZnJvbSAnLi4vX2dsb2JhbC9jb25zdHMvbG9ja3Ita2V5cydcblxubG9ja3IucHJlZml4ID0gbG9ja3JLZXlzLl9fcHJlZml4X19cblxubGV0IExvZ2luTW9kdWxlID0gKCgpID0+IHtcbiAgbGV0IF94aHJGYWNhZGUgPSB4aHJGYWNhZGUobG9ja3IuZ2V0KGxvY2tyS2V5cy50b2tlbikpXG4gIGxldCBfdXNlciA9IGxvY2tyLmdldChsb2NrcktleXMudXNlcilcblxuICBsZXQgX2FkZER5bmFtaWNDbGlja0V2ZW50TGlzdGVuZXIgPSAodGFyZ2V0U2VsZWN0b3IsIGNhbGxiYWNrKSA9PiB7XG4gICAgZG9tTWFuaXB1bGF0b3IuYWRkRHluYW1pY0V2ZW50TGlzdGVuZXIoZG9jdW1lbnQuYm9keSwgJ2NsaWNrJyxcbiAgICAgIHRhcmdldFNlbGVjdG9yLCBjYWxsYmFjaylcbiAgfVxuXG4gIGxldCBfcmVnaXN0ZXJEb21FdmVudEhhbmRsZXIgPSAoKSA9PiB7XG4gICAgX2FkZER5bmFtaWNDbGlja0V2ZW50TGlzdGVuZXIoJy5sb2dpbi1mb3JtLS1sb2dpbi1idXR0b24nLCBfbG9naW4pXG4gIH1cblxuICBsZXQgX2xvZ2luID0gYXN5bmMgZSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb25zdCBlbWFpbCA9IGUudGFyZ2V0LmNsb3Nlc3QoJ2Zvcm0nKS5xdWVyeVNlbGVjdG9yKCcubG9naW4tZm9ybS0tZW1haWwnKS52YWx1ZVxuICAgICAgY29uc3QgcGFzc3dvcmQgPSBlLnRhcmdldC5jbG9zZXN0KCdmb3JtJykucXVlcnlTZWxlY3RvcignLmxvZ2luLWZvcm0tLXBhc3N3b3JkJykudmFsdWVcblxuICAgICAgY29uc3QgdXNlciA9IGF3YWl0IF94aHJGYWNhZGUucG9zdCh1cmxzLmxvZ2luLCB7IGVtYWlsLCBwYXNzd29yZCB9KVxuICAgICAgbG9ja3Iuc2V0KGxvY2tyS2V5cy51c2VyLCB1c2VyKVxuICAgICAgbG9ja3Iuc2V0KGxvY2tyS2V5cy50b2tlbiwgdXNlci5qd3RUb2tlbilcblxuICAgICAgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UoJy8nKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsb2Nrci5ybShsb2NrcktleXMudXNlcilcbiAgICAgIGxvY2tyLnJtKGxvY2tyS2V5cy50b2tlbilcblxuICAgICAgc3dhbEZhY2FkZS50b2FzdEVycm9yKGVycm9yLm1lc3NhZ2UpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiAoKSA9PiB7XG4gICAgICBfcmVnaXN0ZXJEb21FdmVudEhhbmRsZXIoKVxuICAgIH1cbiAgfVxufSkoKVxuXG53aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09IHVybHMubG9naW4gJiYgTG9naW5Nb2R1bGUuaW5pdCgpXG4iXX0=
