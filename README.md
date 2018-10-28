# @composi/datastore
A class providing a simple dataStore for state management.

## Install

Run:

```sh
npm i -D @composi/datastore
```

## Create a DataStore

First you need to import DataStore into your project. Then you need to create an instance. When doing so, you pass the data you want the dataStore to use. You can also optionally provide a custom event name.

Just pass whatever data you need to use to DataStore. The value can be any valid JavaScript type: boolean, null, undefined, string, array, object, set, weak set, map, weak map.

```javascript
import { DataStore } from '@composi/datastore'

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
const dataStore = new DataStore(fruits)
```

We can check that our dataStore contains our fruits by checking its `state` property:

```javascript
console.log(dataStore.state[0].value) // Apples
console.log(dataStore.state[1].value) // Oranges
console.log(dataStore.state[2].value) // Bananas
```

In the above example our dataStore state was an array. In fact the state and by any type: boolean, string, number, array or object. For complex state you'll probably need an object with many different properties.


## DataStore Events

You can provide your dataStore with a custom event. However, if you do not provide an event, the dataStore will use its default, which is `dataStoreStateChanged`. You indicate what event you want to use when you set up a watcher, as described below.

You can assign multiple events to the same dataStore. You can even create multiple watchers for the save event. You can activate any event watcher by [sending its event](#send), or by manipulating the dataStore's state with the `setState` method.

## watch

You can tell an event what to do when an event occurrs. There are two things that cause the event to occur: changing the dataStore's state with [setState](#setState) and calling the dataStore's [send](#send) method.

For now we are going to look at how to set up a watcher for a dataStore. The `watch` method takes two arguments: an event and a callback to fire. Optionally you can just provide a callback. The dataStore will then use its current event for the callback. The callback gets one parameter: any data passed with the event. In the case of [setState](#setState), this will be the new state after changes were made.

```javascript
import { DataStore } from '@composi/datastore'

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
const dataStore = new DataStore(fruits)

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

You can setup the watch with just the callback to use the default event:

```javascript
// Set up a watcher to use default event `dataStoreStateChanged`:
dataStore.watch(() => {
  console.log('The event "dataStoreStateChanged" was received by this watcher.')
})
```

## setState

DataStores lets you change their state through use of their `setState` method. There are two ways to use it. You can pass it an object or you can use a callback. In the case of passing an object as its arugment, the dataStore will merge the object with its state object. Consequently, if your state is not an object, but a string, number or array, this will not work. 

### Merging an Object into DataStore's State

```javascript
import { DataStore } from '@composi/datastore'

const dataStore = new DataStore({
  name: 'Shelly'
})

// Merge new object into dataStore's state:
dataStore.setState({job: 'lab technician'})

dataStore.state // {name: 'Shelly', job: 'lab technician'}
```

### setState with Callback

You can also use a callback with `setState`. This allows you do do more things in order to update the dataStore state as needed. The callback gets the previous state of the dataStore passed as its argument. You operate on this copy of the dataStore's state. When you are done, you return it. If you forget to return the previous state, the dataStore's state will not get updated.

```javascript
import { DataStore } from '@composi/datastore'

const dataStore = new DataStore({
  name: 'Shelly'
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

## send

You can send an event that your dataStore is watching. This will cause its watcher to execute with any data you passed with the event. Watchers for other events will not respond. Since it is possible to have multiple watchers for the same event, sending to their event will cause all of them to respond.

```javascript
import { DataStore } from '@composi/datastore'

const dataStore = new DataStore({
  name: 'Joe'
})

// Add a watcher:
dataStore.watch('update-person', data => {
  console.log('The event "update-person" was fired. The data received is:')
  console.log(data)
})

// send event with data:
dataStore.send('update-person', {name: 'Mary'})
// The event "update-person" was fired. The data received is:
// {name: 'Mary'}
```

## unwatch

You may want a watcher to exist for a limited time, after which you would like to remove it. You can do that with the `unwatch` method. It takes one argument--the event to unwatch. This deletes it from the dataStore's events property. This also means that all watchers for that event will cease to function.

Please note that you can only unwatch custom events. You can't unwatch the event `dataStoreStateChanged` because it is the default. 

```javascript
import { DataStore } from '@composi/datastore'

const dataStore = new DataStore({
  name: 'Joe'
})

// Add a watcher:
dataStore.watch('update-person', data => {
  console.log('The event "update-person" was fired. The data received is:')
  console.log(data)
})

// Send event with data:
dataStore.send('update-person', {name: 'Mary'})
// The event "update-person" was fired. The data received is:
// {name: 'Mary'}

// Unwatch event:
dataStore.unwatch('update-person')

// Sending the unwatched event will have no effect:
dataStore.send('update-person', {name: 'Sam'})
```

# Persisting Your Data

Sometimes you need to persist some data between user sessions. @composi/datastore provides two methods to make this possible. These are promise-based methods, so they require use of thenables. This makes putting and getting from localStorage non-blocking.

## putInLocalStorage

This persists the dataStore's state in localStorage. It uses the key `composi-datastore` for what it saves. You can set up a watcher to persist state whenever it changes:

```javascript
// import { DataStore } from '@composi/datastore'

// Create empty dataStore:
const dataStore = new DataStore
// Create a watcher to persist state in localStorage.
// Here we're using the default event `dataStoreStateChanged`.
// When the state changes, it will run this watcher,
// which tells the dataStore to put its state in localStorage.
dataStore.watch(() => {
  dataStore.putInLocalStorage()
})
```

As we mentioned, this is promise-based. So, if you wanted to do somehting when the put was complete, you would need to use a thenable:

```javascript
dataStore.watch(() => {
  dataStore.putInLocalStorage()
})
  .then(() => console.log('Successfully saved dataStore state in localStorage.'))
```

LocalStorage is very limited. It can't store binary data, only strings. So this method converts your dataStore data to a string using JSON.stringify. Although this is convenient for smaller amounts of data, localStorage is not practical when you have thousands items. 

If you need something more robust than localStorage, you might want to use [@composi/idb](https://www.npmjs.com/package/@composi/idb). This is a promise-based wrapper around IndexedDB with a simple API like localStorage. You could use it to persist your dataStore state in a watcher:

```javascript
dataStore.watch(() => {
  idb.set('my-datastore', dataStore.state)
})
```

## getFromLocalStorage

You can hydrate your dataStore at load time with data you stored in localStorage using `putInLocalStorage` in a previous session. This is great for simple data persistence needs, especially in early developemnt. Using this technique during development helps you achieve something similar to Hot Module Reloading. Just make sure that the app's UI is based on its dataStore state. That way, when there is a browser refresh during development, the saved data will enable the same UI state to be reloaded.

### Warning
When trying to hydrate a dataStore with `getFromLocalStorage`, if there is no data in it, this will throw an error. If you want to provide fallback data, you'll need to do that in a `catch` statement. Notice how we do this below:

```javascript
import { h, render } from '@composi/core'
import { DataStore } from '@composi/datastore'

// Create empty dataStore:
const dataStore = new DataStore()
// Setup watcher to render component when state changes:
dataStore.watch('update-list', () => {
  render(<List data={dataStore.state}/>, 'section')
})

// Try to rehydrate dataStore from localStorage.
dataStore.getFromLocalStorage()
  .then(data => {
    if (data) {
      dataStore.setState(prevState => {
        prevState = data
        return prevState
      })
    }
  })
  // If there was no data in localStorate, 
  // the Promise will throw.
  // We catch that here and provide default data.
  // Because we're using setState on the dataStore,
  // this fires the watcher defined above,
  // rendering the component with default data.
  .catch(() => {
    dataStore.setState(prevState => {
      prevState = fruits
      return prevState
    })
    dataStore.putInLocalStorage()
  })
```

## Example of Data Persistence

Here's a complete example using `getFromLocalStorage` to hydrate a dataStore, while also providing a fallback with default data:

```javascript
import { h, render } from '@composi/core'
import { DataStore } from '@composi/datastore'

const refs = {}

function uuid() {
  return Math.random().toString(16).substring(2, 16)
}

// Default data to use.
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

// Create an empty dataStore:
const dataStore = new DataStore()

// Setup a watcher to render the component when state changes:
dataStore.watch('update-list', () => {
  render(<List data={dataStore.state}/>, 'section')
})

// Hydrate dataStore with data from localStorage:
dataStore.getFromLocalStorage()
  .then(data => {
    // If there was data retrieved from localStorage,
    // add it to dataStore, which will trigger the watcher.
    if (data) {
      dataStore.setState(prevState => {
        prevState = data
        return prevState
      })
    }
  })
  // If localStorage has no data,
  // this is the first time loading.
  // In that case give the dataStore some default data.
  .catch(() => {
    dataStore.setState(prevState => {
      prevState = fruits
      return prevState
    })
    dataStore.putInLocalStorage()
  })

// Define component to render.
function List({data}) {
  const createInputRef = input => {
    if (input)
    refs.input = input
  }
  const addItem = () => {
    const value = refs.input && refs.input.value
    if (value) {
      dataStore.setState(prevState => {
        prevState.push({
          key: uuid(),
          value
        })
        return prevState
      })
      refs.input.value = ''
      refs.input.focus()
      // When data is add, save to localStorage.
      dataStore.putInLocalStorage()
        .then(() => console.log('Successfully put stuff into localStorage!'))
    } else {
      alert('Please provide a value before submitting.')
    }
  }
  function deleteItem(key) {
    dataStore.setState(prevState => {
      const state = prevState.filter(item => item.key != key)
      return state
    })
    // When an item is deleted, 
    // save new state to localStorage.
    dataStore.putInLocalStorage()
      .then(() => console.log('Successfully persisted removal of item in localStorage!'))
  }
  return (
    <div>
      <p>
        <input onmount={createInputRef} type="text"/>
        <button onclick={addItem}>Add</button>
      </p>
      <ul>
        {
          data.map(item => <li key="item.key">
            <span>{item.value}</span>
            <button onclick={() => deleteItem(item.key)} className="delete-item">X</button>
          </li>)
        }
      </ul>
    </div>
  )
}
```


## version

A dataStore has a version. At instantiation time it has a version of 1. You can check the version of a dataStore like this:

```javascript
console.log(dataStore.version) // 1
```
You can bump the version using `bumpVersion`. This bumps the version by 1.

```
dataStore.bumpVersion()
console.log(dataStore.version) // 2
dataStore.bumpVersion()
console.log(dataStore.version) // 3
```
It's up to you to decide when and how the version gets bumped. Maybe you never need to.

When you save your dataStore state to localStorage with `putInLocalStorage` it also saves the dataStore's current version with the key `composi-datastore-version`. You can get this key from localStorage to see how many times the version was bumped.

```javascript
const dataStoreKey = localStorage.getItem('composi-datastore-version')
```

## timestamp

Each time you save your dataStore state to localStorage with `putInLocalStorage`, it also saves a timestamp with the key `composi-datastore-timestamp`. You can retrieve that timestamp from localStorage at load time to see when was the last time the dataStore was backed up. If the timestamp shows that the data is quite stale, you may choose to clear localStorage and populate it with new data.

```javascript
// After page load:
const timestamp = localStorage.getItem('composi-datastore-timestamp')
const currentTime = new Date().getTime()
// One day in milliseconds.
const day = 1000 * 60 * 60 * 24
// Test to see if timestamp is more than 30 days.
// If it is, clear localStorage:
if ((currentTime - timestamp) / day > 30) {
  // Remove the dataStore's key/value.
  localStorage.removeItem('composi-datastore')
  dataStore.putInLocalStorage()
}
```
