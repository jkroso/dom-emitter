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
