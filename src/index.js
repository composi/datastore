import { uuid } from '@composi/uuid'
import { getType } from '@composi/get-type'
import { mergeObjects } from '@composi/merge-objects'
const EMPTY_OBJECT = {}
import { Observer } from '@composi/observer'

/**
 * A uuid to use as the property of the dataStore's state. This creates a pseudo-private
 */
const dataStore = uuid()

/**
 * A class to create a dataStore. This is used in conjunction with DataStoreComponent to create stateless components with external state management through a dataStore.
 */
export class DataStore {
  constructor(props) {
    this[dataStore] = undefined
    this.observer = new Observer()
    this.state = props.state
    this.events = {}
    this.events['dataStoreStateChanged'] = []
    if (props.event) {
      this.events[props.event] = []
    }
  }

  /**
   * @method This is a getter to access the component's state using the pseudo-private key dataStore.
   * @return {boolean | number | string | Object | any[]} The component's state
   */
  get state() {
    return this[dataStore]
  }

  /**
   * @method This is a setter to define the component's state. It uses the dataStore object as a pseudo-private key. It uses requestAnimationFrame to throttle component updates to avoid layout thrashing.
   * @param {string | number | boolean | Object | any[]} data Data to set as component state.
   * @return {void} undefined
   */
  set state(data) {
    this[dataStore] = data
    const self = this
    if (this.events) {
      Object.keys(self.events).map(event => {
        if (event.length) {
          self.dispatch(event, this.state)
        }
      })
    }
    // this.dispatch(this.event, this.state)
  }

  /**
   * @method This is a method to dispatch an event with data to a DataStoreComponent that is using a dataStore.
   * @param {string} event The name of the event that the component is watching.
   * @param {any} data Any data you want to send to the component.
   */
  dispatch(event, data) {
    if (!event) {
      this.observer.dispatch('dataStoreStateChanged', data)
      this.observer.dispatch(event, data)
    } else {
      this.observer.dispatch(event, data)
    }
  }

  /**
   * @method This method sets up an observer to listener for the designated event and do something with any data passed along.
   * @param {string} event The event to watch.
   * @param {any} cb Any data that the event callback will need to handle.
   */
  watch(event, cb) {
    if (typeof event === 'string') {
      this.events[event] = [this.observer.watch(event, cb)]
    } else {
      this.events['dataStoreStateChanged'].push(
        this.observer.watch('dataStoreStateChanged', event)
      )
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
      copyOfState = mergeObjects(EMPTY_OBJECT, this.state)
      const newState = data.call(this, copyOfState)
      if (newState) this.state = newState
    } else if (getType(this.state) === 'Object' && getType(data) === 'Object') {
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
    }
  }
}
