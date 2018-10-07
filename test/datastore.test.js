// @ts-nocheck
import { DataStore } from "../dist/datastore"

test("dataStore should exist.", function () {
  const dataStore = new DataStore({ boolean: true })
  expect(typeof dataStore.events).toBe('object')
  expect(typeof dataStore.state).toBe('object')
})

test('dataStore should have default event: dataStoreStateChanged.', function () {
  const dataStore = new DataStore({ boolean: true })
  expect(dataStore.events).toHaveProperty('dataStoreStateChanged')
})

test('Should be able to get state of dataStore.', function() {
  const dataStore = new DataStore({ name: 'Joe' })
  expect(dataStore.state).toEqual({ name: 'Joe' })
})

test('Should be able to update state of component with setState.', function() {
  const dataStore = new DataStore({ name: 'Joe' })
  expect(dataStore.state).toEqual({ name: 'Joe' })
  
  dataStore.setState(prevState => {
    prevState.name = 'Mary'
    return prevState
  })
  expect(dataStore.state.name).toBe('Mary')
})

test('dataStore.setState should merge provided object with state object.', function() {
  const dataStore = new DataStore({ name: 'Joe' })
  expect(dataStore.state).toEqual({ name: 'Joe' })
  
  dataStore.setState({job: 'mechanic'})
  expect(dataStore.state).toEqual({ name: 'Joe', job: 'mechanic' })
})

test('dataStore.setState should fire default event: dataStoreStateChanged', function() {
  let eventFired = false
  expect(eventFired).toBe(false)
  const dataStore = new DataStore({ state: 'some text' })
  // Use any falsy value as event argument:
  dataStore.watch('', function () {
    eventFired = true
  })
  dataStore.setState(prevState => {
    prevState = 'changed text'
    return prevState
  })
  expect(dataStore.state).toBe('changed text')
  expect(eventFired).toBe(true)
})


let customEventFired = false
test('dataStore with custom event should fire when state is changed.', function() {
  const dataStore = new DataStore({ name: 'Joe' })
  expect(dataStore.state).toEqual({ name: 'Joe' })
  dataStore.watch('update-person', function (data) {
    customEventFired = true
    expect(data).toEqual({ name: 'Joe', job: 'mechanic' })
  })
  
  dataStore.setState(prevState => {
    prevState.job = 'mechanic'
    return prevState
  })
  expect(customEventFired).toBe(true)
  expect(dataStore.state).toEqual({name: 'Joe', job: 'mechanic'})
})

test('dataStore should fire its custom event when dispatched.', function() {
  const dataStore = new DataStore({ name: 'Joe' })
  dataStore.watch('update-person', function (data) {
    expect(data).toEqual({ name: 'Joe', job: 'mechanic' })
  })
  dataStore.dispatch('update-person', { name: 'Joe', job: 'mechanic'})
})

test('dataStore with multiple events should all respond to setState.', function() {
  const dataStore = new DataStore({ name: 'Joe' })

  dataStore.watch('update-person', function (data) {
    expect(data).toEqual({ name: 'Joe', job: 'mechanic' })
  })
  dataStore.watch('', function(data) {
    expect(data).toEqual({ name: 'Joe', job: 'mechanic' })
  })
  dataStore.setState(prevState => {
    prevState.job = 'mechanic'
    return prevState
  })
})
test('Should be able to unwatch a custom event.', function() {
  let count = 0
  const dataStore = new DataStore({ name: 'Joe' })
  dataStore.watch('update-person', function (data) {
    count += 1
    expect(data).toEqual({ name: 'Joe', job: 'mechanic' })
  })
  dataStore.watch('update-person', function (data) {
    expect(data).toEqual({ name: 'Joe', job: 'mechanic' })
  })
  dataStore.unwatch('dataStoreStateChanged', function(data) {
    expect(data).toEqual({ name: 'Joe', job: 'mechanic' })
  })
  dataStore.dispatch('update-person', { name: 'Joe', job: 'mechanic' })
  dataStore.setState({ name: 'Joe', job: 'mechanic' })
  expect(dataStore.state).toEqual({ name: 'Joe', job: 'mechanic' })
  expect(dataStore.events).toHaveProperty('dataStoreStateChanged')
  expect(count).toEqual(0)
})

test('dataStore should be able to hold an array.', function() {
  const numbers = [1,2,3]
  const dataStore = new DataStore(numbers)
  expect(Array.isArray(dataStore.state)).toBe(true)
})

test('Should be able to update dataStore state when it is an array.', function() {
  const numbers = [1, 2, 3]
  const dataStore = new DataStore(numbers)
  expect(dataStore.state.length).toBe(3)
  dataStore.setState(prevState => {
    prevState.push(4)
    return prevState
  })
  expect(dataStore.state.length).toBe(4)
  expect(dataStore.state[3]).toBe(4)
})

test('dataStore should be able to hold an object.', function () {
  const person = {
    name: 'Joe'
  }
  const dataStore = new DataStore({
    state: person
  })
  expect(!Array.isArray(dataStore.state) && typeof dataStore.state === 'object').toBe(true)
})

test('Should be able to update dataStore state when it is an object.', function() {
  const person = {
    name: 'Joe'
  }
  const dataStore = new DataStore(person)
  expect(dataStore.state.name).toBe('Joe')
  dataStore.setState(prevState => {
    prevState.name = 'Ellen'
    prevState.job = 'physician'
    return prevState
  })
  expect(dataStore.state.name).toBe('Ellen')
  expect(dataStore.state.job).toBe('physician')
})

test('dataStore should be able to hold primitive types.', function () {
  const dataStoreBoolean = new DataStore(true)
  const dataStoreString = new DataStore('some text')
  const dataStoreNumber = new DataStore(123)

  expect(dataStoreBoolean.state).toBe(true)
  expect(dataStoreString.state).toBe('some text')
  expect(dataStoreNumber.state).toBe(123)
})
