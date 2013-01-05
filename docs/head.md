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
