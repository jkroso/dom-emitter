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
