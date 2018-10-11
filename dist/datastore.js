(function(a,b){"object"==typeof exports&&"undefined"!=typeof module?b(exports):"function"==typeof define&&define.amd?define(["exports"],b):b(a.datastore={})})(this,function(a){"use strict";function b(a){return b="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},b(a)}function c(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function d(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}function e(a,b,c){return b&&d(a.prototype,b),c&&d(a,c),a}function f(a){return"number"==typeof a&&isNaN(a)?"nan":a&&3===a.nodeType?"text":a&&1===a.nodeType?"element":/\[object (.*)]/.exec(toString.call(a))[1].toLowerCase()}function g(...a){function c(a,b=new WeakMap){if(Object(a)!==a)return a;if(b.has(a))return b.get(a);const d=a instanceof Date?new Date(a):a instanceof RegExp?new RegExp(a.source,a.flags):a.constructor?new a.constructor:Object.create(null);return b.set(a,d),Object.assign(d,...Object.keys(a).map(d=>({[d]:c(a[d],b)})))}return a.unshift({}),a.reduce((d,a)=>Object.assign(d,c(a)))}class h{constructor(){this.events={}}watch(a,b){this.events.hasOwnProperty(a)?this.events[a].push(b):this.events[a]=[b]}dispatch(a,b){return this.events.hasOwnProperty(a)?this.events[a].map(a=>a(b)):[]}unwatch(a){this.events[a]}}var i={},j=Symbol(),k=function(){function a(b){c(this,a),this[j]=void 0,this.observer=new h,this.state=b,this.events={},this.events.dataStoreStateChanged=[]}return e(a,[{key:"dispatch",value:function(a,b){""!==a&&a?this.events[a]&&this.observer.dispatch(a,b):this.observer.dispatch("dataStoreStateChanged",b)}},{key:"watch",value:function(a,b){""===a?this.events.dataStoreStateChanged.push(this.observer.watch("dataStoreStateChanged",b)):this.events[a]=[this.observer.watch(a,b)]}},{key:"setState",value:function(a){if("function"==typeof a){var c="array"===f(this.state)?JSON.parse(JSON.stringify(this.state)):"object"===b(this.state)?g(i,this.state):this.state;var d=a.call(this,c);d&&(this.state=d)}else if("object"===f(this.state)&&"object"===f(a)){var e=g(this.state,a);this.state=e}}},{key:"unwatch",value:function(a){"dataStoreStateChanged"!==a&&(delete this.events[a],this.observer.unwatch(a))}},{key:"state",get:function(){return this[j]},set:function(a){var b=this;this[j]=a,this.events&&Object.keys(this.events).map(function(a){a.length&&b.dispatch(a,b.state)})}}]),a}();a.DataStore=k,Object.defineProperty(a,"__esModule",{value:!0})});
//# sourceMappingURL=datastore.js.map
