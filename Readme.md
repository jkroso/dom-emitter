# Dom Emitter

Designed to help manage dom events for a view. It can be inherited or as a standalone instance

Example standalone useage:

```js
function ButtonView () {
	this.el = document.createElement('div')
	this.events = new DomEmitter(this.el, this)
	this.events.on('click')
}
ButtonView.prototype.onClick = function(e) {
	this.el.style.backgroundColor = 'red'
}
```

Or the equivilant using inheritance:

```js
function ButtonView () {
	this.view = document.createElement('div')
	DomEmitter.call(this)
	this.on('click')
}
ButtonView.prototype.onClick = function(e) {
	this.view.style.backgroundColor = 'red'
}
```

## Getting Started

With component(1)

	$ component install jkroso/dom-emitter

## API

```javascript
var DomEmitter = require('dom-emitter')
```
  - [DomEmitter()](#domemitter)
  - [DomEmitter.on()](#domemitteroneventstringmethodstring)
  - [DomEmitter.off()](#domemitteroffeventstringmethodstring)
  - [DomEmitter.emit()](#domemitteremiteventstringdataany)
  - [DomEmitter.clear()](#domemittercleareventstring)

## DomEmitter()

  Initialize a `DomEmitter`
  
```js
new DomEmitter(document.body)
new DomEmitter(document.body, {
  onClick: console.log  
})
DomEmitter.call(this) // this.view will be the dom node
```

## DomEmitter.on(event:String, [method]:String)

  Bind to `event` with optional `method` name. When `method` is 
  undefined it becomes `event` with the "on" prefix. Delegation is 
  specified after the event name
  
```js
 events.on('click', 'onClick')
 events.on('click') // implies "onClick"
 events.on('click', function (e) {})
 events.on('click .ok') // will only trigger if the click happened within a child with .ok class
```

## DomEmitter.off([event]:String, [method]:String)

  Unbind a single binding
  
  All the following a equivilent:
  
```js
events.off('click', 'onClick')
events.off('click') // implies 'onClick'
events.off('click', events.onClick)
```

## DomEmitter.emit(event:String, data:Any)

  Create a DOM event and send it down to the DomEmitter's target
  
```js
manager.emit('mousedown', {clientX:50, clientY:50})
manager.emit('login', {user: user})
```

## DomEmitter.clear(event:String)

  Remove all bound functions
  
```js
this.clear() // removes all
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
