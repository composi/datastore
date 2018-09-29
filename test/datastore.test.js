// @ts-nocheck
import { DataStore } from "../dist/datastore"

test("dataStore should exist.", function () {
  const dataStore = new DataStore({state: {boolean: true}})
  expect(typeof dataStore.events).toBe('object')
  expect(typeof dataStore.state).toBe('object')
})

test('dataStore should have default event: dataStoreStateChanged.', function () {
  const dataStore = new DataStore({ state: { boolean: true } })
  expect(dataStore.events).toHaveProperty('dataStoreStateChanged')
})

test('Should be able to get state of dataStore.', function() {
  const dataStore = new DataStore({state: {name: 'Joe'}})
  expect(dataStore.state).toEqual({ name: 'Joe' })
})

test('Should be able to update state of component with setState.', function() {
  const dataStore = new DataStore({ state: { name: 'Joe' } })
  expect(dataStore.state).toEqual({ name: 'Joe' })
  
  dataStore.setState(prevState => {
    prevState.name = 'Mary'
    return prevState
  })
  expect(dataStore.state.name).toBe('Mary')
})

test('dataStore.setState should merge provided object with state object.', function() {
  const dataStore = new DataStore({ state: { name: 'Joe' } })
  expect(dataStore.state).toEqual({ name: 'Joe' })
  
  dataStore.setState({job: 'mechanic'})
  expect(dataStore.state).toEqual({ name: 'Joe', job: 'mechanic' })
})

test('dataStore.setState should fire default event: dataStoreStateChanged', function() {
  let eventFired = false
  expect(eventFired).toBe(false)
  const dataStore = new DataStore({ state: 'some text' })
  dataStore.watch('dataStoreStateChanged', function () {
    eventFired = true
  })
  dataStore.setState(prevState => {
    prevState = 'changed text'
    return prevState
  })
  expect(dataStore.state).toBe('changed text')
})

test('Should be able to assign custom event to dataStore.', function() {
  const dataStore = new DataStore({state: 'whatever', event: 'special-event'})
  expect(dataStore.events).toHaveProperty('special-event')
})


let customEventFired = false
test('dataStore with custom event should fire when state is changed.', function() {
  const dataStore = new DataStore({state: {name: 'Joe'}, event: 'update-person'})
  expect(dataStore.state).toEqual({name: 'Joe'})
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
  const dataStore = new DataStore({ state: { name: 'Joe' }, event: 'update-person' })
  dataStore.watch('update-person', function (data) {
    expect(data).toEqual({ name: 'Joe', job: 'mechanic' })
  })
  dataStore.dispatch('update-person', { name: 'Joe', job: 'mechanic'})
})

test('dataStore with multiple events should all respond to setState.', function() {
  const dataStore = new DataStore({ state: { name: 'Joe' }, event: 'update-person' })

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
  const dataStore = new DataStore({ state: { name: 'Joe' }, event: 'update-person' })
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
