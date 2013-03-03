
var DomEmitter = require('..')
var assert = require('chai').assert
var should = require('chai').should()

var test = document.getElementById('test')
var node
beforeEach(function () {
  test.innerHTML = '<div id="target"><div>first</div><div>second</div></div>'
  node = test.firstChild
})

describe('.on(event)', function(){
  it('should default to invoking "on<Event>"', function(done){
    new DomEmitter(node, { onClick: function(){done()} }).on('click')
    happen.click(node)
  })
  
  it('should event object', function(done){
    new DomEmitter(node, {
      onClick: function(e){
        assert(e)
        done()
      }
    }).on('click')
    happen.click(node)
  })
  
  it('should error if no valid method is present', function(done){
    try { new DomEmitter(node).on('click') } 
    catch (e) { done() }
  })
})

describe('.on(event, method:string)', function(){
  it('should invoke the given method', function(done){
    new DomEmitter(node, { click: function () {done()} }).on('click', 'click')
    happen.click(node)
  })
  
  it('should bind to dom events', function (done) {
    new DomEmitter(node).on('click', function () {done()})
    happen.click(node)
  })
  
  it('should call in the context given', function (done) {
    var self = { 
      click: function () {
        assert(self === this)
        done()
      }
    }
    new DomEmitter(node, self).on('click', 'click')
    happen.click(node)
  })
})

describe('.on(event, method:function)', function () {
  it('should invoke the given function', function(done){
    new DomEmitter(node).on('click', function () {done()})
    happen.click(node)
  })
  it('should return the given function', function () {
    function fn() {}
    assert(new DomEmitter(node).on('click', fn) === fn)
  })
  it('should call in the context given', function (done) {
    var self = {}
    new DomEmitter(node, self).on('click', function () {
      assert(self === this)
      done()
    })
    happen.click(node)
  })
})

describe('.on(event<selector>)', function () {
  it('should delegate to child nodes matching the selector', function () {
    var c = 0
    new DomEmitter(node).on('click div', function (){ c++ })
    happen.click(node)
    happen.click(node.firstChild)
    c.should.equal(1)
  })

  it('should run the selector as if this view is a top level element', function () {
    var c = 0
    new DomEmitter(node).on('click #target > div', function (){ c++ })
    happen.click(node)
    happen.click(node.firstChild)
    c.should.equal(0)
  })

  it('should be able to run child selectors', function () {
    var c = 0
    new DomEmitter(node).on('click > div', function (){ c++ })
    happen.click(node)
    happen.click(node.firstChild)
    c.should.equal(1)
  })

  it('should continue to work after the view has moved within the dom', function () {
    var c = 0
    new DomEmitter(node).on('click > div', function (){ c++ })
    happen.click(node)
    happen.click(node.firstChild)

    var div = document.createElement('div')
    document.body.appendChild(div)
    div.appendChild(node)
    
    happen.click(node)
    happen.click(node.firstChild)

    document.body.removeChild(div)
    c.should.equal(2)
  })
})

describe('.off(event)', function () {
  it('should imply the method name', function () {
    var methods = {
      onClick: function(e){
        assert(false, 'Should not be called')
      }
    }
    var m = new DomEmitter(node, methods)
    m.on('click')
    m.off('click')
    happen.click(node)
  })
  it('should error if it can\'t find a method', function (done) {
    try { new DomEmitter(node).off('click') } 
    catch (e) { done() }
  })
})

describe('.off(event, method:string)', function(){
  it('should unbind a single binding', function(){
    var e = new DomEmitter(node, {
      login: function(){
        assert(0, 'should not invoke .login()');
      }
    })

    e.on('click', 'login');
    e.off('click', 'login');
    happen.click(node)
  })
})
describe('.off(event, method:function)', function () {4
  it('should remove the given function', function () {
    var e = new DomEmitter(node)
    var fn = e.on('click', function () {assert(false, '.onclick() should not have been called')})
    e.off('click', fn)
    happen.click(node)
  })
})

describe('.clear()', function () {
  it('should remove all event types', function () {
    var e = new DomEmitter(node, {
      onClick: function(){
        assert(0, 'should not invoke .click()')
      },
      onMouseup: function(){
        assert(0, 'should not invoke .mouseup()')
      }
    })
    e.on('click')
    e.on('mouseup')
    e.clear()
    happen.click(node)
    happen.mouseup(node)
  })
})

describe('.clear(event)', function(){
  it('should unbind all bindings for the given event', function(){
    var e = new DomEmitter(node, {
      onClick: function(){
        assert(0, 'should not invoke .click()');
      }
    })
    e.on('click')
    e.on('click', function () {
      assert(false, 'Should not be called')
    })
    e.clear('click')
    happen.click(node)
  })
})

describe('.emit(type, options)', function () {
  it('should trigger all matching handlers', function (done) {
    var e = new DomEmitter(node, {
      onSelect: function () {
        done()
      }
    })
    e.on('select')
    e.emit('select')
    e.clear()
  })

  it('should call them in the order they were added', function () {
    var e = new DomEmitter(node)
    var c = 0
    e.on('test', function () {
      assert(++c === 1)
    })
    e.on('test', function () {
      assert(++c === 2)
    })
    e.emit('test')
  })
  
  it('should target the event DomEmitter\'s DOM node', function (done) {
    var e = new DomEmitter(node, {
      onSelect: function (e) {
        assert(node === e.target)
        done()
      }
    })
    e.on('select')
    e.emit('select')
    e.clear()
  })

  it('should simulate native mouse events', function (done) {
    var e = new DomEmitter(node, {
      onClick: function (e) {
        assert(e.clientX === 50)
        assert(e.clientY === 50)
        assert(e instanceof MouseEvent)
        done()
      }
    })
    e.on('click')
    e.emit('click', {clientX:50,clientY:50})
    e.clear()
  })

  it('should be cancelable', function () {
    var e = new DomEmitter(node)
    
    e.on('test', function (e) {
      assert(e.cancelable === true)
      e.stopPropagation()
    })

    document.body.addEventListener('test', function () {
      assert(false)
    }, false)

    e.emit('test')
  })
})

describe('.once(topic, method:Function)', function () {
  it('should remove itself after one event', function () {
    var e = new DomEmitter(node)
    var c = 0
    e.once('click', function () {
      c++
    })
    e.emit('click')
    e.emit('click')
    assert(c === 1)
  })
})

describe('.once(topic, method:String)', function () {
  it('should remove itself after one event', function () {
    var e = new DomEmitter(node, {
      onClick: function () {
        c++
      }
    })
    var c = 0
    e.once('click', 'onClick')
    e.emit('click')
    e.emit('click')
    assert(c === 1)
  })
  
  it('should work without a method string', function () {
    var e = new DomEmitter(node, {
      onClick: function () {
        c++
      }
    })
    var c = 0
    e.once('click')
    e.emit('click')
    e.emit('click')
    assert(c === 1)
  })
})
