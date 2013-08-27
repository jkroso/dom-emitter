
var happen = require('happen/src/happen')
var chai = require('./chai')
var Emitter = require('..')

var test = document.getElementById('test')
var node
var emitter
var spy

beforeEach(function(){
	test.innerHTML = '<div id="target"><div>first</div><div>second</div></div>'
	node = test.firstChild
	spy = chai.spy()
	emitter = Emitter({
		el: node,
		onClick: chai.spy(),
		click: chai.spy()
	})
})

describe('.on(<string>, <function>)', function(){
	it('should hook up the function', function(){
		emitter.on('click', spy)
		happen.click(node)
		spy.should.have.been.called(1)
	})

	it('should return `this`', function(){
		emitter.on('click', spy).should.equal(emitter)
	})

	it('should be called with an event object', function(done){
		emitter.on('click', function(e){
			e.should.be.a('object')
			done()
		})
		happen.click(node)
	})
})

describe('.on(<string>)', function(){
	it('should default to invoking "on#{Event}"', function(){
		emitter.on('click')
		happen.click(node)
		emitter.onClick.should.have.been.called()
	})

	it('should error if no valid method is present', function(){
		(function(){
			emitter.on('non-existant-property')
		}).should.throw()
	})
})

describe('.on(<string>, <string>)', function(){
	it('should invoke the given method', function(){
		emitter.on('click', 'click')
		happen.click(node)
		emitter.click.should.have.been.called()
	})
})

describe('.on(<string #{selector}>)', function(){
	it('should delegate to child nodes matching the selector', function(){
		emitter.on('click div', spy)
		happen.click(node)
		happen.click(node.firstChild)
		spy.should.have.been.called(1)
	})

	it('should run the selector as if this view is a top level element', function(){
		emitter.on('click #target > div', spy)
		happen.click(node)
		happen.click(node.firstChild)
		spy.should.not.have.been.called(1)
	})

	it('should be able to run child selectors', function(){
		emitter.on('click > div', spy)
		happen.click(node)
		happen.click(node.firstChild)
		spy.should.have.been.called(1)
	})

	it('should lookup the event name as usual', function(){
		emitter.on('click > div')
		happen.click(node)
		happen.click(node.firstChild)
		emitter.onClick.should.have.been.called(1)
	})

	describe('when the emitters node is moved', function(){
		beforeEach(function(){
			node.removeAttribute('id')
		})

		it('within the same document', function(){
			emitter.on('click > div', spy)
			happen.click(node)
			happen.click(node.firstChild)

			var div = document.createElement('div')
			document.body.appendChild(div)
			div.appendChild(node)

			happen.click(node)
			happen.click(node.firstChild)

			spy.should.have.been.called(2)
			document.body.removeChild(div)
		})

		it('added to the document', function(){
			node.parentElement.removeChild(node)
			emitter.on('click > div')
			test.appendChild(node)
			// Note: events don't bubble when the target is not
			// a part of the document so delegation is useless until
			// you have inserted the node into the main document
			happen.click(node)
			happen.click(node.firstChild)

			emitter.onClick.should.have.been.called(1)
		})

		it('added after a similar node', function(){
			node.parentElement.removeChild(node)
			var clone = node.cloneNode(true)
			emitter.on('click > div')
			test.appendChild(clone)
			test.appendChild(node)
			happen.click(node.firstChild)
			emitter.onClick.should.have.been.called(1)
		})

		it('added below a similar node', function(){
			var regres = document.querySelector('.regression.test')
			regres.parentElement.removeChild(regres)
			var clone = regres.cloneNode(true)

			new Emitter(regres).on('click > .a', spy)
			new Emitter(clone).on('click > .a', spy)

			var mocha = document.getElementById('mocha')
			regres.appendChild(clone)
			document.body.insertBefore(regres, test)
			regres.insertBefore(clone, regres.firstChild)

			happen.click(clone.firstChild)
			spy.should.have.been.called(1)
		})
	})
})

describe('.off(<string>, <function>)', function(){
	it('should remove the given function', function(){
		emitter.on('click', spy).off('click', spy)
		happen.click(node)
		spy.should.not.have.been.called()
	})
})

describe('.off(<string>)', function(){
	it('should imply the method name', function(){
		emitter.on('click').off('click')
		happen.click(node)
		emitter.onClick.should.not.have.been.called()
	})

	it('should error if it can\'t find a method', function(){
		(function(){
			emitter.off('something-that-doesnt exist')
		}).should.throw()
	})
})

describe('.off(<string>, <string>)', function(){
	it('should unbind a single binding', function(){
		emitter.on('click', 'click').off('click', 'click')
		happen.click(node)
		emitter.click.should.not.have.been.called()
	})
})

describe('.emit(<string>)', function(){
	it('should trigger all matching handlers', function(){
		emitter.on('select', spy).emit('select')
		spy.should.have.been.called()
	})

	it('should call handlers in the order they were added', function(){
		var c = 0
		emitter.on('test', function(){
			(++c).should.equal(1)
		})
		emitter.on('test', function(){
			(++c).should.equal(2)
		})
		emitter.emit('test')
		c.should.equal(2)
	})

	it('should target the event DomEmitter\'s DOM node', function(){
		emitter.onSpy = chai.spy(function(e){
			e.target.should.equal(node)
		})
		emitter.on('spy').emit('spy')
		emitter.onSpy.should.have.been.called()
	})

	it('should be cancelable', function(){
		emitter.onSpy = chai.spy(function(e){
			e.stopPropagation()
		})
		document.body.addEventListener('spy', emitter.onSpy, false)
		emitter.on('spy').emit('spy')
		emitter.onSpy.should.have.been.called(1)
	})
})

describe('.emit(<string>, <object>)', function(){
	it('should mix properties into the event object', function(){
		emitter.onClick = chai.spy(function (e) {
			e.clientX.should.equal(50)
			e.clientY.should.equal(50)
		})
		emitter.on('click').emit('click', {clientX:50,clientY:50})
		emitter.onClick.should.have.been.called()
	})
})

describe('inheriting events', function(){
	var Class
	beforeEach(function(){
		Class = function(){
			this.el = node
			Emitter.bindEvents(this)
		}
		Emitter(Class.prototype)
	})
	it('should work with events defined without `this.el`', function(){
		Class.prototype.on('click', spy)
		var a = new Class()
		happen.click(node)
		spy.should.have.been.called(1)
	})

	it('should be able to add events without affecting others', function(){
		Class.prototype.on('click', spy)
		var a = new Class()
		a.on('mousedown', spy)
		var b = new Class()
		happen.mousedown(node)
		spy.should.have.been.called(1)
		happen.click(node)
		spy.should.have.been.called(3)
	})

	it('should handle multiple handlers per event', function(){
		Class.prototype.on('click', spy).on('click', spy)
		new Class()
		happen.click(node)
		spy.should.have.been.called(2)
	})
})