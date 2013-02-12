# Dom Emitter

Manage the events of a DOM element

```js
var body = new DomEmitter(document.body)
body.on('click', console.log)
body.emit('click', {x:50,y:112})
```
It is also designed for convenient use alongside a MVC style view. a.k.a presenter

```js
function Button () {
	this.view = document.createElement('button')
	this.events = new DomEmitter(this.view, this)
	this.events.on('click')
}
Button.prototype.onClick = console.log
new Button().events.emit('click', {x:50,y:112})
```

Custom events are handled the same way as native so you treat it just like a normal event emitter. The only difference is that events propogate up and down the DOM so you can bind to them above the target node.

## Getting Started

With component

	$ component install jkroso/dom-emitter --save

With npm

	$ npm install jkroso/dom-emitter --save

## API

```javascript
var DomEmitter = require('dom-emitter')
```
  - [DomEmitter()](#domemitter)
  - [DomEmitter.on()](#domemitterontypestringmethodstring)
  - [DomEmitter.off()](#domemitterofftypestringmethodstring)
  - [DomEmitter.emit()](#domemitteremiteventstringdataany)
  - [DomEmitter.clear()](#domemittercleareventstring)

## DomEmitter()

  Initialize a `DomEmitter`
  
```js
new DomEmitter(document.body, {
  onClick: console.log  
})
```

## DomEmitter.on(type:String, [method]:String)

  Bind to `type` with optional `method`. When `method` is 
  undefined it inferred from `type`. Delegation is can be
  specified in `type`
  
```js
 events.on('click', 'onClick')
 events.on('click') // implies "onClick"
 events.on('click', function (e) {})
 events.on('click .ok') // will only trigger if the click happened within a child with .ok class
```

## DomEmitter.off(type:String, [method]:String)

  Remove a single behaviour
  
  All the following are equivilent:
  
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
