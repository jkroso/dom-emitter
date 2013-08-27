# Dom-Emitter

A mixin class for managing the events of a MVC style View.

## Features

- stores all listeners making cleanup easy
- one DOM binding per event type
- intuitive delegation
- emits proper DOM events
- convenient method binding
- efficient context binding (no fn.bind(this))

## Installation

_With [component](//github.com/component/component), [packin](//github.com/jkroso/packin) or [npm](//github.com/isaacs/npm)_

    $ {package mananger} install jkroso/dom-emitter

then in your app:

```javascript
var Emitter = require('dom-emitter')
```

## API

### Emitter(object)

  mix `Emitter` methods on to `object`

### Emitter.on(type:String, [fn]:String)

  Bind `fn` to `type` events. When `fn` is `undefined`
  it will be inferred from `type`. Delegation can also be
  specified in `type` by leaving a space then a css
  selector which is relative to `this.el`.

```js
 this.on('click', this.onClick)
 this.on('click', 'onClick')
 this.on('click')     // implies "onClick"
 this.on('click .ok') // delegates to `.ok`
```

### Emitter.off(type:String, [method]:String)

  unbind `fn` from `type` events

  All the following are equivalent:

```js
this.off('click', this.onClick)
this.off('click', 'onClick')
this.off('click')
```

### Emitter.emit(topic:String, [data]:Object)

  Create a DOM event and send it down to `this.el`.
  Any data you pass will be merged with the event
  object.

```js
this.emit('mousedown')
this.emit('login', {user: user})
this.emit('keydown', {key: 'enter'})
```

### bind()

  hook into the DOM

### unbind()

  unhook from the DOM

### bindEvents(self:emitter)

  convenience function for binding all events