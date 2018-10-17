import { getType } from '@composi/get-type'
import { mergeObjects } from '@composi/merge-objects'
const EMPTY_OBJECT = {}
import { Observer } from '@composi/observer'

/**
 * A Symbol as the property of the dataStore's state. This creates a pseudo-private.
 */
const DATASTORE = Symbol()

/**
 * A Symbol as the property of the dataStore's version. This creates a pseudo-private.
 */
const VERSION = Symbol('vesion')

/**
 * A Symbol as the property of the dataStore's timestamp. This creates a pseudo-private.
 */
const TIMESTAMP = Symbol('timestamp')

/**
 * A class to create a dataStore. This is used in conjunction with DataStoreComponent to create stateless components with external state management through a dataStore.
 */
export class DataStore {
  /**
   * Constructor for DataStore.
   * @param {*} data Whatever data you want to store.
   */
  constructor(data) {
    this[DATASTORE] = undefined
    this.observer = new Observer()
    this.state = data
    this.events = {}
    this.events['dataStoreStateChanged'] = []
    this[VERSION] = 1
    this[TIMESTAMP] = new Date().getTime()
  }

  /**
   * @method This is a getter to access the component's state using the pseudo-private key dataStore.
   * @return {boolean | number | string | Object | any[]} The component's state
   */
  get state() {
    return this[DATASTORE]
  }

  /**
   * @method This is a setter to define the component's state. It uses the dataStore object as a pseudo-private key. It uses requestAnimationFrame to throttle component updates to avoid layout thrashing.
   * @param {string | number | boolean | Object | any[]} data Data to set as component state.
   * @return {void} undefined
   */
  set state(data) {
    this[DATASTORE] = data
    if (this.events) {
      Object.keys(this.events).map(event => {
        if (event.length) {
          this.dispatch(event, this.state)
        }
      })
    }
  }

  /**
   * Get the current version of the dataStore.
   * @return {number} number
   */
  get version() {
    return this[VERSION]
  }

  /**
   * Increase the dataStore version. Use this to update the version, bumping it one version higher.
   * @return {void} undefined
   */
  bumpVersion() {
    this[VERSION] = this[VERSION] + 1
  }

  get timestamp() {
    return this[TIMESTAMP]
  }

  /**
   * @method This is a method to dispatch an event with data to a DataStoreComponent that is using a dataStore.
   * @param {string} event The name of the event that the component is watching.
   * @param {any} data Any data you want to send to the component.
   */
  dispatch(event, data) {
    if (event === '' || !event) {
      this.observer.dispatch('dataStoreStateChanged', data)
    } else if (this.events[event]) {
      this.observer.dispatch(event, data)
    }
  }

  /**
   * @method This method sets up an observer to listener for the designated event and do something with any data passed along.
   * @param {string} event The event to watch.
   * @param {any} cb Any data that the event callback will need to handle.
   */
  watch(event, cb) {
    if (!event) {
      this.events['dataStoreStateChanged'].push(
        this.observer.watch('dataStoreStateChanged', cb)
      )
    } else if (typeof event === 'function') {
      this.events['dataStoreStateChanged'].push(
        this.observer.watch('dataStoreStateChanged', event)
      )
    } else {
      this.events[event] = [this.observer.watch(event, cb)]
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
  setState(data) {
    if (typeof data === 'function') {
      let copyOfState
      if (getType(this.state) === 'array') {
        copyOfState = JSON.parse(JSON.stringify(this.state))
      } else if (typeof this.state === 'object') {
        copyOfState = mergeObjects(EMPTY_OBJECT, this.state)
      } else {
        // Handle primitive types:
        copyOfState = this.state
      }
      const newState = data.call(this, copyOfState)
      if (newState) this.state = newState
    } else if (getType(this.state) === 'object' && getType(data) === 'object') {
      const newState = mergeObjects(this.state, data)
      this.state = newState
    }
  }

  /**
   * Unwatch a custom event. This will not remove the default event--dataStoreStateChanged.
   * @param {string} event
   * @return {void} undefined
   */
  unwatch(event) {
    if (event !== 'dataStoreStateChanged') {
      delete this.events[event]
      this.observer.unwatch(event)
    }
  }

  /**
   * Saves the current dataStore state in localStorage.
   * @return {Promise} Promise
   */
  putInLocalStorage() {
    return new Promise((resolve, reject) => {
      if (this.state) {
        localStorage.setItem('composi-datastore', JSON.stringify(this.state))
        localStorage.setItem('composi-datastore-version', this.version + '')
        localStorage.setItem('composi-datastore-timestamp', this.timestamp)
        resolve()
      } else {
        reject(new Error('Unable to save to localStorage.'))
      }
    })
  }

  /**
   * Rehydrate the dataStore with whatever was prevously saved from the dataStore in localStorage.
   * @return {Promise} Promise
   */
  getFromLocalStorage() {
    return new Promise((resolve, reject) => {
      const state = JSON.parse(localStorage.getItem('composi-datastore'))
      if (state) {
        this.state = state
        resolve()
      } else {
        reject(new Error('There was nothing in localStorage to retrieve.'))
      }
    })
  }
}
