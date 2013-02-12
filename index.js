var bind = require('event').bind
  , unbind = require('event').unbind
  , match = require('delegate').match
  , domEvent = require('dom-event')
  , mouseEvent = domEvent.mouse
  , keyEvent = domEvent.key
  , customEvent = domEvent.custom

module.exports = DomEmitter

/**
 * Initialize a `DomEmitter`
 *
 *   new DomEmitter(document.body, {
 *     onClick: console.log  
 *   })
 *   
 * @param {Object} view
 * @param {Object} context
 */

function DomEmitter(view, context) {
	this.__view__ = view
	this.__context__ = context || {}
	this.__domBindings__ = {}
	this.behaviours = {}
}

/**
 * Bind to `type` with optional `method`. When `method` is 
 * undefined it inferred from `type`. Delegation is can be
 * specified in `type`
 *
 *    events.on('click', 'onClick')
 *    events.on('click') // implies "onClick"
 *    events.on('click', function (e) {})
 *    events.on('click .ok') // will only trigger if the click happened within a child with .ok class
 *
 * @param {String} type
 * @param {String} [method]
 * @return {Function} acts as a key to remove the behaviour
 * @api public
 */

DomEmitter.prototype.on = function(type, method){
	var parsed = parse(type)
	  , name = parsed.name
	  , binding = this.__domBindings__[name]

	// lookup a function if one wasn't passed
	if (typeof method !== 'function') {
		method = getMethod(method, name, this.__context__)
	}

	// bind to the dom
	if (!binding) {
		var self = this
		binding = this.__domBindings__[name] = function dispatcher (e) {
			emit(self.__context__, self.behaviours[name], e)
			
			var selectors = dispatcher.selectors
			for (var i = 0, len = selectors.length; i < len; i++) {
				if (e.delegateTarget = match(e.target, this, selectors[i])) {
					emit(self.__context__, self.behaviours[name+' '+selectors[i]], e)
				}
			}
		}
		binding.deps = 0
		binding.selectors = []
		bind(this.__view__, name, binding)
	}

	// keep count of the number of subscriptions depending on
	// this dom binding
	binding.deps++
	
	if (parsed.selector) {
		binding.selectors = binding.selectors.concat(parsed.selector)
	}

	addBehavior(this.behaviours, type, method)

	return method
}

function getMethod (name, type, context) {
	name = typeof name === 'string'
		? context[name]
		: context['on' + type[0].toUpperCase() + type.slice(1)]
	if (!name) throw new Error('Can\'t find a method for '+type)
	return name
}

function emit (context, handlers, data) {
	if (!handlers) return 
	var i = handlers.length
	while (i--) {
		handlers[i].call(context, data)
	}
}

function addBehavior (hash, name, fn) {
	if (hash[name]) hash[name] = hash[name].concat(fn)
	else hash[name] = [fn]
}

function removeBehaviour (hash, name, fn) {
	if (hash[name]) hash[name] = hash[name].filter(function (a) {
		return a !== fn
	})
	else delete hash[name]
}

/**
 * Remove a single behaviour
 * 
 * All the following are equivilent:
 *
 *   events.off('click', 'onClick')
 *   events.off('click') // implies 'onClick'
 *   events.off('click', events.onClick)
 *
 * @param {String} type
 * @param {String} [method]
 */

DomEmitter.prototype.off = function(type, method){
	var parsed = parse(type)
	  , name = parsed.name
	  , binding = this.__domBindings__[name]

	if (typeof method !== 'function') {
		method = getMethod(method, name, this.__context__)
	}

	if (--binding.deps <= 0) {
		delete this.__domBindings__[name]
		unbind(this.__view__, name, binding)
	} 
	else if (parsed.selector) {
		binding.selectors = binding.selectors.filter(function (s) {
			return s !== parsed.selector
		})
	}

	removeBehaviour(this.behaviours, type, method)
}

// Native events tests
var isMouse = /^mouse(?:up|down|move|o(?:ver|ut)|enter|leave)|(?:dbl)?click$/
var isKey = /^key(up|down|press) +([\w\/]+(?: \w+)?)$/

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
	var match
	if (match = isMouse.exec(topic))
		data = mouseEvent(topic, data)
	else if (match = isKey.exec(topic))
		data = keyEvent(match[1], match[2], data)
	else
		data = customEvent(topic, data)

	this.__view__.dispatchEvent(data)
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
		for (event in this.behaviours) this.clear(event)
	} else {
		var name = parse(event).name
		var bindings = this.__domBindings__[name]

		for (var i = 0, len = bindings.length; i < len; i++) {
			unbind(this.__view__, bindings[i])
		}

		delete this.__domBindings__[name];
		delete this.behaviours[event];
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
