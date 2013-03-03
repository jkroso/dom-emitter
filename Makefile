
test/built.js: index.js test/*
	@node_modules/.bin/sourcegraph.js test/browser.js \
		--plugins mocha,nodeish,javascript \
		| node_modules/.bin/bigfile \
			--export null \
			--plugins nodeish,javascript > test/built.js

Readme.md: docs/* index.js
	@cat docs/head.md > $@
	@dox --api < index.js >> $@
	@cat docs/tail.md >> $@

dist/dom-emitter.js: index.js
	@mkdir -p dist
	@node_modules/.bin/sourcegraph.js index.js \
		--plugins nodeish,javascript \
		| node_modules/.bin/bigfile \
			--export DomEmitter \
			--plugins nodeish,javascript > $@
