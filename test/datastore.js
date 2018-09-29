(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.datastore = {})));
}(this, (function (exports) { 'use strict';

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

  /**
   * Function to create an RFC4122 version 4 compliant uuid.
   * @return {string} string
   */
  function uuid() {
    let d = new Date().getTime();
    if (
      typeof performance !== 'undefined' &&
      typeof performance.now === 'function'
    ) {
      // Use high-precision timer if available
      d += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
  }

  /**
   * Determine the type of the provided argument.
   * @param {*} value
   * @return {string} string
   */
  function getType(value) {
    // Trap for NaN:
    if (typeof value === 'number' && isNaN(value)) {
      return 'NaN'
    } else {
      return new RegExp('\\[object (.*)]').exec(toString.call(value))[1]
    }
  }

  /**
   * Combine two objects, merging the second into the first. Any properties already existing in the first will be replaced by those of the second. Any properties in the second not in the first will be added to it.
   *
   * @param {Object.<string, any>[]} objects
   * @return {Object.<string, any>} Object.<string, any>
   */
  function mergeObjects(...objects) {
    // Clone both objects:
    const clones = objects.map(obj => JSON.parse(JSON.stringify(obj)));
    // Merge objects:
    return clones.reduce((a, b) => Object.assign({}, a, b))
  }

  /**
   * Observer class providing two methods: watch and dispatch.
   * It also exposes a method for setting state: `setState`.
   * `setState` works just like the same method on Composi class components.
   * When you use `setState` it sends a message to an instance of DataStoreComponent to update itself.
   */
  class Observer {
    constructor() {
      this.events = {};
    }

    /**
     * Method to subscribe to a publishing event.
     * @param {string} event
     * @param {Function} callback
     * @return {Object.<string, any>} events
     */
    watch(event, callback) {
      this.events[event] = [];
      return this.events[event].push(callback)
    }

    /**
     *
     * @param {string} event
     * @param {any} [data]
     * @return {any[]} events
     */
    dispatch(event, data) {
      // There's no event to dispatch to, so bail out:
      if (!this.events.hasOwnProperty(event)) {
        return []
      }
      return this.events[event].map(callback => callback(data))
    }

    /**
     * Remove an event from queue.
     * @param {string} event
     * @return {void} undefined
     */
    unwatch(event) {
      this.events[event];
    }
  }

  var EMPTY_OBJECT = {};
  /**
   * A uuid to use as the property of the dataStore's state. This creates a pseudo-private
   */

  var dataStore = uuid();
  /**
   * A class to create a dataStore. This is used in conjunction with DataStoreComponent to create stateless components with external state management through a dataStore.
   */

  var DataStore =
  /*#__PURE__*/
  function () {
    function DataStore(props) {
      _classCallCheck(this, DataStore);

      this[dataStore] = undefined;
      this.observer = new Observer();
      this.state = props.state;
      this.events = {};
      this.events['dataStoreStateChanged'] = [];

      if (props.event) {
        this.events[props.event] = [];
      }
    }
    /**
     * @method This is a getter to access the component's state using the pseudo-private key dataStore.
     * @return {boolean | number | string | Object | any[]} The component's state
     */


    _createClass(DataStore, [{
      key: "dispatch",

      /**
       * @method This is a method to dispatch an event with data to a DataStoreComponent that is using a dataStore.
       * @param {string} event The name of the event that the component is watching.
       * @param {any} data Any data you want to send to the component.
       */
      value: function dispatch(event, data) {
        if (!event) {
          this.observer.dispatch('dataStoreStateChanged', data);
          this.observer.dispatch(event, data);
        } else {
          this.observer.dispatch(event, data);
        }
      }
      /**
       * @method This method sets up an observer to listener for the designated event and do something with any data passed along.
       * @param {string} event The event to watch.
       * @param {any} cb Any data that the event callback will need to handle.
       */

    }, {
      key: "watch",
      value: function watch(event, cb) {
        if (typeof event === 'string') {
          this.events[event] = [this.observer.watch(event, cb)];
        } else {
          this.events['dataStoreStateChanged'].push(this.observer.watch('dataStoreStateChanged', event));
        }
      }
      /**
       * @method Method to set a dataStore's state. This accepts simple types or Objects. If updating an array, you can pass in the data and the position (number) in the array to update. Optionally you can pass a callback, which receives the state as its argument. You need to return the state changes in order for the component to be updated.
       * @example Set state on a dataStore:
       * 
       * ```
       * this.setState(true)
       * this.setState(0)
       * this.setState({name: 'Joe'})
       * this.setState([1,2,3])
       * this.setState(prevState => prevState + 1)
       ```
       * @param {string | number | boolean | Object | any[] | Function} data The data to set. If a callback is passed as the argument to execute, it gets passed the previous state as its argument. You need to make sure the callback returns the final state or the component will not update.
       * @return {void} undefined
       */

    }, {
      key: "setState",
      value: function setState(data) {
        if (typeof data === 'function') {
          var copyOfState;
          copyOfState = mergeObjects(EMPTY_OBJECT, this.state);
          var newState = data.call(this, copyOfState);
          if (newState) this.state = newState;
        } else if (getType(this.state) === 'Object' && getType(data) === 'Object') {
          var _newState = mergeObjects(this.state, data);

          this.state = _newState;
        }
      }
      /**
       * Unwatch a custom event. This will not remove the default event--dataStoreStateChanged.
       * @param {string} event
       * @return {void} undefined
       */

    }, {
      key: "unwatch",
      value: function unwatch(event) {
        if (event !== 'dataStoreStateChanged') {
          delete this.events[event];
        }
      }
    }, {
      key: "state",
      get: function get() {
        return this[dataStore];
      }
      /**
       * @method This is a setter to define the component's state. It uses the dataStore object as a pseudo-private key. It uses requestAnimationFrame to throttle component updates to avoid layout thrashing.
       * @param {string | number | boolean | Object | any[]} data Data to set as component state.
       * @return {void} undefined
       */
      ,
      set: function set(data) {
        var _this = this;

        this[dataStore] = data;
        var self = this;

        if (this.events) {
          Object.keys(self.events).map(function (event) {
            if (event.length) {
              self.dispatch(event, _this.state);
            }
          });
        } // this.dispatch(this.event, this.state)

      }
    }]);

    return DataStore;
  }();

  exports.DataStore = DataStore;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
