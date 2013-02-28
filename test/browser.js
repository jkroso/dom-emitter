var mocha = require('mocha')
mocha.setup('bdd')

require('./events.test')

mocha.run(function () {
	console.log('Done!')
})