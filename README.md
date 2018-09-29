# @composi/data-store
A class providing a simple dataStore for state management.

## Install

Run:

```sh
npm i -D @composi/data-store
```

## Create a DataStore

First you need to import DataStore into your project. Then you need to create an instance. When doing so, you pass the data you want the dataStore to use. You can also optionally provide a custom event name.

DataStore expects data to be in a particular format--an object literal with the property `state`. You assign the data you want to use to that state property. The value of state can be any valid JavaScript data: boolean, null, undefined, string, array, object, set, weak set, map, weak map. You can also provide an `event` property to define a custom event for the dataStore. If no event is provided, the dataStore will use the default event `dataStoreStateChanged`.

```javascript
import { DataStore } from '@composi/data-store'

// Some data for the dataStore.
const fruits = [
  {
    key: 101,
    value: 'Apples'
  },
  {
    key: 102,
    value: 'Oranges'
  },
  {
    key: 103,
    value: 'Bananas'
  }
]

// Initialize the dataStore.
// We provide a custom event as well.
const dataStore = new DataStore({
  state: fruits,
  event: 'fruits-updated'
})
```

We can check that our dataStore contains our fruits by checking its `state` property:

```javascript
console.log(dataStore.state[0].value) // Apples
console.log(dataStore.state[1].value) // Oranges
console.log(dataStore.state[2].value) // Bananas
```

In the above example our dataStore state was an array. In fact the state and by any type: boolean, string, number, array or object. For complex state you'll probably need an object with many different properties.


## DataStore Events

As we showed above, you can provide you dataStore with a custom event. However, if you do not provide an event, the dataStore will use its default, which is `dataStoreStateChanged`.

You can assign multiple events to the same dataStore. You can even create multiple watchers for the save event. You can activate any event watcher by [dispatching its event](#dispatch), or by manipulating the dataStore's state with the `setState` method.

## watch

You can tell an event what to do when it event occurrs. There are two things that cause the event to occur: changing the dataStore's state with [setState](#setState) and calling the dataStore's [dispatch](#dispatch) method.

For now we are going to look at how to set up a watcher for a dataStore. The `watch` method takes two arguments: an event and a callback to fire. Optionally you can just provide a callback. The dataStore will then use its current event for the callback. The callback gets one parameter: any data passed with the event. In the case of [setState](#setState), this will be the new state after changes were made.

```javascript
import { DataStore } from '@composi/data-store'

// Some data for the dataStore.
const fruits = [
  {
    key: 101,
    value: 'Apples'
  },
  {
    key: 102,
    value: 'Oranges'
  },
  {
    key: 103,
    value: 'Bananas'
  }
]

// Initialize the dataStore.
// We provide a custom event as well.
const dataStore = new DataStore({
  state: fruits
})

// Create a watcher.
// We'll provide a custom event here.
dataStore.watch('fruits-updated', data => {
  console.log('The event fired. The new data is:')
  console.log(data)
})
```

Now, if we update the data in the list, we will see the results in the console. To update the dataStore's state we need to know how to use `setState`. 

### Using the Default Event

When setting up a watcher, if you use a falsy value for the event, the dataStore will use the default event `dataStoreStateChanged`. Possible falsy values are: `null`, `undefined`, `false`, `0` and `''`.

```javascript
// Set up a watcher for `dataStoreStateChanged`:
dataStore.watch(null, () => {
  console.log('The event "dataStoreStateChanged" was received by this watcher.')
})
```

For sure you could also just use `dataStoreStateChanged`, but falsy values are much shorter.

## setState

DataStores let you change their state through use of their `setState` method. There are two ways to use it. You can pass it an object or you can use a callback. In the case of passing an object as its arugment, the dataStore will merge the object with its state object. 

### Merging Object into DataStore's State

```javascript
import { DataStore } from '@composi/data-store'

const dataStore = new DataStore({
  state: {
    name: 'Shelly'
  }
})

// Merge new object into dataStore's state:
dataStore.setState({job: 'lab technician'})

dataStore.state // {name: 'Shelly', job: 'lab technician'}
```

### setState with Callback

You can also use a callback with `setState`. This allows you do do more things in order to update the dataStore state as need. The callback gets the previous state of the dataStore passed as its argument. You operate on this copy of the dataStore's state. When you are done, you return it. If you forget to return the previous state, the dataStore's state will not get updated.

```javascript
import { DataStore } from '@composi/data-store'

const dataStore = new DataStore({
  state: {
    name: 'Shelly'
  }
})

// Merge new object into dataStore's state:
dataStore.setState(prevState => {
  prevState.job = 'lab technician'
  // Return prevState so that the changes register:
  return prevState
})

dataStore.state // {name: 'Shelly', job: 'lab technician'}
```

When you use `setState` to manipulate the dataStore's state, all watchers that you have setup for that dataStore will respond to the changes.

## dispatch

You can dispatch and event that your dataStore is watching. This will cause its watcher to execute with any data you passed with the event.

```javascript
import { DataStore } from '@composi/data-store'

const dataStore = new DataStore({
  state: {
    name: 'Joe'
  }
})

// Add a watcher:
dataStore.watch('update-person', data => {
  console.log('The event "update-person" was fired. The data received is:')
  console.log(data)
})

// Dispatch event with data:
dataStore.dispatch('update-person', {name: 'Mary'})
// The event "update-person" was fired. The data received is:
// {name: 'Mary'}
```

## unwatch

You may want a watcher to exist for a limited time, after which you would like to remove it. You can do that with the `unwatch` method. It takes on argument--the event to unwatch. This deletes it from the dataStore's events property. This also means that all watchers for that event will cease to function.

Please note that you can only unwatch custom events. You can't unwatch the event `dataStoreStateChanged` because it is the default. 

```javascript
import { DataStore } from '@composi/data-store'

const dataStore = new DataStore({
  state: {
    name: 'Joe'
  }
})

// Add a watcher:
dataStore.watch('update-person', data => {
  console.log('The event "update-person" was fired. The data received is:')
  console.log(data)
})

// Dispatch event with data:
dataStore.dispatch('update-person', {name: 'Mary'})
// The event "update-person" was fired. The data received is:
// {name: 'Mary'}

// Unwatch event:
dataStore.unwatch('update-person')

// Dispatching the unwatched event will have no effect:
dataStore.dispatch('update-person', {name: 'Sam'})
```
