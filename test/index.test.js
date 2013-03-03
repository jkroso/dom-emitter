
var DomEmitter = require('..')
  , chai = require('chai')
  , expect = chai.expect
  , should = chai.should()
  , spies = require('chai-spies')

chai.use(spies)

var test = document.getElementById('test')
var node, spy

beforeEach(function () {
  test.innerHTML = '<div id="target"><div>first</div><div>second</div></div>'
  node = test.firstChild
  spy = chai.spy()
})

describe('new DomEmitter(<dom>, <object>)', function () {
  it('should use the `context` as its calling context', function () {
    var self = {}
    var e = new DomEmitter(node, self)
    e.context.should.equal(self)
  })

  it('if `context` has an `events` property it should be passed to `.on`', function () {
    var self = {
      events: {
        'click > div': spy,
        'mousedown div': spy
      }
    }
    chai.spy(DomEmitter.prototype, 'on')
    var e = new DomEmitter(node, self)
    DomEmitter.prototype.on.should.have.been.called
  })
})

describe('new DomEmitter(<dom>)', function () {
  it('should use the `view` as the calling context', function () {
    var e = new DomEmitter(node)
    e.context.should.equal(node)
  })
})

describe('.on(<string>)', function(){
  it('should default to invoking "on#{Event}"', function(){
    new DomEmitter(node, { onClick: spy }).on('click')
    happen.click(node)
    spy.should.have.been.called
  })
  
  it('should be called with an event object', function(done){
    new DomEmitter(node, {
      onClick: function(e){
        expect(e).to.exist
        e.should.be.a('object')
        done()
      }
    }).on('click')
    happen.click(node)
  })
  
  it('should error if no valid method is present', function(){
    (function () {
      new DomEmitter(node).on('click') 
    }).should.throw()
  })
})

describe('.on(<string>, <string>)', function(){
  it('should invoke the given method', function(){
    new DomEmitter(node, { click: spy }).on('click', 'click')
    happen.click(node)
    spy.should.have.been.called
  })
  
  
  it('should call in the context given', function () {
    var spy = chai.spy(function () {
      this.should.equal(self)
    })
    var self = { test: spy }
    new DomEmitter(node, self).on('click', 'test')
    happen.click(node)
    spy.should.have.been.called.once
  })
})

describe('.on(<string>, <function>)', function () {
  it('should invoke the given function', function(){
    new DomEmitter(node).on('click', spy)
    happen.click(node)
    spy.should.have.been.called
  })

  it('should return the given function', function () {
    new DomEmitter(node).on('click', spy).should.equal(spy)
  })

  it('should call in the context given', function (done) {
    var self = {}
    new DomEmitter(node, self).on('click', function () {
      expect(this).to.equal(self)
      done()
    })
    happen.click(node)
  })
})

describe('.on(<string #{selector}>)', function () {
  it('should delegate to child nodes matching the selector', function () {
    new DomEmitter(node).on('click div', spy)
    happen.click(node)
    happen.click(node.firstChild)
    spy.should.have.been.called.once
  })

  it('should run the selector as if this view is a top level element', function () {
    new DomEmitter(node).on('click #target > div', spy)
    happen.click(node)
    happen.click(node.firstChild)
    spy.should.not.have.been.called
  })

  it('should be able to run child selectors', function () {
    new DomEmitter(node).on('click > div', spy)
    happen.click(node)
    happen.click(node.firstChild)
    spy.should.have.been.called.once
  })

  it('should lookup the event name as usual', function () {
    new DomEmitter(node, {onClick:spy}).on('click > div')
    happen.click(node)
    happen.click(node.firstChild)
    spy.should.have.been.called.once
  })

  it('should continue to work after the view has moved within the dom', function () {
    new DomEmitter(node).on('click > div', spy)
    happen.click(node)
    happen.click(node.firstChild)

    var div = document.createElement('div')
    document.body.appendChild(div)
    div.appendChild(node)
    
    happen.click(node)
    happen.click(node.firstChild)

    spy.should.have.been.called.twice
    document.body.removeChild(div)
  })
})

describe('.on(<object>)', function () {
  it('add all values methods in the object', function () {
    new DomEmitter(node).on({ click:spy, mousedown:spy })
    happen.click(node)
    happen.mousedown(node)
    spy.should.have.been.called.twice
  })

  it('should delegate all methods that use a selector string', function () {
    new DomEmitter(node).on({
      'click div': spy,
      'mousedown div': spy
    })
    happen.click(node.firstChild)
    happen.mousedown(node.firstChild)
    spy.should.have.been.called.twice
  })
})

describe('.off(<string>)', function () {
  it('should imply the method name', function () {
    var methods = { onClick: spy }
    var m = new DomEmitter(node, methods)
    m.on('click')
    m.off('click')
    happen.click(node)
    spy.should.not.have.been.called
  })
  
  it('should error if it can\'t find a method', function () {
    (function () {
      new DomEmitter(node).off('click')
    }).should.throw()
  })
})

describe('.off(<string>, <string>)', function(){
  it('should unbind a single binding', function(){
    var e = new DomEmitter(node, { login: spy })
    e.on('click', 'login');
    e.off('click', 'login');
    happen.click(node)
    spy.should.not.have.been.called
  })
})

describe('.off(<string>, <function>)', function () {4
  it('should remove the given function', function () {
    var e = new DomEmitter(node)
    e.on('click', spy)
    e.off('click', spy)
    happen.click(node)
    spy.should.not.have.been.called
  })
})

describe('.clear()', function () {
  it('should remove all event types', function () {
    var e = new DomEmitter(node, {
      onClick: spy,
      onMouseup: spy
    })
    e.on('click')
    e.on('mouseup')
    e.clear()
    happen.click(node)
    happen.mouseup(node)
  })
})

describe('.clear(<string>)', function(){
  it('should unbind all bindings for the given event', function(){
    var e = new DomEmitter(node, { onClick: spy })
    e.on('click')
    e.on('click', spy)
    e.clear('click')
    happen.click(node)
    spy.should.not.have.been.called
  })
})

describe('.emit(<string>)', function () {
  it('should trigger all matching handlers', function () {
    var e = new DomEmitter(node)
    e.on('select', spy)
    e.emit('select')
    spy.should.have.been.called
  })

  it('should call handlers in the order they were added', function () {
    var e = new DomEmitter(node)
    var c = 0
    e.on('test', function () {
      (++c).should.equal(1)
    })
    e.on('test', function () {
      (++c).should.equal(2)
    })
    e.emit('test')
    c.should.equal(2)
  })
  
  it('should target the event DomEmitter\'s DOM node', function () {
    var spy = chai.spy(function (e) {
      e.target.should.equal(node)
    })
    var e = new DomEmitter(node, { onSelect: spy })
    e.on('select')
    e.emit('select')
    spy.should.have.been.called
  })

  it('should be cancelable', function () {
    var e = new DomEmitter(node)
    var spy = chai.spy(function (e) {
      e.stopPropagation()
    })

    e.on('test', spy)
    document.body.addEventListener('test', spy, false)
    e.emit('test')

    spy.should.have.been.called.once
  })

  it('should simulate native events', function () {
    var spy = chai.spy(function (e) {
      e.should.be.an.instanceOf(MouseEvent)
    })

    var e = new DomEmitter(node, { onClick: spy })
    e.on('click')
    e.emit('click')
    spy.should.have.been.called
  })
})

describe('.emit(<string>, <object>)', function () {
  it('should mix properties into the event object', function () {
    var spy = chai.spy(function (e) {
      e.clientX.should.equal(50)
      e.clientY.should.equal(50)
    })

    var e = new DomEmitter(node, { onClick: spy })
    e.on('click')
    e.emit('click', {clientX:50,clientY:50})
    spy.should.have.been.called
  })
})

describe('once(<string>', function () {
  it('should remove itself after one event', function () {
    var e = new DomEmitter(node, { onClick: spy })
    e.once('click')
    e.emit('click')
    e.emit('click')
    spy.should.have.been.called.once
  })
})

describe('.once(<string>, <function>)', function () {
  it('should remove itself after one event', function () {
    var e = new DomEmitter(node)
    e.once('click', spy)
    e.emit('click')
    e.emit('click')
    spy.should.have.been.called.once
  })
})

describe('.once(<string>, <string>)', function () {
  it('should remove itself after one event', function () {
    var e = new DomEmitter(node, { onClick: spy })
    e.once('click', 'onClick')
    e.emit('click')
    e.emit('click')
    spy.should.have.been.called.once
  })
})
