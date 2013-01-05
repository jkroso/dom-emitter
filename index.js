var bind = require('event').bind
  , unbind = require('event').unbind
  , delegate = require('delegate').bind
  , match = require('delegate').match
  , Emitter = require('emitter')
  , on = Emitter.prototype.on
  , off = Emitter.prototype.off
  , emit = Emitter.prototype.emit
  , mouse = require('dom-event').mouse
  , keyboard = require('dom-event').key
  , custom = require('dom-event').custom

module.exports = DomEmitter

/**
 * Initialize a `DomEmitter`
 *
 *   new DomEmitter(document.body)
 *   new DomEmitter(document.body, {
 *     onClick: console.log  
 *   })
 *   DomEmitter.call(this) // this.view will be the dom node
 *   
 * @param {Object} [view=this.view]
 * @param {Object} [context=this]
 * @api public
 */

function DomEmitter(view, context) {
	Emitter.call(this)
	this.view || (this.view = view)
	this._context = context || this
	this._handlers = {}
}

/**
 * Bind to `event` with optional `method` name. When `method` is 
 * undefined it becomes `event` with the "on" prefix. Delegation is 
 * specified after the event name
 *
 *    events.on('click', 'onClick')
 *    events.on('click') // implies "onClick"
 *    events.on('click', function (e) {})
 *    events.on('click .ok') // will only trigger if the click happened within a child with .ok class
 *
 * @param {String} event
 * @param {String} [method]
 * @return {Function} the function that was subscribed
 * @api public
 */

DomEmitter.prototype.on = function(event, method){
	var parsed = parse(event)
	  , name = parsed.name
	  , handler = this._handlers[name]
	  , self = this

	if (typeof method === 'string')
		method = this._context[method]
	else if (!method)
		method = this._context['on' + capitalize(name)]

	if (!method) throw new Error('Can\'t find a method')

	if (!handler) {
		handler = this._handlers[name] = function dispatcher (e) {
			emit.call(self, name, e)
			var selectors = dispatcher.selectors
			if (selectors) {
				for (var i = 0, len = selectors.length; i < len; i++) {
					if (e.delegateTarget = match(e.target, this, selectors[i]))
						emit.call(self, name+' '+selectors[i], e)
				}
			}
		}
		handler.deps = 0
		bind(this.view, name, handler)
	}
	handler.deps++
	
	if (parsed.selector)
		handler.selectors = (handler.selectors || []).concat(parsed.selector)

	on.call(this, event, method, this._context)

	return method
}

/*!
 * Uppercase the first letter
 * @api private
 */
function capitalize (word) {
	return word[0].toUpperCase() + word.slice(1)
}

/**
 * Unbind a single binding
 * 
 * All the following a equivilent:
 *
 *   events.off('click', 'onClick')
 *   events.off('click') // implies 'onClick'
 *   events.off('click', events.onClick)
 *
 * @param {String} [event]
 * @param {String} [method]
 * @return {Function} callback
 * @api public
 */

DomEmitter.prototype.off = function(event, method){
	var parsed = parse(event)
	  , name = parsed.name
	  , handler = this._handlers[name]

	if (typeof method === 'string') {
		method = this._context[method]
	}
	else if (!method) {
		method = this._context['on' + capitalize(name)]
	}
	if (!method) throw new Error('Can\'t find a method')

	if (--handler.deps <= 0) {
		delete this._handlers[name]
		unbind(this.view, name, handler)
	}

	return method
}

/*!
 * Is it a native mouse event
 */
var mouseRegex = /^mouse(?:up|down|move|o(?:ver|ut)|enter|leave)|(?:dbl)?click$/

/*!
 * Is it a native keyboard event
 * Extract the keys title while we are at it
 */
var keyRegex = /^key(up|down|press) +([\w\/]+(?: \w+)?)$/

/**
 * Create a DOM event and send it down to the DomEmitter's target
 *
 *   manager.emit('mousedown', {clientX:50, clientY:50})
 *   manager.emit('login', {user: user})
 * 
 * @param {String} event type
 * @param {Any} data to merged with the dom event object
 */
DomEmitter.prototype.emit = function (topic, data) {
	var match, event
	if (match = mouseRegex.exec(topic))
		event = mouse(topic, data)
	else if (match = keyRegex.exec(topic))
		event = keyboard(match[1], match[2], data)
	else
		event = custom(topic, data)
	this.view.dispatchEvent(event)
}

/**
 * Remove all bound functions
 *
 *   this.clear() // removes all
 *   this.clear('click') // just click handlers
 *
 * @param {String} event if you want to limit to a certain type
 * @api public
 */
DomEmitter.prototype.clear = function (event) {
	if (event == null) {
		for (event in this._callbacks)
			this.clear(event)
	}
	else {
		var handlers = this._callbacks[event]
		  , i = handlers.length
		while (i--)
			if (typeof handlers[i] === 'function') 
				this.off(event, handlers[i])
	}
}

/**
 * Parse event / selector string.
 *
 * @param {String} string
 * @return {Object}
 * @api private
 */

function parse(str) {
	str = str.split(' ')
	var event = str.shift()
	return { name: event, selector: str.join(' ') }
}