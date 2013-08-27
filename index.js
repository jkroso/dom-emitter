
var emitter = require('emitter/light').prototype
var unique = require('unique-selector')
var domEvent = require('dom-event')
var query = require('query')
var event = require('event')
var merge = require('merge')
var own = {}.hasOwnProperty
var emit = emitter.emit
var off = emitter.off
var on = emitter.on

module.exports = Emitter

Emitter.bind = bind
Emitter.unbind = unbind

function Emitter(o){
	if (this instanceof Emitter) {
		this.el = o
	} else {
		for (var k in Emitter.prototype) {
			o[k] = Emitter.prototype[k]
		}
		return o
	}
}

/**
 * Bind `fn` to `type` events. When `fn` is `undefined`
 * it will be inferred from `type`. Delegation can also be
 * specified in `type` by leaving a space then a css
 * selector which is relative to `this.el`.
 *
 *    this.on('click', this.onClick)
 *    this.on('click', 'onClick')
 *    this.on('click')     // implies "onClick"
 *    this.on('click .ok') // delegates to `.ok`
 *
 * @param {String} type
 * @param {String} [fn]
 * @return {this}
 */

Emitter.prototype.on = function(type, fn){
	var parsed = parse(type)
	if (typeof fn != 'function') {
		fn = getMethod(fn, parsed.name, this)
	}
	on.call(this, type, fn)
	bind(this, parsed.name, parsed.selector)
	return this
}

/**
 * unbind `fn` from `type` events
 *
 * All the following are equivalent:
 *
 *   this.off('click', this.onClick)
 *   this.off('click', 'onClick')
 *   this.off('click')
 *
 * @param {String} type
 * @param {String} [method]
 * @return {this}
 */

Emitter.prototype.off = function(type, fn){
	var parsed = parse(type)
	if (typeof fn != 'function') {
		fn = getMethod(fn, parsed.name, this)
	}
	off.call(this, type, fn)
	unbind(this, parsed.name, parsed.selector)
	return this
}

/**
 * Create a DOM event and send it down to `this.el`.
 * Any data you pass will be merged with the event
 * object.
 *
 *   this.emit('mousedown')
 *   this.emit('login', {user: user})
 *   this.emit('keydown', {key: 'enter'})
 *
 * @param {String} topic
 * @param {Object} [data]
 * @return {this}
 */

Emitter.prototype.emit = function(topic, data){
	var event = domEvent(topic, data)
	merge(event, data)
	this.el.dispatchEvent(event)
	return this
}

/**
 * hook into the DOM
 *
 * @param {Emitter} self
 * @param {String} type
 * @param {String} selector
 */

function bind(self, type, selector){
	if (!own.call(self, '_bindings')) self._bindings = {}
	var fn = self._bindings[type]

	if (typeof fn != 'function') {
		var path = unique(self.el) + ' '
		fn = self._bindings[type] = function(e){
			var selects = fn.selectors
			var len = selects.length

			// delegations
			if (len && e.target !== this) {
				// ensure root path is correct
				if (query(path) != this || !(/^(?:#|BODY)/).test(path)) {
					path = unique(this) + ' '
				}

				var i = 0
				while (i < len) {
					var select = selects[i++]
					var target = match(this, e.target, path + select)
					if (target) {
						e.delegate = target
						emit.call(self, type + ' ' + select, e)
					}
				}
			}

			emit.call(self, type, e)
		}

		fn.deps = 0
		fn.selectors = []
		event.bind(self.el, type, fn)
	}

	// count
	fn.deps++
	if (typeof selector == 'string' && selector) {
		fn.selectors = fn.selectors.concat(selector)
	}
}

/**
 * lookup an events implied method in the `context` object
 *
 * @param {String} [name]
 * @param {String} type
 * @param {Object} context
 * @api private
 */

function getMethod (name, type, ctx) {
	var fn = typeof name === 'string'
		? ctx[name]
		: ctx['on' + type[0].toUpperCase() + type.slice(1)]
	if (!fn) throw new Error('Can\'t find a method for '+type)
	return fn
}

/**
 * Return the first Element between `bottom` and
 * `top` that matches the selector
 *
 * @param {Element} top
 * @param {Element} bottom
 * @param {String} selector
 * @return {Element}
 * @api private
 */

function match(top, bottom, selector){
	var nodes = query.all(selector, top)
	var len = nodes.length

	while (bottom && bottom !== top) {
		for (var i = 0; i < len; i++) {
			if (nodes[i] === bottom) return bottom
		}
		bottom = bottom.parentElement
	}
}

/**
 * unhook from the DOM
 *
 * @param {Emitter} self
 * @param {String} type
 * @param {String} selector
 */

function unbind(self, type, selector){
	if (!own.call(self, '_bindings')) return
	var fn = self._bindings[type]

	if (typeof selector == 'string' && selector) {
		fn.selectors = fn.selectors.filter(function(str){
			return str != selector
		})
	}

	if (--fn.deps <= 0) {
		delete self._bindings[type]
		event.unbind(self.el, type, fn)
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
	return {
		name: str.shift(),
		selector: str.join(' ')
	}
}