var mocha = require('mocha')
mocha.setup('bdd')

require('./index.test')

mocha.run(function () {
	console.log('Done!')
})