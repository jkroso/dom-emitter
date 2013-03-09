# Dom Emitter

Manage the events of a DOM element.

## Features

- stores all listeners making cleanup easy
- one DOM binding per event type
- intuitive delegation
- emits proper DOM events
- convenient method binding
- efficient context binding (no fn.bind(this))

## Examples

```js
var body = new DomEmitter(document.body)
body.on('click', console.log)
body.emit('click', {x:50,y:112})
// => {type: 'click', x:50, y:112, ...}
```

It is also has a simple system for inferring methods from the name of the event:

```js
function Button () {
	this.view = document.createElement('button')
	this.events = new DomEmitter(this.view, this)
	this.events.on('click')
}
Button.prototype.onClick = console.log
new Button().events.emit('click', {x:50,y:112})
// => {type: 'click', x:50, y:112, ...}
```

Delegation. leave a space then write a CSS query:

```js
body.on('click > div.button') // infers "onClick"
```
Will only be triggered if a click occurs within a direct child of `document.body` that has a `tagName` of "div" and a "button" class.

Naming delegated functions can be a bit tricky so sometimes its more readable to declare them in an object:

```js
body.on({
	'click > div.button': console.log,
	'mousedown > div.button': function(e){
		e.delegate.style.backgroundColor = '#888'
	},
	'login': function(e){
		alert('Welcome!')
	}
})
```

## Getting Started

With component

	$ component install jkroso/dom-emitter

With npm

	$ npm install jkroso/dom-emitter --save

## API

```javascript
var DomEmitter = require('dom-emitter')
```
  - [DomEmitter()](#domemitter)
  - [DomEmitter.on()](#domemitterontypestringmethodstring)
  - [DomEmitter.off()](#domemitterofftypestringmethodstring)
  - [DomEmitter.once()](#domemitteronce)
  - [DomEmitter.emit()](#domemitteremittopicstringdataany)
  - [DomEmitter.clear()](#domemittercleartopicstring)

### DomEmitter()

  Initialize a `DomEmitter`. If you provide a `context`
  then that will be the source of implies methods. It 
  will also be `this` inside handlers.
  
```js
new DomEmitter(document.body, {
  onClick: console.log  
})
```

### DomEmitter.on(type:String, [method]:String)

  Bind to `type` with optional `method`. When `method` is 
  undefined it inferred from `type`. Delegation is can be
  specified in `type`
  
```js
 events.on('click', 'onClick')
 events.on('click') // implies "onClick"
 events.on('click', function (e) {})
 events.on('click .ok') // delegates to `.ok`
```

### DomEmitter.off(type:String, [method]:String)

  Remove a single behavior
  
  All the following are equivalent:
  
```js
events.off('click', 'onClick')
events.off('click') // implies 'onClick'
events.off('click', events.onClick)
```

### DomEmitter.once()

  Add listener but remove it after one call

### DomEmitter.emit(topic:String, [data]:Any)

  Create a DOM event and send it down to the DomEmitter's 
  target. Any data you pass will be merged with the event 
  object
  
```js
manager.emit('mousedown')
manager.emit('login', {user: user})
manager.emit('keydown', {key: 'enter'})
```

### DomEmitter.clear([topic]:String)

  Remove all bound functions.
  Optionally limited to a certain topic
  
```js
this.clear() // all
this.clear('click') // just click handlers
```

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Jakeb Rosoman

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
